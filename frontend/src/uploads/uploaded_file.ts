import BaseUpload from "./base_upload";

export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  original_name?: string;
}

interface BaseUploadedFileParameters {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadIndex: number;
}

export class BaseUploadedFile extends BaseUpload {
  id: string;
  // true for placeholder, false for S3, undefined for regular files
  placeholder?: boolean | undefined;
  size: number;

  constructor({
    id,
    name,
    size,
    type,
    uploadIndex
  }: BaseUploadedFileParameters) {
    super({ name, status: "done", type, uploadIndex });

    this.id = id;
    this.size = size;
  }
}

class PlaceholderFile extends BaseUploadedFile {
  type: "placeholder";

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      name: initialFile.name,
      size: initialFile.size,
      type: "placeholder",
      uploadIndex
    });

    this.placeholder = true;
  }
}

export class UploadedS3File extends BaseUploadedFile {
  key: string;
  type: "uploadedS3";

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      name: initialFile.original_name || initialFile.name,
      size: initialFile.size,
      type: "uploadedS3",
      uploadIndex
    });

    this.key = initialFile.name;
    this.placeholder = false;
  }
}

export class UploadedFile extends BaseUploadedFile {
  type: "uploadedTus";
  url: string;

  constructor(
    initialFile: InitialFile,
    uploadUrl: string,
    uploadIndex: number
  ) {
    super({
      id: initialFile.id,
      name: initialFile.name,
      size: initialFile.size,
      type: "uploadedTus",
      uploadIndex
    });

    this.url = `${uploadUrl}${initialFile.id}`;
  }
}

export const createUploadedFile = (
  initialFile: InitialFile,
  uploadUrl: string,
  uploadIndex: number
): BaseUploadedFile => {
  if (initialFile.placeholder === true) {
    return new PlaceholderFile(initialFile, uploadIndex);
  } else if (initialFile.placeholder === false) {
    return new UploadedS3File(initialFile, uploadIndex);
  } else {
    return new UploadedFile(initialFile, uploadUrl, uploadIndex);
  }
};
