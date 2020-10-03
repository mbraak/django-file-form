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

export interface ServerPart {
  ETag: string;
  PartNumber: number;
  Size: number;
}

export interface UrlInfo {
  url: string;
}

export const MB = 1024 * 1024;

export const abortMultipartUpload = ({
  key,
  uploadId,
  endpoint
}: MultipartUpload): Promise<unknown> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    "X-CSRFToken": csrftoken
  });
  const url = urljoin(endpoint, uploadIdEnc, `?key=${filename}`);
  return fetch(url, {
    method: "delete",
    headers: headers
  }).then(response => {
    return response.json();
  });
};

export const completeMultipartUpload = ({
  key,
  uploadId,
  parts,
  endpoint
}: {
  key: string;
  uploadId: string;
  parts: Part[];
  endpoint: string;
}): Promise<LocationInfo> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    "X-CSRFToken": csrftoken
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

export const createMultipartUpload = (
  file: File,
  s3UploadDir: string,
  endpoint: string
): Promise<MultipartUpload> => {
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({
    accept: "application/json",
    "content-type": "application/json",
    "X-CSRFToken": csrftoken
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

export const listParts = ({
  key,
  endpoint,
  uploadId
}: MultipartUpload): Promise<ServerPart[]> => {
  const filename = encodeURIComponent(key);
  const uploadIdEnc = encodeURIComponent(uploadId);
  const url = urljoin(endpoint, uploadIdEnc, `?key=${filename}`);

  return fetch(url, { method: "get" })
    .then(response => {
      return response.json();
    })
    .then(data => {
      return (data as Record<string, unknown>)["parts"] as ServerPart[];
    });
};

export const prepareUploadPart = ({
  key,
  uploadId,
  number,
  endpoint
}: {
  key: string;
  uploadId: string;
  number: number;
  endpoint: string;
}): Promise<UrlInfo> => {
  const filename = encodeURIComponent(key);
  const csrftoken = (<HTMLInputElement>(
    document.getElementsByName("csrfmiddlewaretoken")[0]
  )).value;
  const headers = new Headers({ "X-CSRFToken": csrftoken });
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
