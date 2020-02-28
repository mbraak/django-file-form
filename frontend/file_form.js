/* global document, window */

import { Upload } from "tus-js-client";
import escape from "escape-html";

class RenderUploadFile {
  constructor({ container, input, skipRequired, translations }) {
    this.container = container;
    this.input = input;
    this.translations = translations;

    if (skipRequired) {
      this.input.required = false;
    }
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
    div.className = `dff-file dff-file-id-${uploadIndex}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = escape(filename);

    div.appendChild(nameSpan);
    this.container.appendChild(div);

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
    return this.container.querySelector(`.dff-file-id-${index}`);
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
    const el = this.container.querySelector(`.dff-file-id-${index}`);
    const innerProgressSpan = el.querySelector(".dff-progress-inner");

    if (innerProgressSpan) {
      innerProgressSpan.style.width = `${percentage}%`;
    }
  }
}

class UploadFile {
  constructor({
    input,
    container,
    fieldName,
    formId,
    initial,
    multiple,
    skipRequired,
    supportDropArea,
    translations,
    uploadUrl
  }) {
    this.container = container;
    this.fieldName = fieldName;
    this.formId = formId;
    this.multiple = multiple;
    this.translations = translations;
    this.uploadUrl = uploadUrl;

    this.uploadIndex = 0;
    this.uploads = [];

    if (supportDropArea) {
      this.initDropArea();
    }

    this.filesContainer = this.createFilesContainer();

    this.renderer = new RenderUploadFile({ container: this.filesContainer, input, skipRequired, translations });

    if (initial) {
      this.addInitialFiles(initial);
    }

    input.addEventListener("change", this.onChange);
    this.filesContainer.addEventListener("click", this.onClick);
  }

  createFilesContainer() {
    const div = document.createElement("div");
    div.className = "dff-files";
    this.container.appendChild(div);

    return div;
  }

  addInitialFiles(initialFiles) {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    const addInitialFile = (file, i) => {
      renderer.addUploadedFile(file.name, i);
      this.uploads.push({ url: `${this.uploadUrl}${file.id}` });
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
        onError: () => this.handleError(uploadIndex),
        onProgress: (bytesUploaded, bytesTotal) => this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
        onSuccess: () => this.handleSuccess(uploadIndex)
      });

      upload.start();
      renderer.addNewUpload(filename, uploadIndex);

      this.uploads.push(upload);
    });
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
  };

  handleError = uploadIndex => {
    this.renderer.setError(uploadIndex);
  };

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

  initDropArea() {
    new DropArea({
      container: this.container,
      onUploadFiles: this.uploadFiles,
      translations: this.translations
    });
  }
}

class DropArea {
  constructor({ container, onUploadFiles, translations }) {
    this.container = container;
    this.onUploadFiles = onUploadFiles;

    const dropArea = document.createElement("div");
    dropArea.className = "dff-drop-area";
    dropArea.innerHTML = translations["Drop your files here"];

    dropArea.addEventListener("dragenter", () => {
      dropArea.classList.add("dff-entered");
    });
    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dff-entered");
    });
    dropArea.addEventListener("dragover", e => {
      dropArea.classList.add("dff-entered");
      e.preventDefault();
    });
    dropArea.addEventListener("drop", this.onDrop);

    this.container.appendChild(dropArea);

    this.dropArea = dropArea;
  }

  onDrop = e => {
    this.dropArea.classList.remove("dff-entered");
    e.preventDefault();
    e.stopPropagation();

    this.onUploadFiles([...e.dataTransfer.files]);
  };
}

const getInputNameWithPrefix = (fieldName, prefix) => (prefix ? `${prefix}-${fieldName}` : fieldName);

const getInputValueForFormAndPrefix = (form, fieldName, prefix) => {
  const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
  const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);

  if (!input) {
    console.error(`Cannot find input with name '${inputNameWithPrefix}'`);
    return null;
  }

  return input.value;
};

const initFormSet = (form, prefix, options) => {
  const formCount = parseInt(getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix), 10);

  for (let i = 0; i < formCount; i += 1) {
    const subFormPrefix = getInputNameWithPrefix(`${i}`);
    initUploadFields(
      form,
      {
        ...options, prefix: `${prefix}-${subFormPrefix}`,
      }
    );
  }
};

const initUploadFields = (form, options = {}) => {
  const matchesPrefix = fieldName => {
    if (!(options && options.prefix)) {
      return true;
    }

    return fieldName.startsWith(`${options.prefix}-`);
  };

  const getPrefix = () => (options && options.prefix ? options.prefix : null);

  const getInputValue = fieldName => getInputValueForFormAndPrefix(form, fieldName, getPrefix());

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

    if (!(input && matchesPrefix(input.name))) {
      return;
    }

    const fieldName = input.name;
    const { multiple } = input;
    const initial = getInitialFiles(element);
    const translations = JSON.parse(element.getAttribute("data-translations"));
    const supportDropArea = options.supportDropArea || false;

    new UploadFile({
      container: element,
      fieldName,
      formId,
      initial,
      input,
      multiple,
      skipRequired,
      supportDropArea,
      translations,
      uploadUrl
    });
  });
};

global.initFormSet = initFormSet;
global.initUploadFields = initUploadFields;
