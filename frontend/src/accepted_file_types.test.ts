import { describe, expect, test } from "vitest";

import AcceptedFileTypes from "./accepted_file_types.ts";

const createFile = (name: string, type = ""): File =>
  new File(["test"], name, { type });

describe(".isAccepted", () => {
  test("returns true if the extension is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted(createFile("abc.txt"))).toBe(true);
    expect(acceptedFileTypes.isAccepted(createFile("def.xyz"))).toBe(true);
  });

  test("returns true if the extension is accepted and the filename is uppercase", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted(createFile("ABC.TXT"))).toBe(true);
    expect(acceptedFileTypes.isAccepted(createFile("DEF.XYZ"))).toBe(true);
  });

  test("returns false if the extension is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted(createFile("abc.xls"))).toBe(false);
  });

  test("returns false if the filename doesn't have an extension", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted(createFile("abc"))).toBe(false);
  });

  test("returns true if the input is empty", () => {
    const acceptedFileTypes = new AcceptedFileTypes("");
    expect(acceptedFileTypes.isAccepted(createFile("abc.xls"))).toBe(true);
  });

  test("returns true if the mimetype is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(
      acceptedFileTypes.isAccepted(createFile("abc.txt", "text/plain"))
    ).toBe(true);
    expect(
      acceptedFileTypes.isAccepted(createFile("abc.json", "application/json"))
    ).toBe(true);
  });

  test("returns true if the mimetype matches a wildcard", () => {
    const acceptedFileTypes = new AcceptedFileTypes("image/*");
    expect(
      acceptedFileTypes.isAccepted(createFile("abc.png", "image/png"))
    ).toBe(true);
    expect(
      acceptedFileTypes.isAccepted(createFile("abc.txt", "text/plain"))
    ).toBe(false);
  });

  test("returns true if the mimetype is accepted and the filename is uppercase", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(
      acceptedFileTypes.isAccepted(createFile("ABC.TXT", "text/plain"))
    ).toBe(true);
    expect(
      acceptedFileTypes.isAccepted(createFile("ABC.JSON", "application/json"))
    ).toBe(true);
  });

  test("returns false if the mimetype is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(
      acceptedFileTypes.isAccepted(
        createFile("abc.xls", "application/vnd.ms-excel")
      )
    ).toBe(false);
  });

  test("accepts any file type for a full wildcard", () => {
    const acceptedFileTypes = new AcceptedFileTypes("*/*");
    expect(
      acceptedFileTypes.isAccepted(
        createFile("abc.xls", "application/vnd.ms-excel")
      )
    ).toBe(true);
    expect(acceptedFileTypes.isAccepted(createFile("abc"))).toBe(false);
  });

  test("handles whitespace and mixed case in the accept attribute", () => {
    const acceptedFileTypes = new AcceptedFileTypes(" .TXT , Image/* ");
    expect(acceptedFileTypes.isAccepted(createFile("abc.txt"))).toBe(true);
    expect(
      acceptedFileTypes.isAccepted(createFile("abc.png", "image/png"))
    ).toBe(true);
    expect(acceptedFileTypes.isAccepted(createFile("abc.xls"))).toBe(false);
  });

  test("does not match a partial extension", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt");
    expect(acceptedFileTypes.isAccepted(createFile("abc.txt.zip"))).toBe(false);
    expect(acceptedFileTypes.isAccepted(createFile("abctxt"))).toBe(false);
  });

  test("returns false if the browser doesn't know the mimetype", () => {
    const acceptedFileTypes = new AcceptedFileTypes("text/plain");
    expect(acceptedFileTypes.isAccepted(createFile("abc.txt"))).toBe(false);
  });
});
