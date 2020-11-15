import BaseUpload from "../uploads/base_upload";
import { Translations } from "./types";
import UploadInProgress from "./UploadInProgress";
import UploadDone from "./UploadDone";
import UploadError from "./UploadError";

interface UploadProps {
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const Upload = ({
  onDelete,
  translations,
  upload
}: UploadProps): JSX.Element => {
  switch (upload.status) {
    case "done":
      return (
        <UploadDone
          onDelete={onDelete}
          translations={translations}
          upload={upload}
        />
      );

    case "error":
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
