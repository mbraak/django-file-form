// The following code is adapted from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
// which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

import BaseUpload, { InitialFile } from "./base_upload.ts";
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
} from "./s3_utils.ts";

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
  public onError?: (error: unknown) => void;
  public onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  public onSuccess?: () => void;

  private _chunks: Blob[];
  private _chunkState: ChunkState[];
  private _createdPromise: Promise<MultipartUpload>;
  private _csrfToken: string;
  private _endpoint: string;
  private _file: File;
  private _key: null | string;
  private _parts: Part[];
  private _s3UploadDir: string;
  private _uploadId: null | string;
  private _uploading: XMLHttpRequest[];

  constructor({
    csrfToken,
    endpoint,
    file,
    s3UploadDir,
    uploadIndex
  }: S3UploadParameters) {
    super({ name: file.name, status: "uploading", type: "s3", uploadIndex });

    this._csrfToken = csrfToken;
    this._endpoint = endpoint;
    this._file = file;
    this._s3UploadDir = s3UploadDir;

    this._key = null;
    this._uploadId = null;
    this._parts = [];

    // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
    // upload was created already. That also ensures that the sequencing is right
    // (so the `OP` definitely happens if the upload is created).
    //
    // This mostly exists to make `abortUpload` work well: only sending the abort request if
    // the upload was already created, and if the createMultipartUpload request is still in flight,
    // aborting it immediately after it finishes.
    this._createdPromise = Promise.reject(new Error());
    this._chunks = [];
    this._chunkState = [];
    this._uploading = [];
    this.onError = undefined;
    this.onProgress = undefined;
    this.onSuccess = undefined;

    this._initChunks();

    this._createdPromise.catch(() => ({})); // silence uncaught rejection warning
  }

  public async abort(): Promise<void> {
    this._uploading.slice().forEach(xhr => {
      xhr.abort();
    });
    this._uploading = [];

    await this._createdPromise;

    if (this._key && this._uploadId) {
      await abortMultipartUpload({
        csrfToken: this._csrfToken,
        endpoint: this._endpoint,
        key: this._key,
        uploadId: this._uploadId
      });
    }
  }

  public async delete(): Promise<void> {
    return Promise.resolve();
  }

  public getId(): string | undefined {
    return this._uploadId ?? undefined;
  }

  public getInitialFile(): InitialFile {
    return {
      id: this._uploadId ?? "",
      name: this._key ?? "",
      original_name: this._file.name,
      size: this._file.size,
      type: "s3"
    };
  }

  public getSize(): number {
    return this._file.size;
  }

  public start(): void {
    void this._createUpload();
  }

  private _completeUpload(): Promise<void> {
    // Parts may not have completed uploading in sorted order, if limit > 1.
    this._parts.sort((a, b) => a.PartNumber - b.PartNumber);

    if (!this._uploadId || !this._key) {
      return Promise.resolve();
    }

    return completeMultipartUpload({
      csrfToken: this._csrfToken,
      endpoint: this._endpoint,
      key: this._key,
      parts: this._parts,
      uploadId: this._uploadId
    }).then(
      () => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      },
      (err: unknown) => {
        this._handleError(err);
      }
    );
  }

  private _createUpload(): Promise<void> {
    this._createdPromise = createMultipartUpload({
      csrfToken: this._csrfToken,
      endpoint: this._endpoint,
      file: this._file,
      s3UploadDir: this._s3UploadDir
    });
    return this._createdPromise
      .then((result: MultipartUpload | null) => {
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

        this._key = result.key;
        this._uploadId = result.uploadId;

        this._uploadParts();
      })
      .catch((err: unknown) => {
        this._handleError(err);
      });
  }

  private _handleError(error: unknown): void {
    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  }

  private _initChunks(): void {
    const chunks: Blob[] = [];
    const desiredChunkSize = getChunkSize(this._file);
    // at least 5MB per request, at most 10k requests
    const minChunkSize = Math.max(5 * MB, Math.ceil(this._file.size / 10000));
    const chunkSize = Math.max(desiredChunkSize, minChunkSize);

    for (let i = 0; i < this._file.size; i += chunkSize) {
      const end = Math.min(this._file.size, i + chunkSize);
      chunks.push(this._file.slice(i, end));
    }

    this._chunks = chunks;
    this._chunkState = chunks.map(() => ({
      busy: false,
      done: false,
      uploaded: 0
    }));
  }

  private _onPartComplete(index: number, etag: string): void {
    const state = this._chunkState[index];

    if (state) {
      state.etag = etag;
      state.done = true;
    }

    const part = {
      ETag: etag,
      PartNumber: index + 1
    };
    this._parts.push(part);

    this._uploadParts();
  }

  private _onPartProgress(index: number, sent: number): void {
    const state = this._chunkState[index];

    if (state) {
      state.uploaded = sent;
    }

    if (this.onProgress) {
      const totalUploaded = this._chunkState.reduce((n, c) => n + c.uploaded, 0);
      this.onProgress(totalUploaded, this._file.size);
    }
  }

  private _uploadPart(index: number): Promise<void> {
    const state = this._chunkState[index];

    if (state) {
      state.busy = true;
    }

    if (!this._key || !this._uploadId) {
      return Promise.resolve();
    }

    return prepareUploadPart({
      csrfToken: this._csrfToken,
      endpoint: this._endpoint,
      key: this._key,
      number: index + 1,
      uploadId: this._uploadId
    })
      .then(result => {
        const valid =
          typeof result === "object" && typeof result.url === "string";
        if (!valid) {
          throw new TypeError(
            "AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`."
          );
        }
        return result;
      })
      .then(
        ({ url }: UrlInfo) => {
          this._uploadPartBytes(index, url);
        },
        (err: unknown) => {
          this._handleError(err);
        }
      );
  }

  private _uploadPartBytes(index: number, url: string): void {
    const body = this._chunks[index];
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.responseType = "text";

    this._uploading.push(xhr);

    xhr.upload.addEventListener("progress", ev => {
      if (!ev.lengthComputable) {
        return;
      }

      this._onPartProgress(index, ev.loaded);
    });

    xhr.addEventListener("abort", () => {
      remove(this._uploading, xhr);

      const state = this._chunkState[index];

      if (state) {
        state.busy = false;
      }
    });

    xhr.addEventListener("load", () => {
      remove(this._uploading, xhr);

      const state = this._chunkState[index];

      if (state) {
        state.busy = false;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        this._handleError(new Error("Non 2xx"));
        return;
      }

      this._onPartProgress(index, body?.size ?? 0);

      // NOTE This must be allowed by CORS.
      const etag = xhr.getResponseHeader("ETag");
      if (etag === null) {
        this._handleError(
          new Error(
            "AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."
          )
        );
        return;
      }

      this._onPartComplete(index, etag);
    });

    xhr.addEventListener("error", () => {
      remove(this._uploading, xhr);

      const state = this._chunkState[index];

      if (state) {
        state.busy = false;
      }

      const error = new Error("Unknown error");
      this._handleError(error);
    });
    xhr.send(body);
  }

  private _uploadParts(): void {
    const need = 1 - this._uploading.length;
    if (need === 0) {
      return;
    }

    // All parts are uploaded.
    if (this._chunkState.every(state => state.done)) {
      void this._completeUpload();
      return;
    }

    const candidates = [];
    for (let i = 0; i < this._chunkState.length; i++) {
      const state = this._chunkState[i];

      if (!state || state.done || state.busy) {
        continue;
      }

      candidates.push(i);
      if (candidates.length >= need) {
        break;
      }
    }

    candidates.forEach(index => {
      void this._uploadPart(index);
    });
  }
}

export default S3Upload;
