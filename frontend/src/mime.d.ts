declare module "mime/lite" {
  export function getType(fileName: string): string;
  export function getExtension(mimeType: string): string;
}
