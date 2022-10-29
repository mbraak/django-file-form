export type Metadata = Record<string, unknown>;

type UploadStatus = "done" | "error" | "invalid" | "uploading";
type ActionStatus = "in_progress" | "error";

export type UploadType =
  | "existing"
  | "invalid"
  | "placeholder"
  | "s3"
  | "tus"
  | "uploadedS3"
  | "uploadedTus";

interface BaseInitialFile {
  metadata?: Metadata;
  name: string;
  size?: number;
}

export interface InitialExistingFile extends BaseInitialFile {
  type: "existing";
}

export interface InitialPlaceholderFile extends BaseInitialFile {
  id: string;
  type: "placeholder";
}

export interface InitialS3File extends BaseInitialFile {
  id: string;
  original_name: string;
  type: "s3";
}

export interface InitialTusFile extends BaseInitialFile {
  id: string;
  type: "tus";
  url: string;
}

export type InitialFile =
  | InitialExistingFile
  | InitialPlaceholderFile
  | InitialS3File
  | InitialTusFile;

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
  public abstract getSize(): number | undefined;

  public setMetadata(metadata: Metadata): void {
    this.metadata = metadata;

    if (this.render) {
      this.render();
    }

    if (this.updateMetadata) {
      this.updateMetadata();
    }
  }
  public getInitialFile(): InitialFile | null {
    return null;
  }
}

export default BaseUpload;
