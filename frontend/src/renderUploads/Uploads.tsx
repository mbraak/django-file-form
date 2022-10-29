import { Component } from "inferno";
import BaseUpload from "../uploads/base_upload";
import AcceptedFileTypes from "../accepted_file_types";
import getFilesFromDataTransfer from "./getFilesFromDataTransfer";
import { RenderFileInfo, Translations } from "./types";
import Upload from "./Upload";

interface UploadsProps {
  CustomFileInfo?: RenderFileInfo;
  inputAccept: string;
  onDelete: (upload: BaseUpload) => void;
  onUploadFiles: (files: File[]) => Promise<void>;
  supportDropArea: boolean;
  translations: Translations;
  uploads: BaseUpload[];
}

interface UploadsState {
  dropping: boolean;
}

class Uploads extends Component<UploadsProps, UploadsState> {
  acceptedFileTypes: AcceptedFileTypes;

  constructor(props: UploadsProps) {
    super(props);

    this.state = {
      dropping: false
    };

    this.acceptedFileTypes = new AcceptedFileTypes(props.inputAccept);
  }

  render(): JSX.Element {
    const { CustomFileInfo, onDelete, supportDropArea, translations, uploads } =
      this.props;
    const dropping = this.state?.dropping;

    const dragProps = supportDropArea
      ? {
          onDragEnter: this.handleDragEnter,
          onDragLeave: this.handleDragLeave,
          onDragOver: this.handleDragOver,
          onDrop: this.handleDrop
        }
      : {};

    const className = `dff-drop-area${dropping ? " dff-dropping" : ""}`;

    return (
      <div className={className} {...dragProps}>
        {supportDropArea && !uploads.length && (
          <div className="dff-drop-hint">
            {translations["Drop your files here"]}
          </div>
        )}
        {uploads.map(upload => (
          <Upload
            CustomFileInfo={CustomFileInfo}
            key={upload.uploadIndex}
            onDelete={onDelete}
            upload={upload}
            translations={translations}
          />
        ))}
      </div>
    );
  }

  handleDragEnter = (): void => {
    this.setState({ dropping: true });
  };

  handleDragLeave = (): void => {
    this.setState({ dropping: false });
  };

  handleDragOver = (e: DragEvent): void => {
    e.preventDefault();

    this.setState({ dropping: true });
  };

  handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ dropping: false });

    const uploadFiles = async (): Promise<void> => {
      try {
        if (e.dataTransfer) {
          const files = await getFilesFromDataTransfer(e.dataTransfer);
          const acceptedFiles = files.filter(file =>
            this.acceptedFileTypes.isAccepted(file.name)
          );

          await this.props.onUploadFiles(acceptedFiles);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void uploadFiles();
  };
}

export default Uploads;
