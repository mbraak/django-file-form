// The following code is adapted from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
// which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

import BaseUpload, {
  DEFAULT_RETRY_DELAYS,
  type InitialFile
} from "./base_upload.ts";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getChunkSize,
  isRetryableRequestError,
  isRetryableStatus,
  MB,
  type MultipartUpload,
  type Part,
  prepareUploadPart,
  remove,
  type UrlInfo
} from "./s3_utils.ts";

interface Chunk {
  blob: Blob;
  done: boolean;
  partNumber: number;
  uploaded: number;
}

// The multipart upload after it is created
interface CreatedUpload {
  key: string;
  uploadId: string;
}

interface S3UploadParameters {
  csrfToken: string;
  endpoint: string;
  file: File;
  retryDelays: null | number[];
  s3UploadDir: string;
  uploadIndex: number;
}

class S3Upload extends BaseUpload {
  public onError?: (error: unknown) => void;
  public onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  public onSuccess?: () => void;

  // Ends the wait for a retry early
  private cancelRetryWait?: () => void;
  private chunks: Chunk[];
  private createdPromise: Promise<MultipartUpload>;
  private csrfToken: string;
  private endpoint: string;
  private file: File;
  private key: null | string;
  private parts: Part[];
  private retryDelays: number[];
  private retryTimeout?: ReturnType<typeof setTimeout>;
  private s3UploadDir: string;
  // Set when the upload is aborted or has failed; no more requests are started
  private stopped: boolean;
  private uploadId: null | string;
  private uploading: XMLHttpRequest[];

  constructor({
    csrfToken,
    endpoint,
    file,
    retryDelays,
    s3UploadDir,
    uploadIndex
  }: S3UploadParameters) {
    super({ name: file.name, status: "uploading", type: "s3", uploadIndex });

    this.csrfToken = csrfToken;
    this.endpoint = endpoint;
    this.file = file;
    this.retryDelays = retryDelays ?? DEFAULT_RETRY_DELAYS;
    this.s3UploadDir = s3UploadDir;
    this.stopped = false;

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
    this.createdPromise = Promise.reject(new Error("Upload not created"));
    this.chunks = [];
    this.uploading = [];
    this.onError = undefined;
    this.onProgress = undefined;
    this.onSuccess = undefined;

    this.initChunks();

    this.createdPromise.catch(() => ({})); // silence uncaught rejection warning
  }

  public async abort(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.retryTimeout);
    this.cancelRetryWait?.();

    for (const xhr of this.uploading.slice()) {
      xhr.abort();
    }
    this.uploading = [];

    // If creating the upload failed, there is nothing to abort
    await this.createdPromise.catch(() => undefined);
    await this.abortMultipartUpload();
  }

  public delete(): Promise<void> {
    return Promise.resolve();
  }

  public getId(): string | undefined {
    return this.uploadId ?? undefined;
  }

  public getInitialFile(): InitialFile {
    return {
      id: this.uploadId ?? "",
      name: this.key ?? "",
      original_name: this.file.name,
      size: this.file.size,
      type: "s3"
    };
  }

  public getSize(): number {
    return this.file.size;
  }

  public start(): void {
    void this.createUpload();
  }

  private async abortMultipartUpload(): Promise<void> {
    if (this.key && this.uploadId) {
      await abortMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        uploadId: this.uploadId
      });
    }
  }

  private completeUpload(upload: CreatedUpload): Promise<void> {
    // Parts may not have completed uploading in sorted order, if limit > 1.
    this.parts.sort((a, b) => a.PartNumber - b.PartNumber);

    return this.requestWithRetries(() =>
      completeMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: upload.key,
        parts: this.parts,
        uploadId: upload.uploadId
      })
    ).then(
      () => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      },
      (err: unknown) => {
        this.handleError(err);
      }
    );
  }

  private createUpload(): Promise<void> {
    this.createdPromise = this.requestWithRetries(() =>
      createMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        file: this.file,
        s3UploadDir: this.s3UploadDir
      })
    );
    return this.createdPromise
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

        this.key = result.key;
        this.uploadId = result.uploadId;

        this.uploadParts({ key: result.key, uploadId: result.uploadId });
      })
      .catch((err: unknown) => {
        this.handleError(err);
      });
  }

  // The upload has failed and can't be continued.
  // An error after the upload is aborted or has already failed is ignored.
  private handleError(error: unknown): void {
    if (this.stopped) {
      return;
    }

    this.stopped = true;

    // Remove the parts that are already uploaded from S3. This is cleanup, so a
    // failure is ignored; the upload has already failed.
    this.abortMultipartUpload().catch(() => undefined);

    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  }

  private initChunks(): void {
    const chunks: Chunk[] = [];
    const desiredChunkSize = getChunkSize(this.file);
    // at least 5MB per request, at most 10k requests
    const minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000));
    const chunkSize = Math.max(desiredChunkSize, minChunkSize);

    for (let i = 0; i < this.file.size; i += chunkSize) {
      const end = Math.min(this.file.size, i + chunkSize);
      chunks.push({
        blob: this.file.slice(i, end),
        done: false,
        partNumber: chunks.length + 1,
        uploaded: 0
      });
    }

    this.chunks = chunks;
  }

  private onPartComplete(
    upload: CreatedUpload,
    chunk: Chunk,
    etag: string
  ): void {
    chunk.done = true;

    this.parts.push({
      ETag: etag,
      PartNumber: chunk.partNumber
    });

    this.uploadParts(upload);
  }

  private onPartProgress(chunk: Chunk, sent: number): void {
    chunk.uploaded = sent;

    if (this.onProgress) {
      const totalUploaded = this.chunks.reduce((n, c) => n + c.uploaded, 0);
      this.onProgress(totalUploaded, this.file.size);
    }
  }

  // Send a request to the S3 views; retry it after a temporary error
  private async requestWithRetries<T>(request: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await request();
      } catch (error) {
        const delay = this.retryDelays[attempt];

        if (
          this.stopped ||
          delay === undefined ||
          !isRetryableRequestError(error)
        ) {
          throw error;
        }

        const waited = await this.waitForRetry(delay);

        if (!waited) {
          throw error;
        }
      }
    }
  }

  // Retry uploading a part after a temporary error, or fail the upload.
  // A retry requests a new url for the part, because the previous one may have expired.
  private retryPartOrFail(
    upload: CreatedUpload,
    chunk: Chunk,
    attempt: number,
    error: unknown,
    retryable: boolean
  ): void {
    if (this.stopped) {
      return;
    }

    const delay = this.retryDelays[attempt];

    if (!retryable || delay === undefined) {
      this.handleError(error);
      return;
    }

    // The data of the failed attempt is sent again
    this.onPartProgress(chunk, 0);

    void this.waitForRetry(delay).then(waited => {
      if (waited) {
        void this.uploadPart(upload, chunk, attempt + 1);
      }
    });
  }

  // attempt: 0 for the first attempt, 1 for the first retry, etc.
  private async uploadPart(
    upload: CreatedUpload,
    chunk: Chunk,
    attempt: number
  ): Promise<void> {
    let result: UrlInfo;

    try {
      result = await prepareUploadPart({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: upload.key,
        number: chunk.partNumber,
        uploadId: upload.uploadId
      });
    } catch (error) {
      this.retryPartOrFail(
        upload,
        chunk,
        attempt,
        error,
        isRetryableRequestError(error)
      );
      return;
    }

    if (this.stopped) {
      return;
    }

    const valid = typeof result === "object" && typeof result.url === "string";
    if (!valid) {
      this.handleError(
        new TypeError(
          "AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`."
        )
      );
      return;
    }

    this.uploadPartBytes(upload, chunk, result.url, attempt);
  }

  private uploadPartBytes(
    upload: CreatedUpload,
    chunk: Chunk,
    url: string,
    attempt: number
  ): void {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.responseType = "text";

    this.uploading.push(xhr);

    xhr.upload.addEventListener("progress", ev => {
      this.onPartProgress(chunk, ev.loaded);
    });

    xhr.addEventListener("abort", () => {
      remove(this.uploading, xhr);
    });

    xhr.addEventListener("load", () => {
      remove(this.uploading, xhr);

      if (xhr.status < 200 || xhr.status >= 300) {
        this.retryPartOrFail(
          upload,
          chunk,
          attempt,
          new Error("Non 2xx"),
          isRetryableStatus(xhr.status)
        );
        return;
      }

      this.onPartProgress(chunk, chunk.blob.size);

      // NOTE This must be allowed by CORS.
      const etag = xhr.getResponseHeader("ETag");
      if (etag === null) {
        this.handleError(
          new Error(
            "AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."
          )
        );
        return;
      }

      this.onPartComplete(upload, chunk, etag);
    });

    xhr.addEventListener("error", () => {
      remove(this.uploading, xhr);

      // A network error
      this.retryPartOrFail(
        upload,
        chunk,
        attempt,
        new Error("Unknown error"),
        true
      );
    });
    xhr.send(chunk.blob);
  }

  // Upload the parts one at a time; this is called when the upload is created and after each part is uploaded
  private uploadParts(upload: CreatedUpload): void {
    if (this.stopped) {
      return;
    }

    const chunk = this.chunks.find(c => !c.done);

    if (chunk) {
      void this.uploadPart(upload, chunk, 0);
    } else {
      void this.completeUpload(upload);
    }
  }

  // Wait before a retry. Resolves with true after the delay, or early with false
  // when the upload is aborted.
  private waitForRetry(delay: number): Promise<boolean> {
    return new Promise(resolve => {
      this.cancelRetryWait = () => {
        resolve(false);
      };
      this.retryTimeout = setTimeout(() => {
        resolve(true);
      }, delay);
    });
  }
}

export default S3Upload;
