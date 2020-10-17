type UploadStatus = "done" | "error" | "uploading";

interface UploadParameters {
  name: string;
  status: UploadStatus;
  type: string;
  uploadIndex: number;
}

abstract class BaseUpload {
  name: string;
  status: UploadStatus;
  type: string;
  uploadIndex: number;

  constructor({ name, status, type, uploadIndex }: UploadParameters) {
    this.name = name;
    this.status = status;
    this.type = type;
    this.uploadIndex = uploadIndex;
  }

  public abstract async abort(): Promise<void>;
  public abstract async delete(): Promise<void>;
  public abstract getSize(): number;
}

export default BaseUpload;
