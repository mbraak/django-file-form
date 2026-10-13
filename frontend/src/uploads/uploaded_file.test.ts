import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi
} from "vitest";

import type {
  InitialExistingFile,
  InitialPlaceholderFile,
  InitialS3File,
  InitialTusFile
} from "./base_upload.ts";

import {
  createUploadedFile,
  ExistingFile,
  UploadedS3File,
  UploadedTusFile
} from "./uploaded_file.ts";

const UPLOAD_URL = "http://tus_endpoint.net/upload/";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const existingFile: InitialExistingFile = {
  name: "existing.txt",
  size: 1024,
  type: "existing"
};

const placeholderFile: InitialPlaceholderFile = {
  id: "placeholder-id-1",
  name: "placeholder.txt",
  size: 2048,
  type: "placeholder"
};

const s3File: InitialS3File = {
  id: "upload-id-1",
  name: "upload_dir/abc.txt",
  original_name: "original.txt",
  size: 4096,
  type: "s3"
};

const tusFile: InitialTusFile = {
  id: "file-id-1",
  name: "tus.txt",
  size: 512,
  type: "tus",
  url: ""
};

const create = (
  initialFile:
    | InitialExistingFile
    | InitialPlaceholderFile
    | InitialS3File
    | InitialTusFile
) =>
  createUploadedFile({
    csrfToken: "csrf1",
    initialFile,
    uploadIndex: 3,
    uploadUrl: UPLOAD_URL
  });

describe("createUploadedFile", () => {
  test.each([
    { initialFile: existingFile, type: "existing" },
    { initialFile: placeholderFile, type: "placeholder" },
    { initialFile: s3File, type: "uploadedS3" },
    { initialFile: tusFile, type: "uploadedTus" }
  ])("creates a done upload of type $type", ({ initialFile, type }) => {
    const upload = create(initialFile);

    expect(upload.type).toBe(type);
    expect(upload.status).toBe("done");
    expect(upload.uploadIndex).toBe(3);
  });

  test.each([existingFile, placeholderFile, s3File, tusFile])(
    "returns the size of a $type file",
    initialFile => {
      expect(create(initialFile).getSize()).toBe(initialFile.size);
    }
  );

  test.each([existingFile, placeholderFile, s3File, tusFile])(
    "returns the initial file of a $type file",
    initialFile => {
      expect(create(initialFile).getInitialFile()).toStrictEqual(initialFile);
    }
  );

  test.each([existingFile, placeholderFile, s3File])(
    "aborts a $type file without a request",
    async initialFile => {
      await expect(create(initialFile).abort()).resolves.toBeUndefined();
    }
  );
});

describe("ExistingFile", () => {
  test("has the name and no id", () => {
    const upload = create(existingFile);

    expect(upload).toBeInstanceOf(ExistingFile);
    expect(upload.name).toBe("existing.txt");
    expect(upload.getId()).toBeUndefined();
  });

  test("deletes without a request", async () => {
    await expect(create(existingFile).delete()).resolves.toBeUndefined();
  });
});

describe("PlaceholderFile", () => {
  test("has the name and no id", () => {
    const upload = create(placeholderFile);

    expect(upload.name).toBe("placeholder.txt");
    expect(upload.getId()).toBeUndefined();
  });

  test("deletes without a request", async () => {
    await expect(create(placeholderFile).delete()).resolves.toBeUndefined();
  });
});

describe("UploadedS3File", () => {
  test("uses the original name as the name", () => {
    const upload = create(s3File);

    expect(upload).toBeInstanceOf(UploadedS3File);
    expect(upload.name).toBe("original.txt");
    expect(upload.getId()).toBe("upload-id-1");
  });

  test("uses the key as the name when there is no original name", () => {
    const upload = create({ ...s3File, original_name: "" });

    expect(upload.name).toBe("upload_dir/abc.txt");
  });

  test("deletes without a request", async () => {
    await expect(create(s3File).delete()).resolves.toBeUndefined();
  });
});

describe("UploadedTusFile", () => {
  test("has the name and the id", () => {
    const upload = create(tusFile);

    expect(upload).toBeInstanceOf(UploadedTusFile);
    expect(upload.name).toBe("tus.txt");
    expect(upload.getId()).toBe("file-id-1");
  });

  test("deletes the file on the server", async () => {
    const onRequest = vi.fn<(request: Request) => void>();
    server.use(
      http.delete(`${UPLOAD_URL}file-id-1`, ({ request }) => {
        onRequest(request);
        return new HttpResponse(null, { status: 204 });
      })
    );

    await create(tusFile).delete();

    expect(onRequest).toHaveBeenCalledOnce();
    expect(onRequest.mock.calls[0]?.[0].headers.get("X-CSRFToken")).toBe(
      "csrf1"
    );
  });

  test("rejects when the delete fails", async () => {
    server.use(
      http.delete(
        `${UPLOAD_URL}file-id-1`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    await expect(create(tusFile).delete()).rejects.toThrow("Delete failed");
  });

  test("aborts without a request", async () => {
    await expect(create(tusFile).abort()).resolves.toBeUndefined();
  });
});
