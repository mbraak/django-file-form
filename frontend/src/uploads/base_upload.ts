type UploadStatus = "done" | "error" | "uploading";
export type UploadType =
  | "placeholder"
  | "s3"
  | "tus"
  | "uploadedS3"
  | "uploadedTus";

interface UploadParameters {
  name: string;
  status: UploadStatus;
  type: UploadType;
  uploadIndex: number;
}

abstract class BaseUpload {
  name: string;
  status: UploadStatus;
  type: UploadType;
  uploadIndex: number;

  constructor({ name, status, type, uploadIndex }: UploadParameters) {
    this.name = name;
    this.status = status;
    this.type = type;
    this.uploadIndex = uploadIndex;
  }

  public async abort(): Promise<void> {
    //
  }
  public async delete(): Promise<void> {
    //
  }
  public abstract getSize(): number;
}

export default BaseUpload;
