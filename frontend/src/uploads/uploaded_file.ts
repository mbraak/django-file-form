import BaseUpload, { InitialFile, UploadType } from "./base_upload";
import { deleteUpload } from "./tus_utils";

interface BaseUploadedFileParameters {
  id: string;
  name: string;
  size: number;
  type: UploadType;
  uploadIndex: number;
}

export abstract class BaseUploadedFile extends BaseUpload {
  id: string;
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
      name: initialFile.name,
      size: initialFile.size,
      type: "placeholder",
      uploadIndex
    });
  }

  public getInitialFile(): InitialFile {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: "placeholder"
    };
  }
}

export class UploadedS3File extends BaseUploadedFile {
  key: string;

  constructor(initialFile: InitialFile, uploadIndex: number) {
    super({
      id: initialFile.id,
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
      size: this.size,
      type: "s3"
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

  getInitialFile(): InitialFile {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: "tus"
    };
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
  switch (initialFile.type) {
    case "placeholder":
      return new PlaceholderFile(initialFile, uploadIndex);

    case "s3":
      return new UploadedS3File(initialFile, uploadIndex);

    case "tus":
      return new UploadedTusFile({
        csrfToken,
        initialFile,
        uploadUrl,
        uploadIndex
      });

    default:
      throw new Error(`Unknown upload type ${initialFile.type as string}`);
  }
};
