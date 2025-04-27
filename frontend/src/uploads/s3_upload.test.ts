import { waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import S3Upload from "./s3_upload.ts";

const server = setupServer(
  http.post("http://s3_endpoint.net/", () =>
    HttpResponse.json({ key: "test-key-1", uploadId: "upload-id-1" })
  ),
  http.get("http://s3_endpoint.net/upload-id-1/1", () =>
    HttpResponse.json({ url: "http://s3_endpoint.net/upload/1" })
  ),
  http.put("http://s3_endpoint.net/upload/1", () => HttpResponse.json({}))
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

const createS3Upload = () => {
  const file = new File(["content1"], "file.txt");

  return new S3Upload({
    csrfToken: "csrf1",
    endpoint: "http://s3_endpoint.net/",
    file,
    s3UploadDir: "upload_dir",
    uploadIndex: 1
  });
};

describe("getId", () => {
  test("returns undefined when the upload is not started", () => {
    expect(createS3Upload().getId()).toBeUndefined();
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
});

describe("getSize", () => {
  test("returns the size", () => {
    expect(createS3Upload().getSize()).toEqual(8);
  });
});

describe("start", () => {
  test("...", async () => {
    const s3Upload = createS3Upload();
    s3Upload.start();

    await waitFor(() => {
      expect(s3Upload.status).toEqual("done");
    });
  });
});
