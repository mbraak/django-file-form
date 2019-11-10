/* global document, window */

import { Upload } from "tus-js-client";
import escape from "escape-html";

class RenderUploadFile {
  constructor({ container, input, skipRequired, translations }) {
    this.container = container;
    this.input = input;
    this.translations = translations;
    this.filesContainer = null;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  getFilesContainer() {
    if (!this.filesContainer) {
      const div = document.createElement("div");
      div.className = "dff-files";
      this.container.appendChild(div);

      this.filesContainer = div;
    }

    return this.filesContainer;
  }

  addUploadedFile(filename, uploadIndex) {
    this.addFile(filename, uploadIndex);
    this.setSuccess(uploadIndex);
  }

  addNewUpload(filename, uploadIndex) {
    const div = this.addFile(filename, uploadIndex);

    const progressSpan = document.createElement("span");
    progressSpan.className = "dff-progress";

    const innerSpan = document.createElement("span");
    innerSpan.className = "dff-progress-inner";

    progressSpan.appendChild(innerSpan);
    div.appendChild(progressSpan);

    const cancelLink = document.createElement("a");
    cancelLink.className = "dff-cancel";
    cancelLink.innerHTML = this.translations.Cancel;
    cancelLink.setAttribute("data-index", uploadIndex);
    cancelLink.href = "#";
    div.appendChild(cancelLink);
  }

  addFile(filename, uploadIndex) {
    const div = document.createElement("div");
    div.className = `dff-file-id-${uploadIndex}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = escape(filename);

    div.appendChild(nameSpan);
    this.getFilesContainer().appendChild(div);

    this.input.required = false;
    return div;
  }

  deleteFile(index) {
    const div = this.findFileDiv(index);

    if (div) {
      div.remove();
    }
  }

  setError(index) {
    const span = document.createElement("span");
    span.classList.add("dff-error");
    span.innerHTML = this.translations["Upload failed"];

    const el = this.findFileDiv(index);
    el.appendChild(span);
    el.classList.add("dff-upload-fail");

    this.removeProgress(index);
    this.removeCancel(index);
  }

  setDeleteFailed(index) {
    const el = this.findFileDiv(index);

    const span = document.createElement("span");
    span.innerHTML = this.translations["Delete failed"];

    el.appendChild(span);
  }

  findFileDiv(index) {
    return this.getFilesContainer().querySelector(`.dff-file-id-${index}`);
  }

  setSuccess(index) {
    const { translations } = this;

    const el = this.findFileDiv(index);
    el.classList.add("dff-upload-success");

    const deleteLink = document.createElement("a");
    deleteLink.innerHTML = translations.Delete;
    deleteLink.className = "dff-delete";
    deleteLink.setAttribute("data-index", index);
    deleteLink.href = "#";

    el.appendChild(deleteLink);

    this.removeProgress(index);
    this.removeCancel(index);
  }

  removeProgress(index) {
    const el = this.findFileDiv(index);

    const progressSpan = el.querySelector(".dff-progress");

    if (progressSpan) {
      progressSpan.remove();
    }
  }

  removeCancel(index) {
    const el = this.findFileDiv(index);

    const cancelSpan = el.querySelector(".dff-cancel");

    if (cancelSpan) {
      cancelSpan.remove();
    }
  }

  clearInput() {
    const { input } = this;

    input.value = "";
  }

  updateProgress(index, percentage) {
    const el = this.getFilesContainer().querySelector(`.dff-file-id-${index}`);
    const innerProgressSpan = el.querySelector(".dff-progress-inner");

    if (innerProgressSpan) {
      innerProgressSpan.style.width = `${percentage}%`;
    }
  }
}

class UploadFile {
  constructor({ input, container, fieldName, formId, initial, multiple, skipRequired, translations, uploadUrl }) {
    this.fieldName = fieldName;
    this.formId = formId;
    this.multiple = multiple;
    this.uploadUrl = uploadUrl;

    this.uploadIndex = 0;
    this.uploads = [];

    this.renderer = new RenderUploadFile({ container, input, skipRequired, translations });

    if (initial) {
      this.addInitialFiles(initial.map(f => f.name)); // todo: success
    }

    input.addEventListener("change", this.onChange);
    container.addEventListener("click", this.onClick);
  }

  addInitialFiles(filenames) {
    if (filenames.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    if (multiple) {
      let uploadIndex = 0;

      filenames.forEach(
        filename => {
          renderer.addUploadedFile(filename, uploadIndex);
          uploadIndex += 1;
        }
      );
    } else {
      renderer.addUploadedFile(
        filenames[filenames.length - 1],
        0
      );
    }
  }

  onChange = e => {
    const files = [...e.target.files];

    if (files.length === 0) {
      return;
    }

    if (!this.multiple && this.uploads.length !== 0) {
      this.renderer.deleteFile(0);
      this.uploads = [];
    }

    files.forEach(
      file => {
        const { fieldName, formId, renderer, uploads, uploadUrl } = this;
        const filename = file.name;
        const uploadIndex = uploads.length;

        const upload = new Upload(file, {
          endpoint: uploadUrl,
          metadata: { fieldName, filename, formId },
          onError: () => this.handleError(uploadIndex),
          onProgress: (bytesUploaded, bytesTotal) => this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
          onSuccess: () => this.handleSuccess(uploadIndex),
        });

        upload.start();
        renderer.addNewUpload(filename, uploadIndex);

        this.uploads.push(upload);
      }
    );
  }

  onClick = e => {
    const { target } = e;

    if (target.classList.contains("dff-delete")) {
      const uploadIndex = parseInt(target.getAttribute("data-index"), 10);
      this.handleDelete(uploadIndex);
    } else if (target.classList.contains("dff-cancel")) {
      const uploadIndex = parseInt(target.getAttribute("data-index"), 10);
      this.handleCancel(uploadIndex);
    }
  }

  handleProgress = (uploadIndex, bytesUploaded, bytesTotal) => {
    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    this.renderer.updateProgress(uploadIndex, percentage);
  };

  handleError = uploadIndex => {
    this.renderer.setError(uploadIndex);
  }

  handleSuccess = uploadIndex => {
    const { renderer } = this;

    renderer.clearInput();
    renderer.setSuccess(uploadIndex);
  };

  handleDelete(uploadIndex) {
    const { url } = this.uploads[uploadIndex];

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = () => {
      if (xhr.status === 204) {
        this.renderer.deleteFile(uploadIndex);
      } else {
        this.renderer.setDeleteFailed(uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  handleCancel(uploadIndex) {
    const upload = this.uploads[uploadIndex];
    upload.abort(true);

    this.renderer.deleteFile(uploadIndex);
  }
}

const initUploadFields = (form, options = {}) => {
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

  form.querySelectorAll(".dff-uploader").forEach(container => {
    const element = container.querySelector(".dff-container");

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
    const translations = JSON.parse(element.getAttribute("data-translations"));

    new UploadFile({
      container, fieldName, formId, initial, input, multiple, skipRequired, translations, uploadUrl
    });
  });
};

global.initUploadFields = initUploadFields;
