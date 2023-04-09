import AcceptedFileTypes from "./accepted_file_types";

describe(".isAccepted", () => {
  it("returns true if the extension is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc.txt")).toBe(true);
    expect(acceptedFileTypes.isAccepted("def.xyz")).toBe(true);
  });

  it("returns false if the extension is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(false);
  });

  it("returns false if the filename doesn't have an extension", () => {
    const acceptedFileTypes = new AcceptedFileTypes(".txt,.xyz");
    expect(acceptedFileTypes.isAccepted("abc")).toBe(false);
  });

  it("returns true if the input is empty", () => {
    const acceptedFileTypes = new AcceptedFileTypes("");
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(true);
  });

  it("returns true if the mimetype is accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(acceptedFileTypes.isAccepted("abc.txt")).toBe(true);
    expect(acceptedFileTypes.isAccepted("abc.json")).toBe(true);
  });

  it("returns false if the mimetype is not accepted", () => {
    const acceptedFileTypes = new AcceptedFileTypes(
      "text/plain,application/json"
    );
    expect(acceptedFileTypes.isAccepted("abc.xls")).toBe(false);
  });
});
