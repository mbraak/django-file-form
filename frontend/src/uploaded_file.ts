import BaseUpload from "./base_upload";

export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  original_name?: string;
}

export class BaseUploadedFile extends BaseUpload {
  id: string;
  name: string;
  // true for placeholder, false for S3, undefined for regular files
  placeholder?: boolean | undefined;
  size: number;
  url?: string;

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super("done", uploadIndex);

    this.id = initialFile.id;
    this.name = initialFile.name;
    this.size = initialFile.size;
  }
}

class PlaceholderFile extends BaseUploadedFile {
  constructor(initialFile: InitialFile, uploadIndex: number) {
    super(initialFile, uploadIndex);

    this.placeholder = true;
  }
}

export class UploadedS3File extends BaseUploadedFile {
  original_name: string;

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super(initialFile, uploadIndex);

    this.original_name = initialFile.original_name || initialFile.name;
    this.placeholder = false;
  }
}

class UploadedFile extends BaseUploadedFile {
  constructor(
    initialFile: InitialFile,
    uploadUrl: string,
    uploadIndex: number
  ) {
    super(initialFile, uploadIndex);

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
