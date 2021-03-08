const findForm = (element: Element): HTMLElement | null => {
  const parent = element.parentElement;

  if (!parent) {
    return null;
  }

  if (parent.tagName === "FORM") {
    return parent;
  }

  return findForm(parent);
};

const unique = (values: unknown[]): unknown[] =>
  Array.from(new Set(values).values());

declare const window: any; // eslint-disable-line @typescript-eslint/no-explicit-any

const autoInitFileForms = (): void => {
  const initUploadFields = window.initUploadFields as () => void; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

  const forms = unique(
    Array.from(document.querySelectorAll(".dff-uploader")).map(findForm)
  );
  forms.forEach(initUploadFields);
};

export default autoInitFileForms;
