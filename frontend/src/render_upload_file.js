/* global document */

import escape from "escape-html";
import { formatBytes } from "./util";

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

export default RenderUploadFile;
