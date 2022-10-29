import { findInput, getMetadataFieldName, getUploadsFieldName } from "./util";
import S3Upload from "./uploads/s3_upload";
import EventEmitter from "eventemitter3";
import { createUploadedFile, InvalidFile } from "./uploads/uploaded_file";
import TusUpload from "./uploads/tus_upload";
import BaseUpload, { InitialFile, Metadata } from "./uploads/base_upload";
import renderUploads from "./renderUploads";
import { RenderFileInfo } from "./renderUploads/types";
import AcceptedFileTypes from "./accepted_file_types";

export type Translations = { [key: string]: string };

export interface Callbacks {
  onDelete?: (upload: BaseUpload) => void;
  onError?: (error: Error, upload: BaseUpload) => void;
  onProgress?: (
    bytesUploaded: number,
    bytesTotal: number,
    upload: BaseUpload
  ) => void;
  onSuccess?: (upload: BaseUpload) => void;
}

interface FileFieldParameters {
  callbacks: Callbacks;
  chunkSize: number;
  csrfToken: string;
  CustomFileInfo?: RenderFileInfo;
  eventEmitter?: EventEmitter;
  fieldName: string;
  form: Element;
  formId: string;
  initial?: InitialFile[];
  input: HTMLInputElement;
  multiple: boolean;
  parent: Element;
  prefix: string | null;
  retryDelays: number[] | null;
  s3UploadDir: string | null;
  skipRequired: boolean;
  supportDropArea: boolean;
  translations: Translations;
  uploadUrl: string;
}

class FileField {
  acceptedFileTypes: AcceptedFileTypes;
  callbacks: Callbacks;
  chunkSize: number;
  container: HTMLElement;
  csrfToken: string;
  CustomFileInfo?: RenderFileInfo;
  eventEmitter?: EventEmitter;
  fieldName: string;
  form: Element;
  formId: string;
  input: HTMLInputElement;
  multiple: boolean;
  nextUploadIndex: number;
  prefix: string | null;
  retryDelays: number[] | null;
  s3UploadDir: string | null;
  skipRequired: boolean;
  supportDropArea: boolean;
  translations: Translations;
  uploads: BaseUpload[];
  uploadUrl: string;

  constructor({
    callbacks,
    chunkSize,
    csrfToken,
    CustomFileInfo,
    eventEmitter,
    fieldName,
    form,
    formId,
    initial,
    input,
    multiple,
    parent,
    prefix,
    retryDelays,
    s3UploadDir,
    skipRequired,
    supportDropArea,
    translations,
    uploadUrl
  }: FileFieldParameters) {
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.csrfToken = csrfToken;
    this.CustomFileInfo = CustomFileInfo;
    this.eventEmitter = eventEmitter;
    this.fieldName = fieldName;
    this.form = form;
    this.formId = formId;
    this.input = input;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.s3UploadDir = s3UploadDir;
    this.skipRequired = skipRequired;
    this.supportDropArea = supportDropArea;
    this.translations = translations;
    this.uploadUrl = uploadUrl;
    this.acceptedFileTypes = new AcceptedFileTypes(input.accept);

    this.uploads = [];
    this.nextUploadIndex = 0;

    this.container = this.createFilesContainer(parent);

    if (initial) {
      this.addInitialFiles(initial);
    }

    this.checkDropHint();

    input.addEventListener("change", this.onChange);

    this.render();
  }

  addInitialFiles(initialFiles: InitialFile[]): void {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple } = this;

    const addInitialFile = (initialFile: InitialFile): void => {
      const upload = createUploadedFile({
        csrfToken: this.csrfToken,
        initialFile,
        uploadIndex: this.nextUploadIndex,
        uploadUrl: this.uploadUrl
      });
      this.uploads.push(upload);

      upload.render = this.render.bind(this);
      upload.updateMetadata = () => {
        this.updateMetadata(upload.name, upload.metadata);
      };
    };

    if (multiple) {
      initialFiles.forEach((file: InitialFile): void => {
        addInitialFile(file);
        this.nextUploadIndex += 1;
      });
    } else {
      addInitialFile(initialFiles[0]);
    }
  }

  updateMetadata(fileName: string, metadata: Metadata): void {
    const metaDataFieldName = getMetadataFieldName(this.fieldName, this.prefix);
    const metaDataInput = findInput(this.form, metaDataFieldName, this.prefix);

    if (!metaDataInput) {
      return;
    }

    const data = metaDataInput.value;

    const metaDataPerFile = data
      ? (JSON.parse(data) as Record<string, Metadata>)
      : {};

    metaDataPerFile[fileName] = metadata;
    metaDataInput.value = JSON.stringify(metaDataPerFile);
  }

  uploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      return;
    }

    if (!this.multiple) {
      this.uploads = [];
    }

    for await (const file of files) {
      await this.uploadFile(file);
    }

    this.checkDropHint();
  };

  async uploadFile(file: File): Promise<void> {
    const createUpload = (): S3Upload | TusUpload => {
      const { csrfToken, s3UploadDir } = this;

      if (s3UploadDir != null) {
        return new S3Upload({
          csrfToken,
          endpoint: uploadUrl,
          file,
          s3UploadDir,
          uploadIndex: newUploadIndex
        });
      } else {
        return new TusUpload({
          chunkSize: this.chunkSize,
          csrfToken: this.csrfToken,
          fieldName,
          file,
          formId,
          retryDelays: this.retryDelays,
          uploadIndex: newUploadIndex,
          uploadUrl
        });
      }
    };

    const { fieldName, formId, uploadUrl } = this;
    const fileName = file.name;
    const existingUpload = this.findUploadByName(fileName);
    const newUploadIndex = existingUpload
      ? existingUpload.uploadIndex
      : this.nextUploadIndex;

    if (!existingUpload) {
      this.nextUploadIndex += 1;
    }

    if (existingUpload) {
      await this.removeExistingUpload(existingUpload);
    }

    const upload = createUpload();

    upload.onError = error => this.handleError(upload, error);
    upload.onProgress = (bytesUploaded, bytesTotal) =>
      this.handleProgress(upload, bytesUploaded, bytesTotal);
    upload.onSuccess = () => this.handleSuccess(upload);
    upload.start();

    upload.render = this.render.bind(this);
    upload.updateMetadata = () => {
      this.updateMetadata(upload.name, upload.metadata);
    };

    this.uploads.push(upload);

    this.render();

    this.emitEvent("addUpload", upload);
  }

  findUploadByName(fileName: string): BaseUpload | undefined {
    return this.uploads.find(upload => upload.name === fileName);
  }

  async removeExistingUpload(upload: BaseUpload): Promise<void> {
    this.emitEvent("removeUpload", upload);

    if (upload.status === "uploading") {
      this.render();
      await upload.abort();
    } else if (upload.status === "done") {
      try {
        upload.deleteStatus = "in_progress";
        this.render();
        await upload.delete();
      } catch {
        upload.deleteStatus = "error";
        this.render();
        return;
      }
    }

    this.removeUploadFromList(upload);
    this.updatePlaceholderInput();
    this.render();
  }

  onChange = (e: Event): void => {
    const files = (e.target as HTMLInputElement).files || [];
    const acceptedFiles: File[] = [];
    const invalidFiles: File[] = [];

    for (const file of files) {
      if (this.acceptedFileTypes.isAccepted(file.name)) {
        acceptedFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    if (invalidFiles) {
      invalidFiles.forEach(file => {
        this.uploads.push(
          new InvalidFile({
            name: file.name,
            uploadIndex: this.nextUploadIndex
          })
        );
        this.nextUploadIndex += 1;
      });
      this.render();
    }

    if (acceptedFiles) {
      void this.uploadFiles([...acceptedFiles]);
    }
  };

  handleProgress = (
    upload: BaseUpload,
    bytesUploaded: number,
    bytesTotal: number
  ): void => {
    upload.progress = (bytesUploaded / bytesTotal) * 100;

    const { onProgress } = this.callbacks;

    if (onProgress) {
      if (upload instanceof TusUpload) {
        onProgress(bytesUploaded, bytesTotal, upload);
      }
    }

    this.render();
  };

  handleError = (upload: BaseUpload, error: Error): void => {
    upload.status = "error";
    this.render();

    const { onError } = this.callbacks;

    if (onError) {
      if (upload instanceof TusUpload) {
        onError(error, upload);
      }
    }
  };

  handleSuccess = (upload: BaseUpload): void => {
    this.updatePlaceholderInput();
    this.input.value = "";
    upload.status = "done";

    this.emitEvent("uploadComplete", upload);

    const { onSuccess } = this.callbacks;
    if (onSuccess && upload.type === "tus") {
      onSuccess(upload);
    }

    this.render();
  };

  removeUploadFromList(upload: BaseUpload): void {
    const index = this.uploads.indexOf(upload);

    if (index >= 0) {
      this.uploads.splice(index, 1);
    }

    this.checkDropHint();

    const { onDelete } = this.callbacks;

    if (onDelete) {
      onDelete(upload);
    }
  }

  async handleCancel(upload: BaseUpload): Promise<void> {
    await upload.abort();
    this.removeUploadFromList(upload);
  }

  checkDropHint(): void {
    if (!this.supportDropArea) {
      return;
    }
  }

  updatePlaceholderInput(): void {
    const input = findInput(
      this.form,
      getUploadsFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (!input) {
      return;
    }

    const placeholdersInfo = this.uploads
      .map(upload => upload.getInitialFile())
      .filter(upload => Boolean(upload)) as InitialFile[];

    input.value = JSON.stringify(placeholdersInfo);
  }

  emitEvent(eventName: string, upload: BaseUpload): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(eventName, {
        fieldName: this.fieldName,
        fileName: upload.name,
        upload
      });
    }
  }

  createFilesContainer = (parent: Element): HTMLElement => {
    const div = document.createElement("div") as HTMLElement;
    div.className = "dff-files";
    parent.appendChild(div);

    return div;
  };

  handleDelete = (upload: BaseUpload): void => {
    void this.removeExistingUpload(upload);
  };

  render(): void {
    this.updateInputRequired();

    renderUploads({
      container: this.container,
      CustomFileInfo: this.CustomFileInfo,
      inputAccept: this.input.accept,
      onDelete: this.handleDelete,
      onUploadFiles: this.uploadFiles,
      supportDropArea: this.supportDropArea,
      translations: this.translations,
      uploads: this.uploads
    });
  }

  updateInputRequired(): void {
    this.input.required = !this.skipRequired && !this.uploads.length;
  }
}

export default FileField;
