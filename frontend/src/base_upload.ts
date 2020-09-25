type UploadStatus = "done" | "error" | "uploading";

class BaseUpload {
  status: UploadStatus;

  constructor(status: UploadStatus) {
    this.status = status;
  }
}

export default BaseUpload;
