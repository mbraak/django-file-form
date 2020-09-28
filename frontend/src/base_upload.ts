type UploadStatus = "done" | "error" | "uploading";

class BaseUpload {
  status: UploadStatus;
  uploadIndex: number;

  constructor(status: UploadStatus, uploadIndex: number) {
    this.status = status;
    this.uploadIndex = uploadIndex;
  }
}

export default BaseUpload;
