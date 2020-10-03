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
  BaseUploadedFile,
  createUploadedFile,
  InitialFile,
  UploadedFile,
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

  uploadFiles = (files: File[]): void => {
    if (files.length === 0) {
      return;
    }

    if (!this.multiple && this.uploads.length !== 0) {
      this.renderer.deleteFile(0);
      this.uploads = [];
    }

    files.forEach(file => {
      this.uploadFile(file);
    });

    this.checkDropHint();
  };

  uploadFile(file: File): void {
    const { fieldName, formId, s3UploadDir, renderer, uploadUrl } = this;
    const fileName = file.name;
    const existingUpload = this.findUploadByName(fileName);
    const newUploadIndex = existingUpload
      ? existingUpload.uploadIndex
      : this.nextUploadIndex;

    if (!existingUpload) {
      this.nextUploadIndex += 1;
    }

    if (existingUpload) {
      this.removeExistingUpload(existingUpload);
    }

    let upload: S3Upload | TusUpload | null = null;

    if (s3UploadDir != null) {
      upload = new S3Upload(file, newUploadIndex, {
        endpoint: uploadUrl,
        onProgress: (bytesUploaded: number, bytesTotal: number): void =>
          this.handleProgress(newUploadIndex, bytesUploaded, bytesTotal),
        onError: (error: Error): void =>
          this.handleError(newUploadIndex, error),
        onSuccess: (): void =>
          this.handleSuccess(newUploadIndex, (upload as S3Upload).file.size),
        s3UploadDir
      });
      upload.start();
    } else {
      upload = new TusUpload(file, newUploadIndex, {
        chunkSize: this.chunkSize,
        fieldName,
        formId,
        onError: (error: Error): void =>
          this.handleError(newUploadIndex, error),
        onProgress: (bytesUploaded: number, bytesTotal: number): void =>
          this.handleProgress(newUploadIndex, bytesUploaded, bytesTotal),
        onSuccess: (size: number): void =>
          this.handleSuccess(newUploadIndex, size),
        retryDelays: this.retryDelays,
        uploadUrl
      });
    }

    const element = renderer.addNewUpload(fileName, newUploadIndex);
    this.uploads.push(upload);

    this.emitEvent("addUpload", element, upload);
  }

  getUploadByIndex(uploadIndex: number): BaseUpload | undefined {
    return this.uploads.find(upload => upload?.uploadIndex === uploadIndex);
  }

  findUploadByName(fileName: string): BaseUpload | undefined {
    return this.uploads.find(upload => upload && upload.name === fileName);
  }

  removeExistingUpload(upload: BaseUpload): void {
    if (upload.status === "uploading") {
      void (upload as TusUpload).abort();
    }

    const element = this.renderer.findFileDiv(upload.uploadIndex);

    if (element) {
      this.emitEvent("removeUpload", element, upload);
    }

    if (
      upload instanceof TusUpload ||
      upload instanceof S3Upload ||
      (upload as UploadedFile).url
    ) {
      switch (upload.status) {
        case "done": {
          if (upload instanceof S3Upload) {
            this.deleteS3Uploaded(upload);
          } else {
            this.deleteFromServer(upload);
          }
          break;
        }

        case "error":
        case "uploading": {
          this.removeUploadFromList(upload);
          break;
        }
      }
    } else if ((upload as BaseUploadedFile).placeholder) {
      this.deletePlaceholder(upload);
    }
  }

  onChange = (e: Event): void => {
    this.uploadFiles([...(e.target as HTMLInputElement).files]);
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
        this.removeExistingUpload(upload);
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
    uploadIndex: number,
    bytesUploaded: number,
    bytesTotal: number
  ): void => {
    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    this.renderer.updateProgress(uploadIndex, percentage);

    const { onProgress } = this.callbacks;

    if (onProgress) {
      const upload = this.getUploadByIndex(uploadIndex);

      if (upload && upload instanceof TusUpload) {
        onProgress(bytesUploaded, bytesTotal, upload);
      }
    }
  };

  handleError = (uploadIndex: number, error: Error): void => {
    const upload = this.getUploadByIndex(uploadIndex);

    if (!upload) {
      return;
    }

    this.renderer.setError(uploadIndex);
    upload.status = "error";

    const { onError } = this.callbacks;

    if (onError) {
      if (upload instanceof TusUpload) {
        onError(error, upload);
      }
    }
  };

  handleSuccess = (uploadIndex: number, uploadedSize: number): void => {
    const upload = this.getUploadByIndex(uploadIndex);

    if (!upload) {
      return;
    }

    const { renderer } = this;
    this.updateS3UploadedInput();
    renderer.clearInput();
    renderer.setSuccess(uploadIndex, uploadedSize);
    upload.status = "done";

    const { onSuccess } = this.callbacks;

    const element = document.getElementsByClassName(
      `dff-file-id-${uploadIndex}`
    )[0] as HTMLElement;
    this.emitEvent("uploadComplete", element, upload);

    if (onSuccess) {
      if (upload instanceof TusUpload) {
        onSuccess(upload);
      }
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

  deleteFromServer(upload: BaseUpload): void {
    let url = null;
    if (upload instanceof TusUpload) {
      url = upload.getUrl();
    } else {
      url = (upload as UploadedFile).url;
    }

    if (!url) {
      return;
    }

    this.renderer.disableDelete(upload.uploadIndex);

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = (): void => {
      if (xhr.status === 204) {
        this.removeUploadFromList(upload);
      } else {
        this.renderer.setDeleteFailed(upload.uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  deletePlaceholder(upload: BaseUpload): void {
    this.removeUploadFromList(upload);
    this.updatePlaceholderInput();
  }

  deleteS3Uploaded(upload: BaseUpload): void {
    this.removeUploadFromList(upload);
    this.updateS3UploadedInput();
  }

  handleCancel(upload: BaseUpload): void {
    if (upload instanceof TusUpload) {
      void upload.abort();
      this.removeUploadFromList(upload);
    } else if (upload instanceof S3Upload) {
      upload.abort();
      this.removeUploadFromList(upload);
    }
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
    const placeholdersInfo = this.uploads.filter(
      upload =>
        upload &&
        !(upload instanceof TusUpload) &&
        !(upload instanceof S3Upload) &&
        (upload as BaseUploadedFile).placeholder
    ) as BaseUploadedFile[];

    const input = findInput(
      this.form,
      getPlaceholderFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (input) {
      input.value = JSON.stringify(placeholdersInfo);
    }
  }

  updateS3UploadedInput(): void {
    // upload could be
    // 1. A regular Upload object
    // 2. A map object with .placeholder == true
    // 3. A map object with .placeholder == false, created when the form is reloaded
    // 4. An S3Uploader object that will need to be saved as UploadedFile
    // the latter two cases are handled here

    const s3Uploads: InitialFile[] = this.uploads
      .filter(upload => upload instanceof S3Upload)
      .map(upload => {
        const s3Upload = upload as S3Upload;
        return {
          id: s3Upload.uploadId || "",
          name: s3Upload.key || "",
          placeholder: false,
          size: s3Upload.file.size,
          original_name: s3Upload.file.name
        };
      });

    const uploadedInfo: InitialFile[] = this.uploads
      .filter(upload => upload && upload instanceof UploadedS3File)
      .map(upload => {
        const uploadedS3File = upload as UploadedS3File;

        return {
          id: uploadedS3File.id,
          name: uploadedS3File.key,
          original_name: uploadedS3File.name,
          size: uploadedS3File.size
        } as InitialFile;
      })
      .concat(s3Uploads);

    const input = findInput(
      this.form,
      getS3UploadedFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (input) {
      input.value = JSON.stringify(uploadedInfo);
    }
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
