import { beforeEach, describe, expect, test, vi } from "vitest";

import type { UploadEvent } from "./file_field.ts";

import initUploadFields from "./init_upload_fields.ts";
import S3Upload from "./uploads/s3_upload.ts";

const createDiv = (className: string) => {
  const div = document.createElement("div");
  div.className = className;

  return div;
};

const createInput = (type: string, name: string, value?: string) => {
  const input = document.createElement("input");

  input.setAttribute("type", type);
  input.setAttribute("name", name);

  if (value) {
    input.setAttribute("value", value);
  }

  return input;
};

const createHiddenInput = (name: string, value: string) =>
  createInput("hidden", name, value);

// Add a file field, as rendered by the UploadWidget
const appendUploader = (form: Element, fieldName: string) => {
  const uploaderDiv = createDiv("dff-uploader");
  form.append(uploaderDiv);

  const containerDiv = createDiv("dff-container");
  uploaderDiv.append(containerDiv);

  const input = createInput("file", fieldName);
  containerDiv.append(input);

  return input;
};

const createForm = ({
  initialUploads = [{ name: "existing.txt", size: 1024, type: "existing" }],
  s3UploadDir,
  withCsrfToken = true
}: {
  initialUploads?: unknown[];
  s3UploadDir?: string;
  withCsrfToken?: boolean;
} = {}) => {
  const form = document.createElement("form");
  document.body.append(form);

  if (withCsrfToken) {
    form.append(createHiddenInput("csrfmiddlewaretoken", "token1"));
  }
  form.append(createHiddenInput("form_id", "id1"));
  form.append(createHiddenInput("upload_url", "/upload"));
  if (s3UploadDir) {
    form.append(createHiddenInput("s3_upload_dir", s3UploadDir));
  }
  form.append(
    createHiddenInput("input_file-uploads", JSON.stringify(initialUploads))
  );
  form.append(createHiddenInput("input_file-metadata", "{}"));

  appendUploader(form, "input_file");

  return form;
};

const getFileInput = (form: Element, name = "input_file") => {
  const input = form.querySelector<HTMLInputElement>(
    `[name="${CSS.escape(name)}"]`
  );

  if (!input) {
    throw new Error(`No input ${name}`);
  }

  return input;
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe(".initUploadFields", () => {
  test("dispatches addUpload event from the form for initial files", () => {
    const form = createForm();
    const listener = vi.fn();
    form.addEventListener("addUpload", listener);

    initUploadFields(form);

    expect(listener).toHaveBeenCalledOnce();

    const event = listener.mock.calls[0]?.[0] as UploadEvent;

    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.target).toBe(form);
    expect(event.detail.fieldName).toBe("input_file");
    expect(event.detail.fileName).toBe("existing.txt");
    expect(event.detail.element).toHaveClass("dff-file");
    expect(event.detail.metaDataField).toBe(
      form.querySelector("[name='input_file-metadata']")
    );
    expect(event.detail.upload.name).toBe("existing.txt");
  });

  test("event bubbles to the document", () => {
    const form = createForm();
    const listener = vi.fn();
    document.addEventListener("addUpload", listener);

    initUploadFields(form);

    expect(listener).toHaveBeenCalledOnce();

    document.removeEventListener("addUpload", listener);
  });

  test("only initializes the fields with the prefix", () => {
    // A form set renders the fields of all its forms in the same form element
    const form = document.createElement("form");
    document.body.append(form);
    form.append(createHiddenInput("csrfmiddlewaretoken", "token1"));
    form.append(createHiddenInput("form-1-form_id", "id1"));
    form.append(createHiddenInput("form-1-upload_url", "/upload"));

    const inputs = [
      "form-0-input_file",
      "form-1-input_file",
      "form-10-input_file"
    ].map(fieldName => appendUploader(form, fieldName));

    initUploadFields(form, { prefix: "form-1" });

    const isInitialized = (input: HTMLInputElement) =>
      input.parentElement?.querySelector(".dff-files") != null;

    expect(inputs.map(isInitialized)).toStrictEqual([false, true, false]);
  });

  test("uses s3 uploads when the form has an s3_upload_dir input", () => {
    vi.spyOn(S3Upload.prototype, "start").mockImplementation(() => {
      // don't upload
    });

    const form = createForm({ s3UploadDir: "dir1" });
    initUploadFields(form);

    const listener = vi.fn();
    form.addEventListener("addUpload", listener);

    const input = getFileInput(form);
    Object.defineProperty(input, "files", {
      value: [new File(["test"], "file.txt")]
    });
    input.dispatchEvent(new Event("change"));

    const event = listener.mock.calls[0]?.[0] as UploadEvent;

    expect(event.detail.upload).toBeInstanceOf(S3Upload);

    vi.restoreAllMocks();
  });

  test("keeps a required input required by default", () => {
    const form = createForm({ initialUploads: [] });
    const input = getFileInput(form);
    input.required = true;

    initUploadFields(form);

    expect(input.required).toBe(true);
  });

  test("makes the input not required when skipRequired is true", () => {
    const form = createForm({ initialUploads: [] });
    const input = getFileInput(form);
    input.required = true;

    initUploadFields(form, { skipRequired: true });

    expect(input.required).toBe(false);
  });

  test("throws an error when the form has no csrf token", () => {
    const form = createForm({ withCsrfToken: false });

    expect(() => {
      initUploadFields(form);
    }).toThrow("Csrf token not found");
  });

  describe("supportDropArea", () => {
    // The drop area highlights the files container when a file is dragged over it
    const dragOver = (form: Element) => {
      const filesContainer = form.querySelector(".dff-files");

      if (!filesContainer) {
        throw new Error("No files container");
      }

      filesContainer.dispatchEvent(new Event("dragover", { cancelable: true }));

      return filesContainer;
    };

    test("adds a drop area by default", () => {
      const form = createForm();

      initUploadFields(form);

      expect(dragOver(form)).toHaveClass("dff-dropping");
    });

    test("does not add a drop area when supportDropArea is false", () => {
      const form = createForm();

      initUploadFields(form, { supportDropArea: false });

      expect(dragOver(form)).not.toHaveClass("dff-dropping");
    });
  });
});
