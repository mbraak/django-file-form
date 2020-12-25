import BaseUpload, { Metadata } from "./base_upload";
import { deleteUpload } from "./tus_utils";

export interface InitialFile {
  id: string;
  metadata?: Metadata;
  name: string;
  original_name?: string;
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
}

interface BaseUploadedFileParameters {
  id: string;
  metadata?: Metadata;
  name: string;
  size: number;
  type: string;
  uploadIndex: number;
}

export class BaseUploadedFile extends BaseUpload {
  id: string;
  size: number;

  constructor({
    id,
    metadata,
    name,
    size,
    type,
    uploadIndex
  }: BaseUploadedFileParameters) {
    super({ metadata, name, status: "done", type, uploadIndex });

    this.id = id;
    this.metadata;
    this.size = size;
  }

  public async abort(): Promise<void> {
    return Promise.resolve();
  }

  public async delete(): Promise<void> {
    return Promise.resolve();
  }

  public getSize(): number {
    return this.size;
  }
}

class PlaceholderFile extends BaseUploadedFile {
  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      metadata: initialFile.metadata,
      name: initialFile.name,
      size: initialFile.size,
      type: "placeholder",
      uploadIndex
    });
  }
}

export class UploadedS3File extends BaseUploadedFile {
  key: string;

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
      metadata: initialFile.metadata,
      name: initialFile.original_name || initialFile.name,
      size: initialFile.size,
      type: "uploadedS3",
      uploadIndex
    });

    this.key = initialFile.name;
  }

  getInitialFile(): InitialFile {
    return {
      id: this.id,
      name: this.key,
      original_name: this.name,
      size: this.size
    };
  }
}

interface UploadedTusFileParameters {
  csrfToken: string;
  initialFile: InitialFile;
  uploadUrl: string;
  uploadIndex: number;
}

export class UploadedTusFile extends BaseUploadedFile {
  csrfToken: string;
  url: string;

  constructor({
    csrfToken,
    initialFile,
    uploadUrl,
    uploadIndex
  }: UploadedTusFileParameters) {
    super({
      id: initialFile.id,
      metadata: initialFile.metadata,
      name: initialFile.name,
      size: initialFile.size,
      type: "uploadedTus",
      uploadIndex
    });

    this.csrfToken = csrfToken;
    this.url = `${uploadUrl}${initialFile.id}`;
  }

  public async delete(): Promise<void> {
    await deleteUpload(this.url, this.csrfToken);
  }
}

interface UploadedFileParameters {
  csrfToken: string;
  initialFile: InitialFile;
  uploadUrl: string;
  uploadIndex: number;
}

export const createUploadedFile = ({
  csrfToken,
  initialFile,
  uploadUrl,
  uploadIndex
}: UploadedFileParameters): BaseUploadedFile => {
  if (initialFile.placeholder === true) {
    return new PlaceholderFile(initialFile, uploadIndex);
  } else if (initialFile.placeholder === false) {
    return new UploadedS3File(initialFile, uploadIndex);
  } else {
    return new UploadedTusFile({
      csrfToken,
      initialFile,
      uploadUrl,
      uploadIndex
    });
  }
};
