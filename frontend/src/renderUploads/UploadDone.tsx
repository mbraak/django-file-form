import BaseUpload from "../uploads/base_upload";
import { Translations } from "./types";
import { formatBytes } from "../util";

interface DeleteLinkProps {
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const DeleteLink = ({ onDelete, translations, upload }: DeleteLinkProps) => {
  const handleDelete = () => onDelete(upload);

  const classes = ["dff-delete"];
  const deleting = upload.deleteStatus === "in_progress";

  if (deleting) {
    classes.push("dff-disabled");
  }

  return (
    <a
      className="dff-delete"
      href="#"
      onClick={deleting ? undefined : handleDelete}
    >
      {translations.Delete}
    </a>
  );
};

interface UploadDoneProps {
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const UploadDone = ({
  onDelete,
  translations,
  upload
}: UploadDoneProps): JSX.Element => (
  <div
    className={`dff-file dff-upload-success dff-file-id-${upload.uploadIndex}`}
  >
    <span>{upload.name}</span>
    <span className="dff-filesize">{formatBytes(upload.getSize(), 2)}</span>
    <DeleteLink
      onDelete={onDelete}
      translations={translations}
      upload={upload}
    />
    {upload.deleteStatus === "error" && (
      <span className="dff-error">{translations["Delete failed"]}</span>
    )}
  </div>
);

export default UploadDone;
