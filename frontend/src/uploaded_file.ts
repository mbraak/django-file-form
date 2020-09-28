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
  uploadIndex: number;
}

export class BaseUploadedFile extends BaseUpload {
  id: string;
  // true for placeholder, false for S3, undefined for regular files
  placeholder?: boolean | undefined;
  size: number;

  constructor({ id, name, size, uploadIndex }: BaseUploadedFileParameters) {
    super({ name, status: "done", uploadIndex });

    this.id = id;
    this.size = size;
  }
}

class PlaceholderFile extends BaseUploadedFile {
  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      name: initialFile.name,
      size: initialFile.size,
      uploadIndex
    });

    this.placeholder = true;
  }
}

export class UploadedS3File extends BaseUploadedFile {
  key: string;

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      name: initialFile.original_name || initialFile.name,
      size: initialFile.size,
      uploadIndex
    });

    this.key = initialFile.name;
    this.placeholder = false;
  }
}

export class UploadedFile extends BaseUploadedFile {
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
