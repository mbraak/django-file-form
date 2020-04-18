/* global document, window */

import { Upload } from "tus-js-client";
import escape from "escape-html";

function formatBytes(bytes, decimals) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals || 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const n = parseFloat((bytes / k ** i).toFixed(dm));
  const size = sizes[i];

  return `${n} ${size}`;
}

class RenderUploadFile {
  constructor({ parent, input, skipRequired, translations }) {
    this.container = this.createFilesContainer(parent);
    this.input = input;
    this.translations = translations;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  createFilesContainer = parent => {
    const div = document.createElement("div");
    div.className = "dff-files";
    parent.appendChild(div);

    return div;
  };

  addUploadedFile(filename, uploadIndex, filesize) {
    this.addFile(filename, uploadIndex);
    this.setSuccess(uploadIndex, filesize);
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

  setSuccess(index, size) {
    const { translations } = this;

    const el = this.findFileDiv(index);
    el.classList.add("dff-upload-success");

    const fileSizeInfo = document.createElement("span");
    fileSizeInfo.innerHTML = formatBytes(size, 2);
    fileSizeInfo.className = "dff-filesize";

    el.appendChild(fileSizeInfo);

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

  renderDropHint() {
    if (this.container.querySelector(".dff-drop-hint")) {
      return;
    }

    const dropHint = document.createElement("div");
    dropHint.className = "dff-drop-hint";
    dropHint.innerHTML = this.translations["Drop your files here"];

    this.container.appendChild(dropHint);
  }

  removeDropHint() {
    const dropHint = this.container.querySelector(".dff-drop-hint");

    if (dropHint) {
      dropHint.remove();
    }
  }
}

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

const getEntriesFromDirectory = async directoryEntry =>
  new Promise((resolve, reject) =>
    directoryEntry.createReader().readEntries(resolve, reject)
  );

const getFileFromFileEntry = async fileEntry =>
  new Promise((resolve, reject) => fileEntry.file(resolve, reject));

const getFilesFromFileSystemEntries = async entries => {
  const result = [];

  for await (const entry of entries) {
    if (entry.isFile) {
      const file = await getFileFromFileEntry(entry);
      result.push(file);
    } else if (entry.isDirectory) {
      const entriesFromDirectory = await getEntriesFromDirectory(entry);
      const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
      files.forEach(file => result.push(file));
    }
  }

  return result;
};

const getFilesFromDataTransfer = async dataTransfer => {
  if (dataTransfer.items) {
    const entries = [...dataTransfer.items].map(item =>
      item.webkitGetAsEntry()
    );

    const files = await getFilesFromFileSystemEntries(entries);
    return files;
  } else {
    // backwards compatibility
    return [...dataTransfer.files];
  }
};

class DropArea {
  constructor({ container, onUploadFiles }) {
    this.container = container;
    this.onUploadFiles = onUploadFiles;

    container.addEventListener("dragenter", () => {
      container.classList.add("dff-dropping");
    });
    container.addEventListener("dragleave", () => {
      container.classList.remove("dff-dropping");
    });
    container.addEventListener("dragover", e => {
      container.classList.add("dff-dropping");
      e.preventDefault();
    });
    container.addEventListener("drop", this.onDrop);
  }

  onDrop = e => {
    this.container.classList.remove("dff-dropping");
    e.preventDefault();
    e.stopPropagation();

    const uploadFiles = async () => {
      try {
        const files = await getFilesFromDataTransfer(e.dataTransfer);
        this.onUploadFiles(files);
      } catch (error) {
        console.error(error);
      }
    };

    uploadFiles();
  };
}

const getInputNameWithPrefix = (fieldName, prefix) =>
  prefix ? `${prefix}-${fieldName}` : fieldName;
const getInputNameWithoutPrefix = (fieldName, prefix) =>
  prefix ? fieldName.slice(prefix.length + 1) : fieldName;
const getPlaceholderFieldName = (fieldName, prefix) =>
  `placeholder-${getInputNameWithoutPrefix(fieldName, prefix)}`;

const findInput = (form, fieldName, prefix) => {
  const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
  const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);

  if (!input) {
    console.error(`Cannot find input with name '${inputNameWithPrefix}'`);
    return null;
  }

  return input;
};

const getInputValueForFormAndPrefix = (form, fieldName, prefix) =>
  findInput(form, fieldName, prefix).value;

const initFormSet = (form, optionsParam) => {
  let options;

  if (typeof optionsParam === "string") {
    options = { prefix: optionsParam };
  } else {
    options = optionsParam;
  }

  const prefix = options.prefix || "form";

  const formCount = parseInt(
    getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix),
    10
  );

  for (let i = 0; i < formCount; i += 1) {
    const subFormPrefix = getInputNameWithPrefix(`${i}`);
    initUploadFields(form, {
      ...options,
      prefix: `${prefix}-${subFormPrefix}`
    });
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

  const getInputValue = fieldName =>
    getInputValueForFormAndPrefix(form, fieldName, getPrefix());

  const getInitialFiles = element => {
    const filesData = element.dataset.files;

    if (!filesData) {
      return [];
    }

    return JSON.parse(filesData);
  };

  const getPlaceholders = fieldName =>
    JSON.parse(getInputValue(getPlaceholderFieldName(fieldName, getPrefix())));

  const uploadUrl = getInputValue("upload_url");
  const formId = getInputValue("form_id");
  const skipRequired = options.skipRequired || false;
  const prefix = getPrefix();

  if (!formId || !uploadUrl) {
    return;
  }

  form.querySelectorAll(".dff-uploader").forEach(uploaderDiv => {
    const container = uploaderDiv.querySelector(".dff-container");

    if (!container) {
      return;
    }

    const input = container.querySelector("input[type=file]");

    if (!(input && matchesPrefix(input.name))) {
      return;
    }

    const fieldName = input.name;
    const { multiple } = input;
    const initial = getInitialFiles(container).concat(
      getPlaceholders(fieldName)
    );
    const translations = JSON.parse(
      container.getAttribute("data-translations")
    );
    const supportDropArea = !(options.supportDropArea === false);

    new UploadFile({
      callbacks: options.callbacks || {},
      fieldName,
      form,
      formId,
      initial,
      input,
      multiple,
      parent: container,
      prefix,
      retryDelays: options.retryDelays,
      skipRequired,
      supportDropArea,
      translations,
      uploadUrl
    });
  });
};

global.initFormSet = initFormSet;
global.initUploadFields = initUploadFields;
