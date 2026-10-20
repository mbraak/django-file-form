import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type MockInstance,
  test,
  vi
} from "vitest";

import type { Callbacks, UploadEvent } from "./file_field.ts";
import type { InitialFile } from "./uploads/base_upload.ts";

import FileField from "./file_field.ts";
import S3Upload from "./uploads/s3_upload.ts";
import TusUpload from "./uploads/tus_upload.ts";
import { ExistingFile } from "./uploads/uploaded_file.ts";

interface CreateFileFieldParameters {
  accept?: string;
  callbacks?: Callbacks;
  disabled?: boolean;
  initial?: InitialFile[];
  multiple?: boolean;
  s3UploadDir?: null | string;
  supportDropArea?: boolean;
  translations?: Record<string, string>;
}

const createHiddenInput = (name: string, value: string) => {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;

  return input;
};

const createFileField = ({
  accept = "",
  callbacks = {},
  disabled = false,
  initial = [],
  multiple = false,
  s3UploadDir = null,
  supportDropArea = false,
  translations = {}
}: CreateFileFieldParameters = {}) => {
  const form = document.createElement("form");
  const parent = document.createElement("div");
  const input = document.createElement("input");
  input.type = "file";
  input.name = "input_file";
  input.accept = accept;
  input.disabled = disabled;

  const uploadsInput = createHiddenInput("input_file-uploads", "");
  const metadataInput = createHiddenInput("input_file-metadata", "{}");

  parent.append(input);
  form.append(uploadsInput, metadataInput, parent);
  document.body.replaceChildren(form);

  const fileField = new FileField({
    callbacks,
    chunkSize: 1024,
    csrfToken: "token1",
    fieldName: "input_file",
    form,
    formId: "id1",
    initial,
    input,
    multiple,
    parent,
    prefix: null,
    retryDelays: null,
    s3UploadDir,
    skipRequired: false,
    supportDropArea,
    translations,
    uploadUrl: "/upload/"
  });

  return { fileField, form, input, metadataInput, parent, uploadsInput };
};

const createUpload = (uploadIndex: number) =>
  new TusUpload({
    chunkSize: 1024,
    csrfToken: "token1",
    fieldName: "input_file",
    file: mockFile("file.txt"),
    formId: "id1",
    retryDelays: null,
    uploadIndex,
    uploadUrl: "/upload/"
  });

const mockFile = (filename: string) =>
  new File(["test"], filename, { type: "text/plain" });

const selectFiles = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, "files", { configurable: true, value: files });
  input.dispatchEvent(new Event("change"));
};

const getUpload = (fileField: FileField, index = 0) => {
  const upload = fileField.uploads[index];

  if (!upload) {
    throw new Error(`No upload at index ${index.toString()}`);
  }

  return upload;
};

const getTusUpload = (fileField: FileField) => {
  const upload = getUpload(fileField);

  if (!(upload instanceof TusUpload)) {
    throw new TypeError("Upload is not a tus upload");
  }

  return upload;
};

const query = (parent: Element, selector: string) => {
  const element = parent.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`No element for ${selector}`);
  }

  return element;
};

const getStatus = (parent: Element) =>
  parent.querySelector(".dff-status")?.textContent;

const existingFile: InitialFile = {
  name: "existing.txt",
  size: 1024,
  type: "existing"
};

let tusAbort: MockInstance<TusUpload["abort"]>;
let tusStart: MockInstance<TusUpload["start"]>;
let s3Start: MockInstance<S3Upload["start"]>;

beforeEach(() => {
  tusStart = vi.spyOn(TusUpload.prototype, "start").mockImplementation(() => {
    //
  });
  tusAbort = vi.spyOn(TusUpload.prototype, "abort").mockResolvedValue();
  s3Start = vi.spyOn(S3Upload.prototype, "start").mockImplementation(() => {
    //
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("constructor", () => {
  test("renders an initial file", () => {
    const { parent } = createFileField({ initial: [existingFile] });

    const fileDiv = parent.querySelector(".dff-file-id-0");

    expect(fileDiv).toHaveClass("dff-upload-success");
    expect(fileDiv?.querySelector(".dff-filename")).toHaveTextContent(
      "existing.txt"
    );
    expect(fileDiv?.querySelector(".dff-filesize")).toHaveTextContent("1 KB");
    expect(fileDiv?.querySelector(".dff-delete")).toBeInTheDocument();
  });

  test("dispatches an addUpload event for an initial file", () => {
    const listener = vi.fn();
    document.addEventListener("addUpload", listener);

    createFileField({ initial: [existingFile] });

    document.removeEventListener("addUpload", listener);

    expect(listener).toHaveBeenCalledOnce();

    const event = listener.mock.calls[0]?.[0] as UploadEvent;

    expect(event.detail.fieldName).toBe("input_file");
    expect(event.detail.fileName).toBe("existing.txt");
    expect(event.detail.metaDataField).toHaveAttribute(
      "name",
      "input_file-metadata"
    );
  });

  test("renders only the first initial file when multiple is false", () => {
    const { fileField, parent } = createFileField({
      initial: [existingFile, { ...existingFile, name: "second.txt" }]
    });

    expect(fileField.uploads).toHaveLength(1);
    expect(parent.querySelectorAll(".dff-file")).toHaveLength(1);
  });

  test("renders all initial files when multiple is true", () => {
    const { fileField, parent } = createFileField({
      initial: [existingFile, { ...existingFile, name: "second.txt" }],
      multiple: true
    });

    expect(fileField.uploads.map(upload => upload.uploadIndex)).toStrictEqual([
      0, 1
    ]);
    expect(fileField.nextUploadIndex).toBe(2);
    expect(parent.querySelector(".dff-file-id-1")).toHaveTextContent(
      "second.txt"
    );
  });

  test("uses the original name of an initial s3 file", () => {
    const { parent } = createFileField({
      initial: [
        {
          id: "s3-id",
          name: "uploads/abc.txt",
          original_name: "original.txt",
          size: 10,
          type: "s3"
        }
      ]
    });

    expect(parent.querySelector(".dff-filename")).toHaveTextContent(
      "original.txt"
    );
  });

  test("renders the drop hint when there are no files", () => {
    const { parent } = createFileField({ supportDropArea: true });

    expect(parent.querySelector(".dff-drop-hint")).toBeInTheDocument();
  });

  test("does not render the drop hint when there are initial files", () => {
    const { parent } = createFileField({
      initial: [existingFile],
      supportDropArea: true
    });

    expect(parent.querySelector(".dff-drop-hint")).not.toBeInTheDocument();
  });

  test("does not render the drop hint when the drop area is not supported", () => {
    const { parent } = createFileField();

    expect(parent.querySelector(".dff-drop-hint")).not.toBeInTheDocument();
  });

  test("does not render the drop hint when the input is disabled", () => {
    const { parent } = createFileField({
      disabled: true,
      supportDropArea: true
    });

    expect(parent.querySelector(".dff-drop-hint")).not.toBeInTheDocument();
  });
});

describe("selecting files", () => {
  test("starts a tus upload and renders the file", () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);

    expect(tusStart).toHaveBeenCalledOnce();
    expect(getUpload(fileField)).toBeInstanceOf(TusUpload);

    const fileDiv = parent.querySelector(".dff-file-id-0");

    expect(fileDiv).toHaveTextContent("file.txt");
    expect(fileDiv?.querySelector(".dff-progress")).toBeInTheDocument();
    expect(fileDiv?.querySelector(".dff-cancel")).toBeInTheDocument();
  });

  test("starts an s3 upload when s3UploadDir is set", () => {
    const { fileField, input } = createFileField({ s3UploadDir: "s3_dir" });

    selectFiles(input, [mockFile("file.txt")]);

    expect(s3Start).toHaveBeenCalledOnce();
    expect(getUpload(fileField)).toBeInstanceOf(S3Upload);
  });

  test("dispatches an addUpload event", () => {
    const { form, input } = createFileField();
    const listener = vi.fn();
    form.addEventListener("addUpload", listener);

    selectFiles(input, [mockFile("file.txt")]);

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0]?.[0] as UploadEvent).detail.fileName).toBe(
      "file.txt"
    );
  });

  test("renders an error for a file with an invalid type", () => {
    const { fileField, input, parent } = createFileField({ accept: ".txt" });

    selectFiles(input, [mockFile("image.png")]);

    expect(fileField.uploads).toHaveLength(0);
    expect(parent.querySelector(".dff-invalid-files")).toHaveTextContent(
      "image.png: Invalid file type"
    );
  });

  test("marks the input as invalid when a file has an invalid type", () => {
    const { input } = createFileField({ accept: ".txt" });

    selectFiles(input, [mockFile("image.png")]);

    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("clears the errors when only valid files are selected", () => {
    const { input, parent } = createFileField({ accept: ".txt" });
    selectFiles(input, [mockFile("image.png")]);

    selectFiles(input, [mockFile("file.txt")]);

    expect(parent.querySelector(".dff-invalid-files")).toBeEmptyDOMElement();
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  test("replaces the current file when multiple is false", async () => {
    const { fileField, input, parent } = createFileField({
      initial: [existingFile]
    });

    selectFiles(input, [mockFile("file.txt")]);

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(1);
    });

    expect(getUpload(fileField).name).toBe("file.txt");
    expect(parent.querySelectorAll(".dff-file")).toHaveLength(1);
  });

  test("uploads all files when multiple is true", async () => {
    const { fileField, input } = createFileField({ multiple: true });

    selectFiles(input, [mockFile("a.txt"), mockFile("b.txt")]);

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(2);
    });

    expect(fileField.uploads.map(upload => upload.uploadIndex)).toStrictEqual([
      0, 1
    ]);
  });

  test("replaces a file with the same name and keeps its index", async () => {
    const { fileField, input, parent } = createFileField({
      initial: [existingFile, { ...existingFile, name: "other.txt" }],
      multiple: true
    });

    selectFiles(input, [mockFile("existing.txt")]);

    await vi.waitFor(() => {
      expect(getUpload(fileField, 1)).toBeInstanceOf(TusUpload);
    });

    expect(getUpload(fileField, 1).uploadIndex).toBe(0);
    expect(fileField.nextUploadIndex).toBe(2);
    expect(parent.querySelectorAll(".dff-file")).toHaveLength(2);
  });

  test("removes the drop hint", async () => {
    const { input, parent } = createFileField({ supportDropArea: true });

    selectFiles(input, [mockFile("file.txt")]);

    await vi.waitFor(() => {
      expect(parent.querySelector(".dff-drop-hint")).not.toBeInTheDocument();
    });
  });
});

describe("handleProgress", () => {
  test("sets the width of the progress bar", () => {
    const { fileField } = createFileField();
    const div = fileField.renderer.addNewUpload("file.txt", 1);

    fileField.handleProgress(createUpload(1), 50, 200);

    expect(div.querySelector(".dff-progress-inner")).toHaveStyle({
      width: "25%"
    });
  });

  test("sets the width of the progress bar to 0% when the total is 0", () => {
    const { fileField } = createFileField();
    const div = fileField.renderer.addNewUpload("file.txt", 1);

    fileField.handleProgress(createUpload(1), 0, 0);

    expect(div.querySelector(".dff-progress-inner")).toHaveStyle({
      width: "0%"
    });
  });

  test("calls the onProgress callback for a tus upload", () => {
    const onProgress = vi.fn();
    const { fileField, input } = createFileField({ callbacks: { onProgress } });

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getTusUpload(fileField);
    upload.onProgress?.(10, 100);

    expect(onProgress).toHaveBeenCalledExactlyOnceWith(10, 100, upload);
  });
});

describe("handleSuccess", () => {
  test("renders the upload as done", () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getTusUpload(fileField);
    upload.onSuccess?.();

    const fileDiv = parent.querySelector(".dff-file-id-0");

    expect(upload.status).toBe("done");
    expect(fileDiv).toHaveClass("dff-upload-success");
    expect(fileDiv?.querySelector(".dff-progress")).not.toBeInTheDocument();
    expect(fileDiv?.querySelector(".dff-delete")).toBeInTheDocument();
  });

  test("updates the uploads input", () => {
    const { fileField, input, uploadsInput } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onSuccess?.();

    expect(JSON.parse(uploadsInput.value)).toStrictEqual([
      { name: "file.txt", size: 4, type: "tus", url: "" }
    ]);
  });

  test("dispatches an uploadComplete event", () => {
    const { fileField, form, input } = createFileField();
    const listener = vi.fn();
    form.addEventListener("uploadComplete", listener);

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onSuccess?.();

    expect(listener).toHaveBeenCalledOnce();
  });

  test("calls the onSuccess callback for a tus upload", () => {
    const onSuccess = vi.fn();
    const { fileField, input } = createFileField({ callbacks: { onSuccess } });

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getTusUpload(fileField);
    upload.onSuccess?.();

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(upload);
  });
});

describe("handleError", () => {
  test("renders the error", () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getTusUpload(fileField);
    upload.onError?.(new Error("failed"));

    const fileDiv = parent.querySelector(".dff-file-id-0");

    expect(upload.status).toBe("error");
    expect(fileDiv).toHaveClass("dff-upload-fail");
    expect(fileDiv?.querySelector(".dff-error")).toHaveTextContent(
      "Upload failed"
    );
  });

  test("calls the onError callback for a tus upload", () => {
    const onError = vi.fn();
    const { fileField, input } = createFileField({ callbacks: { onError } });
    const error = new Error("failed");

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getTusUpload(fileField);
    upload.onError?.(error);

    expect(onError).toHaveBeenCalledExactlyOnceWith(error, upload);
  });
});

describe("clicking delete", () => {
  test("removes the file", async () => {
    const onDelete = vi.fn();
    const { fileField, parent, uploadsInput } = createFileField({
      callbacks: { onDelete },
      initial: [existingFile]
    });
    const upload = getUpload(fileField);

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(parent.querySelector(".dff-file")).not.toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(upload);
    expect(uploadsInput).toHaveValue("[]");
  });

  test("dispatches a removeUpload event", async () => {
    const { fileField, form, parent } = createFileField({
      initial: [existingFile]
    });
    const listener = vi.fn();
    form.addEventListener("removeUpload", listener);

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(listener).toHaveBeenCalledOnce();
  });

  test("renders an error when the delete fails", async () => {
    vi.spyOn(ExistingFile.prototype, "delete").mockRejectedValue(
      new Error("Delete failed")
    );
    const { fileField, parent } = createFileField({ initial: [existingFile] });

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(parent.querySelector(".dff-error")).toHaveTextContent(
        "Delete failed"
      );
    });

    expect(fileField.uploads).toHaveLength(1);
    expect(parent.querySelector(".dff-delete")).not.toHaveClass("dff-disabled");
  });

  test("does nothing when the delete button is disabled", () => {
    const deleteSpy = vi.spyOn(ExistingFile.prototype, "delete");
    const { fileField, parent } = createFileField({ initial: [existingFile] });
    fileField.renderer.disableDelete(0);

    query(parent, ".dff-delete").click();

    expect(deleteSpy).not.toHaveBeenCalled();
    expect(fileField.uploads).toHaveLength(1);
  });

  test("aborts an upload that is still uploading", async () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    fileField.renderer.setSuccess(0);

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(tusAbort).toHaveBeenCalledOnce();
  });
});

describe("clicking cancel", () => {
  test("aborts the upload and removes the file", async () => {
    const onDelete = vi.fn();
    const { fileField, input, parent } = createFileField({
      callbacks: { onDelete }
    });

    selectFiles(input, [mockFile("file.txt")]);
    const upload = getUpload(fileField);

    query(parent, ".dff-cancel").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(tusAbort).toHaveBeenCalledOnce();
    expect(parent.querySelector(".dff-file")).not.toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(upload);
  });

  test("aborts the upload only once when cancel is clicked twice", async () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    const cancelButton = query(parent, ".dff-cancel");

    cancelButton.click();
    cancelButton.click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(tusAbort).toHaveBeenCalledOnce();
  });
});

describe("clicking the filename", () => {
  test("calls the onClick callback for a file that is done", () => {
    const onClick = vi.fn();
    const { parent } = createFileField({
      callbacks: { onClick },
      initial: [existingFile]
    });

    query(parent, ".dff-filename").click();

    expect(onClick).toHaveBeenCalledExactlyOnceWith({
      fieldName: "input_file",
      fileName: "existing.txt",
      id: undefined,
      type: "existing"
    });
  });

  test("renders the filename as a button when there is an onClick callback", () => {
    const { parent } = createFileField({
      callbacks: { onClick: vi.fn() },
      initial: [existingFile]
    });

    expect(query(parent, ".dff-filename").tagName).toBe("BUTTON");
  });

  test("renders the filename as text when there is no onClick callback", () => {
    const { parent } = createFileField({ initial: [existingFile] });

    expect(query(parent, ".dff-filename").tagName).toBe("SPAN");
  });

  test("calls the onClick callback for a file that has been uploaded", () => {
    const onClick = vi.fn();
    const { fileField, input, parent } = createFileField({
      callbacks: { onClick }
    });

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onSuccess?.();

    const filename = query(parent, ".dff-filename");

    expect(filename.tagName).toBe("BUTTON");

    filename.click();

    expect(onClick).toHaveBeenCalledExactlyOnceWith({
      fieldName: "input_file",
      fileName: "file.txt",
      id: undefined,
      type: "tus"
    });
  });

  test("does not call the onClick callback for a file that is uploading", () => {
    const onClick = vi.fn();
    const { input, parent } = createFileField({ callbacks: { onClick } });

    selectFiles(input, [mockFile("file.txt")]);
    query(parent, ".dff-filename").click();

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("announcements", () => {
  test("does not announce the initial files", () => {
    const { parent } = createFileField({ initial: [existingFile] });

    expect(getStatus(parent)).toBe("");
  });

  test("announces a finished upload", () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onSuccess?.();

    expect(getStatus(parent)).toBe("file.txt uploaded");
  });

  test("announces a failed upload", () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onError?.(new Error("failed"));

    expect(getStatus(parent)).toBe("Upload failed: file.txt");
  });

  test("announces a deleted file", async () => {
    const { fileField, parent } = createFileField({ initial: [existingFile] });

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(getStatus(parent)).toBe("existing.txt removed");
  });

  test("announces a failed delete", async () => {
    vi.spyOn(ExistingFile.prototype, "delete").mockRejectedValue(
      new Error("Delete failed")
    );
    const { parent } = createFileField({ initial: [existingFile] });

    query(parent, ".dff-delete").click();

    await vi.waitFor(() => {
      expect(getStatus(parent)).toBe("Delete failed: existing.txt");
    });
  });

  test("announces a canceled upload", async () => {
    const { fileField, input, parent } = createFileField();

    selectFiles(input, [mockFile("file.txt")]);
    query(parent, ".dff-cancel").click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(getStatus(parent)).toBe("file.txt removed");
  });

  test("uses the translations", () => {
    const { fileField, input, parent } = createFileField({
      translations: { "{filename} uploaded": "{filename} geüpload" }
    });

    selectFiles(input, [mockFile("file.txt")]);
    getTusUpload(fileField).onSuccess?.();

    expect(getStatus(parent)).toBe("file.txt geüpload");
  });
});

describe("focus", () => {
  test("moves the focus to the next file after clicking delete", async () => {
    const { fileField, parent } = createFileField({
      initial: [existingFile, { ...existingFile, name: "second.txt" }],
      multiple: true
    });
    const deleteButton = query(parent, ".dff-file-id-0 .dff-delete");
    deleteButton.focus();

    deleteButton.click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(1);
    });

    expect(query(parent, ".dff-file-id-1 .dff-delete")).toHaveFocus();
  });

  test("moves the focus to the input after canceling the only upload", async () => {
    const { fileField, input, parent } = createFileField();
    selectFiles(input, [mockFile("file.txt")]);
    const cancelButton = query(parent, ".dff-cancel");
    cancelButton.focus();

    cancelButton.click();

    await vi.waitFor(() => {
      expect(fileField.uploads).toHaveLength(0);
    });

    expect(input).toHaveFocus();
  });

  test("does not move the focus when a file is replaced", async () => {
    const { fileField, input, parent } = createFileField({
      initial: [existingFile],
      multiple: true
    });
    query(parent, ".dff-delete").focus();

    selectFiles(input, [mockFile("existing.txt")]);

    await vi.waitFor(() => {
      expect(getUpload(fileField)).toBeInstanceOf(TusUpload);
    });

    expect(document.body).toHaveFocus();
  });
});
