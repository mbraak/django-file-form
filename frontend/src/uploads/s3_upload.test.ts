import S3Upload from "./s3_upload.ts";

const createS3Upload = () => {
  const file = new File(["content1"], "file.txt");

  return new S3Upload({
    csrfToken: "csrf1",
    endpoint: "http://endpoint.com/",
    file,
    s3UploadDir: "upload_dir",
    uploadIndex: 1
  });
};

describe("getId", () => {
  it("returns undefined when the upload is not started", () => {
    expect(createS3Upload().getId()).toBeUndefined();
  });
});

describe("getInitialFile", () => {
  it("return the initial file when the upload has not started", () => {
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
  it("returns the size", () => {
    expect(createS3Upload().getSize()).toEqual(8);
  });
});
