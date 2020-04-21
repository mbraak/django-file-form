import UploadFile from "./upload_file";
import {
  getInputNameWithPrefix,
  getInputValueForFormAndPrefix,
  getPlaceholderFieldName
} from "./util";

const initFormSet = (form, optionsParam) => {
  let options;

  if (typeof optionsParam === "string") {
    options = { prefix: optionsParam };
  } else {
    options = optionsParam;
  }

  const prefix = options.prefix || "form";

  const formCount = parseInt(
    getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix),
    10
  );

  for (let i = 0; i < formCount; i += 1) {
    const subFormPrefix = getInputNameWithPrefix(`${i}`);
    initUploadFields(form, {
      ...options,
      prefix: `${prefix}-${subFormPrefix}`
    });
  }
};

const initUploadFields = (form, options = {}) => {
  const matchesPrefix = fieldName => {
    if (!(options && options.prefix)) {
      return true;
    }

    return fieldName.startsWith(`${options.prefix}-`);
  };

  const getPrefix = () => (options && options.prefix ? options.prefix : null);

  const getInputValue = fieldName =>
    getInputValueForFormAndPrefix(form, fieldName, getPrefix());

  const getInitialFiles = element => {
    const filesData = element.dataset.files;

    if (!filesData) {
      return [];
    }

    return JSON.parse(filesData);
  };

  const getPlaceholders = fieldName =>
    JSON.parse(getInputValue(getPlaceholderFieldName(fieldName, getPrefix())));

  const uploadUrl = getInputValue("upload_url");
  const formId = getInputValue("form_id");
  const skipRequired = options.skipRequired || false;
  const prefix = getPrefix();

  if (!formId || !uploadUrl) {
    return;
  }

  form.querySelectorAll(".dff-uploader").forEach(uploaderDiv => {
    const container = uploaderDiv.querySelector(".dff-container");

    if (!container) {
      return;
    }

    const input = container.querySelector("input[type=file]");

    if (!(input && matchesPrefix(input.name))) {
      return;
    }

    const fieldName = input.name;
    const { multiple } = input;
    const initial = getInitialFiles(container).concat(
      getPlaceholders(fieldName)
    );
    const translations = JSON.parse(
      container.getAttribute("data-translations")
    );
    const supportDropArea = !(options.supportDropArea === false);

    new UploadFile({
      callbacks: options.callbacks || {},
      fieldName,
      form,
      formId,
      initial,
      input,
      multiple,
      parent: container,
      prefix,
      retryDelays: options.retryDelays,
      skipRequired,
      supportDropArea,
      translations,
      uploadUrl
    });
  });
};

global.initFormSet = initFormSet;
global.initUploadFields = initUploadFields;
