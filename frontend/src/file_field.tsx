import {
  findInput,
  getMetadataFieldName,
  getPlaceholderFieldName,
  getS3UploadedFieldName
} from "./util";

import S3Upload from "./uploads/s3_upload";
import EventEmitter from "eventemitter3";
import {
  createUploadedFile,
  InitialFile,
  UploadedS3File
} from "./uploads/uploaded_file";
import TusUpload from "./uploads/tus_upload";
import BaseUpload from "./uploads/base_upload";
import renderUploads, { Translations } from "./renderUploads";

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

interface FileFileParameters {
  callbacks: Callbacks;
  chunkSize: number;
  csrfToken: string;
  eventEmitter?: EventEmitter;
  fieldName: string;
  form: Element;
  formId: string;
  initial: InitialFile[];
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
  callbacks: Callbacks;
  chunkSize: number;
  container: HTMLElement;
  csrfToken: string;
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
  }: FileFileParameters) {
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.csrfToken = csrfToken;
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

  uploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      return;
    }

    if (!this.multiple && this.uploads.length !== 0) {
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

    this.uploads.push(upload);

    this.render();

    // todo: event
    //this.emitEvent("addUpload", element, upload);
  }

  getUploadByIndex(uploadIndex: number): BaseUpload | undefined {
    return this.uploads.find(upload => upload.uploadIndex === uploadIndex);
  }

  findUploadByName(fileName: string): BaseUpload | undefined {
    return this.uploads.find(upload => upload.name === fileName);
  }

  async removeExistingUpload(upload: BaseUpload): Promise<void> {
    // todo
    // this.emitEvent("removeUpload", element, upload);

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
    this.updateS3UploadedInput();
    this.updatePlaceholderInput();
    this.render();
  }

  onChange = (e: Event): void => {
    void this.uploadFiles([...(e.target as HTMLInputElement).files]);
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
    this.updateS3UploadedInput();
    this.input.value = "";
    upload.status = "done";

    const { onSuccess } = this.callbacks;

    const element = document.getElementsByClassName(
      `dff-file-id-${upload.uploadIndex}`
    )[0] as HTMLElement;
    this.emitEvent("uploadComplete", element, upload);

    if (onSuccess && upload.type === "tus") {
      onSuccess(upload);
    }

    this.render();
  };

  removeUploadFromList(upload: BaseUpload): void {
    this.uploads.splice(upload.uploadIndex, 1);

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
      getPlaceholderFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (!input) {
      return;
    }

    const placeholdersInfo = this.uploads.filter(
      upload => upload.type === "placeholder"
    );
    input.value = JSON.stringify(placeholdersInfo);
  }

  updateS3UploadedInput(): void {
    const input = findInput(
      this.form,
      getS3UploadedFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (!input) {
      return;
    }

    const uploadedInfo: InitialFile[] = this.uploads
      .filter(upload => upload.type === "s3" || upload.type === "uploadedS3")
      .map(upload => (upload as S3Upload | UploadedS3File).getInitialFile());

    input.value = JSON.stringify(uploadedInfo);
  }

  getMetaDataField(): HTMLElement | null {
    return findInput(
      this.form,
      getMetadataFieldName(this.fieldName, this.prefix),
      this.prefix
    );
  }

  emitEvent(eventName: string, element: HTMLElement, upload: BaseUpload): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(eventName, {
        element,
        fieldName: this.fieldName,
        fileName: upload.name,
        metaDataField: this.getMetaDataField(),
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
      onDelete: this.handleDelete,
      translations: this.translations,
      uploads: this.uploads
    });
  }

  updateInputRequired(): void {
    this.input.required = !this.skipRequired && !this.uploads.length;
  }
}

export default FileField;
