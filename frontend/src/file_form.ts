import EventEmitter from "eventemitter3";
import FileField, { Callbacks } from "./file_field";
import { InitialFile } from "./uploads/uploaded_file";
import {
  findInput,
  formatBytes,
  getInputNameWithPrefix,
  getInputValueForFormAndPrefix,
  getMetadataFieldName,
  getPlaceholderFieldName,
  getS3UploadedFieldName
} from "./util";
import { RenderFileInfo, Translations } from "./renderUploads/types";
import { Metadata } from "./uploads/base_upload";

interface Options {
  callbacks?: Callbacks;
  chunkSize?: number;
  CustomFileInfo?: RenderFileInfo;
  eventEmitter?: EventEmitter;
  prefix?: string;
  retryDelays?: number[];
  skipRequired?: boolean;
  supportDropArea?: boolean;
}

const initUploadFields = (form: Element, options: Options = {}): void => {
  const matchesPrefix = (fieldName: string): boolean => {
    if (!(options && options.prefix)) {
      return true;
    }

    return fieldName.startsWith(`${options.prefix}-`);
  };

  const getPrefix = (): string | null =>
    options && options.prefix ? options.prefix : null;

  const getInputValue = (fieldName: string): string | undefined =>
    getInputValueForFormAndPrefix(form, fieldName, getPrefix());

  const getMetadataPerFile = (fieldName: string): Record<string, Metadata> => {
    const data = getInputValue(getMetadataFieldName(fieldName, getPrefix()));

    if (!data) {
      return {};
    }

    return JSON.parse(data) as Record<string, Metadata>;
  };

  const setInitialMetadata = (
    fieldName: string,
    initialFiles: InitialFile[]
  ): void => {
    const metadataPerFilename = getMetadataPerFile(fieldName);

    initialFiles.forEach(initialFile => {
      initialFile.metadata = metadataPerFilename[initialFile.name];
    });
  };

  const getInitialFiles = (element: HTMLElement): InitialFile[] => {
    const filesData = element.dataset.files;

    if (!filesData) {
      return [];
    }

    return JSON.parse(filesData) as InitialFile[];
  };

  const getPlaceholders = (fieldName: string): InitialFile[] => {
    const data = getInputValue(getPlaceholderFieldName(fieldName, getPrefix()));

    if (!data) {
      return [];
    }

    return JSON.parse(data) as InitialFile[];
  };

  const getS3Uploads = (fieldName: string): InitialFile[] => {
    const data = getInputValue(getS3UploadedFieldName(fieldName, getPrefix()));

    if (!data) {
      return [];
    }

    return JSON.parse(data) as InitialFile[];
  };

  const uploadUrl = getInputValue("upload_url");
  const formId = getInputValue("form_id");
  const s3UploadDir = getInputValue("s3_upload_dir");
  const skipRequired = options.skipRequired || false;
  const prefix = getPrefix();
  const csrfToken = findInput(form, "csrfmiddlewaretoken", null)?.value;

  if (!csrfToken) {
    throw Error("Csrf token not found");
  }

  if (!formId || !uploadUrl) {
    return;
  }

  form.querySelectorAll(".dff-uploader").forEach(uploaderDiv => {
    const container = uploaderDiv.querySelector(
      ".dff-container"
    ) as HTMLElement;

    if (!container) {
      return;
    }

    const input = container.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;

    if (!(input && matchesPrefix(input.name))) {
      return;
    }

    const fieldName = input.name;
    const { multiple } = input;

    const initial = getInitialFiles(container)
      .concat(getPlaceholders(fieldName))
      .concat(getS3Uploads(fieldName));

    setInitialMetadata(fieldName, initial);

    const dataTranslations = container.getAttribute("data-translations");
    const translations: Translations = dataTranslations
      ? (JSON.parse(dataTranslations) as Translations)
      : {};
    const supportDropArea = !(options.supportDropArea === false);

    new FileField({
      callbacks: options.callbacks || {},
      chunkSize: options.chunkSize || 2621440,
      csrfToken,
      CustomFileInfo: options.CustomFileInfo,
      eventEmitter: options.eventEmitter,
      fieldName,
      form,
      formId,
      s3UploadDir: s3UploadDir || null,
      initial,
      input,
      multiple,
      parent: container,
      prefix,
      retryDelays: options.retryDelays || null,
      skipRequired,
      supportDropArea,
      translations,
      uploadUrl
    });
  });
};

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

declare const window: any; // eslint-disable-line @typescript-eslint/no-explicit-any

window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

window.djangoFileForm = { formatBytes }; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
