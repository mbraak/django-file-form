import { screen } from "@testing-library/dom";
import { beforeEach, describe, expect, test } from "vitest";

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

const createFormSet = (prefix: string) => {
  const form = document.createElement("form");
  document.body.append(form);

  form.append(createHiddenInput(`${prefix}-TOTAL_FORMS`, "1"));
  form.append(createHiddenInput("csrfmiddlewaretoken", "token1"));

  form.append(createHiddenInput(`${prefix}-0-form_id`, "id1"));
  form.append(createHiddenInput(`${prefix}-0-upload_url`, "/upload"));

  const uploaderDiv = createDiv("dff-uploader");
  form.append(uploaderDiv);

  const containerDiv = createDiv("dff-container");
  uploaderDiv.append(containerDiv);

  containerDiv.append(createInput("file", `${prefix}-0-input_file`));

  return form;
};

beforeEach(() => {
  document.body.innerHTML = "";
});

describe(".initFormSet", () => {
  test("initializes a form", () => {
    const form = createFormSet("form");

    initFormSet(form, {});

    expect(screen.getByText("Drop your files here")).toBeInTheDocument();
  });

  test("initializes a form with a string prefix parameter", () => {
    const form = createFormSet("test");

    initFormSet(form, "test");

    expect(screen.getByText("Drop your files here")).toBeInTheDocument();
  });

  test("initializes a form with a prefix in an object parameter", () => {
    const form = createFormSet("test");

    initFormSet(form, { prefix: "test" });

    expect(screen.getByText("Drop your files here")).toBeInTheDocument();
  });
});
