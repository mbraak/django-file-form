import BaseUpload, {
  InitialExistingFile,
  InitialFile,
  InitialPlaceholderFile,
  InitialS3File,
  InitialTusFile,
  Metadata,
  UploadType
} from "./base_upload";
import { deleteUpload } from "./tus_utils";

interface BaseUploadedFileParameters {
  metadata?: Metadata;
  name: string;
  size: number;
  type: UploadType;
  uploadIndex: number;
}

export abstract class BaseUploadedFile extends BaseUpload {
  size: number;

  constructor({
    metadata,
    name,
    size,
    type,
    uploadIndex
  }: BaseUploadedFileParameters) {
    super({ metadata, name, status: "done", type, uploadIndex });

    this.size = size;
  }

  public async abort(): Promise<void> {
    return Promise.resolve();
  }

  public async delete(): Promise<void> {
    return Promise.resolve();
  }

  public getSize(): number | undefined {
    return this.size;
  }
}

interface PlaceholderFileParameters {
  initialFile: InitialPlaceholderFile;
  uploadIndex: number;
}

class PlaceholderFile extends BaseUploadedFile {
  id: string;

  constructor({ initialFile, uploadIndex }: PlaceholderFileParameters) {
    super({
      metadata: initialFile.metadata,
      name: initialFile.name,
      size: initialFile.size,
      type: "placeholder",
      uploadIndex
    });

    this.id = initialFile.id;
  }

  public getInitialFile(): InitialPlaceholderFile {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: "placeholder"
    };
  }
}

interface UploadedS3FileParameters {
  initialFile: InitialS3File;
  uploadIndex: number;
}

export class UploadedS3File extends BaseUploadedFile {
  id: string;
  key: string;

  constructor({ initialFile, uploadIndex }: UploadedS3FileParameters) {
    super({
      metadata: initialFile.metadata,
      name: initialFile.original_name || initialFile.name,
      size: initialFile.size,
      type: "uploadedS3",
      uploadIndex
    });

    this.id = initialFile.id;
    this.key = initialFile.name;
  }

  getInitialFile(): InitialS3File {
    return {
      id: this.id,
      name: this.key,
      original_name: this.name,
      size: this.size,
      type: "s3"
    };
  }
}

export class ExistingFile extends BaseUploadedFile {
  constructor(initialFile: InitialExistingFile, uploadIndex: number) {
    super({
      name: initialFile.name,
      size: initialFile.size,
      type: "existing",
      uploadIndex
    });
  }

  public getInitialFile(): InitialExistingFile {
    return {
      name: this.name,
      size: this.size,
      type: "existing"
    };
  }
}

interface UploadedTusFileParameters {
  csrfToken: string;
  initialFile: InitialTusFile;
  uploadIndex: number;
  uploadUrl: string;
}

export class UploadedTusFile extends BaseUploadedFile {
  csrfToken: string;
  id: string;
  url: string;

  constructor({
    csrfToken,
    initialFile,
    uploadIndex,
    uploadUrl
  }: UploadedTusFileParameters) {
    super({
      metadata: initialFile.metadata,
      name: initialFile.name,
      size: initialFile.size,
      type: "uploadedTus",
      uploadIndex
    });

    this.csrfToken = csrfToken;
    this.id = initialFile.id;
    this.url = `${uploadUrl}${initialFile.id}`;
  }

  public async delete(): Promise<void> {
    await deleteUpload(this.url, this.csrfToken);
  }

  getInitialFile(): InitialTusFile {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: "tus",
      url: ""
    };
  }
}

interface UploadedFileParameters {
  csrfToken: string;
  initialFile: InitialFile;
  uploadIndex: number;
  uploadUrl: string;
}

export const createUploadedFile = ({
  csrfToken,
  initialFile,
  uploadIndex,
  uploadUrl
}: UploadedFileParameters): BaseUploadedFile => {
  switch (initialFile.type) {
    case "existing":
      return new ExistingFile(initialFile, uploadIndex);

    case "placeholder":
      return new PlaceholderFile({ initialFile, uploadIndex });

    case "s3":
      return new UploadedS3File({ initialFile, uploadIndex });

    case "tus":
      return new UploadedTusFile({
        csrfToken,
        initialFile,
        uploadUrl,
        uploadIndex
      });
  }
};
