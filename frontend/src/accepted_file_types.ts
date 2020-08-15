import mime from "mime/lite";
import picomatch from "picomatch";

const parseInputAccept = (inputAccept: string): [string[], string[]] => {
  const extensions: string[] = [];
  const mimeTypes: string[] = [];

  inputAccept
    .split(",")
    .map(mimeType => mimeType.trim())
    .filter(Boolean)
    .forEach(fileType => {
      if (fileType.startsWith(".")) {
        extensions.push(`*${fileType}`);
      } else {
        mimeTypes.push(fileType);
      }
    });

  return [extensions, mimeTypes];
};

class AcceptedFileTypes {
  extensions: string[];
  mimeTypes: string[];

  constructor(inputAccept: string) {
    const [extensions, mimeTypes] = parseInputAccept(inputAccept);

    this.extensions = extensions;
    this.mimeTypes = mimeTypes;
  }

  public isAccepted(fileName: string): boolean {
    if (this.extensions.length === 0 && this.mimeTypes.length === 0) {
      return true;
    }

    return (
      this.isMimeTypeAccepted(mime.getType(fileName)) ||
      this.isExtensionAccepted(fileName)
    );
  }

  private isMimeTypeAccepted(mimeType: string): boolean {
    if (this.mimeTypes.length === 0) {
      return false;
    }

    return picomatch.isMatch(mimeType, this.mimeTypes);
  }

  public isExtensionAccepted(fileName: string): boolean {
    if (this.extensions.length === 0) {
      return false;
    }

    return picomatch.isMatch(fileName, this.extensions);
  }
}

export default AcceptedFileTypes;
