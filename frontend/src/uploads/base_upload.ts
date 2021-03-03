type UploadStatus = "done" | "error" | "uploading";
export type UploadType =
  | "placeholder"
  | "s3"
  | "tus"
  | "uploadedS3"
  | "uploadedTus";

export interface InitialFile {
  id: string;
  name: string;
  size?: number;
  url?: string;
  original_name?: string;
  type: "placeholder" | "s3" | "tus";
}

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

  public abstract getInitialFile(): InitialFile;
}

export default BaseUpload;
