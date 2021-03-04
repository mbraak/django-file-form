import BaseUpload from "../uploads/base_upload";
import { RenderFileInfo, Translations } from "./types";
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

const DefaultFileInfo: RenderFileInfo = ({ upload }) => {
  const size = upload.getSize();

  return (
    <>
      <span>{upload.name}</span>
      { size != null && <span className="dff-filesize">{formatBytes(size, 2)}</span>}
    </>
  );
};

interface UploadDoneProps {
  CustomFileInfo?: RenderFileInfo;
  onDelete: (upload: BaseUpload) => void;
  translations: Translations;
  upload: BaseUpload;
}

const UploadDone = ({
  CustomFileInfo,
  onDelete,
  translations,
  upload
}: UploadDoneProps): JSX.Element => {
  const FileInfo = CustomFileInfo ?? DefaultFileInfo;

  return (
    <div
      className={`dff-file dff-upload-success dff-file-id-${upload.uploadIndex}`}
    >
      <FileInfo upload={upload} />
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
};

export default UploadDone;
