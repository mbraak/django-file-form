interface FileSystemEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FileSystemEntryMetadata {
  modificationTime?: Date;
  size?: number;
}

interface FileSystemDirectoryReader {
  readEntries(
    successCallback: (result: FileSystemEntry[]) => void,
    errorCallback?: (error: DOMError) => void
  ): void;
}

interface FileSystemFlags {
  create?: boolean;
  exclusive?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FileSystemDirectoryEntry extends FileSystemEntry {
  isDirectory: true;
  isFile: false;
  createReader(): FileSystemDirectoryReader;
  getFile(
    path?: string,
    options?: FileSystemFlags,
    successCallback?: (result: FileSystemFileEntry) => void,
    errorCallback?: (error: DOMError) => void
  ): void;
  getDirectory(
    path?: string,
    options?: FileSystemFlags,
    successCallback?: (result: FileSystemDirectoryEntry) => void,
    errorCallback?: (error: DOMError) => void
  ): void;
}

interface FileSystemFileEntry extends FileSystemEntry {
  isDirectory: false;
  isFile: true;
  file(
    successCallback: (file: File) => void,
    errorCallback: (error: Error) => void
  ): void;
}
