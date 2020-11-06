type UploadStatus = "done" | "error" | "uploading";

type ActionStatus = "in_progress" | "error";

interface UploadParameters {
  name: string;
  status: UploadStatus;
  type: string;
  uploadIndex: number;
}

abstract class BaseUpload {
  deleteStatus?: ActionStatus;
  name: string;
  progress: number;
  status: UploadStatus;
  type: string;
  uploadIndex: number;

  constructor({ name, status, type, uploadIndex }: UploadParameters) {
    this.name = name;
    this.status = status;
    this.type = type;
    this.uploadIndex = uploadIndex;

    this.progress = 0;
    this.deleteStatus = undefined;
  }

  public abstract async abort(): Promise<void>;
  public abstract async delete(): Promise<void>;
  public abstract getSize(): number;
}

export default BaseUpload;
