/* global document, window */

import { Upload } from "tus-js-client";


class RenderUploadFile {
  constructor({ container, input, skipRequired }) {
    this.container = container;
    this.input = input;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  addFile(filename, uploadIndex) {
    const { container } = this;

    const div = document.createElement("div");
    div.className = `qq-file-id-${uploadIndex}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = filename; // todo: escape

    div.appendChild(nameSpan);
    container.appendChild(div);

    this.input.required = false;
  }

  deleteFile(index) {
    this.findFileDiv(index).remove();
  }

  setError(index) {
    const el = this.findFileDiv(index);
    el.classList.add("qq-upload-fail");
  }

  setDeleteFailed(index) {
    const el = this.findFileDiv(index);

    const span = document.createElement("span");
    span.innerHTML = "Delete failed";

    el.appendChild(span);
  }

  findFileDiv(index) {
    const { container } = this;

    return container.querySelector(`.qq-file-id-${index}`);
  }

  setSuccess(index) {
    const { container } = this;

    const el = container.querySelector(`.qq-file-id-${index}`);
    el.classList.add("qq-upload-success");

    const deleteLink = document.createElement("a");
    deleteLink.innerHTML = "Delete";
    deleteLink.className = "qq-delete";
    deleteLink.setAttribute("data-index", index);
    deleteLink.href = "#";

    el.appendChild(deleteLink);
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

    this.uploadIndex = 0;
    this.uploads = [];

    this.renderer = new RenderUploadFile({ container, input, skipRequired });

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
          renderer.addFile(filename, uploadIndex);
          renderer.setSuccess(uploadIndex);
          uploadIndex += 1;
        }
      );
    } else {
      renderer.addFile(
        filenames[filenames.length - 1],
        0
      );
      renderer.setSuccess(0);
    }
  }

  onChange = e => {
    if (e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

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
    renderer.addFile(filename, uploadIndex);

    this.uploads.push(upload);
  }

  onClick = e => {
    const { target } = e;

    if (target.classList.contains("qq-delete")) {
      const uploadIndex = parseInt(target.getAttribute("data-index"), 10);
      this.handleDelete(uploadIndex);
    }
  }

  handleProgress = (uploadIndex, bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
    console.log("progress", bytesUploaded, bytesTotal, `${percentage}%`);
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
};

global.initUploadFields = initUploadFields;
