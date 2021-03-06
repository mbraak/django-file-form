import initUploadFields, { Options } from "./init_upload_fields";
import { getInputNameWithPrefix, getInputValueForFormAndPrefix } from "./util";

const initFormSet = (form: Element, optionsParam: Options | string): void => {
  let options: Options;

  if (typeof optionsParam === "string") {
    options = { prefix: optionsParam };
  } else {
    options = optionsParam;
  }

  const prefix = options.prefix || "form";

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
    const subFormPrefix = getInputNameWithPrefix(`${i}`, null);
    initUploadFields(form, {
      ...options,
      prefix: `${prefix}-${subFormPrefix}`
    });
  }
};

export default initFormSet;
