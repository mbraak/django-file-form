// The following code is adpated from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
// which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

interface ChunkState {
  busy: boolean;
  done: boolean;
  etag?: string;
  uploaded: number;
}

interface Part {
  ETag: string;
  PartNumber: number;
}

interface ServerPart {
  ETag: string;
  PartNumber: number;
  Size: number;
}

interface MultipartUpload {
  key: string;
  uploadId: string;
  endpoint: string;
}

interface UrlInfo {
  url: string;
}

interface LocationInfo {
  location: string;
}

interface Options {
  key?: string;
  limit?: number;
  onError?: (error: Error) => void;
  onPartComplete?: (part: Part) => void;
  onProgress?: (uploaded: number, total: number) => void;
  onStart?: (multipartUpload: MultipartUpload) => void;
  onSuccess?: (locationInfo: LocationInfo) => void;
  s3UploadDir: string;
  endpoint: string;
  uploadId?: string;
}

const MB = 1024 * 1024;

const getChunkSize = (file: File) => Math.ceil(file.size / 10000);

const createMultipartUpload = (
  file: File,
  s3UploadDir: string,
  endpoint: string
): Promise<MultipartUpload> => {
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    accept: "application/json",
    "content-type": "application/json",
    "X-CSRFToken": csrftoken
  });
  return fetch(`${endpoint}/`, {
    method: "post",
    headers: headers,
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      s3UploadDir: s3UploadDir
    })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as MultipartUpload;
    });
};

const listParts = ({
  key,
  uploadId,
  endpoint
}: MultipartUpload): Promise<ServerPart[]> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  return fetch(`${endpoint}/${uploadIdEnc}?key=${filename}`, {
    method: "get"
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return (data as Record<string, unknown>)["parts"] as ServerPart[];
    });
};

const abortMultipartUpload = ({ key, uploadId, endpoint }: MultipartUpload) => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    "X-CSRFToken": csrftoken
  });
  return fetch(`${endpoint}/${uploadIdEnc}?key=${filename}`, {
    method: "delete",
    headers: headers
  }).then(response => {
    return response.json();
  });
};

const prepareUploadPart = ({
  key,
  uploadId,
  number,
  endpoint
}: {
  key: string;
  uploadId: string;
  number: number;
  endpoint: string;
}) => {
  const filename = encodeURIComponent(key);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({ "X-CSRFToken": csrftoken });
  return fetch(`${endpoint}/${uploadId}/${number}?key=${filename}`, {
    method: "get",
    headers: headers
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as UrlInfo;
    });
};

const completeMultipartUpload = ({
  key,
  uploadId,
  parts,
  endpoint
}: {
  key: string;
  uploadId: string;
  parts: Part[];
  endpoint: string;
}): Promise<LocationInfo> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    "X-CSRFToken": csrftoken
  });
  return fetch(`${endpoint}/${uploadIdEnc}/complete?key=${filename}`, {
    method: "post",
    headers: headers,
    body: JSON.stringify({
      parts: parts
    })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as LocationInfo;
    });
};

function remove(arr: unknown[], el: unknown) {
  const i = arr.indexOf(el);
  if (i !== -1) {
    arr.splice(i, 1);
  }
}

class S3Uploader {
  chunkState: ChunkState[];
  chunks: Blob[];
  createdPromise: Promise<MultipartUpload>;
  file: File;
  isPaused: boolean;
  key: string | null;
  options: Options;
  parts: Part[];
  s3UploadDir: string;
  endpoint: string;
  uploadId: string | null;
  uploading: XMLHttpRequest[];

  constructor(file: File, options: Options) {
    this.options = options;

    this.file = file;

    this.key = this.options.key || null;
    this.uploadId = this.options.uploadId || null;
    this.parts = [];
    this.s3UploadDir = this.options.s3UploadDir;
    this.endpoint = this.options.endpoint;

    // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
    // upload was created already. That also ensures that the sequencing is right
    // (so the `OP` definitely happens if the upload is created).
    //
    // This mostly exists to make `_abortUpload` work well: only sending the abort request if
    // the upload was already created, and if the createMultipartUpload request is still in flight,
    // aborting it immediately after it finishes.
    this.createdPromise = Promise.reject(); // eslint-disable-line prefer-promise-reject-errors
    this.isPaused = false;
    this.chunks = [];
    this.chunkState = [];
    this.uploading = [];

    this._initChunks();

    this.createdPromise.catch(() => ({})); // silence uncaught rejection warning
  }

  _initChunks(): void {
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

  _createUpload(): Promise<void> {
    this.createdPromise = new Promise(resolve => resolve()).then(() =>
      createMultipartUpload(this.file, this.s3UploadDir, this.endpoint)
    );
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

        if (this.options.onStart) {
          this.options.onStart(result);
        }
        this._uploadParts();
      })
      .catch((err: Error) => {
        this._onError(err);
      });
  }

  _resumeUpload(): Promise<void> {
    if (!this.key || !this.uploadId) {
      return Promise.resolve();
    }

    return listParts({
      uploadId: this.uploadId,
      key: this.key,
      endpoint: this.endpoint
    })
      .then(parts => {
        parts.forEach((part: ServerPart) => {
          const i = part.PartNumber - 1;
          this.chunkState[i] = {
            uploaded: part.Size,
            etag: part.ETag,
            done: true,
            busy: false
          };

          // Only add if we did not yet know about this part.
          if (!this.parts.some(p => p.PartNumber === part.PartNumber)) {
            this.parts.push({
              ETag: part.ETag,
              PartNumber: part.PartNumber
            });
          }
        });
        this._uploadParts();
      })
      .catch(err => {
        this._onError(err);
      });
  }

  _uploadParts(): void {
    if (this.isPaused) {
      return;
    }

    const need = (this.options.limit || 1) - this.uploading.length;
    if (need === 0) {
      return;
    }

    // All parts are uploaded.
    if (this.chunkState.every(state => state.done)) {
      void this._completeUpload();
      return;
    }

    const candidates = [];
    for (let i = 0; i < this.chunkState.length; i++) {
      const state = this.chunkState[i];
      if (state.done || state.busy) continue;

      candidates.push(i);
      if (candidates.length >= need) {
        break;
      }
    }

    candidates.forEach(index => {
      void this._uploadPart(index);
    });
  }

  _uploadPart(index: number): Promise<void> {
    this.chunkState[index].busy = true;

    if (!this.key || !this.uploadId) {
      return Promise.resolve();
    }

    return prepareUploadPart({
      key: this.key,
      uploadId: this.uploadId,
      number: index + 1,
      endpoint: this.endpoint
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
          this._uploadPartBytes(index, url);
        },
        err => {
          this._onError(err);
        }
      );
  }

  _onPartProgress(index: number, sent: number): void {
    this.chunkState[index].uploaded = sent;

    if (this.options.onProgress) {
      const totalUploaded = this.chunkState.reduce((n, c) => n + c.uploaded, 0);
      this.options.onProgress(totalUploaded, this.file.size);
    }
  }

  _onPartComplete(index: number, etag: string): void {
    this.chunkState[index].etag = etag;
    this.chunkState[index].done = true;

    const part = {
      PartNumber: index + 1,
      ETag: etag
    };
    this.parts.push(part);

    if (this.options.onPartComplete) {
      this.options.onPartComplete(part);
    }

    this._uploadParts();
  }

  _uploadPartBytes(index: number, url: string): void {
    const body = this.chunks[index];
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.responseType = "text";

    this.uploading.push(xhr);

    xhr.upload.addEventListener("progress", ev => {
      if (!ev.lengthComputable) return;

      this._onPartProgress(index, ev.loaded);
    });

    xhr.addEventListener("abort", ev => {
      remove(this.uploading, ev.target);
      this.chunkState[index].busy = false;
    });

    xhr.addEventListener("load", ev => {
      const target = ev.target as XMLHttpRequest;
      remove(this.uploading, target);
      this.chunkState[index].busy = false;

      if (target.status < 200 || target.status >= 300) {
        this._onError(new Error("Non 2xx"));
        return;
      }

      this._onPartProgress(index, body.size);

      // NOTE This must be allowed by CORS.
      const etag = target.getResponseHeader("ETag");
      if (etag === null) {
        this._onError(
          new Error(
            "AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."
          )
        );
        return;
      }

      this._onPartComplete(index, etag);
    });

    xhr.addEventListener("error", ev => {
      remove(this.uploading, ev.target);
      this.chunkState[index].busy = false;
      const error = new Error("Unknown error");
      // error.source = ev.target
      this._onError(error);
    });
    xhr.send(body);
  }

  _completeUpload(): Promise<void> {
    // Parts may not have completed uploading in sorted order, if limit > 1.
    this.parts.sort((a, b) => a.PartNumber - b.PartNumber);

    if (!this.uploadId || !this.key) {
      return Promise.resolve();
    }

    return completeMultipartUpload({
      key: this.key,
      uploadId: this.uploadId,
      parts: this.parts,
      endpoint: this.endpoint
    }).then(
      result => {
        if (this.options.onSuccess) {
          this.options.onSuccess(result);
        }
      },
      err => {
        this._onError(err);
      }
    );
  }

  _onError(error: Error): void {
    if (this.options.onError) {
      this.options.onError(error);
    } else {
      throw error;
    }
  }

  start(): void {
    this.isPaused = false;
    if (this.uploadId) {
      void this._resumeUpload();
    } else {
      void this._createUpload();
    }
  }

  pause(): void {
    const inProgress = this.uploading.slice();
    inProgress.forEach(xhr => {
      xhr.abort();
    });
    this.isPaused = true;
  }

  abort(): void {
    this.uploading.slice().forEach(xhr => {
      xhr.abort();
    });
    this.createdPromise.then(
      () => {
        if (this.key && this.uploadId) {
          void abortMultipartUpload({
            key: this.key,
            uploadId: this.uploadId,
            endpoint: this.endpoint
          });
        }
      },
      () => {
        // if the creation failed we do not need to abort
      }
    );
    this.uploading = [];
  }
}

export default S3Uploader;
