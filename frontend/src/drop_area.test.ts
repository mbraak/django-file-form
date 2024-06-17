import { fireEvent, waitFor } from "@testing-library/dom";
import DropArea from "./drop_area.ts";
import RenderUploadFile from "./render_upload_file.ts";

const mockFile = (filename: string) =>
  new File(["test"], filename, { type: "text/plain" });

const mockFileSystemEntry = (file: File) =>
  ({
    isDirectory: false,
    isFile: true,
    file: (successCallback: FileCallback) => {
      successCallback(file);
    }
  } as FileSystemFileEntry);

const mockFileSystemDirectoryEntry = (fileEntries: FileSystemFileEntry[]) => {
  const directoryReader = {
    readEntries: (successCallback: FileSystemEntriesCallback) => {
      successCallback(fileEntries);
    }
  } as FileSystemDirectoryReader;

  return {
    isDirectory: true,
    isFile: false,
    createReader: () => directoryReader
  } as FileSystemDirectoryEntry;
};

const mockDataTransferItem = (fileEntry: FileSystemEntry) =>
  ({
    kind: "file",
    type: "text/plain",
    getAsFile: () => null,
    getAsString: () => "test",
    webkitGetAsEntry: () => fileEntry
  } as DataTransferItem);

const mockDataTransfer = (fileEntries: FileSystemEntry[]) => {
  const dataTransferItems = fileEntries.map(mockDataTransferItem);

  const dataTransferItemList =
    dataTransferItems as unknown as DataTransferItemList;

  return {
    items: dataTransferItemList
  } as DataTransfer;
};

// Mock DataTransfer without items attribute
const mockClassicDataTransfer = (file: File) => {
  const files = [file] as unknown as FileList;

  return { files } as DataTransfer;
};

describe("DropArea", () => {
  it("uploads a file", async () => {
    const onUploadFiles = jest.fn();
    const renderer = {
      setErrorInvalidFiles: jest.fn() as unknown
    } as RenderUploadFile;

    const container = document.createElement("div");

    new DropArea({
      container,
      inputAccept: ".txt",
      onUploadFiles,
      renderer
    });

    const file = mockFile("test.txt");
    const fileEntry = mockFileSystemEntry(file);
    const dataTransfer = mockDataTransfer([fileEntry]);

    const dragEvent = new DragEvent("drop", { dataTransfer });
    fireEvent(container, dragEvent);

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledWith([file]);
    });
  });

  it("upload a file when the data transfer doesn't have an items property", async () => {
    const onUploadFiles = jest.fn();
    const renderer = {
      setErrorInvalidFiles: jest.fn() as unknown
    } as RenderUploadFile;

    const container = document.createElement("div");

    new DropArea({
      container,
      inputAccept: ".txt",
      onUploadFiles,
      renderer
    });

    const file = mockFile("test.txt");
    const dataTransfer = mockClassicDataTransfer(file);

    const dragEvent = new DragEvent("drop", { dataTransfer });
    fireEvent(container, dragEvent);

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledWith([file]);
    });
  });

  it("uploads a file when uploading a directory", async () => {
    const onUploadFiles = jest.fn();
    const renderer = {
      setErrorInvalidFiles: jest.fn() as unknown
    } as RenderUploadFile;

    const container = document.createElement("div");

    new DropArea({
      container,
      inputAccept: ".txt",
      onUploadFiles,
      renderer
    });

    const file = mockFile("test.txt");
    const fileEntry = mockFileSystemEntry(file);
    const directoryEntry = mockFileSystemDirectoryEntry([fileEntry]);
    const dataTransfer = mockDataTransfer([directoryEntry]);

    const dragEvent = new DragEvent("drop", { dataTransfer });
    fireEvent(container, dragEvent);

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledWith([file]);
    });
  });
});
