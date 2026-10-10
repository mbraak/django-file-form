import { formatBytes } from "./util.ts";

let nextLabelId = 0;

class RenderUploadFile {
  public container: Element;

  private errors: Element;
  private input: HTMLInputElement;
  private status: Element;
  private translations: Record<string, string>;

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
    this.labelFilesContainer(input);
    this.errors = this.createErrorContainer(parent);
    this.status = this.createStatusContainer(parent);
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
    progressSpan.setAttribute("role", "progressbar");
    progressSpan.setAttribute(
      "aria-label",
      this.formatTranslation("Upload progress for {filename}", filename)
    );
    progressSpan.setAttribute("aria-valuemin", "0");
    progressSpan.setAttribute("aria-valuemax", "100");
    progressSpan.setAttribute("aria-valuenow", "0");

    const innerSpan = document.createElement("span");
    innerSpan.className = "dff-progress-inner";

    progressSpan.append(innerSpan);
    div.append(progressSpan);

    div.append(
      this.createButton(
        "dff-cancel",
        this.getTranslation("Cancel"),
        uploadIndex
      )
    );

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

  // Tells screen reader users what happened to a file: the status element is a
  // live region, which is read out when its text changes.
  public announce(key: string, filename: string): void {
    this.status.replaceChildren(
      document.createTextNode(this.formatTranslation(key, filename))
    );
  }

  public clearInput(): void {
    this.input.value = "";
  }

  public deleteFile(index: number): void {
    const div = this.findFileDiv(index);

    if (div) {
      div.remove();
    }
  }

  public disableCancel(index: number): void {
    const cancelButton = this.findCancelButton(index);

    if (cancelButton) {
      this.setButtonDisabled(cancelButton, true);
    }
  }

  public disableDelete(index: number): void {
    const deleteButton = this.findDeleteButton(index);

    if (deleteButton) {
      this.setButtonDisabled(deleteButton, true);
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
    // Dropping only works with a mouse, and the files container is a list,
    // which may only contain list items
    dropHint.setAttribute("aria-hidden", "true");
    this.setTextContent(dropHint, this.getTranslation("Drop your files here"));

    this.container.append(dropHint);
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
      errorsMessages.append(msg);
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

        el.append(fileSizeInfo);
      }

      el.append(
        this.createButton("dff-delete", this.getTranslation("Delete"), index)
      );
    }

    this.removeProgress(index);
    this.removeCancel(index);
  }

  public updateProgress(index: number, percentage: string): void {
    const el = this.container.querySelector(`.dff-file-id-${index.toString()}`);
    const progressSpan = el?.querySelector(".dff-progress");

    if (!progressSpan) {
      return;
    }

    progressSpan.setAttribute("aria-valuenow", percentage);

    const innerProgressSpan = progressSpan.querySelector<HTMLElement>(
      ".dff-progress-inner"
    );

    if (innerProgressSpan) {
      innerProgressSpan.style.width = `${percentage}%`;
    }
  }

  private addFile(filename: string, uploadIndex: number): HTMLElement {
    const div = document.createElement("div");
    div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;
    div.setAttribute("role", "listitem");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = filename;
    nameSpan.className = "dff-filename";
    nameSpan.dataset.index = uploadIndex.toString();

    div.append(nameSpan);
    this.container.append(div);

    this.input.required = false;
    return div;
  }

  private createButton(
    className: string,
    text: string,
    uploadIndex: number
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.index = uploadIndex.toString();
    this.setTextContent(button, text);

    return button;
  }

  private createErrorContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-invalid-files";
    div.setAttribute("role", "alert");
    parent.append(div);
    return div;
  };

  private createFilesContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-files";
    div.setAttribute("role", "list");
    parent.append(div);

    return div;
  };

  private createStatusContainer = (parent: Element): Element => {
    const div = document.createElement("div");
    div.className = "dff-status";
    div.setAttribute("role", "status");
    parent.append(div);

    return div;
  };

  private enableDelete(index: number): void {
    const deleteButton = this.findDeleteButton(index);

    if (deleteButton) {
      this.setButtonDisabled(deleteButton, false);
    }
  }

  private findCancelButton(index: number): HTMLButtonElement | null {
    const el = this.findFileDiv(index);

    if (!el) {
      return null;
    }

    return el.querySelector<HTMLButtonElement>(".dff-cancel");
  }

  private findDeleteButton(index: number): HTMLButtonElement | null {
    const div = this.findFileDiv(index);
    if (!div) {
      return div;
    }

    return div.querySelector<HTMLButtonElement>(".dff-delete");
  }

  private formatTranslation(key: string, filename: string): string {
    // A replacer function, so that "$&" in the filename is not a pattern
    return this.getTranslation(key).replace("{filename}", () => filename);
  }

  private getTranslation(key: string) {
    return this.translations[key] ?? key;
  }

  // Names the list of files after the label of the field, so that the lists
  // of several fields can be told apart. A label that wraps the input is
  // skipped: its name would include the text of the input itself.
  private labelFilesContainer(input: HTMLInputElement): void {
    const label = input.labels?.[0];

    if (!label || label.contains(input)) {
      return;
    }

    if (!label.id) {
      nextLabelId += 1;
      label.id = `dff-label-${nextLabelId.toString()}`;
    }

    this.container.setAttribute("aria-labelledby", label.id);
  }

  private removeCancel(index: number): void {
    const cancelButton = this.findCancelButton(index);

    if (cancelButton) {
      cancelButton.remove();
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

  private setButtonDisabled(button: HTMLButtonElement, disabled: boolean) {
    button.disabled = disabled;
    // Keep the class for existing stylesheets
    button.classList.toggle("dff-disabled", disabled);
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

    el.append(span);
  }

  private setTextContent(element: HTMLElement, text: string) {
    element.append(document.createTextNode(text));
  }
}

export default RenderUploadFile;
