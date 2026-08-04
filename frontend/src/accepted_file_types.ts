import mime from "mime/lite";
import picomatch from "picomatch/posix";

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
  private _extensions: string[];
  private _mimeTypes: string[];

  constructor(inputAccept: string) {
    const [extensions, mimeTypes] = parseInputAccept(inputAccept);

    this._extensions = extensions;
    this._mimeTypes = mimeTypes;
  }

  public isAccepted(fileName: string): boolean {
    if (this._extensions.length === 0 && this._mimeTypes.length === 0) {
      return true;
    }
    return (
      this._isMimeTypeAccepted(mime.getType(fileName)) ||
      this._isExtensionAccepted(fileName)
    );
  }

  private _isExtensionAccepted(fileName: string): boolean {
    if (this._extensions.length === 0) {
      return false;
    }

    return picomatch.isMatch(fileName, this._extensions, { nocase: true });
  }

  private _isMimeTypeAccepted(mimeType: null | string): boolean {
    if (!mimeType || this._mimeTypes.length === 0) {
      return false;
    }

    return picomatch.isMatch(mimeType, this._mimeTypes);
  }
}

export default AcceptedFileTypes;
