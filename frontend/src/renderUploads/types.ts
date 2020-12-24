import BaseUpload from "../uploads/base_upload";

export type Translations = { [key: string]: string };

interface FileInfoProps {
  upload: BaseUpload;
}

export type RenderFileInfo = ({ upload }: FileInfoProps) => JSX.Element;
