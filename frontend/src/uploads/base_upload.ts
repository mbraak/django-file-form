export interface InitialExistingFile {
  name: string;
  size: number;
  type: "existing";
}
export type InitialFile =
  | InitialExistingFile
  | InitialPlaceholderFile
  | InitialS3File
  | InitialTusFile;

export interface InitialPlaceholderFile {
  id: string;
  name: string;
  size: number;
  type: "placeholder";
}

export interface InitialS3File {
  id: string;
  name: string;
  original_name: string;
  size: number;
  type: "s3";
}

export interface InitialTusFile {
  id: string;
  name: string;
  size: number;
  type: "tus";
  url: string;
}

export type UploadType =
  | "existing"
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

type UploadStatus = "done" | "error" | "uploading";

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

  public abstract getId(): string | undefined;
  public abstract getInitialFile(): InitialFile;
  public abstract getSize(): number | undefined;
}

export default BaseUpload;
