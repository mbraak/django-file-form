import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, test, vi } from "vitest";

import DropArea from "./drop_area.ts";
import RenderUploadFile from "./render_upload_file.ts";

const mockFile = (filename: string) =>
  new File(["test"], filename, { type: "text/plain" });

const mockFileSystemEntry = (file: File) =>
  ({
    file: (successCallback: FileCallback) => {
      successCallback(file);
    },
    isDirectory: false,
    isFile: true
  } as FileSystemFileEntry);

const mockFileSystemDirectoryEntry = (fileEntries: FileSystemFileEntry[]) => {
  const directoryReader = {
    readEntries: (successCallback: FileSystemEntriesCallback) => {
      successCallback(fileEntries);
    }
  } as FileSystemDirectoryReader;

  return {
    createReader: () => directoryReader,
    isDirectory: true,
    isFile: false
  } as FileSystemDirectoryEntry;
};

const mockDataTransferItem = (fileEntry: FileSystemEntry) =>
  ({
    getAsFile: () => null,
    getAsString: () => "test",
    kind: "file",
    type: "text/plain",
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
  test("uploads a file", async () => {
    const onUploadFiles = vi.fn();
    const renderer = {
      setErrorInvalidFiles: vi.fn() as unknown
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

  test("upload a file when the data transfer doesn't have an items property", async () => {
    const onUploadFiles = vi.fn();
    const renderer = {
      setErrorInvalidFiles: vi.fn() as unknown
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

  test("uploads a file when uploading a directory", async () => {
    const onUploadFiles = vi.fn();
    const renderer = {
      setErrorInvalidFiles: vi.fn() as unknown
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

  test("handles an upload with an extension that is not supported", async () => {
    const onUploadFiles = vi.fn();
    const setErrorInvalidFiles = vi.fn();
    const renderer = { setErrorInvalidFiles } as unknown as RenderUploadFile;

    const container = document.createElement("div");

    new DropArea({
      container,
      inputAccept: ".txt",
      onUploadFiles,
      renderer
    });

    const file = mockFile("test.png");
    const fileEntry = mockFileSystemEntry(file);
    const dataTransfer = mockDataTransfer([fileEntry]);

    const dragEvent = new DragEvent("drop", { dataTransfer });
    fireEvent(container, dragEvent);

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledWith([]);
      expect(setErrorInvalidFiles).toHaveBeenCalledWith([file]);
    });
  });
});
