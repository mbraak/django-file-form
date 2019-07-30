/* global document, window */

import { Upload } from "tus-js-client";


class RenderUploadFile {
  constructor({ container, input, skipRequired }) {
    this.container = container;
    this.input = input;
    this.uploadIndex = 0;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  addFile(filename) {
    const { container, uploadIndex } = this;

    const div = document.createElement("div");
    div.className = `qq-file-id-${uploadIndex} qq-upload-success`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = filename; // todo: escape

    const deleteLink = document.createElement("a");
    deleteLink.innerHTML = "Delete"; // todo: i18n
    deleteLink.className = "qq-delete";
    deleteLink.href = "#";

    div.appendChild(nameSpan);
    div.appendChild(deleteLink);

    container.appendChild(div);

    this.input.required = false;
    this.uploadIndex += 1;
  }

  deleteFile(index) {
    const { container } = this;

    container.querySelector(`.qq-file-id-${index}`).remove();
  }

  clearInput() {
    const { input } = this;

    input.value = "";
  }
}

class UploadFile {
  constructor({ input, container, fieldName, formId, initial, multiple, skipRequired, uploadUrl }) {
    this.fieldName = fieldName;
    this.formId = formId;
    this.multiple = multiple;
    this.uploadUrl = uploadUrl;

    this.currentUpload = {};

    this.renderer = new RenderUploadFile({ container, input, skipRequired });

    if (initial) {
      this.addFiles(initial.map(f => f.name));
    }

    input.addEventListener("change", this.onChange);
    container.addEventListener("click", this.onClick);
  }

  addFiles(filenames) {
    if (filenames.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    if (multiple) {
      renderer.addFile(filenames[filenames.length - 1]);
    }

    filenames.forEach(
      filename => renderer.addFile(filename)
    );
  }

  onChange = e => {
    if (e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    const { fieldName, formId, uploadUrl } = this;
    const filename = file.name;

    const upload = new Upload(file, {
      endpoint: uploadUrl,
      metadata: { fieldName, filename, formId },
      onError: this.handleError,
      onProgress: this.handleProgress,
      onSuccess: this.handleSuccess,
    });

    upload.start();

    this.currentUpload = upload;
  }

  onClick = e => {
    if (e.target.classList.contains("qq-delete")) {
      this.handleDelete();
    }
  }

  handleProgress = (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
    console.log("progress", bytesUploaded, bytesTotal, `${percentage}%`);
  };

  handleError = error => {
    console.log(`Failed because: ${error}`);
    this.currentUpload = {};
  }

  handleSuccess = () => {
    const { filename } = this.currentUpload.options.metadata;
    const { renderer } = this;

    renderer.clearInput();
    renderer.addFile(filename);
  };

  handleDelete() {
    const { url } = this.currentUpload;

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = () => {
      this.renderer.deleteFile(0);
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }
}

function initUploadFields(form, options = {}) {
  const getInputNameWithPrefix = fieldName =>
    options && options.prefix ? `${options.prefix}-${fieldName}` : fieldName;

  const getInputValue = fieldName => {
    const inputNameWithPrefix = getInputNameWithPrefix(fieldName);
    const input = form.querySelector(`[name=${inputNameWithPrefix}]`);

    if (!input) {
      console.error(`Cannot find input with name '${inputNameWithPrefix}'`);
      return null;
    }

    return input.value;
  };

  const getInitialFiles = element => {
    const filesData = element.dataset.files;

    if (!filesData) {
      return [];
    }

    return JSON.parse(filesData);
  };

  const uploadUrl = getInputValue("upload_url");
  const formId = getInputValue("form_id");
  const skipRequired = options.skipRequired || false;

  if (!formId || !uploadUrl) {
    return;
  }

  form.querySelectorAll(".file-uploader").forEach(container => {
    const element = container.querySelector(".file-uploader-container");

    if (!element) {
      return;
    }

    const input = element.querySelector("input[type=file]");

    if (!input) {
      return;
    }

    const fieldName = input.name;
    const { multiple } = input;
    const initial = getInitialFiles(element).filter(f => !f.existing);

    new UploadFile({
      container, fieldName, formId, initial, input, multiple, skipRequired, uploadUrl
    });
  });
}

global.initUploadFields = initUploadFields;
