import escape from "escape-html";

import { formatBytes } from "./util.ts";

class RenderUploadFile {
  container: Element;
  errors: Element;
  input: HTMLInputElement;
  translations: Record<string, string>;

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
    this.container = this.createFilesContainer(parent);
    this.errors = this.createErrorContainer(parent);
    this.input = input;
    this.translations = translations;

    if (skipRequired) {
      this.input.required = false;
    }
  }

  public addNewUpload(filename: string, uploadIndex: number): HTMLElement {
    const div = this.addFile(filename, uploadIndex);

    const progressSpan = document.createElement("span");
    progressSpan.className = "dff-progress";

    const innerSpan = document.createElement("span");
    innerSpan.className = "dff-progress-inner";

    progressSpan.appendChild(innerSpan);
    div.appendChild(progressSpan);

    const cancelLink = document.createElement("a");
    cancelLink.className = "dff-cancel";

    this.setTextContent(cancelLink, this.getTranslation("Cancel"));
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
    const element = this.addFile(filename, uploadIndex);
    this.setSuccess(uploadIndex, filesize);
    return element;
  }

  public clearInput(): void {
    const { input } = this;

    input.value = "";
  }

  public deleteFile(index: number): void {
    const div = this.findFileDiv(index);

    if (div) {
      div.remove();
    }
  }

  public disableCancel(index: number): void {
    const cancelSpan = this.findCancelSpan(index);

    if (cancelSpan) {
      cancelSpan.classList.add("dff-disabled");
    }
  }

  public disableDelete(index: number): void {
    const deleteLink = this.findDeleteLink(index);

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
    this.setTextContent(dropHint, this.getTranslation("Drop your files here"));

    this.container.appendChild(dropHint);
  }

  public setDeleteFailed(index: number): void {
    this.setErrorMessage(index, this.getTranslation("Delete failed"));

    this.enableDelete(index);
  }

  public setError(index: number): void {
    this.setErrorMessage(index, this.getTranslation("Upload failed"));

    const el = this.findFileDiv(index);
    if (el) {
      el.classList.add("dff-upload-fail");
    }

    this.removeProgress(index);
    this.removeCancel(index);
  }

  public setErrorInvalidFiles(files: File[]): void {
    const errorsMessages = document.createElement("ul");

    for (const file of files) {
      const msg = document.createElement("li");
      const invalidFileTypeMessage = this.getTranslation("Invalid file type");
      this.setTextContent(msg, `${file.name}: ${invalidFileTypeMessage}`);
      msg.className = "dff-error";
      errorsMessages.appendChild(msg);
    }

    this.errors.replaceChildren(errorsMessages);
    this.clearInput();
  }

  public setSuccess(index: number, size?: number): void {
    const el = this.findFileDiv(index);
    if (el) {
      el.classList.add("dff-upload-success");

      if (size != null) {
        const fileSizeInfo = document.createElement("span");
        this.setTextContent(fileSizeInfo, formatBytes(size, 2));
        fileSizeInfo.className = "dff-filesize";

        el.appendChild(fileSizeInfo);
      }

      const deleteLink = document.createElement("a");
      this.setTextContent(deleteLink, this.getTranslation("Delete"));
      deleteLink.className = "dff-delete";
      deleteLink.setAttribute("data-index", index.toString());
      deleteLink.href = "#";

      el.appendChild(deleteLink);
    }

    this.removeProgress(index);
    this.removeCancel(index);
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

  private addFile(filename: string, uploadIndex: number): HTMLElement {
    const div = document.createElement("div");
    div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;

    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = escape(filename);
    nameSpan.className = "dff-filename";
    nameSpan.setAttribute("data-index", uploadIndex.toString());

    div.appendChild(nameSpan);
    this.container.appendChild(div);

    this.input.required = false;
    return div;
  }

  private createErrorContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-invalid-files";
    parent.appendChild(div);
    return div;
  };

  private createFilesContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-files";
    parent.appendChild(div);

    return div;
  };

  private enableDelete(index: number): void {
    const deleteLink = this.findDeleteLink(index);

    if (deleteLink) {
      deleteLink.classList.remove("dff-disabled");
    }
  }

  private findCancelSpan(index: number): HTMLElement | null {
    const el = this.findFileDiv(index);

    if (!el) {
      return null;
    }

    return el.querySelector<HTMLElement>(".dff-cancel");
  }

  private findDeleteLink(index: number): HTMLElement | null {
    const div = this.findFileDiv(index);
    if (!div) {
      return div;
    }

    return div.querySelector(".dff-delete");
  }

  private getTranslation(key: string) {
    return this.translations[key] ?? key;
  }

  private removeCancel(index: number): void {
    const cancelSpan = this.findCancelSpan(index);

    if (cancelSpan) {
      cancelSpan.remove();
    }
  }

  private removeProgress(index: number): void {
    const el = this.findFileDiv(index);

    if (el) {
      const progressSpan = el.querySelector(".dff-progress");

      if (progressSpan) {
        progressSpan.remove();
      }
    }
  }

  private setErrorMessage(index: number, message: string): void {
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
    this.setTextContent(span, message);

    el.appendChild(span);
  }

  private setTextContent(element: HTMLElement, text: string) {
    element.append(document.createTextNode(text));
  }
}

export default RenderUploadFile;
