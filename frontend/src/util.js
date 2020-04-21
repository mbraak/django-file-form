export const formatBytes = (bytes, decimals) => {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals || 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const n = parseFloat((bytes / k ** i).toFixed(dm));
  const size = sizes[i];

  return `${n} ${size}`;
};

export const getInputNameWithPrefix = (fieldName, prefix) =>
  prefix ? `${prefix}-${fieldName}` : fieldName;

const getInputNameWithoutPrefix = (fieldName, prefix) =>
  prefix ? fieldName.slice(prefix.length + 1) : fieldName;

export const findInput = (form, fieldName, prefix) => {
  const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
  const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);

  if (!input) {
    console.error(`Cannot find input with name '${inputNameWithPrefix}'`);
    return null;
  }

  return input;
};

export const getPlaceholderFieldName = (fieldName, prefix) =>
  `placeholder-${getInputNameWithoutPrefix(fieldName, prefix)}`;

export const getInputValueForFormAndPrefix = (form, fieldName, prefix) =>
  findInput(form, fieldName, prefix).value;
