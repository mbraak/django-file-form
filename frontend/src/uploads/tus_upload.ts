import { Upload } from "tus-js-client";
import BaseUpload from "./base_upload";
import { deleteUpload } from "./tus_utils";

interface Options {
  chunkSize: number;
  fieldName: string;
  formId: string;
  onError: (error: Error) => void;
  onProgress: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess: () => void;
  retryDelays: number[] | null;
  uploadUrl: string;
}

export default class TusUpload extends BaseUpload {
  upload: Upload;

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
      onError: options.onError,
      onProgress: options.onProgress,
      onSuccess: options.onSuccess,
      retryDelays: options.retryDelays || [0, 1000, 3000, 5000]
    });
  }

  public abort(): void {
    void this.upload.abort(true);
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
}
