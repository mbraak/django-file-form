import escape from "escape-html";

import { formatBytes } from "./util.ts";

class RenderUploadFile {
  public container: Element;

  private _errors: Element;
  private _input: HTMLInputElement;
  private _translations: Record<string, string>;

  constructor({
    input,
    parent,
    skipRequired,
    translations
  }: {
    input: HTMLInputElement;
    parent: Element;
    skipRequired: boolean;
    translations: Record<string, string>;
  }) {
    this.container = this._createFilesContainer(parent);
    this._errors = this._createErrorContainer(parent);
    this._input = input;
    this._translations = translations;

    if (skipRequired) {
      this._input.required = false;
    }
  }

  public addNewUpload(filename: string, uploadIndex: number): HTMLElement {
    const div = this._addFile(filename, uploadIndex);

    const progressSpan = document.createElement("span");
    progressSpan.className = "dff-progress";

    const innerSpan = document.createElement("span");
    innerSpan.className = "dff-progress-inner";

    progressSpan.appendChild(innerSpan);
    div.appendChild(progressSpan);

    const cancelLink = document.createElement("a");
    cancelLink.className = "dff-cancel";

    this._setTextContent(cancelLink, this._getTranslation("Cancel"));
    cancelLink.setAttribute("data-index", uploadIndex.toString());
    cancelLink.href = "#";
    div.appendChild(cancelLink);

    return div;
  }

  public addUploadedFile(
    filename: string,
    uploadIndex: number,
    filesize?: number
  ): HTMLElement {
    const element = this._addFile(filename, uploadIndex);
    this.setSuccess(uploadIndex, filesize);
    return element;
  }

  public clearInput(): void {
    const { _input: input } = this;

    input.value = "";
  }

  public deleteFile(index: number): void {
    const div = this.findFileDiv(index);

    if (div) {
      div.remove();
    }
  }

  public disableCancel(index: number): void {
    const cancelSpan = this._findCancelSpan(index);

    if (cancelSpan) {
      cancelSpan.classList.add("dff-disabled");
    }
  }

  public disableDelete(index: number): void {
    const deleteLink = this._findDeleteLink(index);

    if (deleteLink) {
      deleteLink.classList.add("dff-disabled");
    }
  }

  public findFileDiv(index: number): HTMLElement | null {
    return this.container.querySelector(`.dff-file-id-${index.toString()}`);
  }

  public removeDropHint(): void {
    const dropHint = this.container.querySelector(".dff-drop-hint");

    if (dropHint) {
      dropHint.remove();
    }
  }

  public renderDropHint(): void {
    if (this.container.querySelector(".dff-drop-hint")) {
      return;
    }

    const dropHint = document.createElement("div");
    dropHint.className = "dff-drop-hint";
    this._setTextContent(dropHint, this._getTranslation("Drop your files here"));

    this.container.appendChild(dropHint);
  }

  public setDeleteFailed(index: number): void {
    this._setErrorMessage(index, this._getTranslation("Delete failed"));

    this._enableDelete(index);
  }

  public setError(index: number): void {
    this._setErrorMessage(index, this._getTranslation("Upload failed"));

    const el = this.findFileDiv(index);
    if (el) {
      el.classList.add("dff-upload-fail");
    }

    this._removeProgress(index);
    this._removeCancel(index);
  }

  public setErrorInvalidFiles(files: File[]): void {
    const errorsMessages = document.createElement("ul");

    for (const file of files) {
      const msg = document.createElement("li");
      const invalidFileTypeMessage = this._getTranslation("Invalid file type");
      this._setTextContent(msg, `${file.name}: ${invalidFileTypeMessage}`);
      msg.className = "dff-error";
      errorsMessages.appendChild(msg);
    }

    this._errors.replaceChildren(errorsMessages);
    this.clearInput();
  }

  public setSuccess(index: number, size?: number): void {
    const el = this.findFileDiv(index);
    if (el) {
      el.classList.add("dff-upload-success");

      if (size != null) {
        const fileSizeInfo = document.createElement("span");
        this._setTextContent(fileSizeInfo, formatBytes(size, 2));
        fileSizeInfo.className = "dff-filesize";

        el.appendChild(fileSizeInfo);
      }

      const deleteLink = document.createElement("a");
      this._setTextContent(deleteLink, this._getTranslation("Delete"));
      deleteLink.className = "dff-delete";
      deleteLink.setAttribute("data-index", index.toString());
      deleteLink.href = "#";

      el.appendChild(deleteLink);
    }

    this._removeProgress(index);
    this._removeCancel(index);
  }

  public updateProgress(index: number, percentage: string): void {
    const el = this.container.querySelector(`.dff-file-id-${index.toString()}`);
    if (el) {
      const innerProgressSpan = el.querySelector(".dff-progress-inner");

      if (innerProgressSpan) {
        (innerProgressSpan as HTMLElement).style.width = `${percentage}%`;
      }
    }
  }

  private _addFile(filename: string, uploadIndex: number): HTMLElement {
    const div = document.createElement("div");
    div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = escape(filename);
    nameSpan.className = "dff-filename";
    nameSpan.setAttribute("data-index", uploadIndex.toString());

    div.appendChild(nameSpan);
    this.container.appendChild(div);

    this._input.required = false;
    return div;
  }

  private _createErrorContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-invalid-files";
    parent.appendChild(div);
    return div;
  };

  private _createFilesContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-files";
    parent.appendChild(div);

    return div;
  };

  private _enableDelete(index: number): void {
    const deleteLink = this._findDeleteLink(index);

    if (deleteLink) {
      deleteLink.classList.remove("dff-disabled");
    }
  }

  private _findCancelSpan(index: number): HTMLElement | null {
    const el = this.findFileDiv(index);

    if (!el) {
      return null;
    }

    return el.querySelector<HTMLElement>(".dff-cancel");
  }

  private _findDeleteLink(index: number): HTMLElement | null {
    const div = this.findFileDiv(index);
    if (!div) {
      return div;
    }

    return div.querySelector(".dff-delete");
  }

  private _getTranslation(key: string) {
    return this._translations[key] ?? key;
  }

  private _removeCancel(index: number): void {
    const cancelSpan = this._findCancelSpan(index);

    if (cancelSpan) {
      cancelSpan.remove();
    }
  }

  private _removeProgress(index: number): void {
    const el = this.findFileDiv(index);

    if (el) {
      const progressSpan = el.querySelector(".dff-progress");

      if (progressSpan) {
        progressSpan.remove();
      }
    }
  }

  private _setErrorMessage(index: number, message: string): void {
    const el = this.findFileDiv(index);
    if (!el) {
      return;
    }

    const originalMessageSpan = el.querySelector(".dff-error");
    if (originalMessageSpan) {
      originalMessageSpan.remove();
    }

    const span = document.createElement("span");
    span.classList.add("dff-error");
    this._setTextContent(span, message);

    el.appendChild(span);
  }

  private _setTextContent(element: HTMLElement, text: string) {
    element.append(document.createTextNode(text));
  }
}

export default RenderUploadFile;
