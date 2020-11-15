import BaseUpload from "../uploads/base_upload";
import { formatBytes } from "../util";
import { Translations } from "./types";
import UploadInProgress from "./UploadInProgress";

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

const UploadDone = ({ onDelete, translations, upload }: UploadDoneProps) => (
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

interface UploadErrorProps {
  translations: Translations;
  upload: BaseUpload;
}

const UploadError = ({ translations, upload }: UploadErrorProps) => (
  <div className={`dff-file dff-upload-fail dff-file-id-${upload.uploadIndex}`}>
    <span>{upload.name}</span>
    <span className="dff-error">{translations["Upload failed"]}</span>
  </div>
);

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
