import { describe, expect, test } from "vitest";

import RenderUploadFile from "./render_upload_file.ts";

interface CreateRendererParameters {
  inputType?: string;
  skipRequired?: boolean;
  translations?: Record<string, string>;
}

const createRenderer = ({
  inputType = "file",
  skipRequired = false,
  translations = {}
}: CreateRendererParameters = {}) => {
  const parent = document.createElement("div");
  document.body.replaceChildren(parent);

  const input = document.createElement("input");
  input.type = inputType;
  input.required = true;

  const renderer = new RenderUploadFile({
    input,
    parent,
    skipRequired,
    translations
  });

  return { input, parent, renderer };
};

const mockFile = (filename: string) =>
  new File(["test"], filename, { type: "text/plain" });

describe("constructor", () => {
  test("creates the containers in the parent", () => {
    const { parent, renderer } = createRenderer();

    expect(parent.querySelector(".dff-files")).toBe(renderer.container);
    expect(parent.querySelector(".dff-invalid-files")).toBeInTheDocument();
  });

  test("keeps the input required by default", () => {
    const { input } = createRenderer();

    expect(input.required).toBe(true);
  });

  test("makes the input optional when skipRequired is set", () => {
    const { input } = createRenderer({ skipRequired: true });

    expect(input.required).toBe(false);
  });
});

describe("addNewUpload", () => {
  test("renders the filename, the progress bar and the cancel link", () => {
    const { renderer } = createRenderer();

    const div = renderer.addNewUpload("file.txt", 1);

    expect(div).toHaveClass("dff-file", "dff-file-id-1");
    expect(renderer.container).toContainElement(div);

    const filename = div.querySelector(".dff-filename");
    expect(filename).toHaveTextContent("file.txt");
    expect(filename).toHaveAttribute("data-index", "1");

    expect(div.querySelector(".dff-progress")).toContainElement(
      div.querySelector(".dff-progress-inner")
    );

    const cancelLink = div.querySelector(".dff-cancel");
    expect(cancelLink).toHaveTextContent("Cancel");
    expect(cancelLink).toHaveAttribute("data-index", "1");
    expect(cancelLink).toHaveAttribute("href", "#");
  });

  test("makes the input optional", () => {
    const { input, renderer } = createRenderer();

    renderer.addNewUpload("file.txt", 1);

    expect(input.required).toBe(false);
  });

  test("escapes the filename", () => {
    const { renderer } = createRenderer();

    const div = renderer.addNewUpload("<script>alert(1)</script>", 1);

    const filename = div.querySelector(".dff-filename");
    expect(filename?.querySelector("script")).toBeNull();
    expect(filename).toHaveTextContent("<script>alert(1)</script>");
  });

  test("translates the cancel link", () => {
    const { renderer } = createRenderer({
      translations: { Cancel: "Annuleren" }
    });

    const div = renderer.addNewUpload("file.txt", 1);

    expect(div.querySelector(".dff-cancel")).toHaveTextContent("Annuleren");
  });
});

describe("addUploadedFile", () => {
  test("renders a successful upload with the filesize", () => {
    const { renderer } = createRenderer();

    const div = renderer.addUploadedFile("file.txt", 1, 1024);

    expect(div).toHaveClass("dff-upload-success");
    expect(div.querySelector(".dff-filesize")).toHaveTextContent("1 KB");

    const deleteLink = div.querySelector(".dff-delete");
    expect(deleteLink).toHaveTextContent("Delete");
    expect(deleteLink).toHaveAttribute("data-index", "1");
    expect(deleteLink).toHaveAttribute("href", "#");

    expect(div.querySelector(".dff-progress")).toBeNull();
    expect(div.querySelector(".dff-cancel")).toBeNull();
  });

  test("does not render the filesize when it is unknown", () => {
    const { renderer } = createRenderer();

    const div = renderer.addUploadedFile("file.txt", 1);

    expect(div.querySelector(".dff-filesize")).toBeNull();
  });

  test("renders a filesize of zero bytes", () => {
    const { renderer } = createRenderer();

    const div = renderer.addUploadedFile("file.txt", 1, 0);

    expect(div.querySelector(".dff-filesize")).toHaveTextContent("0 Bytes");
  });

  test("translates the delete link", () => {
    const { renderer } = createRenderer({
      translations: { Delete: "Verwijderen" }
    });

    const div = renderer.addUploadedFile("file.txt", 1);

    expect(div.querySelector(".dff-delete")).toHaveTextContent("Verwijderen");
  });
});

describe("clearInput", () => {
  test("clears the value of the input", () => {
    const { input, renderer } = createRenderer({ inputType: "text" });
    input.value = "test";

    renderer.clearInput();

    expect(input.value).toBe("");
  });
});

describe("deleteFile", () => {
  test("removes the file", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);
    renderer.addNewUpload("file2.txt", 2);

    renderer.deleteFile(1);

    expect(div).not.toBeInTheDocument();
    expect(renderer.findFileDiv(2)).toBeInTheDocument();
  });

  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.deleteFile(1);
    }).not.toThrow();
  });
});

describe("disableCancel", () => {
  test("disables the cancel link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.disableCancel(1);

    expect(div.querySelector(".dff-cancel")).toHaveClass("dff-disabled");
  });

  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.disableCancel(1);
    }).not.toThrow();
  });

  test("does nothing when the file has no cancel link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addUploadedFile("file.txt", 1);

    renderer.disableCancel(1);

    expect(div.querySelector(".dff-disabled")).toBeNull();
  });
});

describe("disableDelete", () => {
  test("disables the delete link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addUploadedFile("file.txt", 1);

    renderer.disableDelete(1);

    expect(div.querySelector(".dff-delete")).toHaveClass("dff-disabled");
  });

  test("does nothing when the file has no delete link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.disableDelete(1);

    expect(div.querySelector(".dff-disabled")).toBeNull();
  });

  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.disableDelete(1);
    }).not.toThrow();
  });
});

describe("findFileDiv", () => {
  test("returns the div of the file", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    expect(renderer.findFileDiv(1)).toBe(div);
  });

  test("returns null when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(renderer.findFileDiv(1)).toBeNull();
  });
});

describe("renderDropHint", () => {
  test("renders the drop hint", () => {
    const { renderer } = createRenderer();

    renderer.renderDropHint();

    expect(renderer.container.querySelector(".dff-drop-hint")).toHaveTextContent(
      "Drop your files here"
    );
  });

  test("renders the drop hint only once", () => {
    const { renderer } = createRenderer();

    renderer.renderDropHint();
    renderer.renderDropHint();

    expect(renderer.container.querySelectorAll(".dff-drop-hint")).toHaveLength(
      1
    );
  });

  test("translates the drop hint", () => {
    const { renderer } = createRenderer({
      translations: { "Drop your files here": "Sleep je bestanden hierheen" }
    });

    renderer.renderDropHint();

    expect(renderer.container.querySelector(".dff-drop-hint")).toHaveTextContent(
      "Sleep je bestanden hierheen"
    );
  });
});

describe("removeDropHint", () => {
  test("removes the drop hint", () => {
    const { renderer } = createRenderer();
    renderer.renderDropHint();

    renderer.removeDropHint();

    expect(renderer.container.querySelector(".dff-drop-hint")).toBeNull();
  });

  test("does nothing when there is no drop hint", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.removeDropHint();
    }).not.toThrow();
  });
});

describe("setDeleteFailed", () => {
  test("renders an error and enables the delete link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addUploadedFile("file.txt", 1);
    renderer.disableDelete(1);

    renderer.setDeleteFailed(1);

    expect(div.querySelector(".dff-error")).toHaveTextContent("Delete failed");
    expect(div.querySelector(".dff-delete")).not.toHaveClass("dff-disabled");
  });

  test("renders an error when the file has no delete link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.setDeleteFailed(1);

    expect(div.querySelector(".dff-error")).toHaveTextContent("Delete failed");
  });

  test("translates the error", () => {
    const { renderer } = createRenderer({
      translations: { "Delete failed": "Verwijderen mislukt" }
    });
    const div = renderer.addUploadedFile("file.txt", 1);

    renderer.setDeleteFailed(1);

    expect(div.querySelector(".dff-error")).toHaveTextContent(
      "Verwijderen mislukt"
    );
  });
});

describe("setError", () => {
  test("renders an error and removes the progress bar and the cancel link", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.setError(1);

    expect(div).toHaveClass("dff-upload-fail");
    expect(div.querySelector(".dff-error")).toHaveTextContent("Upload failed");
    expect(div.querySelector(".dff-progress")).toBeNull();
    expect(div.querySelector(".dff-cancel")).toBeNull();
  });

  test("replaces an existing error message", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.setError(1);
    renderer.setError(1);

    expect(div.querySelectorAll(".dff-error")).toHaveLength(1);
  });

  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.setError(1);
    }).not.toThrow();
  });
});

describe("setErrorInvalidFiles", () => {
  test("renders an error for each file and clears the input", () => {
    const { parent, renderer } = createRenderer();

    renderer.setErrorInvalidFiles([mockFile("file1.png"), mockFile("file2")]);

    const errors = parent.querySelectorAll(".dff-invalid-files .dff-error");
    expect(errors).toHaveLength(2);
    expect(errors[0]).toHaveTextContent("file1.png: Invalid file type");
    expect(errors[1]).toHaveTextContent("file2: Invalid file type");
  });

  test("replaces the errors of a previous call", () => {
    const { parent, renderer } = createRenderer();

    renderer.setErrorInvalidFiles([mockFile("file1.png"), mockFile("file2")]);
    renderer.setErrorInvalidFiles([mockFile("file3.png")]);

    const errors = parent.querySelectorAll(".dff-invalid-files .dff-error");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveTextContent("file3.png: Invalid file type");
  });

  test("translates the error", () => {
    const { parent, renderer } = createRenderer({
      translations: { "Invalid file type": "Ongeldig bestandstype" }
    });

    renderer.setErrorInvalidFiles([mockFile("file1.png")]);

    expect(
      parent.querySelector(".dff-invalid-files .dff-error")
    ).toHaveTextContent("file1.png: Ongeldig bestandstype");
  });
});

describe("setSuccess", () => {
  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.setSuccess(1, 1024);
    }).not.toThrow();
  });
});

describe("updateProgress", () => {
  test("sets the width of the progress bar", () => {
    const { renderer } = createRenderer();
    const div = renderer.addNewUpload("file.txt", 1);

    renderer.updateProgress(1, "40");

    expect(div.querySelector(".dff-progress-inner")).toHaveStyle({
      width: "40%"
    });
  });

  test("does nothing when the file does not exist", () => {
    const { renderer } = createRenderer();

    expect(() => {
      renderer.updateProgress(1, "40");
    }).not.toThrow();
  });

  test("does nothing when the file has no progress bar", () => {
    const { renderer } = createRenderer();
    renderer.addUploadedFile("file.txt", 1);

    expect(() => {
      renderer.updateProgress(1, "40");
    }).not.toThrow();
  });
});
