const parseInputAccept = (inputAccept: string): [string[], string[]] => {
  const extensions: string[] = [];
  const mimeTypes: string[] = [];

  const fileTypes = inputAccept
    .split(",")
    .map(fileType => fileType.trim().toLowerCase())
    .filter(Boolean);

  for (const fileType of fileTypes) {
    if (fileType.startsWith(".")) {
      extensions.push(fileType);
    } else {
      mimeTypes.push(fileType);
    }
  }

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
  private extensions: string[];
  private mimeTypes: string[];

  constructor(inputAccept: string) {
    const [extensions, mimeTypes] = parseInputAccept(inputAccept);

    this.extensions = extensions;
    this.mimeTypes = mimeTypes;
  }

  public isAccepted(file: File): boolean {
    if (this.extensions.length === 0 && this.mimeTypes.length === 0) {
      return true;
    }
    return (
      this.isMimeTypeAccepted(file.type) ||
      this.isExtensionAccepted(file.name)
    );
  }

  private isExtensionAccepted(fileName: string): boolean {
    const lowerCaseFileName = fileName.toLowerCase();

    return this.extensions.some(extension =>
      lowerCaseFileName.endsWith(extension)
    );
  }

  private isMimeTypeAccepted(mimeType: string): boolean {
    if (!mimeType) {
      return false;
    }

    const lowerCaseMimeType = mimeType.toLowerCase();

    return this.mimeTypes.some(pattern =>
      matchesMimeType(lowerCaseMimeType, pattern)
    );
  }
}

export default AcceptedFileTypes;
