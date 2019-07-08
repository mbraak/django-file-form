/* global $, document */

import { Upload } from "tus-js-client";


class UploadFile {
  constructor({ input, container, fieldName, formId, initial, multiple, uploadUrl }) {
    this.input = input;
    this.container = container;
    this.fieldName = fieldName;
    this.formId = formId;
    this.initial = initial;
    this.multiple = multiple;
    this.uploadUrl = uploadUrl;

    this.currentUpload = {};
    this.uploadIndex = 0;

    if (initial) {
      initial.forEach(f => {
        this.addFile(f.name);

        if (multiple) {
          this.uploadIndex += 1;
        }

        this.input.required = false;
      });
    }

    this.connect();
  }

  connect() {
    this.input.addEventListener("change", this.onChange);
  }

  onChange = e => {
    if (e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    const { fieldName, formId, multiple, uploadIndex, uploadUrl } = this;
    const filename = file.name;

    const upload = new Upload(file, {
      endpoint: uploadUrl,
      metadata: { fieldName, filename, formId },
      onError: this.handleError,
      onProgress: this.handleProgress,
      onSuccess: this.handleSuccess,
    });

    this.currentUpload = { filename, uploadIndex };

    if (multiple) {
      this.uploadIndex += 1;
    }

    upload.start();
  }

  handleProgress = (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
    console.log("progress", bytesUploaded, bytesTotal, `${percentage}%`);
  };

  handleError = error => {
    console.log(`Failed because: ${error}`);
    this.currentUpload = {};
  }

  handleSuccess = () => {
    const { filename } = this.currentUpload;
    const { input } = this;

    input.value = "";
    input.required = false;

    this.addFile(filename);
  };

  addFile(filename) {
    const { container, uploadIndex } = this;

    const div = document.createElement("div");
    div.className = `qq-file-id-${uploadIndex} qq-upload-success`;
    div.innerHTML = filename;
    container.appendChild(div);
  }
}

function initUploadFields($form, options) {
  const getInputNameWithPrefix = fieldName =>
    options && options.prefix ? `${options.prefix}-${fieldName}` : fieldName;

  const getInputValue = fieldName => {
    const inputNameWithPrefix = getInputNameWithPrefix(fieldName);
    const input = $form.find(`[name=${inputNameWithPrefix}]`);

    if (!input.length) {
      console.error(`Cannot find input with name '${inputNameWithPrefix}'`);
      return null;
    }

    return input.val();
  };

  const uploadUrl = getInputValue("upload_url");
  const formId = getInputValue("form_id");

  if (!formId || !uploadUrl) {
    return;
  }

  $form.find(".file-uploader").each((i, container) => {
    const $element = $(container).find(".file-uploader-container");

    const $inputFile = $($element.find("input[type=file]"));
    const input = $inputFile[0];

    const fieldName = $inputFile.attr("name");
    const multiple = Boolean($inputFile.attr("multiple"));
    const initial = ($element.data("files") || []).filter(f => !f.existing);

    new UploadFile({
      container, fieldName, formId, initial, input, multiple, uploadUrl
    });
  });
}

global.initUploadFields = initUploadFields;
