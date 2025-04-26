import { describe, expect, test } from "vitest";

import AcceptedFileTypes from "./accepted_file_types.ts";

describe(".isAccepted", () => {
  test("returns true if the extension is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc.txt")).toBe(true);
    expect(acceptedFileTypes.isAccepted("def.xyz")).toBe(true);
  });

  test("returns true if the extension is accepted and the filename is uppercase", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("ABC.TXT")).toBe(true);
    expect(acceptedFileTypes.isAccepted("DEF.XYZ")).toBe(true);
  });

  test("returns false if the extension is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(false);
  });

  test("returns false if the filename doesn't have an extension", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc")).toBe(false);
  });

  test("returns true if the input is empty", () => {
    const acceptedFileTypes = new AcceptedFileTypes("");
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(true);
  });

  test("returns true if the mimetype is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(acceptedFileTypes.isAccepted("abc.txt")).toBe(true);
    expect(acceptedFileTypes.isAccepted("abc.json")).toBe(true);
  });

  test("returns true if the mimetype is accepted and the filename is uppercase", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(acceptedFileTypes.isAccepted("ABC.TXT")).toBe(true);
    expect(acceptedFileTypes.isAccepted("ABC.JSON")).toBe(true);
  });

  test("returns false if the mimetype is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(false);
  });
});
