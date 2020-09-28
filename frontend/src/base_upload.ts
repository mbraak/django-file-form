type UploadStatus = "done" | "error" | "uploading";

interface UploadParameters {
  name: string;
  status: UploadStatus;
  uploadIndex: number;
}

class BaseUpload {
  name: string;
  status: UploadStatus;
  uploadIndex: number;

  constructor({ name, status, uploadIndex }: UploadParameters) {
    this.name = name;
    this.status = status;
    this.uploadIndex = uploadIndex;
  }
}

export default BaseUpload;
