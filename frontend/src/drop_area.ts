import AcceptedFileTypes from "./accepted_file_types";
import RenderUploadFile from "./render_upload_file";

const getEntriesFromDirectory = async (
  directoryEntry: FileSystemDirectoryEntry
): Promise<FileSystemEntry[]> =>
  new Promise((resolve, reject) =>
    directoryEntry.createReader().readEntries(resolve, reject)
  );

const getFileFromFileEntry = async (
  fileEntry: FileSystemFileEntry
): Promise<File> =>
  new Promise((resolve, reject) => fileEntry.file(resolve, reject));

const getFilesFromFileSystemEntries = async (
  entries: FileSystemEntry[]
): Promise<File[]> => {
  const result = [];

  for await (const entry of entries) {
    if (entry.isFile) {
      const file = await getFileFromFileEntry(entry as FileSystemFileEntry);
      result.push(file);
    } else if (entry.isDirectory) {
      const entriesFromDirectory = await getEntriesFromDirectory(
        entry as FileSystemDirectoryEntry
      );
      const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
      files.forEach(file => result.push(file));
    }
  }

  return result;
};

const getFilesFromDataTransfer = async (
  dataTransfer: DataTransfer
): Promise<File[]> => {
  if (dataTransfer.items) {
    const entries = [...dataTransfer.items].map(
      item => item.webkitGetAsEntry() as FileSystemEntry
    );

    const files = await getFilesFromFileSystemEntries(entries);
    return files;
  } else {
    // backwards compatibility
    return [...dataTransfer.files];
  }
};

class DropArea {
  acceptedFileTypes: AcceptedFileTypes;
  container: Element;
  onUploadFiles: (files: File[]) => Promise<void>;
  renderer: RenderUploadFile;

  constructor({
    container,
    inputAccept,
    onUploadFiles,
    renderer
  }: {
    container: Element;
    inputAccept: string;
    onUploadFiles: (files: File[]) => Promise<void>;
    renderer: RenderUploadFile;
  }) {
    this.container = container;
    this.onUploadFiles = onUploadFiles;
    this.acceptedFileTypes = new AcceptedFileTypes(inputAccept);
    this.renderer = renderer;

    container.addEventListener("dragenter", () => {
      container.classList.add("dff-dropping");
    });
    container.addEventListener("dragleave", () => {
      container.classList.remove("dff-dropping");
    });
    container.addEventListener("dragover", e => {
      container.classList.add("dff-dropping");
      e.preventDefault();
    });
    container.addEventListener("drop", this.onDrop);
  }

  onDrop = (e: Event): void => {
    const dragEvent = e as DragEvent;
    this.container.classList.remove("dff-dropping");
    dragEvent.preventDefault();
    dragEvent.stopPropagation();

    const uploadFiles = async (): Promise<void> => {
      try {
        if (dragEvent.dataTransfer) {
          const files = await getFilesFromDataTransfer(dragEvent.dataTransfer);
          const acceptedFiles: File[] = [];
          const invalidFiles: File[] = [];

          for (const file of files) {
            if (this.acceptedFileTypes.isAccepted(file.name)) {
              acceptedFiles.push(file);
            } else {
              invalidFiles.push(file);
            }
          }

          this.renderer.setErrorInvalidFiles(invalidFiles);
          void this.onUploadFiles(acceptedFiles);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void uploadFiles();
  };
}

export default DropArea;
