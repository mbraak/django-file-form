import BaseUpload from "../uploads/base_upload";
import { Translations } from "./types";

interface UploadErrorProps {
  translations: Translations;
  upload: BaseUpload;
}

const UploadError = ({
  translations,
  upload
}: UploadErrorProps): JSX.Element => {
  const getErrorMessage = () => {
    switch (upload.status) {
      case "error":
        return translations["Upload failed"];

      case "invalid":
        return translations["Invalid file type"];

      default:
        return "";
    }
  };

  return (
    <div
      className={`dff-file dff-upload-fail dff-file-id-${upload.uploadIndex}`}
    >
      <span>{upload.name}</span>
      <span className="dff-error">{getErrorMessage()}</span>
    </div>
  );
};

export default UploadError;
