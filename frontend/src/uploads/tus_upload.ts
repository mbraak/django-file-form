import { HttpRequest, HttpResponse, Upload } from "tus-js-client";

import BaseUpload, { InitialFile } from "./base_upload.ts";
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
  private csrfToken: string;
  private id: string;
  private upload: Upload;

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

    this.csrfToken = csrfToken;

    this.upload = new Upload(file, {
      chunkSize,
      endpoint: uploadUrl,
      metadata: {
        fieldName: fieldName,
        filename: file.name,
        formId: formId
      },
      onAfterResponse: this.handleAfterResponse,
      onBeforeRequest: this.addCsrTokenToRequest,
      onError: this.handleError,
      onProgress: this.handleProgress,
      onSuccess: this.handleSuccess,
      retryDelays: retryDelays ?? [0, 1000, 3000, 5000]
    });

    this.onError = undefined;
    this.onProgress = undefined;
    this.onSuccess = undefined;
  }

  public async abort(): Promise<void> {
    await this.upload.abort(true);
  }

  public async delete(): Promise<void> {
    if (!this.upload.url) {
      return Promise.resolve();
    }

    await deleteUpload(this.upload.url, this.csrfToken);
  }

  public getId(): string | undefined {
    return this.id;
  }

  getInitialFile(): InitialFile {
    return {
      id: this.id,
      name: this.name,
      size: this.getSize(),
      type: "tus",
      url: ""
    };
  }

  public getSize(): number {
    return (this.upload.file as File).size;
  }

  public start(): void {
    this.upload.start();
  }

  private addCsrTokenToRequest = (request: HttpRequest) => {
    request.setHeader("X-CSRFToken", this.csrfToken);
  };

  private handleAfterResponse = (
    _request: HttpRequest,
    response: HttpResponse
  ) => {
    const resourceId = response.getHeader("ResourceId");

    if (resourceId) {
      this.id = resourceId;
    }
  };

  private handleError = (error: Error) => {
    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  };

  private handleProgress = (bytesUploaded: number, bytesTotal: number) => {
    if (this.onProgress) {
      this.onProgress(bytesUploaded, bytesTotal);
    }
  };

  private handleSuccess = () => {
    if (this.onSuccess) {
      this.onSuccess();
    }
  };
}
