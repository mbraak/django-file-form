import {
  findInput,
  getMetadataFieldName,
  getPlaceholderFieldName,
  getS3UploadedFieldName
} from "./util";
import RenderUploadFile from "./render_upload_file";
import DropArea from "./drop_area";

import S3Upload from "./uploads/s3_upload";
import EventEmitter from "eventemitter3";
import {
  createUploadedFile,
  InitialFile,
  UploadedS3File
} from "./uploads/uploaded_file";
import TusUpload from "./uploads/tus_upload";
import BaseUpload from "./uploads/base_upload";

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

class FileField {
  callbacks: Callbacks;
  chunkSize: number;
  eventEmitter?: EventEmitter;
  fieldName: string;
  form: Element;
  formId: string;
  multiple: boolean;
  nextUploadIndex: number;
  prefix: string | null;
  renderer: RenderUploadFile;
  retryDelays: number[] | null;
  s3UploadDir: string | null;
  supportDropArea: boolean;
  uploads: BaseUpload[];
  uploadUrl: string;

  constructor({
    callbacks,
    chunkSize,
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
  }: {
    callbacks: Callbacks;
    chunkSize: number;
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
  }) {
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.eventEmitter = eventEmitter;
    this.fieldName = fieldName;
    this.form = form;
    this.formId = formId;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.s3UploadDir = s3UploadDir;
    this.supportDropArea = supportDropArea;
    this.uploadUrl = uploadUrl;

    this.uploads = [];
    this.nextUploadIndex = 0;

    this.renderer = new RenderUploadFile({
      parent,
      input,
      skipRequired,
      translations
    });
    const filesContainer = this.renderer.container;

    if (supportDropArea) {
      this.initDropArea(filesContainer, input.accept);
    }

    if (initial) {
      this.addInitialFiles(initial);
    }

    this.checkDropHint();

    input.addEventListener("change", this.onChange);
    filesContainer.addEventListener("click", this.onClick);
  }

  addInitialFiles(initialFiles: InitialFile[]): void {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    const addInitialFile = (initialFile: InitialFile): void => {
      const { name, size } = initialFile;
      const element = renderer.addUploadedFile(
        initialFile.original_name ? initialFile.original_name : name,
        this.nextUploadIndex,
        size
      );

      const upload = createUploadedFile(
        initialFile,
        this.uploadUrl,
        this.nextUploadIndex
      );
      this.uploads.push(upload);

      this.emitEvent("addUpload", element, upload);
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
      this.renderer.deleteFile(0);
      this.uploads = [];
    }

    for await (const file of files) {
      await this.uploadFile(file);
    }

    this.checkDropHint();
  };

  async uploadFile(file: File): Promise<void> {
    const createUpload = (): S3Upload | TusUpload => {
      const { s3UploadDir } = this;

      if (s3UploadDir != null) {
        return new S3Upload(file, newUploadIndex, {
          endpoint: uploadUrl,
          s3UploadDir
        });
      } else {
        return new TusUpload(file, newUploadIndex, {
          chunkSize: this.chunkSize,
          fieldName,
          formId,
          retryDelays: this.retryDelays,
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

    upload.onError = error => this.handleError(upload, error);
    upload.onProgress = (bytesUploaded, bytesTotal) =>
      this.handleProgress(upload, bytesUploaded, bytesTotal);
    upload.onSuccess = () => this.handleSuccess(upload);
    upload.start();

    this.uploads.push(upload);

    const element = renderer.addNewUpload(fileName, newUploadIndex);
    this.emitEvent("addUpload", element, upload);
  }

  getUploadByIndex(uploadIndex: number): BaseUpload | undefined {
    return this.uploads.find(upload => upload.uploadIndex === uploadIndex);
  }

  findUploadByName(fileName: string): BaseUpload | undefined {
    return this.uploads.find(upload => upload.name === fileName);
  }

  async removeExistingUpload(upload: BaseUpload): Promise<void> {
    const element = this.renderer.findFileDiv(upload.uploadIndex);

    if (element) {
      this.emitEvent("removeUpload", element, upload);
    }

    if (upload.status === "uploading") {
      upload.abort();
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
    this.updateS3UploadedInput();
    this.updatePlaceholderInput();
  }

  onChange = (e: Event): void => {
    void this.uploadFiles([...(e.target as HTMLInputElement).files]);
  };

  onClick = (e: Event): void => {
    const target = e.target as HTMLInputElement;

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
      const upload = getUpload();

      if (upload) {
        void this.removeExistingUpload(upload);
      }

      e.preventDefault();
    } else if (target.classList.contains("dff-cancel")) {
      const upload = getUpload();

      if (upload) {
        this.handleCancel(upload);
      }

      e.preventDefault();
    }
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

  handleError = (upload: BaseUpload, error: Error): void => {
    this.renderer.setError(upload.uploadIndex);
    upload.status = "error";

    const { onError } = this.callbacks;

    if (onError) {
      if (upload instanceof TusUpload) {
        onError(error, upload);
      }
    }
  };

  handleSuccess = (upload: BaseUpload): void => {
    const { renderer } = this;

    this.updateS3UploadedInput();
    renderer.clearInput();
    renderer.setSuccess(upload.uploadIndex, upload.getSize());
    upload.status = "done";

    const { onSuccess } = this.callbacks;

    const element = document.getElementsByClassName(
      `dff-file-id-${upload.uploadIndex}`
    )[0] as HTMLElement;
    this.emitEvent("uploadComplete", element, upload);

    if (onSuccess && upload.type === "tus") {
      onSuccess(upload);
    }
  };

  removeUploadFromList(upload: BaseUpload): void {
    this.renderer.deleteFile(upload.uploadIndex);
    this.uploads.splice(upload.uploadIndex, 1);

    this.checkDropHint();

    const { onDelete } = this.callbacks;

    if (onDelete) {
      onDelete(upload);
    }
  }

  handleCancel(upload: BaseUpload): void {
    upload.abort();
    this.removeUploadFromList(upload);
  }

  initDropArea(container: Element, inputAccept: string): void {
    new DropArea({
      container,
      inputAccept,
      onUploadFiles: this.uploadFiles
    });
  }

  checkDropHint(): void {
    if (!this.supportDropArea) {
      return;
    }

    const nonEmptyUploads = this.uploads.filter(e => e);

    if (nonEmptyUploads.length === 0) {
      this.renderer.renderDropHint();
    } else {
      this.renderer.removeDropHint();
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
}

export default FileField;
