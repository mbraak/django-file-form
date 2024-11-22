import { EventEmitter } from "eventemitter3";

import AcceptedFileTypes from "./accepted_file_types.ts";
import DropArea from "./drop_area.ts";
import RenderUploadFile from "./render_upload_file.ts";
import BaseUpload, { InitialFile, UploadType } from "./uploads/base_upload.ts";
import S3Upload from "./uploads/s3_upload.ts";
import TusUpload from "./uploads/tus_upload.ts";
import { createUploadedFile } from "./uploads/uploaded_file.ts";
import {
  findInput,
  getMetadataFieldName,
  getUploadsFieldName
} from "./util.ts";

export interface Callbacks {
  onClick?: ({ fieldName, fileName, type }: ClickEvent) => void;
  onDelete?: (upload: BaseUpload) => void;
  onError?: (error: unknown, upload: BaseUpload) => void;
  onProgress?: (
    bytesUploaded: number,
    bytesTotal: number,
    upload: BaseUpload
  ) => void;
  onSuccess?: (upload: BaseUpload) => void;
}

export type Translations = Record<string, string>;

interface ClickEvent {
  fieldName: string;
  fileName: string;
  id?: string;
  type: UploadType;
}

interface ConstructorParams {
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
  prefix: null | string;
  retryDelays: null | number[];
  s3UploadDir: null | string;
  skipRequired: boolean;
  supportDropArea: boolean;
  translations: Translations;
  uploadUrl: string;
}

class FileField {
  acceptedFileTypes: AcceptedFileTypes;
  callbacks: Callbacks;
  chunkSize: number;
  csrfToken: string;
  eventEmitter?: EventEmitter;
  fieldName: string;
  form: Element;
  formId: string;
  multiple: boolean;
  nextUploadIndex: number;
  prefix: null | string;
  renderer: RenderUploadFile;
  retryDelays: null | number[];
  s3UploadDir: null | string;
  supportDropArea: boolean;
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
  }: ConstructorParams) {
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.csrfToken = csrfToken;
    this.eventEmitter = eventEmitter;
    this.fieldName = fieldName;
    this.form = form;
    this.formId = formId;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.s3UploadDir = s3UploadDir;
    this.supportDropArea = supportDropArea && !input.disabled;
    this.uploadUrl = uploadUrl;
    this.acceptedFileTypes = new AcceptedFileTypes(input.accept);

    this.uploads = [];
    this.nextUploadIndex = 0;

    this.renderer = new RenderUploadFile({
      input,
      parent,
      skipRequired,
      translations
    });
    const filesContainer = this.renderer.container;

    if (supportDropArea) {
      this.initDropArea(filesContainer, input.accept);
    }

    this.addInitialFiles(initial);

    this.checkDropHint();

    input.addEventListener("change", this.onChange);
    filesContainer.addEventListener("click", this.handleClick);
  }

  addInitialFiles(initialFiles: InitialFile[]): void {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    const addInitialFile = (initialFile: InitialFile): void => {
      const { size } = initialFile;
      const name =
        initialFile.type === "s3" && initialFile.original_name
          ? initialFile.original_name
          : initialFile.name;

      const element = renderer.addUploadedFile(
        name,
        this.nextUploadIndex,
        size
      );

      const upload = createUploadedFile({
        csrfToken: this.csrfToken,
        initialFile,
        uploadIndex: this.nextUploadIndex,
        uploadUrl: this.uploadUrl
      });
      this.uploads.push(upload);

      this.emitEvent("addUpload", element, upload);
    };

    if (multiple) {
      initialFiles.forEach((file: InitialFile): void => {
        addInitialFile(file);
        this.nextUploadIndex += 1;
      });
    } else {
      const initialFile = initialFiles[0];

      if (initialFile) {
        addInitialFile(initialFile);
      }
    }
  }

  checkDropHint(): void {
    if (!this.supportDropArea) {
      return;
    }

    const nonEmptyUploads = this.uploads.filter(e => Boolean(e));

    if (nonEmptyUploads.length === 0) {
      this.renderer.renderDropHint();
    } else {
      this.renderer.removeDropHint();
    }
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

  findUploadByName(fileName: string): BaseUpload | undefined {
    return this.uploads.find(upload => upload.name === fileName);
  }

  getMetaDataField(): HTMLElement | null {
    return findInput(
      this.form,
      getMetadataFieldName(this.fieldName, this.prefix),
      this.prefix
    );
  }

  getUploadByIndex(uploadIndex: number): BaseUpload | undefined {
    return this.uploads.find(upload => upload.uploadIndex === uploadIndex);
  }

  async handleCancel(upload: BaseUpload): Promise<void> {
    this.renderer.disableCancel(upload.uploadIndex);
    await upload.abort();
    this.removeUploadFromList(upload);
  }

  handleClick = (e: Event): void => {
    const target = e.target as HTMLElement;

    const getUpload = (): BaseUpload | undefined => {
      const dataIndex = target.getAttribute("data-index");

      if (!dataIndex) {
        return undefined;
      }

      const uploadIndex = parseInt(dataIndex, 10);
      return this.getUploadByIndex(uploadIndex);
    };

    if (
      target.classList.contains("dff-delete") &&
      !target.classList.contains("dff-disabled")
    ) {
      e.preventDefault();

      const upload = getUpload();

      if (upload) {
        void this.removeExistingUpload(upload);
      }
    } else if (target.classList.contains("dff-cancel")) {
      e.preventDefault();

      const upload = getUpload();

      if (upload) {
        void this.handleCancel(upload);
      }
    } else if (target.classList.contains("dff-filename")) {
      e.preventDefault();

      const upload = getUpload();

      if (upload?.status === "done" && this.callbacks.onClick) {
        this.callbacks.onClick({
          fieldName: this.fieldName,
          fileName: upload.name,
          id: upload.getId(),
          type: upload.type
        });
      }
    }
  };

  handleError = (upload: BaseUpload, error: unknown): void => {
    this.renderer.setError(upload.uploadIndex);
    upload.status = "error";

    const { onError } = this.callbacks;

    if (onError) {
      if (upload instanceof TusUpload) {
        onError(error, upload);
      }
    }
  };

  handleInvalidFiles = (files: File[]): void => {
    this.renderer.setErrorInvalidFiles(files);
  };

  handleProgress = (
    upload: BaseUpload,
    bytesUploaded: number,
    bytesTotal: number
  ): void => {
    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    this.renderer.updateProgress(upload.uploadIndex, percentage);

    const { onProgress } = this.callbacks;

    if (onProgress) {
      if (upload instanceof TusUpload) {
        onProgress(bytesUploaded, bytesTotal, upload);
      }
    }
  };

  handleSuccess = (upload: BaseUpload): void => {
    const { renderer } = this;

    this.updatePlaceholderInput();

    renderer.clearInput();
    renderer.setSuccess(upload.uploadIndex, upload.getSize());
    upload.status = "done";

    const { onSuccess } = this.callbacks;

    const element = this.renderer.findFileDiv(upload.uploadIndex);

    if (element) {
      this.emitEvent("uploadComplete", element, upload);
    }

    if (onSuccess && upload.type === "tus") {
      onSuccess(upload);
    }
  };

  initDropArea(container: Element, inputAccept: string): void {
    new DropArea({
      container,
      inputAccept,
      onUploadFiles: this.uploadFiles,
      renderer: this.renderer
    });
  }

  onChange = (e: Event): void => {
    const files = (e.target as HTMLInputElement).files ?? ([] as File[]);
    const acceptedFiles: File[] = [];
    const invalidFiles: File[] = [];

    for (const file of files) {
      if (this.acceptedFileTypes.isAccepted(file.name)) {
        acceptedFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    this.handleInvalidFiles([...invalidFiles]);
    void this.uploadFiles([...acceptedFiles]);

    this.renderer.clearInput();
  };

  async removeExistingUpload(upload: BaseUpload): Promise<void> {
    const element = this.renderer.findFileDiv(upload.uploadIndex);

    if (element) {
      this.emitEvent("removeUpload", element, upload);
    }

    if (upload.status === "uploading") {
      this.renderer.disableCancel(upload.uploadIndex);
      await upload.abort();
    } else if (upload.status === "done") {
      this.renderer.disableDelete(upload.uploadIndex);

      try {
        await upload.delete();
      } catch {
        this.renderer.setDeleteFailed(upload.uploadIndex);
        return;
      }
    }

    this.removeUploadFromList(upload);
    this.updatePlaceholderInput();
  }

  removeUploadFromList(upload: BaseUpload): void {
    this.renderer.deleteFile(upload.uploadIndex);

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

  updatePlaceholderInput(): void {
    const input = findInput(
      this.form,
      getUploadsFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (!input) {
      return;
    }

    const placeholdersInfo: InitialFile[] = this.uploads.map(upload =>
      upload.getInitialFile()
    );

    input.value = JSON.stringify(placeholdersInfo);
  }

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

    const { fieldName, formId, renderer, uploadUrl } = this;
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

    upload.onError = (error: unknown) => {
      this.handleError(upload, error);
    };
    upload.onProgress = (bytesUploaded, bytesTotal) => {
      this.handleProgress(upload, bytesUploaded, bytesTotal);
    };
    upload.onSuccess = () => {
      this.handleSuccess(upload);
    };
    upload.start();

    this.uploads.push(upload);

    const element = renderer.addNewUpload(fileName, newUploadIndex);
    this.emitEvent("addUpload", element, upload);
  }

  uploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      return;
    }

    if (!this.multiple) {
      for (const upload of this.uploads) {
        this.renderer.deleteFile(upload.uploadIndex);
      }

      this.uploads = [];
      const file = files[0];

      if (file) {
        await this.uploadFile(file);
      }
    } else {
      for (const file of files) {
        await this.uploadFile(file);
      }
    }

    this.checkDropHint();
  };
}

export default FileField;
