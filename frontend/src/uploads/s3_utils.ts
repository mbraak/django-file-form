import urljoin from "url-join";

export interface LocationInfo {
  location: string;
}

export interface MultipartUpload {
  key: string;
  uploadId: string;
  endpoint: string;
}

export interface Part {
  ETag: string;
  PartNumber: number;
}

export interface UrlInfo {
  url: string;
}

export const MB = 1024 * 1024;

interface AbortMultipartUploadParameters {
  csrfToken: string;
  endpoint: string;
  key: string;
  uploadId: string;
}

export const abortMultipartUpload = ({
  csrfToken,
  key,
  uploadId,
  endpoint
}: AbortMultipartUploadParameters): Promise<unknown> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const headers = new Headers({
    "X-CSRFToken": csrfToken
  });
  const url = urljoin(endpoint, uploadIdEnc, `?key=${filename}`);
  return fetch(url, {
    method: "delete",
    headers: headers
  }).then(response => {
    return response.json();
  });
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
  key,
  uploadId,
  parts,
  endpoint
}: CompleteMultipartUploadParameters): Promise<LocationInfo> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const headers = new Headers({
    "X-CSRFToken": csrfToken
  });
  const url = urljoin(endpoint, uploadIdEnc, "complete", `?key=${filename}`);
  return fetch(url, {
    method: "post",
    headers: headers,
    body: JSON.stringify({
      parts: parts
    })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as LocationInfo;
    });
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
    method: "post",
    headers: headers,
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      s3UploadDir: s3UploadDir
    })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as MultipartUpload;
    });
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
  const headers = new Headers({ "X-CSRFToken": csrfToken });
  const url = urljoin(endpoint, uploadId, `${number}`, `?key=${filename}`);
  return fetch(url, {
    method: "get",
    headers: headers
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data as UrlInfo;
    });
};

export const remove = (arr: unknown[], el: unknown): void => {
  const i = arr.indexOf(el);
  if (i !== -1) {
    arr.splice(i, 1);
  }
};
