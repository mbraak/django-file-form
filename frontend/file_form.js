/* global $ */

import { Upload } from "tus-js-client";

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

  $form.find(".file-uploader").each((i, element) => {
    const $element = $(element);

    const $inputFile = $($element.find("input[type=file]"));

    const fieldName = $inputFile.attr("name");
    const multiple = Boolean($inputFile.attr("multiple"));

    const uploaderOptions = {
      input: $inputFile[0],
      fieldName,
      uploadUrl,
      formId,
      multiple
    };

    if (options) {
      $.extend(uploaderOptions, options);
    }

    initUploadField(uploaderOptions);
  });
}

const initUploadField = ({ fieldName, formId, input, uploadUrl }) => {
  input.addEventListener("change", e => {
    const file = e.target.files[0];

    const upload = new Upload(file, {
      endpoint: uploadUrl,
      metadata: {
        fieldName,
        filename: file.name,
        formId
      }
    });

    upload.start();
  });
};

global.initUploadFields = initUploadFields;
