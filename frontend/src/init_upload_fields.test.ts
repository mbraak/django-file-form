import { beforeEach, describe, expect, test, vi } from "vitest";

import type { UploadEvent } from "./file_field.ts";

import initUploadFields from "./init_upload_fields.ts";

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

const createForm = () => {
  const form = document.createElement("form");
  document.body.append(form);

  form.append(createHiddenInput("csrfmiddlewaretoken", "token1"));
  form.append(createHiddenInput("form_id", "id1"));
  form.append(createHiddenInput("upload_url", "/upload"));
  form.append(
    createHiddenInput(
      "input_file-uploads",
      JSON.stringify([{ name: "existing.txt", size: 1024, type: "existing" }])
    )
  );
  form.append(createHiddenInput("input_file-metadata", "{}"));

  const uploaderDiv = createDiv("dff-uploader");
  form.append(uploaderDiv);

  const containerDiv = createDiv("dff-container");
  uploaderDiv.append(containerDiv);

  containerDiv.append(createInput("file", "input_file"));

  return form;
};

beforeEach(() => {
  document.body.innerHTML = "";
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
});
