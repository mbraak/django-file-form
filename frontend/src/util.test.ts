import { formatBytes } from "./util";

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
