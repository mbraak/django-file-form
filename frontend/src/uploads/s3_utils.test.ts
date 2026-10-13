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

import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getChunkSize,
  MB,
  prepareUploadPart,
  remove
} from "./s3_utils.ts";

interface ReceivedRequest {
  body: unknown;
  headers: Headers;
  method: string;
  url: URL;
}

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

// Handle all requests to the endpoint, record them and respond with the given json
const recordRequests = (responseData: object) => {
  const onRequest = vi.fn<(request: ReceivedRequest) => void>();

  server.use(
    http.all("http://s3_endpoint.net/*", async ({ request }) => {
      const text = await request.text();

      onRequest({
        body: text ? JSON.parse(text) : undefined,
        headers: request.headers,
        method: request.method,
        url: new URL(request.url)
      });

      return HttpResponse.json(responseData);
    })
  );

  return () => {
    expect(onRequest).toHaveBeenCalledOnce();

    const request = onRequest.mock.calls[0]?.[0];

    if (!request) {
      throw new Error("No request received");
    }

    return request;
  };
};

describe("abortMultipartUpload", () => {
  test("sends a delete request for the upload", async () => {
    const getRequest = recordRequests({});

    await abortMultipartUpload({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      key: "upload_dir/file.txt",
      uploadId: "upload-id-1"
    });

    const request = getRequest();

    expect(request.method).toBe("DELETE");
    expect(request.url.pathname).toBe("/s3/upload-id-1");
    expect(request.url.searchParams.get("key")).toBe("upload_dir/file.txt");
    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
  });

  test("encodes the key and the upload id", async () => {
    const getRequest = recordRequests({});

    await abortMultipartUpload({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      key: "dir/a&b c.txt",
      uploadId: "id/1"
    });

    const request = getRequest();

    expect(request.url.pathname).toBe("/s3/id%2F1");
    expect(request.url.searchParams.get("key")).toBe("dir/a&b c.txt");
  });

  test("returns the response data", async () => {
    recordRequests({ result: "ok" });

    await expect(
      abortMultipartUpload({
        csrfToken: "csrf1",
        endpoint: "http://s3_endpoint.net/s3/",
        key: "file.txt",
        uploadId: "upload-id-1"
      })
    ).resolves.toStrictEqual({ result: "ok" });
  });
});

describe("completeMultipartUpload", () => {
  test("posts the parts", async () => {
    const getRequest = recordRequests({ location: "http://s3/file.txt" });
    const parts = [
      { ETag: "etag1", PartNumber: 1 },
      { ETag: "etag2", PartNumber: 2 }
    ];

    await completeMultipartUpload({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      key: "upload_dir/file.txt",
      parts,
      uploadId: "upload-id-1"
    });

    const request = getRequest();

    expect(request.method).toBe("POST");
    expect(request.url.pathname).toBe("/s3/upload-id-1/complete");
    expect(request.url.searchParams.get("key")).toBe("upload_dir/file.txt");
    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
    expect(request.body).toStrictEqual({ parts });
  });

  test("returns the location", async () => {
    recordRequests({ location: "http://s3/file.txt" });

    await expect(
      completeMultipartUpload({
        csrfToken: "csrf1",
        endpoint: "http://s3_endpoint.net/s3/",
        key: "file.txt",
        parts: [],
        uploadId: "upload-id-1"
      })
    ).resolves.toStrictEqual({ location: "http://s3/file.txt" });
  });
});

describe("createMultipartUpload", () => {
  test("posts the file info", async () => {
    const getRequest = recordRequests({
      key: "upload_dir/file.txt",
      uploadId: "upload-id-1"
    });

    await createMultipartUpload({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      file: new File(["content"], "file.txt", { type: "text/plain" }),
      s3UploadDir: "upload_dir"
    });

    const request = getRequest();

    expect(request.method).toBe("POST");
    expect(request.url.pathname).toBe("/s3/");
    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(request.headers.get("accept")).toBe("application/json");
    expect(request.body).toStrictEqual({
      contentType: "text/plain",
      filename: "file.txt",
      s3UploadDir: "upload_dir"
    });
  });

  test("returns the key and the upload id", async () => {
    recordRequests({ key: "upload_dir/file.txt", uploadId: "upload-id-1" });

    await expect(
      createMultipartUpload({
        csrfToken: "csrf1",
        endpoint: "http://s3_endpoint.net/s3/",
        file: new File(["content"], "file.txt"),
        s3UploadDir: "upload_dir"
      })
    ).resolves.toStrictEqual({
      key: "upload_dir/file.txt",
      uploadId: "upload-id-1"
    });
  });
});

describe("prepareUploadPart", () => {
  test("requests the url for the part", async () => {
    const getRequest = recordRequests({ url: "http://s3/part/3" });

    await prepareUploadPart({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      key: "upload_dir/file.txt",
      number: 3,
      uploadId: "upload-id-1"
    });

    const request = getRequest();

    expect(request.method).toBe("GET");
    expect(request.url.pathname).toBe("/s3/upload-id-1/3");
    expect(request.url.searchParams.get("key")).toBe("upload_dir/file.txt");
    expect(request.headers.get("X-CSRFToken")).toBe("csrf1");
  });

  test("encodes the key and the upload id", async () => {
    const getRequest = recordRequests({ url: "http://s3/part/3" });

    await prepareUploadPart({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/s3/",
      key: "dir/a&b c.txt",
      number: 3,
      uploadId: "id/1"
    });

    const request = getRequest();

    expect(request.url.pathname).toBe("/s3/id%2F1/3");
    expect(request.url.searchParams.get("key")).toBe("dir/a&b c.txt");
  });

  test("returns the url", async () => {
    recordRequests({ url: "http://s3/part/3" });

    await expect(
      prepareUploadPart({
        csrfToken: "csrf1",
        endpoint: "http://s3_endpoint.net/s3/",
        key: "file.txt",
        number: 3,
        uploadId: "upload-id-1"
      })
    ).resolves.toStrictEqual({ url: "http://s3/part/3" });
  });
});

describe("getChunkSize", () => {
  test.each([
    { expected: 0, size: 0 },
    { expected: 1, size: 1 },
    { expected: 1, size: 10_000 },
    { expected: 2, size: 10_001 },
    { expected: Math.ceil((100 * MB) / 10_000), size: 100 * MB }
  ])("returns $expected for a file of $size bytes", ({ expected, size }) => {
    const file = new File([new Uint8Array(size)], "file.bin");

    expect(getChunkSize(file)).toBe(expected);
  });
});

describe("remove", () => {
  test("removes the element from the array", () => {
    const arr = ["a", "b", "c"];

    remove(arr, "b");

    expect(arr).toStrictEqual(["a", "c"]);
  });

  test("removes only the first occurrence", () => {
    const arr = ["a", "b", "a"];

    remove(arr, "a");

    expect(arr).toStrictEqual(["b", "a"]);
  });

  test("does nothing when the element is not in the array", () => {
    const arr = ["a", "b"];

    remove(arr, "c");

    expect(arr).toStrictEqual(["a", "b"]);
  });
});
