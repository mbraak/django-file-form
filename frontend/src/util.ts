export const formatBytes = (bytes: number, decimals: number): string => {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals || 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const n = parseFloat((bytes / k ** i).toFixed(dm));
  const size = sizes[i];

  if (size == null) {
    return "";
  } else {
    return `${n.toString()} ${size}`;
  }
};

export const getInputNameWithPrefix = (
  fieldName: string,
  prefix: null | string
): string => (prefix ? `${prefix}-${fieldName}` : fieldName);

const getInputNameWithoutPrefix = (
  fieldName: string,
  prefix: null | string
): string => (prefix ? fieldName.slice(prefix.length + 1) : fieldName);

export const findInput = (
  form: Element,
  fieldName: string,
  prefix: null | string
): HTMLInputElement | null => {
  const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
  const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);

  if (!input) {
    return null;
  }

  return input as HTMLInputElement;
};

export const getUploadsFieldName = (
  fieldName: string,
  prefix: null | string
): string => `${getInputNameWithoutPrefix(fieldName, prefix)}-uploads`;

export const getInputValueForFormAndPrefix = (
  form: Element,
  fieldName: string,
  prefix: null | string
): string | undefined => findInput(form, fieldName, prefix)?.value;

export const getMetadataFieldName = (
  fieldName: string,
  prefix: null | string
): string => `${getInputNameWithoutPrefix(fieldName, prefix)}-metadata`;
