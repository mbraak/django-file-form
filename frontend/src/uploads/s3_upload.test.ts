import { waitFor } from "@testing-library/dom";
import { delay, http, HttpResponse } from "msw";
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

import S3Upload from "./s3_upload.ts";
import { MB } from "./s3_utils.ts";

const server = setupServer(
  http.post("http://s3_endpoint.net/", () =>
    HttpResponse.json({ key: "test-key-1", uploadId: "upload-id-1" })
  ),
  http.get("http://s3_endpoint.net/upload-id-1/1", () =>
    HttpResponse.json({ url: "http://s3_endpoint.net/upload/1" })
  ),
  http.put("http://s3_endpoint.net/upload/1", () =>
    HttpResponse.json({}, { headers: { ETag: "etag1" } })
  ),
  http.post("http://s3_endpoint.net/upload-id-1/complete", () =>
    HttpResponse.json({})
  ),
  http.delete("http://s3_endpoint.net/upload-id-1", () => HttpResponse.json({}))
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const createS3Upload = (file = new File(["content1"], "file.txt")) =>
  new S3Upload({
    csrfToken: "csrf1",
    endpoint: "http://s3_endpoint.net/",
    file,

    s3UploadDir: "upload_dir",
    uploadIndex: 1
  });

const startUpload = async (file?: File) => {
  const s3Upload = createS3Upload(file);
  const onSuccess = vi.fn();
  s3Upload.onSuccess = onSuccess;

  s3Upload.start();

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });

  return s3Upload;
};

describe("abort", () => {
  test("aborts the multipart upload after the file is uploaded", async () => {
    const abortRequest = vi.fn();
    server.use(
      http.delete("http://s3_endpoint.net/upload-id-1", ({ request }) => {
        abortRequest(new URL(request.url).searchParams.get("key"));
        return HttpResponse.json({});
      })
    );

    const s3Upload = await startUpload();

    await s3Upload.abort();

    expect(abortRequest).toHaveBeenCalledWith("test-key-1");
  });

  test("aborts the request while a part is uploading", async () => {
    const partRequest = vi.fn();
    const abortRequest = vi.fn();
    server.use(
      http.put("http://s3_endpoint.net/upload/1", async () => {
        partRequest();
        await delay(5000);
        return HttpResponse.json({}, { headers: { ETag: "etag1" } });
      }),
      http.delete("http://s3_endpoint.net/upload-id-1", () => {
        abortRequest();
        return HttpResponse.json({});
      })
    );

    const s3Upload = createS3Upload();
    const onSuccess = vi.fn();
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    await waitFor(() => {
      expect(partRequest).toHaveBeenCalled();
    });

    await s3Upload.abort();

    expect(abortRequest).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe("delete", () => {
  test("resolves without doing anything", async () => {
    await expect(createS3Upload().delete()).resolves.toBeUndefined();
  });
});

describe("getId", () => {
  test("returns undefined when the upload is not started", () => {
    expect(createS3Upload().getId()).toBeUndefined();
  });

  test("returns the upload id when the file is uploaded", async () => {
    const s3Upload = await startUpload();

    expect(s3Upload.getId()).toBe("upload-id-1");
  });
});

describe("getInitialFile", () => {
  test("return the initial file when the upload has not started", () => {
    expect(createS3Upload().getInitialFile()).toEqual({
      id: "",
      name: "",
      original_name: "file.txt",
      size: 8,
      type: "s3"
    });
  });

  test("returns the key and the upload id when the file is uploaded", async () => {
    const s3Upload = await startUpload();

    expect(s3Upload.getInitialFile()).toEqual({
      id: "upload-id-1",
      name: "test-key-1",
      original_name: "file.txt",
      size: 8,
      type: "s3"
    });
  });
});

describe("getSize", () => {
  test("returns the size", () => {
    expect(createS3Upload().getSize()).toEqual(8);
  });
});

describe("start", () => {
  test("calls onSuccess when the file is uploaded", async () => {
    let success = false;

    const s3Upload = createS3Upload();
    s3Upload.onSuccess = () => {
      success = true;
    };

    s3Upload.start();

    await waitFor(() => {
      expect(success).toBe(true);
    });
  });

  test("calls onProgress while the file is uploaded", async () => {
    const s3Upload = createS3Upload();
    const onProgress = vi.fn();
    const onSuccess = vi.fn();
    s3Upload.onProgress = onProgress;
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(onProgress).toHaveBeenLastCalledWith(8, 8);
  });

  test("uploads a large file in multiple parts", async () => {
    let completedParts: unknown = null;

    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/2", () =>
        HttpResponse.json({ url: "http://s3_endpoint.net/upload/2" })
      ),
      http.put("http://s3_endpoint.net/upload/2", () =>
        HttpResponse.json({}, { headers: { ETag: "etag2" } })
      ),
      http.post(
        "http://s3_endpoint.net/upload-id-1/complete",
        async ({ request }) => {
          completedParts = await request.json();
          return HttpResponse.json({});
        }
      )
    );

    // The chunk size is at least 5MB, so this file is uploaded in two parts.
    const file = new File([new Uint8Array(5 * MB + 1)], "large_file.txt");

    await startUpload(file);

    expect(completedParts).toEqual({
      parts: [
        { ETag: "etag1", PartNumber: 1 },
        { ETag: "etag2", PartNumber: 2 }
      ]
    });
  });

  test("calls onError when creating the multipart upload fails", async () => {
    server.use(
      http.post("http://s3_endpoint.net/", () => HttpResponse.error())
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  test("calls onError when the result of createMultipartUpload is invalid", async () => {
    server.use(
      http.post("http://s3_endpoint.net/", () =>
        HttpResponse.json({ key: "test-key-1" })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new TypeError(
          "AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`."
        )
      );
    });
  });

  test("calls onError when the result of prepareUploadPart is invalid", async () => {
    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/1", () =>
        HttpResponse.json({})
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new TypeError(
          "AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`."
        )
      );
    });
  });

  test("calls onError when uploading a part returns an error status", async () => {
    server.use(
      http.put("http://s3_endpoint.net/upload/1", () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error("Non 2xx"));
    });
  });

  test("calls onError when the ETag header is missing", async () => {
    server.use(
      http.put("http://s3_endpoint.net/upload/1", () => HttpResponse.json({}))
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new Error(
          "AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."
        )
      );
    });
  });

  test("calls onError when uploading a part fails", async () => {
    server.use(
      http.put("http://s3_endpoint.net/upload/1", () => HttpResponse.error())
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error("Unknown error"));
    });
  });

  test("calls onError when completing the multipart upload fails", async () => {
    server.use(
      http.post("http://s3_endpoint.net/upload-id-1/complete", () =>
        HttpResponse.error()
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    const onSuccess = vi.fn();
    s3Upload.onError = onError;
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
