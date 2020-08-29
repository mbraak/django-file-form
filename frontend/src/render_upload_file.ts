import escape from "escape-html";
import { formatBytes } from "./util";

class RenderUploadFile {
  container: Element;
  input: HTMLInputElement;
  translations: { [key: string]: string };

  constructor({
    parent,
    input,
    skipRequired,
    translations
  }: {
    parent: Element;
    input: HTMLInputElement;
    skipRequired: boolean;
    translations: { [key: string]: string };
  }) {
    this.container = this.createFilesContainer(parent);
    this.input = input;
    this.translations = translations;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  createFilesContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-files";
    parent.appendChild(div);

    return div;
  };

  addUploadedFile(
    filename: string,
    uploadIndex: number,
    filesize: number
  ): void {
    this.addFile(filename, uploadIndex);
    this.setSuccess(uploadIndex, filesize);
  }

  addNewUpload(filename: string, uploadIndex: number): HTMLElement {
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
    cancelLink.setAttribute("data-index", `${uploadIndex}`);
    cancelLink.href = "#";
    div.appendChild(cancelLink);

    return div;
  }

  addFile(filename: string, uploadIndex: number): HTMLElement {
    const div = document.createElement("div");
    div.className = `dff-file dff-file-id-${uploadIndex}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = escape(filename);

    div.appendChild(nameSpan);
    this.container.appendChild(div);

    this.input.required = false;
    return div;
  }

  deleteFile(index: number): void {
    const div = this.findFileDiv(index);

    if (div) {
      div.remove();
    }
  }

  setError(index: number): void {
    const span = document.createElement("span");
    span.classList.add("dff-error");
    span.innerHTML = this.translations["Upload failed"];

    const el = this.findFileDiv(index);
    if (el) {
      el.appendChild(span);
      el.classList.add("dff-upload-fail");
    }

    this.removeProgress(index);
    this.removeCancel(index);
  }

  setDeleteFailed(index: number): void {
    const el = this.findFileDiv(index);

    if (el) {
      const span = document.createElement("span");
      span.innerHTML = this.translations["Delete failed"];

      el.appendChild(span);
    }

    this.enableDelete(index);
  }

  findFileDiv(index: number): HTMLElement | null {
    return this.container.querySelector(`.dff-file-id-${index}`);
  }

  setSuccess(index: number, size: number): void {
    const { translations } = this;

    const el = this.findFileDiv(index);
    if (el) {
      el.classList.add("dff-upload-success");

      const fileSizeInfo = document.createElement("span");
      fileSizeInfo.innerHTML = formatBytes(size, 2);
      fileSizeInfo.className = "dff-filesize";

      el.appendChild(fileSizeInfo);

      const deleteLink = document.createElement("a");
      deleteLink.innerHTML = translations.Delete;
      deleteLink.className = "dff-delete";
      deleteLink.setAttribute("data-index", `${index}`);
      deleteLink.href = "#";

      el.appendChild(deleteLink);
    }

    this.removeProgress(index);
    this.removeCancel(index);
  }

  removeProgress(index: number): void {
    const el = this.findFileDiv(index);

    if (el) {
      const progressSpan = el.querySelector(".dff-progress");

      if (progressSpan) {
        progressSpan.remove();
      }
    }
  }

  removeCancel(index: number): void {
    const el = this.findFileDiv(index);

    if (el) {
      const cancelSpan = el.querySelector(".dff-cancel");

      if (cancelSpan) {
        cancelSpan.remove();
      }
    }
  }

  clearInput(): void {
    const { input } = this;

    input.value = "";
  }

  updateProgress(index: number, percentage: string): void {
    const el = this.container.querySelector(`.dff-file-id-${index}`);
    if (el) {
      const innerProgressSpan = el.querySelector(".dff-progress-inner");

      if (innerProgressSpan) {
        (innerProgressSpan as HTMLElement).style.width = `${percentage}%`;
      }
    }
  }

  renderDropHint(): void {
    if (this.container.querySelector(".dff-drop-hint")) {
      return;
    }

    const dropHint = document.createElement("div");
    dropHint.className = "dff-drop-hint";
    dropHint.innerHTML = this.translations["Drop your files here"];

    this.container.appendChild(dropHint);
  }

  removeDropHint(): void {
    const dropHint = this.container.querySelector(".dff-drop-hint");

    if (dropHint) {
      dropHint.remove();
    }
  }

  disableDelete(index: number): void {
    const deleteLink = this.findDeleteLink(index);

    if (deleteLink) {
      deleteLink.classList.add("dff-disabled");
    }
  }

  enableDelete(index: number): void {
    const deleteLink = this.findDeleteLink(index);

    if (deleteLink) {
      deleteLink.classList.remove("dff-disabled");
    }
  }

  findDeleteLink(index: number): HTMLElement | null {
    const div = this.findFileDiv(index);
    if (!div) {
      return div;
    }

    return div.querySelector(".dff-delete");
  }
}

export default RenderUploadFile;
