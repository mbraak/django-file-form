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

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

const autoInitFileForms = (): void => {
  const forms = unique(
    Array.from(document.querySelectorAll(".dff-uploader")).map(findForm)
  );
  for (const form of forms) {
    if (form) {
      window.initUploadFields(form);
    }
  }
};

export default autoInitFileForms;
