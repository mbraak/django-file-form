import { describe, expect, test } from "vitest";
import { getFilesFromDataTransfer } from "./drop_area.ts";

const mockFileSystemEntry = (filename: string) => {
  const file = new File(["test"], filename, { type: "text/plain" });

  return {
    isDirectory: false,
    isFile: true,
    file: (successCallback: FileCallback) => {
      successCallback(file);
    }
  } as FileSystemFileEntry;
};

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

describe("getFilesFromDataTransfer", () => {
  test("returns a file", async () => {
    const fileEntry = mockFileSystemEntry("test.txt");
    const dataTransfer = mockDataTransfer([fileEntry]);

    const files = await getFilesFromDataTransfer(dataTransfer);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ name: "test.txt" });
  });

  test("returns a file from a directory entry", async () => {
    const fileEntry = mockFileSystemEntry("test.txt");
    const directoryEntry = mockFileSystemDirectoryEntry([fileEntry]);
    const dataTransfer = mockDataTransfer([directoryEntry]);

    const files = await getFilesFromDataTransfer(dataTransfer);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ name: "test.txt" });
  });
});
