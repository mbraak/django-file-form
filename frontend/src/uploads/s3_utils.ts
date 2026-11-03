export interface LocationInfo {
  location: string;
}

export interface MultipartUpload {
  endpoint: string;
  key: string;
  uploadId: string;
}

export interface Part {
  ETag: string;
  PartNumber: number;
}

export interface UrlInfo {
  url: string;
}

export const MB = 1024 * 1024;

// A response with an error status from the S3 views of django-file-form
export class RequestError extends Error {
  public readonly status: number;

  constructor(status: number) {
    super(`S3 upload request failed with status ${status.toString()}`);
    this.status = status;
  }
}

// Server errors, timeouts and rate limiting are temporary, so the request can be retried
export const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

// Can a failed request to the S3 views be retried?
// - fetch rejects with a TypeError on a network error
export const isRetryableRequestError = (error: unknown): boolean =>
  error instanceof RequestError
    ? isRetryableStatus(error.status)
    : error instanceof TypeError;

// Reject if the response has an error status; otherwise return the json data
const getJsonData = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new RequestError(response.status);
  }

  return (await response.json()) as T;
};

interface AbortMultipartUploadParameters {
  csrfToken: string;
  endpoint: string;
  key: string;
  uploadId: string;
}

export const abortMultipartUpload = ({
  csrfToken,
  endpoint,
  key,
  uploadId
}: AbortMultipartUploadParameters): Promise<unknown> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const headers = new Headers({
    "X-CSRFToken": csrfToken
  });
  const url = `${endpoint}${uploadIdEnc}/?key=${filename}`;
  return fetch(url, {
    headers: headers,
    method: "delete"
  }).then(getJsonData);
};

interface CompleteMultipartUploadParameters {
  csrfToken: string;
  endpoint: string;
  key: string;
  parts: Part[];
  uploadId: string;
}

export const completeMultipartUpload = ({
  csrfToken,
  endpoint,
  key,
  parts,
  uploadId
}: CompleteMultipartUploadParameters): Promise<LocationInfo> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const headers = new Headers({
    "X-CSRFToken": csrfToken
  });
  const url = `${endpoint}${uploadIdEnc}/complete?key=${filename}`;
  return fetch(url, {
    body: JSON.stringify({
      parts: parts
    }),
    headers: headers,
    method: "post"
  })
    .then(getJsonData<LocationInfo>);
};

interface CreateMultipartUploadParameters {
  csrfToken: string;
  endpoint: string;
  file: File;
  s3UploadDir: string;
}

export const createMultipartUpload = ({
  csrfToken,
  endpoint,
  file,
  s3UploadDir
}: CreateMultipartUploadParameters): Promise<MultipartUpload> => {
  const headers = new Headers({
    accept: "application/json",
    "content-type": "application/json",
    "X-CSRFToken": csrfToken
  });
  return fetch(endpoint, {
    body: JSON.stringify({
      contentType: file.type,
      filename: file.name,
      s3UploadDir: s3UploadDir
    }),
    headers: headers,
    method: "post"
  })
    .then(getJsonData<MultipartUpload>);
};

export const getChunkSize = (file: File): number =>
  Math.ceil(file.size / 10000);

interface PrepareUploadPartParameters {
  csrfToken: string;
  endpoint: string;
  key: string;
  number: number;
  uploadId: string;
}

export const prepareUploadPart = ({
  csrfToken,
  endpoint,
  key,
  number,
  uploadId
}: PrepareUploadPartParameters): Promise<UrlInfo> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const headers = new Headers({ "X-CSRFToken": csrfToken });
  const url = `${endpoint}${uploadIdEnc}/${number.toString()}?key=${filename}`;
  return fetch(url, {
    headers: headers
  })
    .then(getJsonData<UrlInfo>);
};

export const remove = (arr: unknown[], el: unknown): void => {
  const i = arr.indexOf(el);
  if (i !== -1) {
    arr.splice(i, 1);
  }
};
