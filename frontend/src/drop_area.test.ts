import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, test, vi } from "vitest";

import type RenderUploadFile from "./render_upload_file.ts";

import DropArea from "./drop_area.ts";

const mockFile = (filename: string) =>
  new File(["test"], filename, { type: "text/plain" });

const mockFileSystemEntry = (file: File) =>
  ({
    file: (successCallback: FileCallback) => {
      successCallback(file);
    },
    isDirectory: false,
    isFile: true
  }) as FileSystemFileEntry;

const mockFileSystemDirectoryEntry = (fileEntries: FileSystemFileEntry[]) => {
  const directoryReader = {
    readEntries: (successCallback: FileSystemEntriesCallback) => {
      successCallback(fileEntries);
    }
  };

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
  }) as DataTransferItem;

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
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
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
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
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
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
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
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([]);
      expect(setErrorInvalidFiles).toHaveBeenCalledExactlyOnceWith([file]);
    });
  });
});

describe("DropArea dragging", () => {
  const createDropArea = () => {
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

    return { container, onUploadFiles, setErrorInvalidFiles };
  };

  test("highlights the drop area while dragging", () => {
    const { container } = createDropArea();

    fireEvent.dragEnter(container);

    expect(container).toHaveClass("dff-dropping");

    fireEvent.dragLeave(container);

    expect(container).not.toHaveClass("dff-dropping");
  });

  test("allows dropping on dragover", () => {
    const { container } = createDropArea();

    // fireEvent returns false when the default is prevented
    expect(fireEvent.dragOver(container)).toBe(false);
    expect(container).toHaveClass("dff-dropping");
  });

  test("removes the highlight on drop", async () => {
    const { container, onUploadFiles } = createDropArea();
    fireEvent.dragEnter(container);

    const file = mockFile("test.txt");
    const dataTransfer = mockDataTransfer([mockFileSystemEntry(file)]);
    fireEvent(container, new DragEvent("drop", { dataTransfer }));

    expect(container).not.toHaveClass("dff-dropping");

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
    });
  });

  test("keeps the browser from handling the drop", async () => {
    const { container, onUploadFiles } = createDropArea();
    const parent = document.createElement("div");
    parent.append(container);
    const parentListener = vi.fn();
    parent.addEventListener("drop", parentListener);

    const file = mockFile("test.txt");
    const dataTransfer = mockDataTransfer([mockFileSystemEntry(file)]);
    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
      dataTransfer
    });

    fireEvent(container, dropEvent);

    // Otherwise the browser opens the dropped file, and leaves the page
    expect(dropEvent.defaultPrevented).toBe(true);
    // An outer drop area doesn't also handle the drop
    expect(parentListener).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
    });
  });

  test("does nothing when the drop event has no data transfer", async () => {
    const { container, onUploadFiles, setErrorInvalidFiles } = createDropArea();

    fireEvent(container, new DragEvent("drop"));

    // Wait for the async drop handler
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onUploadFiles).not.toHaveBeenCalled();
    expect(setErrorInvalidFiles).not.toHaveBeenCalled();
  });

  test("uses getAsFile for an item without a file system entry", async () => {
    const { container, onUploadFiles } = createDropArea();
    const file = mockFile("test.txt");
    const items = [
      {
        getAsFile: () => file,
        kind: "file",
        webkitGetAsEntry: () => null
      },
      // An item that is not a file, e.g. a dragged text selection
      {
        getAsFile: () => null,
        kind: "string",
        webkitGetAsEntry: () => null
      }
    ] as unknown as DataTransferItemList;

    fireEvent(
      container,
      new DragEvent("drop", { dataTransfer: { items } as DataTransfer })
    );

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([file]);
    });
  });

  test("ignores an entry that is neither a file nor a directory", async () => {
    const { container, onUploadFiles } = createDropArea();
    const entry = { isDirectory: false, isFile: false } as FileSystemEntry;

    fireEvent(
      container,
      new DragEvent("drop", { dataTransfer: mockDataTransfer([entry]) })
    );

    await waitFor(() => {
      expect(onUploadFiles).toHaveBeenCalledExactlyOnceWith([]);
    });
  });

  test("logs an error when reading a directory fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
      //
    });
    const { container, onUploadFiles } = createDropArea();
    const error = new Error("Cannot read directory");
    const directoryEntry = {
      createReader: () => ({
        readEntries: (
          _successCallback: FileSystemEntriesCallback,
          errorCallback: ErrorCallback
        ) => {
          errorCallback(error as DOMException);
        }
      }),
      isDirectory: true,
      isFile: false
    } as unknown as FileSystemDirectoryEntry;

    fireEvent(
      container,
      new DragEvent("drop", {
        dataTransfer: mockDataTransfer([directoryEntry])
      })
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    });

    expect(onUploadFiles).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
