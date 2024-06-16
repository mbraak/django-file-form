import { describe, expect, test } from "vitest";
import {
  formatBytes,
  getInputNameWithPrefix,
  getMetadataFieldName,
  getUploadsFieldName
} from "./util.ts";

describe("formatBytes", () => {
  test("formats 0 bytes", () => {
    expect(formatBytes(0, 10)).toEqual("0 Bytes");
  });

  test("formats 1200 bytes", () => {
    expect(formatBytes(1200, 0)).toEqual("1 KB");
  });

  test("formats 1200 with 2 decimals", () => {
    expect(formatBytes(1200, 2)).toEqual("1.17 KB");
  });
});

describe("getInputNameWithPrefix", () => {
  test("returns the name with prefix when there is a prefix", () => {
    expect(getInputNameWithPrefix("test_field", "abc")).toBe("abc-test_field");
  });

  test("returns the name when there is no prefix", () => {
    expect(getInputNameWithPrefix("test_field", null)).toBe("test_field");
  });
});

describe("getUploadsFieldName", () => {
  test("returns the name without the prefix and with the 'uploads' suffix when there is a prefix", () => {
    expect(getUploadsFieldName("abc-field1", "abc")).toBe("field1-uploads");
  });

  test("returns the name with the 'uploads' suffix when there is no prefix", () => {
    expect(getUploadsFieldName("field1", null)).toBe("field1-uploads");
  });
});

describe("getMetadataFieldName", () => {
  test("returns the name without the predix and with the 'metadata' suffix when there is a prefix", () => {
    expect(getMetadataFieldName("abc-field1", "abc")).toBe("field1-metadata");
  });

  test("returns the name with the 'metadata' suffix when there is no prefix", () => {
    expect(getMetadataFieldName("field1", null)).toBe("field1-metadata");
  });
});
