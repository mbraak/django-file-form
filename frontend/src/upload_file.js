/* global window */

import { Upload } from "tus-js-client";
import { findInput, getPlaceholderFieldName } from "./util";
import RenderUploadFile from "./render_upload_file";

class UploadFile {
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

  addInitialFiles(initialFiles) {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    const addInitialFile = (file, i) => {
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

      initialFiles.forEach(file => {
        addInitialFile(file, uploadIndex);
        uploadIndex += 1;
      });
    } else {
      addInitialFile(initialFiles[0], 0);
    }
  }

  uploadFiles = files => {
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
      const uploadIndex = uploads.length;

      const upload = new Upload(file, {
        endpoint: uploadUrl,
        metadata: { fieldName, filename, formId },
        onError: error => this.handleError(uploadIndex, error),
        onProgress: (bytesUploaded, bytesTotal) =>
          this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
        onSuccess: () => this.handleSuccess(uploadIndex, upload.file.size),
        retryDelays: this.retryDelays || [0, 1000, 3000, 5000]
      });

      upload.start();
      renderer.addNewUpload(filename, uploadIndex);

      this.uploads.push(upload);
    });

    this.checkDropHint();
  };

  onChange = e => {
    this.uploadFiles([...e.target.files]);
  };

  onClick = e => {
    const { target } = e;

    if (target.classList.contains("dff-delete")) {
      const uploadIndex = parseInt(target.getAttribute("data-index"), 10);
      this.handleDelete(uploadIndex);

      e.preventDefault();
    } else if (target.classList.contains("dff-cancel")) {
      const uploadIndex = parseInt(target.getAttribute("data-index"), 10);
      this.handleCancel(uploadIndex);

      e.preventDefault();
    }
  };

  handleProgress = (uploadIndex, bytesUploaded, bytesTotal) => {
    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    this.renderer.updateProgress(uploadIndex, percentage);

    const { onProgress } = this.callbacks;

    if (onProgress) {
      const upload = this.uploads[uploadIndex];
      onProgress(bytesUploaded, bytesTotal, upload);
    }
  };

  handleError = (uploadIndex, error) => {
    this.renderer.setError(uploadIndex);

    const { onError } = this.callbacks;

    if (onError) {
      const upload = this.uploads[uploadIndex];
      onError(error, upload);
    }
  };

  handleSuccess = (uploadIndex, uploadedSize) => {
    const { renderer } = this;

    renderer.clearInput();
    renderer.setSuccess(uploadIndex, uploadedSize);

    const { onSuccess } = this.callbacks;

    if (onSuccess) {
      const upload = this.uploads[uploadIndex];
      onSuccess(upload);
    }
  };

  handleDelete(uploadIndex) {
    const { placeholder } = this.uploads[uploadIndex];

    if (placeholder) {
      this.deletePlaceholder(uploadIndex);
    } else {
      this.deleteFromServer(uploadIndex);
    }
  }

  deleteUpload(uploadIndex) {
    const upload = this.uploads[uploadIndex];

    this.renderer.deleteFile(uploadIndex);
    delete this.uploads[uploadIndex];
    this.checkDropHint();

    const { onDelete } = this.callbacks;
    if (onDelete) {
      onDelete(upload);
    }
  }

  deleteFromServer(uploadIndex) {
    const { url } = this.uploads[uploadIndex];

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = () => {
      if (xhr.status === 204) {
        this.deleteUpload(uploadIndex);
      } else {
        this.renderer.setDeleteFailed(uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  deletePlaceholder(uploadIndex) {
    this.deleteUpload(uploadIndex);
    this.updatePlaceholderInput();
  }

  handleCancel(uploadIndex) {
    const upload = this.uploads[uploadIndex];
    upload.abort(true);

    this.deleteUpload(uploadIndex);
  }

  initDropArea(container) {
    new DropArea({
      container,
      onUploadFiles: this.uploadFiles
    });
  }

  checkDropHint() {
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

  updatePlaceholderInput() {
    const placeholdersInfo = this.uploads
      .filter(upload => upload.placeholder)
      .map(({ id, name, placeholder, size }) => ({
        id,
        name,
        placeholder,
        size
      }));

    const input = findInput(
      this.form,
      getPlaceholderFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    input.value = JSON.stringify(placeholdersInfo);
  }
}

export default UploadFile;
