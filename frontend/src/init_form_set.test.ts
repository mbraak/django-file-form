import { screen } from "@testing-library/dom";

import initFormSet from "./init_form_set.ts";

const createDiv = (className?: string) => {
  const div = document.createElement("div");

  if (className) {
    div.className = className;
  }

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

describe(".initFormSet", () => {
  it("initializes a form", () => {
    const form = document.createElement("form");
    document.body.append(form);

    form.append(createHiddenInput("form-TOTAL_FORMS", "1"));
    form.append(createHiddenInput("csrfmiddlewaretoken", "token1"));
    form.append(createHiddenInput("form-0-form_id", "id1"));
    form.append(createHiddenInput("form-0-upload_url", "/upload"));

    const uploaderDiv = createDiv("dff-uploader");
    form.append(uploaderDiv);

    const containerDiv = createDiv("dff-container");
    uploaderDiv.append(containerDiv);

    containerDiv.append(createInput("file", "form-0-input_file"));

    initFormSet(form, {});

    screen.getByText("Drop your files here");
  });
});
