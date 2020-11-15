import BaseUpload from "../uploads/base_upload";
import { Translations } from "./types";

interface UploadErrorProps {
  translations: Translations;
  upload: BaseUpload;
}

const UploadError = ({
  translations,
  upload
}: UploadErrorProps): JSX.Element => (
  <div className={`dff-file dff-upload-fail dff-file-id-${upload.uploadIndex}`}>
    <span>{upload.name}</span>
    <span className="dff-error">{translations["Upload failed"]}</span>
  </div>
);

export default UploadError;
