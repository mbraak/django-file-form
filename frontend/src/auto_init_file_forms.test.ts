import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import autoInitFileForms from "./auto_init_file_forms.ts";

const createUploader = () => {
  const div = document.createElement("div");
  div.className = "dff-uploader";

  return div;
};

const createForm = (...children: Element[]) => {
  const form = document.createElement("form");
  form.append(...children);
  document.body.append(form);

  return form;
};

const initUploadFields = vi.fn<typeof window.initUploadFields>();

beforeEach(() => {
  document.body.replaceChildren();
  window.initUploadFields = initUploadFields;
});

afterEach(() => {
  initUploadFields.mockReset();
});

describe("autoInitFileForms", () => {
  test("initializes the form of an uploader", () => {
    const form = createForm(createUploader());

    autoInitFileForms();

    expect(initUploadFields).toHaveBeenCalledExactlyOnceWith(form);
  });

  test("finds the form of an uploader that is nested deeper", () => {
    const wrapper = document.createElement("div");
    const innerWrapper = document.createElement("div");
    innerWrapper.append(createUploader());
    wrapper.append(innerWrapper);
    const form = createForm(wrapper);

    autoInitFileForms();

    expect(initUploadFields).toHaveBeenCalledExactlyOnceWith(form);
  });

  test("initializes a form with multiple uploaders once", () => {
    const form = createForm(createUploader(), createUploader());

    autoInitFileForms();

    expect(initUploadFields).toHaveBeenCalledExactlyOnceWith(form);
  });

  test("initializes each form", () => {
    const form1 = createForm(createUploader());
    const form2 = createForm(createUploader());

    autoInitFileForms();

    expect(initUploadFields).toHaveBeenCalledTimes(2);
    expect(initUploadFields).toHaveBeenNthCalledWith(1, form1);
    expect(initUploadFields).toHaveBeenNthCalledWith(2, form2);
  });

  test("ignores an uploader that is not in a form", () => {
    document.body.append(createUploader());

    autoInitFileForms();

    expect(initUploadFields).not.toHaveBeenCalled();
  });

  test("ignores a form without an uploader", () => {
    createForm(document.createElement("div"));

    autoInitFileForms();

    expect(initUploadFields).not.toHaveBeenCalled();
  });
});
