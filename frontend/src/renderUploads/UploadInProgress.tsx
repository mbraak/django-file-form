import BaseUpload from "../uploads/base_upload";
import { Translations } from "./types";

interface CancelLinkProps {
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const CancelLink = ({ onDelete, translations, upload }: CancelLinkProps) => {
  const handleCancel = () => onDelete(upload);

  const classes = ["dff-cancel"];
  const cancelling = upload.deleteStatus === "in_progress";

  if (cancelling) {
    classes.push("dff-disabled");
  }

  return (
    <a
      className="dff-cancel"
      href="#"
      onClick={cancelling ? undefined : handleCancel}
    >
      {translations.Cancel}
    </a>
  );
};

interface UploadInProgressProps {
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const UploadInProgress = ({
  onDelete,
  translations,
  upload
}: UploadInProgressProps): JSX.Element => (
  <div className={`dff-file dff-file-id-${upload.uploadIndex}`}>
    <span>{upload.name}</span>
    <span className="dff-progress">
      <span
        className="dff-progress-inner"
        style={{ width: `${upload.progress.toFixed(2)}%` }}
      />
    </span>
    <CancelLink
      onDelete={onDelete}
      translations={translations}
      upload={upload}
    />
  </div>
);

export default UploadInProgress;
