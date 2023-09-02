import {
  formatBytes,
  getInputNameWithPrefix,
  getMetadataFieldName,
  getUploadsFieldName
} from "./util";

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0, 10)).toEqual("0 Bytes");
  });

  it("formats 1200 bytes", () => {
    expect(formatBytes(1200, 0)).toEqual("1 KB");
  });

  it("formats 1200 with 2 decimals", () => {
    expect(formatBytes(1200, 2)).toEqual("1.17 KB");
  });
});

describe("getInputNameWithPrefix", () => {
  it("returns the name with prefix when there is a prefix", () => {
    expect(getInputNameWithPrefix("test_field", "abc")).toBe("abc-test_field");
  });

  it("returns the name when there is no prefix", () => {
    expect(getInputNameWithPrefix("test_field", null)).toBe("test_field");
  });
});

describe("getUploadsFieldName", () => {
  it("returns the name without the prefix and with the 'uploads' suffix when there is a prefix", () => {
    expect(getUploadsFieldName("abc-field1", "abc")).toBe("field1-uploads");
  });

  it("returns the name with the 'uploads' suffix when there is no prefix", () => {
    expect(getUploadsFieldName("field1", null)).toBe("field1-uploads");
  });
});

describe("getMetadataFieldName", () => {
  it("returns the name without the predix and with the 'metadata' suffix when there is a prefix", () => {
    expect(getMetadataFieldName("abc-field1", "abc")).toBe("field1-metadata");
  });

  it("returns the name with the 'metadata' suffix when there is no prefix", () => {
    expect(getMetadataFieldName("field1", null)).toBe("field1-metadata");
  });
});
