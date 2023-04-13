// The following code is adapted from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
// which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

import BaseUpload, { InitialFile } from "./base_upload";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getChunkSize,
  MB,
  MultipartUpload,
  Part,
  prepareUploadPart,
  remove,
  UrlInfo
} from "./s3_utils";

interface ChunkState {
  busy: boolean;
  done: boolean;
  etag?: string;
  uploaded: number;
}

interface S3UploadParameters {
  csrfToken: string;
  endpoint: string;
  file: File;
  s3UploadDir: string;
  uploadIndex: number;
}

class S3Upload extends BaseUpload {
  public onError?: (error: Error) => void;
  public onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  public onSuccess?: () => void;

  private chunkState: ChunkState[];
  private chunks: Blob[];
  private createdPromise: Promise<MultipartUpload>;
  private csrfToken: string;
  private endpoint: string;
  private file: File;
  private key: string | null;
  private parts: Part[];
  private s3UploadDir: string;
  private uploadId: string | null;
  private uploading: XMLHttpRequest[];

  constructor({
    csrfToken,
    endpoint,
    file,
    s3UploadDir,
    uploadIndex
  }: S3UploadParameters) {
    super({ name: file.name, status: "uploading", type: "s3", uploadIndex });

    this.csrfToken = csrfToken;
    this.endpoint = endpoint;
    this.file = file;
    this.s3UploadDir = s3UploadDir;

    this.key = null;
    this.uploadId = null;
    this.parts = [];

    // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
    // upload was created already. That also ensures that the sequencing is right
    // (so the `OP` definitely happens if the upload is created).
    //
    // This mostly exists to make `abortUpload` work well: only sending the abort request if
    // the upload was already created, and if the createMultipartUpload request is still in flight,
    // aborting it immediately after it finishes.
    this.createdPromise = Promise.reject(); // eslint-disable-line prefer-promise-reject-errors
    this.chunks = [];
    this.chunkState = [];
    this.uploading = [];
    this.onError = undefined;
    this.onProgress = undefined;
    this.onSuccess = undefined;

    this.initChunks();

    this.createdPromise.catch(() => ({})); // silence uncaught rejection warning
  }

  public async abort(): Promise<void> {
    this.uploading.slice().forEach(xhr => {
      xhr.abort();
    });
    this.uploading = [];

    await this.createdPromise;

    if (this.key && this.uploadId) {
      await abortMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        uploadId: this.uploadId
      });
    }
  }

  public async delete(): Promise<void> {
    return Promise.resolve();
  }

  public getId(): string | undefined {
    return this.uploadId || undefined;
  }

  public getInitialFile(): InitialFile {
    return {
      id: this.uploadId || "",
      name: this.key || "",
      size: this.file.size,
      original_name: this.file.name,
      type: "s3"
    };
  }

  public getSize(): number {
    return this.file.size;
  }

  public start(): void {
    void this.createUpload();
  }

  private initChunks(): void {
    const chunks: Blob[] = [];
    const desiredChunkSize = getChunkSize(this.file);
    // at least 5MB per request, at most 10k requests
    const minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000));
    const chunkSize = Math.max(desiredChunkSize, minChunkSize);

    for (let i = 0; i < this.file.size; i += chunkSize) {
      const end = Math.min(this.file.size, i + chunkSize);
      chunks.push(this.file.slice(i, end));
    }

    this.chunks = chunks;
    this.chunkState = chunks.map(() => ({
      uploaded: 0,
      busy: false,
      done: false
    }));
  }

  private createUpload(): Promise<void> {
    this.createdPromise = createMultipartUpload({
      csrfToken: this.csrfToken,
      endpoint: this.endpoint,
      file: this.file,
      s3UploadDir: this.s3UploadDir
    });
    return this.createdPromise
      .then((result: MultipartUpload) => {
        const valid =
          typeof result === "object" &&
          result &&
          typeof result.uploadId === "string" &&
          typeof result.key === "string";
        if (!valid) {
          throw new TypeError(
            "AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`."
          );
        }

        this.key = result.key;
        this.uploadId = result.uploadId;

        this.uploadParts();
      })
      .catch((err: Error) => {
        this.handleError(err);
      });
  }

  private uploadParts(): void {
    const need = 1 - this.uploading.length;
    if (need === 0) {
      return;
    }

    // All parts are uploaded.
    if (this.chunkState.every(state => state.done)) {
      void this.completeUpload();
      return;
    }

    const candidates = [];
    for (let i = 0; i < this.chunkState.length; i++) {
      const state = this.chunkState[i];

      if (!state || state.done || state.busy) {
        continue;
      }

      candidates.push(i);
      if (candidates.length >= need) {
        break;
      }
    }

    candidates.forEach(index => {
      void this.uploadPart(index);
    });
  }

  private uploadPart(index: number): Promise<void> {
    const state = this.chunkState[index];

    if (state) {
      state.busy = true;
    }

    if (!this.key || !this.uploadId) {
      return Promise.resolve();
    }

    return prepareUploadPart({
      csrfToken: this.csrfToken,
      endpoint: this.endpoint,
      key: this.key,
      number: index + 1,
      uploadId: this.uploadId
    })
      .then(result => {
        const valid =
          typeof result === "object" &&
          result &&
          typeof result.url === "string";
        if (!valid) {
          throw new TypeError(
            "AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`."
          );
        }
        return result;
      })
      .then(
        ({ url }: UrlInfo) => {
          this.uploadPartBytes(index, url);
        },
        err => {
          this.handleError(err as Error);
        }
      );
  }

  private onPartProgress(index: number, sent: number): void {
    const state = this.chunkState[index];

    if (state) {
      state.uploaded = sent;
    }

    if (this.onProgress) {
      const totalUploaded = this.chunkState.reduce((n, c) => n + c.uploaded, 0);
      this.onProgress(totalUploaded, this.file.size);
    }
  }

  private onPartComplete(index: number, etag: string): void {
    const state = this.chunkState[index];

    if (state) {
      state.etag = etag;
      state.done = true;
    }

    const part = {
      PartNumber: index + 1,
      ETag: etag
    };
    this.parts.push(part);

    this.uploadParts();
  }

  private uploadPartBytes(index: number, url: string): void {
    const body = this.chunks[index];
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.responseType = "text";

    this.uploading.push(xhr);

    xhr.upload.addEventListener("progress", ev => {
      if (!ev.lengthComputable) {
        return;
      }

      this.onPartProgress(index, ev.loaded);
    });

    xhr.addEventListener("abort", ev => {
      remove(this.uploading, ev.target);

      const state = this.chunkState[index];

      if (state) {
        state.busy = false;
      }
    });

    xhr.addEventListener("load", ev => {
      const target = ev.target as XMLHttpRequest;
      remove(this.uploading, target);

      const state = this.chunkState[index];

      if (state) {
        state.busy = false;
      }

      if (target.status < 200 || target.status >= 300) {
        this.handleError(new Error("Non 2xx"));
        return;
      }

      this.onPartProgress(index, body?.size || 0);

      // NOTE This must be allowed by CORS.
      const etag = target.getResponseHeader("ETag");
      if (etag === null) {
        this.handleError(
          new Error(
            "AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."
          )
        );
        return;
      }

      this.onPartComplete(index, etag);
    });

    xhr.addEventListener("error", ev => {
      remove(this.uploading, ev.target);

      const state = this.chunkState[index];

      if (state) {
        state.busy = false;
      }

      const error = new Error("Unknown error");
      // error.source = ev.target
      this.handleError(error);
    });
    xhr.send(body);
  }

  private completeUpload(): Promise<void> {
    // Parts may not have completed uploading in sorted order, if limit > 1.
    this.parts.sort((a, b) => a.PartNumber - b.PartNumber);

    if (!this.uploadId || !this.key) {
      return Promise.resolve();
    }

    return completeMultipartUpload({
      csrfToken: this.csrfToken,
      endpoint: this.endpoint,
      key: this.key,
      uploadId: this.uploadId,
      parts: this.parts
    }).then(
      () => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      },
      err => {
        this.handleError(err as Error);
      }
    );
  }

  private handleError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  }
}

export default S3Upload;
