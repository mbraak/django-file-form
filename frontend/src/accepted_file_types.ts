const parseInputAccept = (inputAccept: string): [string[], string[]] => {
  const extensions: string[] = [];
  const mimeTypes: string[] = [];

  inputAccept
    .split(",")
    .map(fileType => fileType.trim().toLowerCase())
    .filter(Boolean)
    .forEach(fileType => {
      if (fileType.startsWith(".")) {
        extensions.push(fileType);
      } else {
        mimeTypes.push(fileType);
      }
    });

  return [extensions, mimeTypes];
};

// Matches a mime type against a pattern from the accept attribute.
// The pattern is a full mime type ('text/plain') or uses a wildcard for the
// type or subtype ('image/*', '*/*').
const matchesMimeType = (mimeType: string, pattern: string): boolean => {
  const [type, subtype] = mimeType.split("/");
  const [patternType, patternSubtype] = pattern.split("/");

  const matchesPart = (
    part: string | undefined,
    patternPart: string | undefined
  ): boolean =>
    patternPart === "*" || (part !== undefined && part === patternPart);

  return matchesPart(type, patternType) && matchesPart(subtype, patternSubtype);
};

class AcceptedFileTypes {
  private _extensions: string[];
  private _mimeTypes: string[];

  constructor(inputAccept: string) {
    const [extensions, mimeTypes] = parseInputAccept(inputAccept);

    this._extensions = extensions;
    this._mimeTypes = mimeTypes;
  }

  public isAccepted(file: File): boolean {
    if (this._extensions.length === 0 && this._mimeTypes.length === 0) {
      return true;
    }
    return (
      this._isMimeTypeAccepted(file.type) ||
      this._isExtensionAccepted(file.name)
    );
  }

  private _isExtensionAccepted(fileName: string): boolean {
    const lowerCaseFileName = fileName.toLowerCase();

    return this._extensions.some(extension =>
      lowerCaseFileName.endsWith(extension)
    );
  }

  private _isMimeTypeAccepted(mimeType: string): boolean {
    if (!mimeType) {
      return false;
    }

    const lowerCaseMimeType = mimeType.toLowerCase();

    return this._mimeTypes.some(pattern =>
      matchesMimeType(lowerCaseMimeType, pattern)
    );
  }
}

export default AcceptedFileTypes;
