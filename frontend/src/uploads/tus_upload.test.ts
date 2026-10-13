import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import TusUpload from "./tus_upload.ts";

const UPLOAD_URL = "http://tus_endpoint.net/upload/";
const FILE_URL = "http://tus_endpoint.net/upload/file-id-1";

const decodeMetadata = (header: null | string) =>
  Object.fromEntries(
    (header ?? "").split(",").map(pair => {
      const [key = "", value = ""] = pair.split(" ");
      return [key, atob(value)];
    })
  );

const createRequest = vi.fn<(request: Request) => void>();
const patchRequest = vi.fn<(request: Request) => void>();
const deleteRequest = vi.fn<(request: Request) => void>();

const server = setupServer(
  http.post(UPLOAD_URL, ({ request }) => {
    createRequest(request);

    return new HttpResponse(null, {
      headers: {
        "Access-Control-Expose-Headers": "Location, ResourceId",
        Location: FILE_URL,
        ResourceId: "resource-id-1"
      },
      status: 201
    });
  }),
  http.patch(FILE_URL, async ({ request }) => {
    patchRequest(request);
    const body = await request.arrayBuffer();
    const offset = Number(request.headers.get("Upload-Offset"));

    return new HttpResponse(null, {
      headers: {
        "Access-Control-Expose-Headers": "Upload-Offset",
        "Upload-Offset": (offset + body.byteLength).toString()
      },
      status: 204
    });
  }),
  http.delete(FILE_URL, ({ request }) => {
    deleteRequest(request);

    return new HttpResponse(null, { status: 204 });
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

const createTusUpload = () =>
  new TusUpload({
    chunkSize: 1024,
    csrfToken: "csrf1",
    fieldName: "input_file",
    file: new File(["content1"], "file.txt", { type: "text/plain" }),
    formId: "form-id-1",
    retryDelays: [],
    uploadIndex: 1,
    uploadUrl: UPLOAD_URL
  });

const startUpload = async () => {
  const tusUpload = createTusUpload();
  const onSuccess = vi.fn();
  tusUpload.onSuccess = onSuccess;

  tusUpload.start();

  await vi.waitFor(() => {
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  return tusUpload;
};

const getRequest = (mock: typeof createRequest) => {
  const request = mock.mock.calls[0]?.[0];

  if (!request) {
    throw new Error("No request received");
  }

  return request;
};

describe("constructor", () => {
  test("sets the name, status, type and upload index", () => {
    const tusUpload = createTusUpload();

    expect(tusUpload.name).toBe("file.txt");
    expect(tusUpload.status).toBe("uploading");
    expect(tusUpload.type).toBe("tus");
    expect(tusUpload.uploadIndex).toBe(1);
  });
});

describe("start", () => {
  test("creates the upload with the metadata and the csrf token", async () => {
    await startUpload();

    const request = getRequest(createRequest);

    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
    expect(request.headers.get("Upload-Length")).toBe("8");
    expect(
      decodeMetadata(request.headers.get("Upload-Metadata"))
    ).toStrictEqual({
      fieldName: "input_file",
      filename: "file.txt",
      formId: "form-id-1"
    });
  });

  test("uploads the file with the csrf token", async () => {
    await startUpload();

    expect(patchRequest).toHaveBeenCalledOnce();
    expect(getRequest(patchRequest).headers.get("X-CSRFToken")).toBe("csrf1");
  });

  test("uploads the file in chunks", async () => {
    const tusUpload = new TusUpload({
      chunkSize: 3,
      csrfToken: "csrf1",
      fieldName: "input_file",
      file: new File(["content1"], "file.txt"),
      formId: "form-id-1",
      retryDelays: [],
      uploadIndex: 1,
      uploadUrl: UPLOAD_URL
    });
    const onSuccess = vi.fn();
    tusUpload.onSuccess = onSuccess;

    tusUpload.start();

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(patchRequest).toHaveBeenCalledTimes(3);
  });

  test("calls onProgress while the file is uploaded", async () => {
    const tusUpload = createTusUpload();
    const onProgress = vi.fn();
    const onSuccess = vi.fn();
    tusUpload.onProgress = onProgress;
    tusUpload.onSuccess = onSuccess;

    tusUpload.start();

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onProgress).toHaveBeenLastCalledWith(8, 8);
  });

  test("calls onError when the upload fails", async () => {
    server.use(
      http.post(UPLOAD_URL, () => new HttpResponse(null, { status: 500 }))
    );
    const tusUpload = createTusUpload();
    const onError = vi.fn<(error: Error) => void>();
    tusUpload.onError = onError;

    tusUpload.start();

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });

    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});

describe("abort", () => {
  test("terminates the upload on the server", async () => {
    const tusUpload = await startUpload();

    await tusUpload.abort();

    expect(deleteRequest).toHaveBeenCalledOnce();
  });

  test("does not send a request when the upload is not started", async () => {
    await createTusUpload().abort();

    expect(deleteRequest).not.toHaveBeenCalled();
  });
});

describe("delete", () => {
  test("deletes the upload with the csrf token", async () => {
    const tusUpload = await startUpload();

    await tusUpload.delete();

    expect(deleteRequest).toHaveBeenCalledOnce();

    const request = getRequest(deleteRequest);

    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
    expect(request.headers.get("Tus-Resumable")).toBe("1.0.0");
  });

  test("rejects when the server does not delete the upload", async () => {
    const tusUpload = await startUpload();
    server.use(
      http.delete(FILE_URL, () => new HttpResponse(null, { status: 500 }))
    );

    await expect(tusUpload.delete()).rejects.toThrow("Delete failed");
  });

  test("does nothing when the upload is not started", async () => {
    await createTusUpload().delete();

    expect(deleteRequest).not.toHaveBeenCalled();
  });
});

describe("getId", () => {
  test("returns undefined when the upload is not started", () => {
    expect(createTusUpload().getId()).toBeUndefined();
  });

  test("returns the resource id from the server", async () => {
    const tusUpload = await startUpload();

    expect(tusUpload.getId()).toBe("resource-id-1");
  });
});

describe("getInitialFile", () => {
  test("returns the initial file when the upload is not started", () => {
    expect(createTusUpload().getInitialFile()).toStrictEqual({
      id: undefined,
      name: "file.txt",
      size: 8,
      type: "tus",
      url: ""
    });
  });

  test("returns the resource id when the file is uploaded", async () => {
    const tusUpload = await startUpload();

    expect(tusUpload.getInitialFile()).toStrictEqual({
      id: "resource-id-1",
      name: "file.txt",
      size: 8,
      type: "tus",
      url: ""
    });
  });
});

describe("getSize", () => {
  test("returns the size of the file", () => {
    expect(createTusUpload().getSize()).toBe(8);
  });
});
