export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  original_name?: string;
}

export class BaseUploadedFile {
  id: string;
  name: string;
  // true for placeholder, false for S3, undefined for regular files
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  // available only for S3 uploaded file
  original_name?: string;

  constructor(initialFile: InitialFile) {
    this.id = initialFile.id;
    this.name = initialFile.name;
    this.size = initialFile.size;
  }
}

class PlaceholderFile extends BaseUploadedFile {
  constructor(initialFile: InitialFile) {
    super(initialFile);

    this.placeholder = true;
  }
}

class UploadedS3File extends BaseUploadedFile {
  constructor(initialFile: InitialFile) {
    super(initialFile);

    this.original_name = initialFile.original_name;
    this.placeholder = false;
  }
}

class UploadedFile extends BaseUploadedFile {
  constructor(initialFile: InitialFile, uploadUrl: string) {
    super(initialFile);

    this.url = `${uploadUrl}${initialFile.id}`;
  }
}

export const createUploadedFile = (
  initialFile: InitialFile,
  uploadUrl: string
): BaseUploadedFile => {
  if (initialFile.placeholder === true) {
    return new PlaceholderFile(initialFile);
  } else if (initialFile.placeholder === false) {
    return new UploadedS3File(initialFile);
  } else {
    return new UploadedFile(initialFile, uploadUrl);
  }
};
