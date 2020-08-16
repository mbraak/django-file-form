import { Upload } from "tus-js-client";
import { findInput, getPlaceholderFieldName } from "./util";
import RenderUploadFile from "./render_upload_file";
import DropArea from "./drop_area";

export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean;
  size: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  placeholder: boolean;
  size: number;
  url?: string;
}

export type Translations = { [key: string]: string };

export interface Callbacks {
  onDelete?: (upload: Upload | UploadedFile) => void;
  onError?: (error: Error, upload: Upload) => void;
  onProgress?: (
    bytesUploaded: number,
    bytesTotal: number,
    upload: Upload
  ) => void;
  onSuccess?: (upload: Upload) => void;
}

class UploadFile {
  callbacks: Callbacks;
  fieldName: string;
  form: Element;
  formId: string;
  multiple: boolean;
  prefix: string | null;
  renderer: RenderUploadFile;
  retryDelays: number[] | null;
  supportDropArea: boolean;
  uploadIndex: number;
  uploadUrl: string;
  uploads: (Upload | UploadedFile)[];

  constructor({
    callbacks,
    fieldName,
    form,
    formId,
    initial,
    input,
    multiple,
    parent,
    prefix,
    retryDelays,
    skipRequired,
    supportDropArea,
    translations,
    uploadUrl
  }: {
    callbacks: Callbacks;
    fieldName: string;
    form: Element;
    formId: string;
    initial: InitialFile[];
    input: HTMLInputElement;
    multiple: boolean;
    parent: Element;
    prefix: string | null;
    retryDelays: number[] | null;
    skipRequired: boolean;
    supportDropArea: boolean;
    translations: Translations;
    uploadUrl: string;
  }) {
    this.callbacks = callbacks;
    this.fieldName = fieldName;
    this.form = form;
    this.formId = formId;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.supportDropArea = supportDropArea;
    this.uploadUrl = uploadUrl;

    this.uploadIndex = 0;
    this.uploads = [];

    this.renderer = new RenderUploadFile({
      parent,
      input,
      skipRequired,
      translations
    });
    const filesContainer = this.renderer.container;

    if (supportDropArea) {
      this.initDropArea(filesContainer);
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

    const addInitialFile = (file: InitialFile, i: number): void => {
      const { id, name, size } = file;
      renderer.addUploadedFile(name, i, size);

      if (file.placeholder) {
        this.uploads.push({ id, name, placeholder: true, size });
      } else {
        const url = `${this.uploadUrl}${file.id}`;
        this.uploads.push({ id, name, placeholder: false, size, url });
      }
    };

    if (multiple) {
      let uploadIndex = 0;

      initialFiles.forEach((file: InitialFile): void => {
        addInitialFile(file, uploadIndex);
        uploadIndex += 1;
      });
    } else {
      addInitialFile(initialFiles[0], 0);
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
      const { fieldName, formId, renderer, uploads, uploadUrl } = this;
      const filename = file.name;
      let uploadIndex = uploads.length;

      // #323 remove existing file
      for (let index = 0; index < this.uploads.length; ++index) {
        let existing_upload = this.uploads[index];
        if (existing_upload instanceof Upload) {
          if (existing_upload.file.name == filename) {
            uploadIndex = index;
            const el = this.renderer.findFileDiv(index);
            if (el && el.classList.contains('dff-upload-fail')) {
              // a failed one, will try to resume
              this.deleteUpload(index);
              break;
            } else {
              // a successful upload
              this.deleteFromServer(index);
              break;
            }
          }
        } else if (existing_upload) {
          if (existing_upload.name === filename) {
            this.deletePlaceholder(index);
            uploadIndex = index;
            break;
          }
        }
      }

      const upload = new Upload(file, {
        endpoint: uploadUrl,
        metadata: { fieldName, filename, formId },
        onError: (error: Error): void => this.handleError(uploadIndex, error),
        onProgress: (bytesUploaded: number, bytesTotal: number): void =>
          this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
        onSuccess: (): void =>
          this.handleSuccess(uploadIndex, (upload.file as File).size),
        retryDelays: this.retryDelays || [0, 1000, 3000, 5000]
      });

      upload.start();
      renderer.addNewUpload(filename, uploadIndex);

      if (uploadIndex == this.uploads.length) {
        this.uploads.push(upload);
      } else {
        this.uploads[uploadIndex] = upload;
      }
    });

    this.checkDropHint();
  };

  onChange = (e: Event): void => {
    this.uploadFiles([...(e.target as HTMLInputElement).files]);
  };

  onClick = (e: Event): void => {
    const target = e.target as HTMLInputElement;

    const getUploadIndex = (): number | null => {
      const dataIndex = target.getAttribute("data-index");

      if (!dataIndex) {
        return null;
      }

      return parseInt(dataIndex, 10);
    };

    if (target.classList.contains("dff-delete")) {
      const uploadIndex = getUploadIndex();

      if (uploadIndex !== null) {
        this.handleDelete(uploadIndex);
      }

      e.preventDefault();
    } else if (target.classList.contains("dff-cancel")) {
      const uploadIndex = getUploadIndex();

      if (uploadIndex !== null) {
        this.handleCancel(uploadIndex);
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
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onProgress(bytesUploaded, bytesTotal, upload);
      }
    }
  };

  handleError = (uploadIndex: number, error: Error): void => {
    this.renderer.setError(uploadIndex);

    const { onError } = this.callbacks;

    if (onError) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onError(error, upload);
      }
    }
  };

  handleSuccess = (uploadIndex: number, uploadedSize: number): void => {
    const { renderer } = this;

    renderer.clearInput();
    renderer.setSuccess(uploadIndex, uploadedSize);

    const { onSuccess } = this.callbacks;

    if (onSuccess) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onSuccess(upload);
      }
    }
  };

  handleDelete(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (upload instanceof Upload || upload.url) {
      this.deleteFromServer(uploadIndex);
    } else {
      this.deletePlaceholder(uploadIndex);
    }
  }

  deleteUpload(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    this.renderer.deleteFile(uploadIndex);
    delete this.uploads[uploadIndex];
    this.checkDropHint();

    const { onDelete } = this.callbacks;
    if (onDelete) {
      onDelete(upload);
    }
  }

  deleteFromServer(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    const { url } = upload;

    if (!url) {
      return;
    }

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = (): void => {
      if (xhr.status === 204) {
        this.deleteUpload(uploadIndex);
      } else {
        this.renderer.setDeleteFailed(uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  deletePlaceholder(uploadIndex: number): void {
    this.deleteUpload(uploadIndex);
    this.updatePlaceholderInput();
  }

  handleCancel(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (upload instanceof Upload) {
      void upload.abort(true);

      this.deleteUpload(uploadIndex);
    }
  }

  initDropArea(container: Element): void {
    new DropArea({
      container,
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
      upload => !(upload instanceof Upload) && upload.placeholder
    ) as UploadedFile[];

    const input = findInput(
      this.form,
      getPlaceholderFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (input) {
      input.value = JSON.stringify(placeholdersInfo);
    }
  }
}

export default UploadFile;
