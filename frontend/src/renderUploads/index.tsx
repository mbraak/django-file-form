import { render } from "inferno";
import BaseUpload from "../uploads/base_upload";
import Uploads from "./Uploads";
import { Translations } from "./types";

interface RenderUploadParameters {
  container: HTMLElement;
  inputAccept: string;
  onDelete: (upload: BaseUpload) => void;
  onUploadFiles: (files: File[]) => void;
  supportDropArea: boolean;
  translations: Translations;
  uploads: BaseUpload[];
}

const renderUploads = ({
  container,
  inputAccept,
  onDelete,
  onUploadFiles,
  supportDropArea,
  translations,
  uploads
}: RenderUploadParameters): void => {
  render(
    <Uploads
      inputAccept={inputAccept}
      onDelete={onDelete}
      onUploadFiles={onUploadFiles}
      supportDropArea={supportDropArea}
      translations={translations}
      uploads={uploads}
    />,
    container
  );
};

export default renderUploads;
