import { render } from "inferno";
import BaseUpload from "../uploads/base_upload";
import Uploads from "./Uploads";
import { RenderFileInfo, Translations } from "./types";

interface RenderUploadParameters {
  container: HTMLElement;
  CustomFileInfo?: RenderFileInfo;
  inputAccept: string;
  onDelete: (upload: BaseUpload) => void;
  onUploadFiles: (files: File[]) => Promise<void>;
  supportDropArea: boolean;
  translations: Translations;
  uploads: BaseUpload[];
}

const renderUploads = ({
  container,
  CustomFileInfo,
  inputAccept,
  onDelete,
  onUploadFiles,
  supportDropArea,
  translations,
  uploads
}: RenderUploadParameters): void => {
  render(
    <Uploads
      CustomFileInfo={CustomFileInfo}
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
