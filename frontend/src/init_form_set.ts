import initUploadFields, { Options } from "./init_upload_fields.ts";
import {
  getInputNameWithPrefix,
  getInputValueForFormAndPrefix
} from "./util.ts";

const initFormSet = (
  form: HTMLFormElement,
  optionsParam: Options | string
): void => {
  let options: Options;

  if (typeof optionsParam === "string") {
    options = { prefix: optionsParam };
  } else {
    options = optionsParam;
  }

  const prefix = options.prefix ?? "form";

  const totalFormsValue = getInputValueForFormAndPrefix(
    form,
    "TOTAL_FORMS",
    prefix
  );

  if (!totalFormsValue) {
    return;
  }

  const formCount = parseInt(totalFormsValue, 10);

  for (let i = 0; i < formCount; i += 1) {
    const subFormPrefix = getInputNameWithPrefix(i.toString(), null);
    initUploadFields(form, {
      ...options,
      prefix: `${prefix}-${subFormPrefix}`
    });
  }
};

export default initFormSet;
