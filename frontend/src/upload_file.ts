import { Upload } from "tus-js-client";
import {
  findInput,
  getPlaceholderFieldName,
  getS3UploadedFieldName
} from "./util";
import RenderUploadFile from "./render_upload_file";
import DropArea from "./drop_area";

import S3Uploader from "./s3_uploader";

export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  original_name?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  // true for placeholder, false for S3, undefined for regular files
  placeholder?: boolean | undefined;
  size: number;
  url?: string;
  // available only for S3 uploaded file
  original_name?: string;
}

type UploadStatus = "done" | "error" | "uploading";

export type Translations = { [key: string]: string };

export interface Callbacks {
  onDelete?: (upload: Upload | UploadedFile | S3Uploader) => void;
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
  s3UploadDir: string | null;
  multiple: boolean;
  prefix: string | null;
  renderer: RenderUploadFile;
  retryDelays: number[] | null;
  supportDropArea: boolean;
  uploadIndex: number;
  uploadUrl: string;
  uploads: (Upload | UploadedFile | S3Uploader | undefined)[];
  uploadStatuses: (UploadStatus | undefined)[];

  constructor({
    callbacks,
    fieldName,
    form,
    formId,
    s3UploadDir,
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
    s3UploadDir: string | null;
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
    this.s3UploadDir = s3UploadDir;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.supportDropArea = supportDropArea;
    this.uploadUrl = uploadUrl;

    this.uploadIndex = 0;
    this.uploads = [];
    this.uploadStatuses = [];

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

    const addInitialFile = (file: InitialFile, i: number): void => {
      const { id, name, size } = file;
      renderer.addUploadedFile(
        file.original_name ? file.original_name : name,
        i,
        size
      );

      if (file.placeholder === true) {
        // in case of placeholder
        this.uploads.push({ id, name, placeholder: true, size });
      } else if (file.placeholder === false) {
        // in case of S3
        this.uploads.push({
          id,
          name,
          placeholder: false,
          size,
          original_name: file.original_name
        });
      } else {
        // in case of regular UploadedFile
        const url = `${this.uploadUrl}${file.id}`;
        this.uploads.push({ id, name, size, url });
      }

      this.uploadStatuses.push("done");
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
      this.uploadFile(file);
    });

    this.checkDropHint();
  };

  uploadFile(file: File): void {
    const {
      fieldName,
      formId,
      s3UploadDir,
      renderer,
      uploads,
      uploadUrl
    } = this;
    const filename = file.name;
    const existingUploadIndex = this.findUpload(filename);

    if (existingUploadIndex !== null) {
      this.removeExistingUpload(existingUploadIndex);
    }

    const uploadIndex = uploads.length;
    let upload: S3Uploader | Upload | null = null;

    if (s3UploadDir != null) {
      upload = new S3Uploader(file, {
        s3UploadDir: s3UploadDir,
        onProgress: (bytesUploaded: number, bytesTotal: number): void =>
          this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
        onError: (error: Error): void => this.handleError(uploadIndex, error),
        onSuccess: (): void =>
          this.handleSuccess(uploadIndex, (upload as S3Uploader).file.size)
      });
    } else {
      upload = new Upload(file, {
        endpoint: uploadUrl,
        metadata: { fieldName, filename, formId },
        onError: (error: Error): void => this.handleError(uploadIndex, error),
        onProgress: (bytesUploaded: number, bytesTotal: number): void =>
          this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
        onSuccess: (): void =>
          this.handleSuccess(
            uploadIndex,
            ((upload as Upload).file as File).size
          ),
        retryDelays: this.retryDelays || [0, 1000, 3000, 5000]
      });
    }

    upload.start();
    renderer.addNewUpload(filename, uploadIndex);
    this.uploads.push(upload);
    this.uploadStatuses.push("uploading");
  }

  findUpload(filename: string): number | null {
    const upload = this.uploads.find(upload => {
      if (upload instanceof Upload) {
        return upload.options?.metadata?.filename === filename;
      } else if (upload instanceof S3Uploader) {
        return upload.file.name === filename;
      } else if (upload) {
        return upload.name === filename;
      } else {
        return false;
      }
    });

    const index = this.uploads.indexOf(upload);
    return index >= 0 ? index : null;
  }

  removeExistingUpload(uploadIndex: number): void {
    const uploadStatus = this.uploadStatuses[uploadIndex];

    if (uploadStatus === "uploading") {
      const upload = this.uploads[uploadIndex] as Upload;
      void upload.abort(true);
    }

    const upload = this.uploads[uploadIndex];

    if (!upload) {
      return;
    }

    if (
      upload instanceof Upload ||
      upload instanceof S3Uploader ||
      upload.url
    ) {
      const uploadStatus = this.uploadStatuses[uploadIndex];

      switch (uploadStatus) {
        case "done": {
          if (upload instanceof S3Uploader) {
            this.deleteS3Uploaded(uploadIndex);
          } else {
            this.deleteFromServer(uploadIndex);
          }
          break;
        }

        case "error": {
          this.removeUploadFromList(uploadIndex);
          break;
        }

        case "uploading": {
          const upload = this.uploads[uploadIndex] as Upload;
          void upload.abort(true);
          this.removeUploadFromList(uploadIndex);
          break;
        }
      }
    } else if (upload.placeholder) {
      this.deletePlaceholder(uploadIndex);
    }
  }

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

    if (
      target.classList.contains("dff-delete") &&
      !target.classList.contains("dff-disabled")
    ) {
      const uploadIndex = getUploadIndex();

      if (uploadIndex !== null) {
        this.removeExistingUpload(uploadIndex);
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
    this.uploadStatuses[uploadIndex] = "error";

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
    this.updateS3UploadedInput();
    renderer.clearInput();
    renderer.setSuccess(uploadIndex, uploadedSize);
    this.uploadStatuses[uploadIndex] = "done";

    const { onSuccess } = this.callbacks;

    if (onSuccess) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onSuccess(upload);
      }
    }
  };

  removeUploadFromList(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (!upload) {
      return;
    }

    this.renderer.deleteFile(uploadIndex);
    delete this.uploads[uploadIndex];
    delete this.uploadStatuses[uploadIndex];

    this.checkDropHint();

    const { onDelete } = this.callbacks;

    if (onDelete) {
      onDelete(upload);
    }
  }

  deleteFromServer(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (!upload) {
      return;
    }

    const { url } = upload as Upload | UploadedFile;

    if (!url) {
      return;
    }

    this.renderer.disableDelete(uploadIndex);

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = (): void => {
      if (xhr.status === 204) {
        this.removeUploadFromList(uploadIndex);
      } else {
        this.renderer.setDeleteFailed(uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  deletePlaceholder(uploadIndex: number): void {
    this.removeUploadFromList(uploadIndex);
    this.updatePlaceholderInput();
  }

  deleteS3Uploaded(uploadIndex: number): void {
    this.removeUploadFromList(uploadIndex);
    this.updateS3UploadedInput();
  }

  handleCancel(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (upload instanceof Upload) {
      void upload.abort(true);
      this.removeUploadFromList(uploadIndex);
    } else if (upload instanceof S3Uploader) {
      upload.abort();
      this.removeUploadFromList(uploadIndex);
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
        !(upload instanceof Upload) &&
        !(upload instanceof S3Uploader) &&
        upload.placeholder
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

  updateS3UploadedInput(): void {
    // upload could be
    // 1. A regular Upload object
    // 2. A map object with .placeholder == true
    // 3. A map object with .placeholder == false, created when the form is reloaded
    // 4. An S3Uploader object that will need to be saved as UploadedFile
    // the latter two cases are handled here

    const s3Uploads = this.uploads
      .filter(upload => upload instanceof S3Uploader)
      .map(upload => {
        const s3Upload = upload as S3Uploader;
        return {
          id: s3Upload.uploadId,
          name: s3Upload.key,
          placeholder: false,
          size: s3Upload.file.size,
          original_name: s3Upload.file.name
        } as UploadedFile;
      });

    const uploadedInfo = this.uploads
      .filter(
        upload =>
          upload &&
          !(upload instanceof Upload) &&
          !(upload instanceof S3Uploader) &&
          upload.placeholder === false
      )
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
}

export default UploadFile;
