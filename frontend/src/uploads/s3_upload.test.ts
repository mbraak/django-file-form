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
import { MB, RequestError } from "./s3_utils.ts";

// The part uploads use a cross-origin XMLHttpRequest, so jsdom enforces CORS
const corsHeaders = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "PUT",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "ETag"
};

const server = setupServer(
  http.options(
    "http://s3_endpoint.net/upload/*",
    () => new HttpResponse(null, { headers: corsHeaders, status: 204 })
  ),
  http.post("http://s3_endpoint.net/", () =>
    HttpResponse.json({ key: "test-key-1", uploadId: "upload-id-1" })
  ),
  http.get("http://s3_endpoint.net/upload-id-1/1", () =>
    HttpResponse.json({ url: "http://s3_endpoint.net/upload/1" })
  ),
  http.put("http://s3_endpoint.net/upload/1", () =>
    HttpResponse.json({}, { headers: { ...corsHeaders, ETag: "etag1" } })
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

// No retries by default, so a failed request fails the upload
const createS3Upload = (
  file = new File(["content1"], "file.txt"),
  retryDelays: number[] = []
) =>
  new S3Upload({
    csrfToken: "csrf1",
    endpoint: "http://s3_endpoint.net/",
    file,
    retryDelays,
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
  test("does nothing when the upload is not started", async () => {
    const abortRequest = vi.fn();
    server.use(
      http.delete("http://s3_endpoint.net/*", () => {
        abortRequest();
        return HttpResponse.json({});
      })
    );

    await expect(createS3Upload().abort()).resolves.toBeUndefined();

    expect(abortRequest).not.toHaveBeenCalled();
  });

  test("resolves when creating the upload failed", async () => {
    server.use(
      http.post("http://s3_endpoint.net/", () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;
    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });

    await expect(s3Upload.abort()).resolves.toBeUndefined();
  });

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
        return HttpResponse.json(
          {},
          { headers: { ...corsHeaders, ETag: "etag1" } }
        );
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
    expect(createS3Upload().getInitialFile()).toStrictEqual({
      id: "",
      name: "",
      original_name: "file.txt",
      size: 8,
      type: "s3"
    });
  });

  test("returns the key and the upload id when the file is uploaded", async () => {
    const s3Upload = await startUpload();

    expect(s3Upload.getInitialFile()).toStrictEqual({
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
    expect(createS3Upload().getSize()).toBe(8);
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
        HttpResponse.json({}, { headers: { ...corsHeaders, ETag: "etag2" } })
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

    expect(completedParts).toStrictEqual({
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

  test("calls onError when creating the multipart upload returns an error status", async () => {
    server.use(
      http.post("http://s3_endpoint.net/", () =>
        HttpResponse.json({ status: "permission denied" }, { status: 403 })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new RequestError(403)
      );
    });
  });

  test("calls onError instead of onSuccess when completing the upload returns an error status", async () => {
    server.use(
      http.post("http://s3_endpoint.net/upload-id-1/complete", () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    const onSuccess = vi.fn();
    s3Upload.onError = onError;
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new RequestError(500)
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
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
        HttpResponse.json({}, { headers: corsHeaders, status: 500 })
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
      http.put("http://s3_endpoint.net/upload/1", () =>
        HttpResponse.json({}, { headers: corsHeaders })
      )
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

describe("retries", () => {
  // Respond to the requests for part 1 with the given responses, in order. After that, succeed.
  const respondToPart = (
    urlResponses: (() => Response)[],
    putResponses: (() => Response)[]
  ) => {
    const urlRequest = vi.fn();
    const putRequest = vi.fn();

    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/1", () => {
        urlRequest();
        const respond = urlResponses.shift();
        return respond
          ? respond()
          : HttpResponse.json({ url: "http://s3_endpoint.net/upload/1" });
      }),
      http.put("http://s3_endpoint.net/upload/1", () => {
        putRequest();
        const respond = putResponses.shift();
        return respond
          ? respond()
          : HttpResponse.json(
              {},
              { headers: { ...corsHeaders, ETag: "etag1" } }
            );
      })
    );

    return { putRequest, urlRequest };
  };

  const recordAbortRequests = () => {
    const abortRequest = vi.fn();

    server.use(
      http.delete("http://s3_endpoint.net/upload-id-1", () => {
        abortRequest();
        return HttpResponse.json({});
      })
    );

    return abortRequest;
  };

  const partError = (status: number) => () =>
    HttpResponse.json({}, { headers: corsHeaders, status });

  const startWithCallbacks = (retryDelays: number[]) => {
    const s3Upload = createS3Upload(undefined, retryDelays);
    const onError = vi.fn();
    const onProgress = vi.fn();
    const onSuccess = vi.fn();
    s3Upload.onError = onError;
    s3Upload.onProgress = onProgress;
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    return { onError, onProgress, onSuccess, s3Upload };
  };

  test.each([
    { name: "a server error", respond: partError(500) },
    { name: "a 503 response", respond: partError(503) },
    { name: "a 429 response", respond: partError(429) },
    { name: "a 408 response", respond: partError(408) },
    { name: "a network error", respond: () => HttpResponse.error() }
  ])("retries uploading a part after $name", async ({ respond }) => {
    const { putRequest, urlRequest } = respondToPart([], [respond]);

    const { onError, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(putRequest).toHaveBeenCalledTimes(2);
    // A new url is requested for the retry
    expect(urlRequest).toHaveBeenCalledTimes(2);
  });

  test.each([
    { name: "a server error", respond: () => HttpResponse.json({}, { status: 500 }) },
    { name: "a network error", respond: () => HttpResponse.error() }
  ])("retries requesting the url of a part after $name", async ({ respond }) => {
    const { putRequest, urlRequest } = respondToPart([respond], []);

    const { onError, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(urlRequest).toHaveBeenCalledTimes(2);
    expect(putRequest).toHaveBeenCalledOnce();
  });

  test("does not retry requesting the url after a 403 response", async () => {
    const { urlRequest } = respondToPart(
      [() => HttpResponse.json({}, { status: 403 })],
      []
    );

    const { onError, onSuccess } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new RequestError(403)
      );
    });

    expect(urlRequest).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test("does not retry uploading a part after a 403 response", async () => {
    const { putRequest } = respondToPart([], [partError(403)]);

    const { onError } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error("Non 2xx"));
    });

    expect(putRequest).toHaveBeenCalledOnce();
  });

  test("does not retry when the ETag header is missing", async () => {
    const { putRequest } = respondToPart(
      [],
      [() => HttpResponse.json({}, { headers: corsHeaders })]
    );

    const { onError } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledOnce();
    });

    expect(putRequest).toHaveBeenCalledOnce();
  });

  test("fails after the last retry and aborts the multipart upload", async () => {
    const abortRequest = recordAbortRequests();
    const { putRequest } = respondToPart(
      [],
      [partError(500), partError(500), partError(500)]
    );

    const { onError, onSuccess } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledExactlyOnceWith(new Error("Non 2xx"));
    });

    // The first attempt and two retries
    expect(putRequest).toHaveBeenCalledTimes(3);
    expect(onSuccess).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(abortRequest).toHaveBeenCalledOnce();
    });
  });

  test("keeps the parts that are already uploaded", async () => {
    const part2Request = vi.fn();
    let completedParts: unknown = null;

    respondToPart([], []);
    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/2", () =>
        HttpResponse.json({ url: "http://s3_endpoint.net/upload/2" })
      ),
      http.put("http://s3_endpoint.net/upload/2", () => {
        part2Request();

        return part2Request.mock.calls.length === 1
          ? partError(500)()
          : HttpResponse.json(
              {},
              { headers: { ...corsHeaders, ETag: "etag2" } }
            );
      }),
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
    const s3Upload = createS3Upload(file, [0]);
    const onSuccess = vi.fn();
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(part2Request).toHaveBeenCalledTimes(2);
    expect(completedParts).toStrictEqual({
      parts: [
        { ETag: "etag1", PartNumber: 1 },
        { ETag: "etag2", PartNumber: 2 }
      ]
    });
  });

  test("resets the progress of the part before retrying", async () => {
    respondToPart([], [partError(500)]);

    const { onProgress, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onProgress).toHaveBeenCalledWith(0, 8);
    expect(onProgress).toHaveBeenLastCalledWith(8, 8);
  });

  test("does not retry after the upload is aborted", async () => {
    recordAbortRequests();
    const { putRequest } = respondToPart([], [partError(500)]);

    const { onError, onSuccess, s3Upload } = startWithCallbacks([50]);

    await waitFor(() => {
      expect(putRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(100);

    expect(putRequest).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  test("does not upload a part when the upload is aborted while requesting its url", async () => {
    const abortRequest = recordAbortRequests();
    const putRequest = vi.fn();
    const urlRequest = vi.fn();

    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/1", async () => {
        urlRequest();
        await delay(50);
        return HttpResponse.json({ url: "http://s3_endpoint.net/upload/1" });
      }),
      http.put("http://s3_endpoint.net/upload/1", () => {
        putRequest();
        return HttpResponse.json({}, { headers: { ...corsHeaders, ETag: "etag1" } });
      })
    );

    const { s3Upload } = startWithCallbacks([]);

    await waitFor(() => {
      expect(urlRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(100);

    expect(abortRequest).toHaveBeenCalledOnce();
    expect(putRequest).not.toHaveBeenCalled();
  });

  test("does not retry when requesting the url fails after the upload is aborted", async () => {
    const abortRequest = recordAbortRequests();
    const urlRequest = vi.fn();

    server.use(
      http.get("http://s3_endpoint.net/upload-id-1/1", async () => {
        urlRequest();
        await delay(50);
        return HttpResponse.json({}, { status: 500 });
      })
    );

    const { onError, s3Upload } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(urlRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(100);

    expect(urlRequest).toHaveBeenCalledOnce();
    expect(abortRequest).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  test("does not upload parts when the upload is aborted while it is created", async () => {
    const abortRequest = recordAbortRequests();
    const createRequest = vi.fn();
    const { urlRequest } = respondToPart([], []);

    server.use(
      http.post("http://s3_endpoint.net/", async () => {
        createRequest();
        await delay(50);
        return HttpResponse.json({ key: "test-key-1", uploadId: "upload-id-1" });
      })
    );

    const { s3Upload } = startWithCallbacks([]);

    await waitFor(() => {
      expect(createRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(50);

    expect(abortRequest).toHaveBeenCalledOnce();
    expect(urlRequest).not.toHaveBeenCalled();
  });

  // Respond to the create requests with the given responses, in order. After that, succeed.
  const respondToCreate = (responses: (() => Response)[]) => {
    const createRequest = vi.fn();

    server.use(
      http.post("http://s3_endpoint.net/", () => {
        createRequest();
        const respond = responses.shift();
        return respond
          ? respond()
          : HttpResponse.json({ key: "test-key-1", uploadId: "upload-id-1" });
      })
    );

    return createRequest;
  };

  // Respond to the complete requests with the given responses, in order. After that, succeed.
  const respondToComplete = (responses: (() => Response)[]) => {
    const completeRequest = vi.fn<(body: unknown) => void>();

    server.use(
      http.post(
        "http://s3_endpoint.net/upload-id-1/complete",
        async ({ request }) => {
          completeRequest(await request.json());
          const respond = responses.shift();
          return respond ? respond() : HttpResponse.json({});
        }
      )
    );

    return completeRequest;
  };

  const viewError = (status: number) => () =>
    HttpResponse.json({}, { status });

  test.each([
    { name: "a server error", respond: viewError(500) },
    { name: "a network error", respond: () => HttpResponse.error() }
  ])("retries creating the upload after $name", async ({ respond }) => {
    const createRequest = respondToCreate([respond]);

    const { onError, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(createRequest).toHaveBeenCalledTimes(2);
  });

  test("does not retry creating the upload after a 403 response", async () => {
    const createRequest = respondToCreate([viewError(403)]);

    const { onError } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledExactlyOnceWith(new RequestError(403));
    });

    expect(createRequest).toHaveBeenCalledOnce();
  });

  test("fails after the last retry of creating the upload", async () => {
    const abortRequest = recordAbortRequests();
    const createRequest = respondToCreate([
      viewError(500),
      viewError(500),
      viewError(500)
    ]);

    const { onError, onSuccess } = startWithCallbacks([0, 0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledExactlyOnceWith(new RequestError(500));
    });

    expect(createRequest).toHaveBeenCalledTimes(3);
    expect(onSuccess).not.toHaveBeenCalled();
    // There is no upload to abort
    expect(abortRequest).not.toHaveBeenCalled();
  });

  test("retries completing the upload after a server error", async () => {
    const completeRequest = respondToComplete([viewError(503)]);

    const { onError, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(completeRequest).toHaveBeenCalledTimes(2);

    const parts = { parts: [{ ETag: "etag1", PartNumber: 1 }] };

    expect(completeRequest).toHaveBeenNthCalledWith(1, parts);
    expect(completeRequest).toHaveBeenNthCalledWith(2, parts);
  });

  test("fails after the last retry of completing the upload and aborts it", async () => {
    const abortRequest = recordAbortRequests();
    const completeRequest = respondToComplete([viewError(500), viewError(500)]);

    const { onError, onSuccess } = startWithCallbacks([0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledExactlyOnceWith(new RequestError(500));
    });

    expect(completeRequest).toHaveBeenCalledTimes(2);
    expect(onSuccess).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(abortRequest).toHaveBeenCalledOnce();
    });
  });

  // The retry delay is longer than the timeout of the test, so these tests also check that
  // abort doesn't wait for the delay
  test("stops waiting to retry creating the upload when it is aborted", async () => {
    const abortRequest = recordAbortRequests();
    const createRequest = respondToCreate([viewError(500)]);

    const { onError, onSuccess, s3Upload } = startWithCallbacks([60_000]);

    await waitFor(() => {
      expect(createRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();

    expect(createRequest).toHaveBeenCalledOnce();
    expect(abortRequest).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test("stops waiting to retry completing the upload when it is aborted", async () => {
    const abortRequest = recordAbortRequests();
    const completeRequest = respondToComplete([viewError(500)]);

    const { onError, onSuccess, s3Upload } = startWithCallbacks([60_000]);

    await waitFor(() => {
      expect(completeRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(50);

    expect(completeRequest).toHaveBeenCalledOnce();
    expect(abortRequest).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test("stops waiting to retry a part when the upload is aborted", async () => {
    const abortRequest = recordAbortRequests();
    const { putRequest } = respondToPart([], [partError(500)]);

    const { onError, s3Upload } = startWithCallbacks([60_000]);

    await waitFor(() => {
      expect(putRequest).toHaveBeenCalledOnce();
    });

    await s3Upload.abort();
    await delay(50);

    expect(putRequest).toHaveBeenCalledOnce();
    expect(abortRequest).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  test("uses the default retry delays when retryDelays is null", async () => {
    const { putRequest } = respondToPart([], [partError(500)]);

    const s3Upload = new S3Upload({
      csrfToken: "csrf1",
      endpoint: "http://s3_endpoint.net/",
      file: new File(["content1"], "file.txt"),
      retryDelays: null,
      s3UploadDir: "upload_dir",
      uploadIndex: 1
    });
    const onSuccess = vi.fn();
    s3Upload.onSuccess = onSuccess;

    s3Upload.start();

    // The first default delay is 0
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    expect(putRequest).toHaveBeenCalledTimes(2);
  });
});

describe("failure cleanup", () => {
  test("aborts the multipart upload when completing the upload fails", async () => {
    const abortRequest = vi.fn();
    server.use(
      http.post("http://s3_endpoint.net/upload-id-1/complete", () =>
        HttpResponse.json({}, { status: 500 })
      ),
      http.delete("http://s3_endpoint.net/upload-id-1", ({ request }) => {
        abortRequest(new URL(request.url).searchParams.get("key"));
        return HttpResponse.json({});
      })
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(abortRequest).toHaveBeenCalledExactlyOnceWith("test-key-1");
    });

    expect(onError).toHaveBeenCalledOnce();
  });

  test("ignores a failed abort request", async () => {
    server.use(
      http.put("http://s3_endpoint.net/upload/1", () =>
        HttpResponse.json({}, { headers: corsHeaders, status: 500 })
      ),
      http.delete("http://s3_endpoint.net/upload-id-1", () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;

    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledExactlyOnceWith(new Error("Non 2xx"));
    });
    // Let the abort request finish
    await delay(50);

    expect(onError).toHaveBeenCalledOnce();
  });
});

describe("without callbacks", () => {
  test("completes the upload when onSuccess is not set", async () => {
    const completeRequest = vi.fn();
    server.use(
      http.post("http://s3_endpoint.net/upload-id-1/complete", () => {
        completeRequest();
        return HttpResponse.json({});
      })
    );

    createS3Upload().start();

    await waitFor(() => {
      expect(completeRequest).toHaveBeenCalledOnce();
    });
  });
});

describe("abort after an invalid create result", () => {
  test("does not send an abort request", async () => {
    const abortRequest = vi.fn();
    server.use(
      http.post("http://s3_endpoint.net/", () => HttpResponse.json({})),
      http.delete("http://s3_endpoint.net/*", () => {
        abortRequest();
        return HttpResponse.json({});
      })
    );

    const s3Upload = createS3Upload();
    const onError = vi.fn();
    s3Upload.onError = onError;
    s3Upload.start();

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    await s3Upload.abort();

    expect(abortRequest).not.toHaveBeenCalled();
  });
});
