import EventEmitter from "eventemitter3";
import FileField, { Callbacks } from "./file_field";
import { InitialFile, Metadata } from "./uploads/base_upload";
import {
  findInput,
  getInputValueForFormAndPrefix,
  getMetadataFieldName,
  getUploadsFieldName
} from "./util";
import { RenderFileInfo, Translations } from "./renderUploads/types";

export interface Options {
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
    const data = getInputValue(getUploadsFieldName(fieldName, getPrefix()));

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
    const initial = getInitialFiles(container).concat(
      getPlaceholders(fieldName)
    );

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

export default initUploadFields;
