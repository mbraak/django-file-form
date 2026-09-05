import { type HttpRequest, type HttpResponse, Upload } from "tus-js-client";

import BaseUpload, { type InitialFile } from "./base_upload.ts";
import { deleteUpload } from "./tus_utils.ts";

interface Parameters {
  chunkSize: number;
  csrfToken: string;
  fieldName: string;
  file: File;
  formId: string;
  retryDelays: null | number[];
  uploadIndex: number;
  uploadUrl: string;
}

export default class TusUpload extends BaseUpload {
  public onError?: (error: Error) => void;
  public onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  public onSuccess?: () => void;
  private _csrfToken: string;
  private _id: string;
  private _upload: Upload;

  constructor({
    chunkSize,
    csrfToken,
    fieldName,
    file,
    formId,
    retryDelays,
    uploadIndex,
    uploadUrl
  }: Parameters) {
    super({ name: file.name, status: "uploading", type: "tus", uploadIndex });

    this._csrfToken = csrfToken;

    this._upload = new Upload(file, {
      chunkSize,
      endpoint: uploadUrl,
      metadata: {
        fieldName: fieldName,
        filename: file.name,
        formId: formId
      },
      onAfterResponse: this._handleAfterResponse,
      onBeforeRequest: this._addCsrTokenToRequest,
      onError: this._handleError,
      onProgress: this._handleProgress,
      onSuccess: this._handleSuccess,
      retryDelays: retryDelays ?? [0, 1000, 3000, 5000]
    });

    this.onError = undefined;
    this.onProgress = undefined;
    this.onSuccess = undefined;
  }

  public async abort(): Promise<void> {
    await this._upload.abort(true);
  }

  public async delete(): Promise<void> {
    if (!this._upload.url) {
      return Promise.resolve();
    }

    await deleteUpload(this._upload.url, this._csrfToken);
  }

  public getId(): string | undefined {
    return this._id;
  }

  getInitialFile(): InitialFile {
    return {
      id: this._id,
      name: this.name,
      size: this.getSize(),
      type: "tus",
      url: ""
    };
  }

  public getSize(): number {
    return (this._upload.file as File).size;
  }

  public start(): void {
    this._upload.start();
  }

  private _addCsrTokenToRequest = (request: HttpRequest) => {
    request.setHeader("X-CSRFToken", this._csrfToken);
  };

  private _handleAfterResponse = (
    _request: HttpRequest,
    response: HttpResponse
  ) => {
    const resourceId = response.getHeader("ResourceId");

    if (resourceId) {
      this._id = resourceId;
    }
  };

  private _handleError = (error: Error) => {
    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  };

  private _handleProgress = (bytesUploaded: number, bytesTotal: number) => {
    if (this.onProgress) {
      this.onProgress(bytesUploaded, bytesTotal);
    }
  };

  private _handleSuccess = () => {
    if (this.onSuccess) {
      this.onSuccess();
    }
  };
}
