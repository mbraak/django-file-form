export type Metadata = Record<string, unknown>;

type UploadStatus = "done" | "error" | "uploading";
type ActionStatus = "in_progress" | "error";

export type UploadType =
  | "placeholder"
  | "s3"
  | "tus"
  | "uploadedS3"
  | "uploadedTus";

export interface InitialFile {
  id: string;
  metadata?: Metadata;
  name: string;
  size: number;
  url?: string;
  original_name?: string;
  type: "placeholder" | "s3" | "tus";
}

interface UploadParameters {
  metadata?: Metadata;
  name: string;
  status: UploadStatus;
  type: UploadType;
  uploadIndex: number;
}

abstract class BaseUpload {
  deleteStatus?: ActionStatus;
  metadata: Metadata;
  name: string;
  progress: number;
  render?: () => void;
  status: UploadStatus;
  type: UploadType;
  updateMetadata?: () => void;
  uploadIndex: number;

  constructor({ metadata, name, status, type, uploadIndex }: UploadParameters) {
    this.metadata = metadata || {};
    this.name = name;
    this.status = status;
    this.type = type;
    this.uploadIndex = uploadIndex;

    this.progress = 0;
    this.deleteStatus = undefined;
  }

  public async abort(): Promise<void> {
    //
  }
  public async delete(): Promise<void> {
    //
  }
  public abstract getSize(): number;

  public setMetadata(metadata: Metadata): void {
    this.metadata = metadata;

    if (this.render) {
      this.render();
    }

    if (this.updateMetadata) {
      this.updateMetadata();
    }
  }
  public abstract getInitialFile(): InitialFile;
}

export default BaseUpload;
