import { Upload } from "tus-js-client";
import BaseUpload from "./base_upload";
import { deleteUpload } from "./tus_utils";

interface Options {
  chunkSize: number;
  fieldName: string;
  formId: string;
  retryDelays: number[] | null;
  uploadUrl: string;
}

export default class TusUpload extends BaseUpload {
  public onError?: (error: Error) => void;
  public onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  public onSuccess?: () => void;
  private upload: Upload;

  constructor(file: File, uploadIndex: number, options: Options) {
    super({ name: file.name, status: "uploading", type: "tus", uploadIndex });

    this.upload = new Upload(file, {
      chunkSize: options.chunkSize,
      endpoint: options.uploadUrl,
      metadata: {
        fieldName: options.fieldName,
        filename: file.name,
        formId: options.formId
      },
      onError: this.handleError,
      onProgress: this.handleProgress,
      onSuccess: this.handleSucces,
      retryDelays: options.retryDelays || [0, 1000, 3000, 5000]
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

    await deleteUpload(this.upload.url);
  }

  public getSize(): number {
    return (this.upload.file as File).size;
  }

  public start(): void {
    this.upload.start();
  }

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

  private handleSucces = () => {
    if (this.onSuccess) {
      this.onSuccess();
    }
  };
}
