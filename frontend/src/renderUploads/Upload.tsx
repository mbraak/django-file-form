import BaseUpload from "../uploads/base_upload";
import { RenderFileInfo, Translations } from "./types";
import UploadInProgress from "./UploadInProgress";
import UploadDone from "./UploadDone";
import UploadError from "./UploadError";

interface UploadProps {
  CustomFileInfo?: RenderFileInfo;
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const Upload = ({
  CustomFileInfo,
  onDelete,
  translations,
  upload
}: UploadProps): JSX.Element => {
  switch (upload.status) {
    case "done":
      return (
        <UploadDone
          CustomFileInfo={CustomFileInfo}
          onDelete={onDelete}
          translations={translations}
          upload={upload}
        />
      );

    case "error":
    case "invalid":
      return <UploadError translations={translations} upload={upload} />;

    case "uploading":
      return (
        <UploadInProgress
          onDelete={onDelete}
          translations={translations}
          upload={upload}
        />
      );
  }
};

export default Upload;
