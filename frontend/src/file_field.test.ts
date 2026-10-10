import { describe, expect, test } from "vitest";

import FileField from "./file_field.ts";
import TusUpload from "./uploads/tus_upload.ts";

const createFileField = () => {
  const form = document.createElement("form");
  const parent = document.createElement("div");
  const input = document.createElement("input");
  input.type = "file";

  parent.append(input);
  form.append(parent);
  document.body.replaceChildren(form);

  return new FileField({
    callbacks: {},
    chunkSize: 1024,
    csrfToken: "token1",
    fieldName: "input_file",
    form,
    formId: "id1",
    initial: [],
    input,
    multiple: false,
    parent,
    prefix: null,
    retryDelays: null,
    s3UploadDir: null,
    skipRequired: false,
    supportDropArea: false,
    translations: {},
    uploadUrl: "/upload"
  });
};

const createUpload = (uploadIndex: number) =>
  new TusUpload({
    chunkSize: 1024,
    csrfToken: "token1",
    fieldName: "input_file",
    file: new File(["test"], "file.txt", { type: "text/plain" }),
    formId: "id1",
    retryDelays: null,
    uploadIndex,
    uploadUrl: "/upload"
  });

describe("handleProgress", () => {
  test("sets the width of the progress bar", () => {
    const fileField = createFileField();
    const div = fileField.renderer.addNewUpload("file.txt", 1);

    fileField.handleProgress(createUpload(1), 50, 200);

    expect(div.querySelector(".dff-progress-inner")).toHaveStyle({
      width: "25%"
    });
  });

  test("sets the width of the progress bar to 0% when the total is 0", () => {
    const fileField = createFileField();
    const div = fileField.renderer.addNewUpload("file.txt", 1);

    fileField.handleProgress(createUpload(1), 0, 0);

    expect(div.querySelector(".dff-progress-inner")).toHaveStyle({
      width: "0%"
    });
  });
});
