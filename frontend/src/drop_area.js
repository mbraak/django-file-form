const getEntriesFromDirectory = async directoryEntry =>
  new Promise((resolve, reject) =>
    directoryEntry.createReader().readEntries(resolve, reject)
  );

const getFileFromFileEntry = async fileEntry =>
  new Promise((resolve, reject) => fileEntry.file(resolve, reject));

const getFilesFromFileSystemEntries = async entries => {
  const result = [];

  for await (const entry of entries) {
    if (entry.isFile) {
      const file = await getFileFromFileEntry(entry);
      result.push(file);
    } else if (entry.isDirectory) {
      const entriesFromDirectory = await getEntriesFromDirectory(entry);
      const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
      files.forEach(file => result.push(file));
    }
  }

  return result;
};

const getFilesFromDataTransfer = async dataTransfer => {
  if (dataTransfer.items) {
    const entries = [...dataTransfer.items].map(item =>
      item.webkitGetAsEntry()
    );

    const files = await getFilesFromFileSystemEntries(entries);
    return files;
  } else {
    // backwards compatibility
    return [...dataTransfer.files];
  }
};

class DropArea {
  constructor({ container, onUploadFiles }) {
    this.container = container;
    this.onUploadFiles = onUploadFiles;

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

  onDrop = e => {
    this.container.classList.remove("dff-dropping");
    e.preventDefault();
    e.stopPropagation();

    const uploadFiles = async () => {
      try {
        const files = await getFilesFromDataTransfer(e.dataTransfer);
        this.onUploadFiles(files);
      } catch (error) {
        console.error(error);
      }
    };

    uploadFiles();
  };
}

export default DropArea;
