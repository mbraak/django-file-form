(function () {

  const findForm = element => {
    const parent = element.parentElement;
    if (!parent) {
      return null;
    }
    if (parent.tagName === "FORM") {
      return parent;
    }
    return findForm(parent);
  };
  const unique = values => Array.from(new Set(values).values());
  // eslint-disable-line @typescript-eslint/no-explicit-any

  const autoInitFileForms = () => {
    const initUploadFields = window.initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

    const forms = unique(Array.from(document.querySelectorAll(".dff-uploader")).map(findForm));
    forms.forEach(initUploadFields);
  };

  function _defineProperty$2(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  const formatBytes = (bytes, decimals) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const n = parseFloat((bytes / k ** i).toFixed(dm));
    const size = sizes[i];
    return `${n} ${size}`;
  };
  const getInputNameWithPrefix = (fieldName, prefix) => prefix ? `${prefix}-${fieldName}` : fieldName;
  const getInputNameWithoutPrefix = (fieldName, prefix) => prefix ? fieldName.slice(prefix.length + 1) : fieldName;
  const findInput = (form, fieldName, prefix) => {
    const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
    const input = form.querySelector(`[name="${inputNameWithPrefix}"]`);
    if (!input) {
      return null;
    }
    return input;
  };
  const getUploadsFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-uploads`;
  const getInputValueForFormAndPrefix = (form, fieldName, prefix) => {
    var _findInput;
    return (_findInput = findInput(form, fieldName, prefix)) === null || _findInput === void 0 ? void 0 : _findInput.value;
  };
  const getMetadataFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-metadata`;

  let BaseUpload$1 = class BaseUpload {
    constructor(_ref) {
      let {
        metadata,
        name,
        status,
        type,
        uploadIndex
      } = _ref;
      _defineProperty$2(this, "deleteStatus", void 0);
      _defineProperty$2(this, "metadata", void 0);
      _defineProperty$2(this, "name", void 0);
      _defineProperty$2(this, "progress", void 0);
      _defineProperty$2(this, "render", void 0);
      _defineProperty$2(this, "status", void 0);
      _defineProperty$2(this, "type", void 0);
      _defineProperty$2(this, "updateMetadata", void 0);
      _defineProperty$2(this, "uploadIndex", void 0);
      this.metadata = metadata || {};
      this.name = name;
      this.status = status;
      this.type = type;
      this.uploadIndex = uploadIndex;
      this.progress = 0;
      this.deleteStatus = undefined;
    }
    async abort() {
      //
    }
    async delete() {
      //
    }
    setMetadata(metadata) {
      this.metadata = metadata;
      if (this.render) {
        this.render();
      }
      if (this.updateMetadata) {
        this.updateMetadata();
      }
    }
    getInitialFile() {
      return null;
    }
  };

  function normalize(strArray) {
    var resultArray = [];
    if (strArray.length === 0) {
      return '';
    }
    if (typeof strArray[0] !== 'string') {
      throw new TypeError('Url must be a string. Received ' + strArray[0]);
    }

    // If the first part is a plain protocol, we combine it with the next part.
    if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
      var first = strArray.shift();
      strArray[0] = first + strArray[0];
    }

    // There must be two or three slashes in the file protocol, two slashes in anything else.
    if (strArray[0].match(/^file:\/\/\//)) {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
    } else {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
    }
    for (var i = 0; i < strArray.length; i++) {
      var component = strArray[i];
      if (typeof component !== 'string') {
        throw new TypeError('Url must be a string. Received ' + component);
      }
      if (component === '') {
        continue;
      }
      if (i > 0) {
        // Removing the starting slashes for each component but the first.
        component = component.replace(/^[\/]+/, '');
      }
      if (i < strArray.length - 1) {
        // Removing the ending slashes for each component but the last.
        component = component.replace(/[\/]+$/, '');
      } else {
        // For the last component we will combine multiple slashes to a single one.
        component = component.replace(/[\/]+$/, '/');
      }
      resultArray.push(component);
    }
    var str = resultArray.join('/');
    // Each input component is now separated by a single slash except the possible first plain protocol part.

    // remove trailing slash before parameters or hash
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    // replace ? in parameters with &
    var parts = str.split('?');
    str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');
    return str;
  }
  function urlJoin() {
    var input;
    if (typeof arguments[0] === 'object') {
      input = arguments[0];
    } else {
      input = [].slice.call(arguments);
    }
    return normalize(input);
  }

  const MB = 1024 * 1024;
  const abortMultipartUpload = _ref => {
    let {
      csrfToken,
      key,
      uploadId,
      endpoint
    } = _ref;
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, `?key=${filename}`);
    return fetch(url, {
      method: "delete",
      headers: headers
    }).then(response => {
      return response.json();
    });
  };
  const completeMultipartUpload = _ref2 => {
    let {
      csrfToken,
      key,
      uploadId,
      parts,
      endpoint
    } = _ref2;
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, "complete", `?key=${filename}`);
    return fetch(url, {
      method: "post",
      headers: headers,
      body: JSON.stringify({
        parts: parts
      })
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const createMultipartUpload = _ref3 => {
    let {
      csrfToken,
      endpoint,
      file,
      s3UploadDir
    } = _ref3;
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
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const getChunkSize = file => Math.ceil(file.size / 10000);
  const prepareUploadPart = _ref4 => {
    let {
      csrfToken,
      endpoint,
      key,
      number,
      uploadId
    } = _ref4;
    const filename = encodeURIComponent(key);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadId, `${number}`, `?key=${filename}`);
    return fetch(url, {
      method: "get",
      headers: headers
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const remove$1 = (arr, el) => {
    const i = arr.indexOf(el);
    if (i !== -1) {
      arr.splice(i, 1);
    }
  };

  class S3Upload extends BaseUpload$1 {
    constructor(_ref) {
      let {
        csrfToken,
        endpoint,
        file,
        s3UploadDir,
        uploadIndex
      } = _ref;
      super({
        name: file.name,
        status: "uploading",
        type: "s3",
        uploadIndex
      });
      _defineProperty$2(this, "onError", void 0);
      _defineProperty$2(this, "onProgress", void 0);
      _defineProperty$2(this, "onSuccess", void 0);
      _defineProperty$2(this, "chunkState", void 0);
      _defineProperty$2(this, "chunks", void 0);
      _defineProperty$2(this, "createdPromise", void 0);
      _defineProperty$2(this, "csrfToken", void 0);
      _defineProperty$2(this, "endpoint", void 0);
      _defineProperty$2(this, "file", void 0);
      _defineProperty$2(this, "key", void 0);
      _defineProperty$2(this, "parts", void 0);
      _defineProperty$2(this, "s3UploadDir", void 0);
      _defineProperty$2(this, "uploadId", void 0);
      _defineProperty$2(this, "uploading", void 0);
      this.csrfToken = csrfToken;
      this.endpoint = endpoint;
      this.file = file;
      this.s3UploadDir = s3UploadDir;
      this.key = null;
      this.uploadId = null;
      this.parts = [];

      // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
      // upload was created already. That also ensures that the sequencing is right
      // (so the `OP` definitely happens if the upload is created).
      //
      // This mostly exists to make `abortUpload` work well: only sending the abort request if
      // the upload was already created, and if the createMultipartUpload request is still in flight,
      // aborting it immediately after it finishes.
      this.createdPromise = Promise.reject(); // eslint-disable-line prefer-promise-reject-errors
      this.chunks = [];
      this.chunkState = [];
      this.uploading = [];
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
      this.initChunks();
      this.createdPromise.catch(() => ({})); // silence uncaught rejection warning
    }

    async abort() {
      this.uploading.slice().forEach(xhr => {
        xhr.abort();
      });
      this.uploading = [];
      await this.createdPromise;
      if (this.key && this.uploadId) {
        await abortMultipartUpload({
          csrfToken: this.csrfToken,
          endpoint: this.endpoint,
          key: this.key,
          uploadId: this.uploadId
        });
      }
    }
    async delete() {
      return Promise.resolve();
    }
    getInitialFile() {
      return {
        id: this.uploadId || "",
        name: this.key || "",
        size: this.file.size,
        original_name: this.file.name,
        type: "s3"
      };
    }
    getSize() {
      return this.file.size;
    }
    start() {
      void this.createUpload();
    }
    initChunks() {
      const chunks = [];
      const desiredChunkSize = getChunkSize(this.file);
      // at least 5MB per request, at most 10k requests
      const minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000));
      const chunkSize = Math.max(desiredChunkSize, minChunkSize);
      for (let i = 0; i < this.file.size; i += chunkSize) {
        const end = Math.min(this.file.size, i + chunkSize);
        chunks.push(this.file.slice(i, end));
      }
      this.chunks = chunks;
      this.chunkState = chunks.map(() => ({
        uploaded: 0,
        busy: false,
        done: false
      }));
    }
    createUpload() {
      this.createdPromise = createMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        file: this.file,
        s3UploadDir: this.s3UploadDir
      });
      return this.createdPromise.then(result => {
        const valid = typeof result === "object" && result && typeof result.uploadId === "string" && typeof result.key === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`.");
        }
        this.key = result.key;
        this.uploadId = result.uploadId;
        this.uploadParts();
      }).catch(err => {
        this.handleError(err);
      });
    }
    uploadParts() {
      const need = 1 - this.uploading.length;
      if (need === 0) {
        return;
      }

      // All parts are uploaded.
      if (this.chunkState.every(state => state.done)) {
        void this.completeUpload();
        return;
      }
      const candidates = [];
      for (let i = 0; i < this.chunkState.length; i++) {
        const state = this.chunkState[i];
        if (state.done || state.busy) {
          continue;
        }
        candidates.push(i);
        if (candidates.length >= need) {
          break;
        }
      }
      candidates.forEach(index => {
        void this.uploadPart(index);
      });
    }
    uploadPart(index) {
      this.chunkState[index].busy = true;
      if (!this.key || !this.uploadId) {
        return Promise.resolve();
      }
      return prepareUploadPart({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        number: index + 1,
        uploadId: this.uploadId
      }).then(result => {
        const valid = typeof result === "object" && result && typeof result.url === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`.");
        }
        return result;
      }).then(_ref2 => {
        let {
          url
        } = _ref2;
        this.uploadPartBytes(index, url);
      }, err => {
        this.handleError(err);
      });
    }
    onPartProgress(index, sent) {
      this.chunkState[index].uploaded = sent;
      if (this.onProgress) {
        const totalUploaded = this.chunkState.reduce((n, c) => n + c.uploaded, 0);
        this.onProgress(totalUploaded, this.file.size);
      }
    }
    onPartComplete(index, etag) {
      this.chunkState[index].etag = etag;
      this.chunkState[index].done = true;
      const part = {
        PartNumber: index + 1,
        ETag: etag
      };
      this.parts.push(part);
      this.uploadParts();
    }
    uploadPartBytes(index, url) {
      const body = this.chunks[index];
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.responseType = "text";
      this.uploading.push(xhr);
      xhr.upload.addEventListener("progress", ev => {
        if (!ev.lengthComputable) {
          return;
        }
        this.onPartProgress(index, ev.loaded);
      });
      xhr.addEventListener("abort", ev => {
        remove$1(this.uploading, ev.target);
        this.chunkState[index].busy = false;
      });
      xhr.addEventListener("load", ev => {
        const target = ev.target;
        remove$1(this.uploading, target);
        this.chunkState[index].busy = false;
        if (target.status < 200 || target.status >= 300) {
          this.handleError(new Error("Non 2xx"));
          return;
        }
        this.onPartProgress(index, body.size);

        // NOTE This must be allowed by CORS.
        const etag = target.getResponseHeader("ETag");
        if (etag === null) {
          this.handleError(new Error("AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."));
          return;
        }
        this.onPartComplete(index, etag);
      });
      xhr.addEventListener("error", ev => {
        remove$1(this.uploading, ev.target);
        this.chunkState[index].busy = false;
        const error = new Error("Unknown error");
        // error.source = ev.target
        this.handleError(error);
      });
      xhr.send(body);
    }
    completeUpload() {
      // Parts may not have completed uploading in sorted order, if limit > 1.
      this.parts.sort((a, b) => a.PartNumber - b.PartNumber);
      if (!this.uploadId || !this.key) {
        return Promise.resolve();
      }
      return completeMultipartUpload({
        csrfToken: this.csrfToken,
        endpoint: this.endpoint,
        key: this.key,
        uploadId: this.uploadId,
        parts: this.parts
      }).then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      }, err => {
        this.handleError(err);
      });
    }
    handleError(error) {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    }
  }

  const deleteUpload = async (url, csrfToken) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.onload = () => {
      if (xhr.status === 204) {
        resolve();
      } else {
        reject();
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.send(null);
  });

  class BaseUploadedFile extends BaseUpload$1 {
    constructor(_ref) {
      let {
        metadata,
        name,
        size,
        type,
        uploadIndex
      } = _ref;
      super({
        metadata,
        name,
        status: "done",
        type,
        uploadIndex
      });
      _defineProperty$2(this, "size", void 0);
      this.size = size;
    }
    async abort() {
      return Promise.resolve();
    }
    async delete() {
      return Promise.resolve();
    }
    getSize() {
      return this.size;
    }
  }
  class PlaceholderFile extends BaseUploadedFile {
    constructor(_ref2) {
      let {
        initialFile,
        uploadIndex
      } = _ref2;
      super({
        metadata: initialFile.metadata,
        name: initialFile.name,
        size: initialFile.size,
        type: "placeholder",
        uploadIndex
      });
      _defineProperty$2(this, "id", void 0);
      this.id = initialFile.id;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.name,
        size: this.size,
        type: "placeholder"
      };
    }
  }
  class UploadedS3File extends BaseUploadedFile {
    constructor(_ref3) {
      let {
        initialFile,
        uploadIndex
      } = _ref3;
      super({
        metadata: initialFile.metadata,
        name: initialFile.original_name || initialFile.name,
        size: initialFile.size,
        type: "uploadedS3",
        uploadIndex
      });
      _defineProperty$2(this, "id", void 0);
      _defineProperty$2(this, "key", void 0);
      this.id = initialFile.id;
      this.key = initialFile.name;
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.key,
        original_name: this.name,
        size: this.size,
        type: "s3"
      };
    }
  }
  class ExistingFile extends BaseUploadedFile {
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "existing",
        uploadIndex
      });
    }
    getInitialFile() {
      return {
        name: this.name,
        size: this.size,
        type: "existing"
      };
    }
  }
  class UploadedTusFile extends BaseUploadedFile {
    constructor(_ref4) {
      let {
        csrfToken,
        initialFile,
        uploadIndex,
        uploadUrl
      } = _ref4;
      super({
        metadata: initialFile.metadata,
        name: initialFile.name,
        size: initialFile.size,
        type: "uploadedTus",
        uploadIndex
      });
      _defineProperty$2(this, "csrfToken", void 0);
      _defineProperty$2(this, "id", void 0);
      _defineProperty$2(this, "url", void 0);
      this.csrfToken = csrfToken;
      this.id = initialFile.id;
      this.url = `${uploadUrl}${initialFile.id}`;
    }
    async delete() {
      await deleteUpload(this.url, this.csrfToken);
    }
    getInitialFile() {
      return {
        id: this.id,
        name: this.name,
        size: this.size,
        type: "tus",
        url: ""
      };
    }
  }
  class InvalidFile extends BaseUploadedFile {
    constructor(_ref5) {
      let {
        name,
        uploadIndex
      } = _ref5;
      super({
        name,
        uploadIndex,
        type: "invalid"
      });
      this.status = "invalid";
    }
  }
  const createUploadedFile = _ref6 => {
    let {
      csrfToken,
      initialFile,
      uploadIndex,
      uploadUrl
    } = _ref6;
    switch (initialFile.type) {
      case "existing":
        return new ExistingFile(initialFile, uploadIndex);
      case "placeholder":
        return new PlaceholderFile({
          initialFile,
          uploadIndex
        });
      case "s3":
        return new UploadedS3File({
          initialFile,
          uploadIndex
        });
      case "tus":
        return new UploadedTusFile({
          csrfToken,
          initialFile,
          uploadUrl,
          uploadIndex
        });
    }
  };

  /**
   *  base64.ts
   *
   *  Licensed under the BSD 3-Clause License.
   *    http://opensource.org/licenses/BSD-3-Clause
   *
   *  References:
   *    http://en.wikipedia.org/wiki/Base64
   *
   * @author Dan Kogai (https://github.com/dankogai)
   */
  const version$1 = '3.7.2';
  /**
   * @deprecated use lowercase `version`.
   */
  const VERSION = version$1;
  const _hasatob = typeof atob === 'function';
  const _hasbtoa = typeof btoa === 'function';
  const _hasBuffer = typeof Buffer === 'function';
  const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
  const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
  const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const b64chs = Array.prototype.slice.call(b64ch);
  const b64tab = ((a) => {
      let tab = {};
      a.forEach((c, i) => tab[c] = i);
      return tab;
  })(b64chs);
  const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
  const _fromCC = String.fromCharCode.bind(String);
  const _U8Afrom = typeof Uint8Array.from === 'function'
      ? Uint8Array.from.bind(Uint8Array)
      : (it, fn = (x) => x) => new Uint8Array(Array.prototype.slice.call(it, 0).map(fn));
  const _mkUriSafe = (src) => src
      .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
  const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
  /**
   * polyfill version of `btoa`
   */
  const btoaPolyfill = (bin) => {
      // console.log('polyfilled');
      let u32, c0, c1, c2, asc = '';
      const pad = bin.length % 3;
      for (let i = 0; i < bin.length;) {
          if ((c0 = bin.charCodeAt(i++)) > 255 ||
              (c1 = bin.charCodeAt(i++)) > 255 ||
              (c2 = bin.charCodeAt(i++)) > 255)
              throw new TypeError('invalid character found');
          u32 = (c0 << 16) | (c1 << 8) | c2;
          asc += b64chs[u32 >> 18 & 63]
              + b64chs[u32 >> 12 & 63]
              + b64chs[u32 >> 6 & 63]
              + b64chs[u32 & 63];
      }
      return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
  };
  /**
   * does what `window.btoa` of web browsers do.
   * @param {String} bin binary string
   * @returns {string} Base64-encoded string
   */
  const _btoa = _hasbtoa ? (bin) => btoa(bin)
      : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
          : btoaPolyfill;
  const _fromUint8Array = _hasBuffer
      ? (u8a) => Buffer.from(u8a).toString('base64')
      : (u8a) => {
          // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
          const maxargs = 0x1000;
          let strs = [];
          for (let i = 0, l = u8a.length; i < l; i += maxargs) {
              strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
          }
          return _btoa(strs.join(''));
      };
  /**
   * converts a Uint8Array to a Base64 string.
   * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
   * @returns {string} Base64 string
   */
  const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
  // This trick is found broken https://github.com/dankogai/js-base64/issues/130
  // const utob = (src: string) => unescape(encodeURIComponent(src));
  // reverting good old fationed regexp
  const cb_utob = (c) => {
      if (c.length < 2) {
          var cc = c.charCodeAt(0);
          return cc < 0x80 ? c
              : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                  + _fromCC(0x80 | (cc & 0x3f)))
                  : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                      + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                      + _fromCC(0x80 | (cc & 0x3f)));
      }
      else {
          var cc = 0x10000
              + (c.charCodeAt(0) - 0xD800) * 0x400
              + (c.charCodeAt(1) - 0xDC00);
          return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
              + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
              + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
              + _fromCC(0x80 | (cc & 0x3f)));
      }
  };
  const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  /**
   * @deprecated should have been internal use only.
   * @param {string} src UTF-8 string
   * @returns {string} UTF-16 string
   */
  const utob = (u) => u.replace(re_utob, cb_utob);
  //
  const _encode = _hasBuffer
      ? (s) => Buffer.from(s, 'utf8').toString('base64')
      : _TE
          ? (s) => _fromUint8Array(_TE.encode(s))
          : (s) => _btoa(utob(s));
  /**
   * converts a UTF-8-encoded string to a Base64 string.
   * @param {boolean} [urlsafe] if `true` make the result URL-safe
   * @returns {string} Base64 string
   */
  const encode$1 = (src, urlsafe = false) => urlsafe
      ? _mkUriSafe(_encode(src))
      : _encode(src);
  /**
   * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
   * @returns {string} Base64 string
   */
  const encodeURI = (src) => encode$1(src, true);
  // This trick is found broken https://github.com/dankogai/js-base64/issues/130
  // const btou = (src: string) => decodeURIComponent(escape(src));
  // reverting good old fationed regexp
  const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
  const cb_btou = (cccc) => {
      switch (cccc.length) {
          case 4:
              var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                  | ((0x3f & cccc.charCodeAt(1)) << 12)
                  | ((0x3f & cccc.charCodeAt(2)) << 6)
                  | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
              return (_fromCC((offset >>> 10) + 0xD800)
                  + _fromCC((offset & 0x3FF) + 0xDC00));
          case 3:
              return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
                  | ((0x3f & cccc.charCodeAt(1)) << 6)
                  | (0x3f & cccc.charCodeAt(2)));
          default:
              return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
                  | (0x3f & cccc.charCodeAt(1)));
      }
  };
  /**
   * @deprecated should have been internal use only.
   * @param {string} src UTF-16 string
   * @returns {string} UTF-8 string
   */
  const btou = (b) => b.replace(re_btou, cb_btou);
  /**
   * polyfill version of `atob`
   */
  const atobPolyfill = (asc) => {
      // console.log('polyfilled');
      asc = asc.replace(/\s+/g, '');
      if (!b64re.test(asc))
          throw new TypeError('malformed base64.');
      asc += '=='.slice(2 - (asc.length & 3));
      let u24, bin = '', r1, r2;
      for (let i = 0; i < asc.length;) {
          u24 = b64tab[asc.charAt(i++)] << 18
              | b64tab[asc.charAt(i++)] << 12
              | (r1 = b64tab[asc.charAt(i++)]) << 6
              | (r2 = b64tab[asc.charAt(i++)]);
          bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
              : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                  : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
      }
      return bin;
  };
  /**
   * does what `window.atob` of web browsers do.
   * @param {String} asc Base64-encoded string
   * @returns {string} binary string
   */
  const _atob = _hasatob ? (asc) => atob(_tidyB64(asc))
      : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
          : atobPolyfill;
  //
  const _toUint8Array = _hasBuffer
      ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
      : (a) => _U8Afrom(_atob(a), c => c.charCodeAt(0));
  /**
   * converts a Base64 string to a Uint8Array.
   */
  const toUint8Array = (a) => _toUint8Array(_unURI(a));
  //
  const _decode = _hasBuffer
      ? (a) => Buffer.from(a, 'base64').toString('utf8')
      : _TD
          ? (a) => _TD.decode(_toUint8Array(a))
          : (a) => btou(_atob(a));
  const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
  /**
   * converts a Base64 string to a UTF-8 string.
   * @param {String} src Base64 string.  Both normal and URL-safe are supported
   * @returns {string} UTF-8 string
   */
  const decode$1 = (src) => _decode(_unURI(src));
  /**
   * check if a value is a valid Base64 string
   * @param {String} src a value to check
    */
  const isValid = (src) => {
      if (typeof src !== 'string')
          return false;
      const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
      return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
  };
  //
  const _noEnum = (v) => {
      return {
          value: v, enumerable: false, writable: true, configurable: true
      };
  };
  /**
   * extend String.prototype with relevant methods
   */
  const extendString = function () {
      const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
      _add('fromBase64', function () { return decode$1(this); });
      _add('toBase64', function (urlsafe) { return encode$1(this, urlsafe); });
      _add('toBase64URI', function () { return encode$1(this, true); });
      _add('toBase64URL', function () { return encode$1(this, true); });
      _add('toUint8Array', function () { return toUint8Array(this); });
  };
  /**
   * extend Uint8Array.prototype with relevant methods
   */
  const extendUint8Array = function () {
      const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
      _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
      _add('toBase64URI', function () { return fromUint8Array(this, true); });
      _add('toBase64URL', function () { return fromUint8Array(this, true); });
  };
  /**
   * extend Builtin prototypes with relevant methods
   */
  const extendBuiltins = () => {
      extendString();
      extendUint8Array();
  };
  const gBase64 = {
      version: version$1,
      VERSION: VERSION,
      atob: _atob,
      atobPolyfill: atobPolyfill,
      btoa: _btoa,
      btoaPolyfill: btoaPolyfill,
      fromBase64: decode$1,
      toBase64: encode$1,
      encode: encode$1,
      encodeURI: encodeURI,
      encodeURL: encodeURI,
      utob: utob,
      btou: btou,
      decode: decode$1,
      isValid: isValid,
      fromUint8Array: fromUint8Array,
      toUint8Array: toUint8Array,
      extendString: extendString,
      extendUint8Array: extendUint8Array,
      extendBuiltins: extendBuiltins,
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  /**
   * Check if we're required to add a port number.
   *
   * @see https://url.spec.whatwg.org/#default-port
   * @param {Number|String} port Port number we need to check
   * @param {String} protocol Protocol we need to check against.
   * @returns {Boolean} Is it a default port for the given protocol
   * @api private
   */
  var requiresPort = function required(port, protocol) {
    protocol = protocol.split(':')[0];
    port = +port;
    if (!port) return false;
    switch (protocol) {
      case 'http':
      case 'ws':
        return port !== 80;
      case 'https':
      case 'wss':
        return port !== 443;
      case 'ftp':
        return port !== 21;
      case 'gopher':
        return port !== 70;
      case 'file':
        return false;
    }
    return port !== 0;
  };

  var querystringify$1 = {};

  var has$1 = Object.prototype.hasOwnProperty,
    undef;

  /**
   * Decode a URI encoded string.
   *
   * @param {String} input The URI encoded string.
   * @returns {String|Null} The decoded string.
   * @api private
   */
  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch (e) {
      return null;
    }
  }

  /**
   * Attempts to encode a given input.
   *
   * @param {String} input The string that needs to be encoded.
   * @returns {String|Null} The encoded string.
   * @api private
   */
  function encode(input) {
    try {
      return encodeURIComponent(input);
    } catch (e) {
      return null;
    }
  }

  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */
  function querystring(query) {
    var parser = /([^=?#&]+)=?([^&]*)/g,
      result = {},
      part;
    while (part = parser.exec(query)) {
      var key = decode(part[1]),
        value = decode(part[2]);

      //
      // Prevent overriding of existing properties. This ensures that build-in
      // methods like `toString` or __proto__ are not overriden by malicious
      // querystrings.
      //
      // In the case if failed decoding, we want to omit the key/value pairs
      // from the result.
      //
      if (key === null || value === null || key in result) continue;
      result[key] = value;
    }
    return result;
  }

  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */
  function querystringify(obj, prefix) {
    prefix = prefix || '';
    var pairs = [],
      value,
      key;

    //
    // Optionally prefix with a '?' if needed
    //
    if ('string' !== typeof prefix) prefix = '?';
    for (key in obj) {
      if (has$1.call(obj, key)) {
        value = obj[key];

        //
        // Edge cases where we actually want to encode the value to an empty
        // string instead of the stringified value.
        //
        if (!value && (value === null || value === undef || isNaN(value))) {
          value = '';
        }
        key = encode(key);
        value = encode(value);

        //
        // If we failed to encode the strings, we should bail out as we don't
        // want to add invalid strings to the query.
        //
        if (key === null || value === null) continue;
        pairs.push(key + '=' + value);
      }
    }
    return pairs.length ? prefix + pairs.join('&') : '';
  }

  //
  // Expose the module.
  //
  querystringify$1.stringify = querystringify;
  querystringify$1.parse = querystring;

  var required = requiresPort,
    qs = querystringify$1,
    controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,
    CRHTLF = /[\n\r\t]/g,
    slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//,
    port = /:\d+$/,
    protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,
    windowsDriveLetter = /^[a-zA-Z]:/;

  /**
   * Remove control characters and whitespace from the beginning of a string.
   *
   * @param {Object|String} str String to trim.
   * @returns {String} A new string representing `str` stripped of control
   *     characters and whitespace from its beginning.
   * @public
   */
  function trimLeft(str) {
    return (str ? str : '').toString().replace(controlOrWhitespace, '');
  }

  /**
   * These are the parse rules for the URL parser, it informs the parser
   * about:
   *
   * 0. The char it Needs to parse, if it's a string it should be done using
   *    indexOf, RegExp using exec and NaN means set as current value.
   * 1. The property we should set when parsing this value.
   * 2. Indication if it's backwards or forward parsing, when set as number it's
   *    the value of extra chars that should be split off.
   * 3. Inherit from location if non existing in the parser.
   * 4. `toLowerCase` the resulting value.
   */
  var rules = [['#', 'hash'],
  // Extract from the back.
  ['?', 'query'],
  // Extract from the back.
  function sanitize(address, url) {
    // Sanitize what is left of the address
    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  }, ['/', 'pathname'],
  // Extract from the back.
  ['@', 'auth', 1],
  // Extract from the front.
  [NaN, 'host', undefined, 1, 1],
  // Set left over value.
  [/:(\d*)$/, 'port', undefined, 1],
  // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1] // Set left over.
  ];

  /**
   * These properties should not be copied or inherited from. This is only needed
   * for all non blob URL's as a blob URL does not include a hash, only the
   * origin.
   *
   * @type {Object}
   * @private
   */
  var ignore = {
    hash: 1,
    query: 1
  };

  /**
   * The location object differs when your code is loaded through a normal page,
   * Worker or through a worker using a blob. And with the blobble begins the
   * trouble as the location object will contain the URL of the blob, not the
   * location of the page where our code is loaded in. The actual origin is
   * encoded in the `pathname` so we can thankfully generate a good "default"
   * location from it so we can generate proper relative URL's again.
   *
   * @param {Object|String} loc Optional default location object.
   * @returns {Object} lolcation object.
   * @public
   */
  function lolcation(loc) {
    var globalVar;
    if (typeof window !== 'undefined') globalVar = window;else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;else if (typeof self !== 'undefined') globalVar = self;else globalVar = {};
    var location = globalVar.location || {};
    loc = loc || location;
    var finaldestination = {},
      type = typeof loc,
      key;
    if ('blob:' === loc.protocol) {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if ('string' === type) {
      finaldestination = new Url(loc, {});
      for (key in ignore) delete finaldestination[key];
    } else if ('object' === type) {
      for (key in loc) {
        if (key in ignore) continue;
        finaldestination[key] = loc[key];
      }
      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }
    return finaldestination;
  }

  /**
   * Check whether a protocol scheme is special.
   *
   * @param {String} The protocol scheme of the URL
   * @return {Boolean} `true` if the protocol scheme is special, else `false`
   * @private
   */
  function isSpecial(scheme) {
    return scheme === 'file:' || scheme === 'ftp:' || scheme === 'http:' || scheme === 'https:' || scheme === 'ws:' || scheme === 'wss:';
  }

  /**
   * @typedef ProtocolExtract
   * @type Object
   * @property {String} protocol Protocol matched in the URL, in lowercase.
   * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
   * @property {String} rest Rest of the URL that is not part of the protocol.
   */

  /**
   * Extract protocol information from a URL with/without double slash ("//").
   *
   * @param {String} address URL we want to extract from.
   * @param {Object} location
   * @return {ProtocolExtract} Extracted information.
   * @private
   */
  function extractProtocol(address, location) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, '');
    location = location || {};
    var match = protocolre.exec(address);
    var protocol = match[1] ? match[1].toLowerCase() : '';
    var forwardSlashes = !!match[2];
    var otherSlashes = !!match[3];
    var slashesCount = 0;
    var rest;
    if (forwardSlashes) {
      if (otherSlashes) {
        rest = match[2] + match[3] + match[4];
        slashesCount = match[2].length + match[3].length;
      } else {
        rest = match[2] + match[4];
        slashesCount = match[2].length;
      }
    } else {
      if (otherSlashes) {
        rest = match[3] + match[4];
        slashesCount = match[3].length;
      } else {
        rest = match[4];
      }
    }
    if (protocol === 'file:') {
      if (slashesCount >= 2) {
        rest = rest.slice(2);
      }
    } else if (isSpecial(protocol)) {
      rest = match[4];
    } else if (protocol) {
      if (forwardSlashes) {
        rest = rest.slice(2);
      }
    } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
      rest = match[4];
    }
    return {
      protocol: protocol,
      slashes: forwardSlashes || isSpecial(protocol),
      slashesCount: slashesCount,
      rest: rest
    };
  }

  /**
   * Resolve a relative URL pathname against a base URL pathname.
   *
   * @param {String} relative Pathname of the relative URL.
   * @param {String} base Pathname of the base URL.
   * @return {String} Resolved pathname.
   * @private
   */
  function resolve(relative, base) {
    if (relative === '') return base;
    var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/')),
      i = path.length,
      last = path[i - 1],
      unshift = false,
      up = 0;
    while (i--) {
      if (path[i] === '.') {
        path.splice(i, 1);
      } else if (path[i] === '..') {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0) unshift = true;
        path.splice(i, 1);
        up--;
      }
    }
    if (unshift) path.unshift('');
    if (last === '.' || last === '..') path.push('');
    return path.join('/');
  }

  /**
   * The actual URL instance. Instead of returning an object we've opted-in to
   * create an actual constructor as it's much more memory efficient and
   * faster and it pleases my OCD.
   *
   * It is worth noting that we should not use `URL` as class name to prevent
   * clashes with the global URL instance that got introduced in browsers.
   *
   * @constructor
   * @param {String} address URL we want to parse.
   * @param {Object|String} [location] Location defaults for relative paths.
   * @param {Boolean|Function} [parser] Parser for the query string.
   * @private
   */
  function Url(address, location, parser) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, '');
    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }
    var relative,
      extracted,
      parse,
      instruction,
      index,
      key,
      instructions = rules.slice(),
      type = typeof location,
      url = this,
      i = 0;

    //
    // The following if statements allows this module two have compatibility with
    // 2 different API:
    //
    // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
    //    where the boolean indicates that the query string should also be parsed.
    //
    // 2. The `URL` interface of the browser which accepts a URL, object as
    //    arguments. The supplied object will be used as default values / fall-back
    //    for relative paths.
    //
    if ('object' !== type && 'string' !== type) {
      parser = location;
      location = null;
    }
    if (parser && 'function' !== typeof parser) parser = qs.parse;
    location = lolcation(location);

    //
    // Extract protocol information before running the instructions.
    //
    extracted = extractProtocol(address || '', location);
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || '';
    address = extracted.rest;

    //
    // When the authority component is absent the URL starts with a path
    // component.
    //
    if (extracted.protocol === 'file:' && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
      instructions[3] = [/(.*)/, 'pathname'];
    }
    for (; i < instructions.length; i++) {
      instruction = instructions[i];
      if (typeof instruction === 'function') {
        address = instruction(address, url);
        continue;
      }
      parse = instruction[0];
      key = instruction[1];
      if (parse !== parse) {
        url[key] = address;
      } else if ('string' === typeof parse) {
        index = parse === '@' ? address.lastIndexOf(parse) : address.indexOf(parse);
        if (~index) {
          if ('number' === typeof instruction[2]) {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if (index = parse.exec(address)) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }
      url[key] = url[key] || (relative && instruction[3] ? location[key] || '' : '');

      //
      // Hostname, host and protocol should be lowercased so they can be used to
      // create a proper `origin`.
      //
      if (instruction[4]) url[key] = url[key].toLowerCase();
    }

    //
    // Also parse the supplied query string in to an object. If we're supplied
    // with a custom parser as function use that instead of the default build-in
    // parser.
    //
    if (parser) url.query = parser(url.query);

    //
    // If the URL is relative, resolve the pathname against the base URL.
    //
    if (relative && location.slashes && url.pathname.charAt(0) !== '/' && (url.pathname !== '' || location.pathname !== '')) {
      url.pathname = resolve(url.pathname, location.pathname);
    }

    //
    // Default to a / for pathname if none exists. This normalizes the URL
    // to always have a /
    //
    if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
      url.pathname = '/' + url.pathname;
    }

    //
    // We should not add port numbers if they are already the default port number
    // for a given protocol. As the host also contains the port number we're going
    // override it with the hostname which contains no port number.
    //
    if (!required(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = '';
    }

    //
    // Parse down the `auth` for the username and password.
    //
    url.username = url.password = '';
    if (url.auth) {
      index = url.auth.indexOf(':');
      if (~index) {
        url.username = url.auth.slice(0, index);
        url.username = encodeURIComponent(decodeURIComponent(url.username));
        url.password = url.auth.slice(index + 1);
        url.password = encodeURIComponent(decodeURIComponent(url.password));
      } else {
        url.username = encodeURIComponent(decodeURIComponent(url.auth));
      }
      url.auth = url.password ? url.username + ':' + url.password : url.username;
    }
    url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host ? url.protocol + '//' + url.host : 'null';

    //
    // The href is just the compiled result.
    //
    url.href = url.toString();
  }

  /**
   * This is convenience method for changing properties in the URL instance to
   * insure that they all propagate correctly.
   *
   * @param {String} part          Property we need to adjust.
   * @param {Mixed} value          The newly assigned value.
   * @param {Boolean|Function} fn  When setting the query, it will be the function
   *                               used to parse the query.
   *                               When setting the protocol, double slash will be
   *                               removed from the final url if it is true.
   * @returns {URL} URL instance for chaining.
   * @public
   */
  function set$1(part, value, fn) {
    var url = this;
    switch (part) {
      case 'query':
        if ('string' === typeof value && value.length) {
          value = (fn || qs.parse)(value);
        }
        url[part] = value;
        break;
      case 'port':
        url[part] = value;
        if (!required(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = '';
        } else if (value) {
          url.host = url.hostname + ':' + value;
        }
        break;
      case 'hostname':
        url[part] = value;
        if (url.port) value += ':' + url.port;
        url.host = value;
        break;
      case 'host':
        url[part] = value;
        if (port.test(value)) {
          value = value.split(':');
          url.port = value.pop();
          url.hostname = value.join(':');
        } else {
          url.hostname = value;
          url.port = '';
        }
        break;
      case 'protocol':
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;
      case 'pathname':
      case 'hash':
        if (value) {
          var char = part === 'pathname' ? '/' : '#';
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;
      case 'username':
      case 'password':
        url[part] = encodeURIComponent(value);
        break;
      case 'auth':
        var index = value.indexOf(':');
        if (~index) {
          url.username = value.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = value.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(value));
        }
    }
    for (var i = 0; i < rules.length; i++) {
      var ins = rules[i];
      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }
    url.auth = url.password ? url.username + ':' + url.password : url.username;
    url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host ? url.protocol + '//' + url.host : 'null';
    url.href = url.toString();
    return url;
  }

  /**
   * Transform the properties back in to a valid and full URL string.
   *
   * @param {Function} stringify Optional query stringify function.
   * @returns {String} Compiled version of the URL.
   * @public
   */
  function toString$2(stringify) {
    if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
    var query,
      url = this,
      host = url.host,
      protocol = url.protocol;
    if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
    var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? '//' : '');
    if (url.username) {
      result += url.username;
      if (url.password) result += ':' + url.password;
      result += '@';
    } else if (url.password) {
      result += ':' + url.password;
      result += '@';
    } else if (url.protocol !== 'file:' && isSpecial(url.protocol) && !host && url.pathname !== '/') {
      //
      // Add back the empty userinfo, otherwise the original invalid URL
      // might be transformed into a valid one with `url.pathname` as host.
      //
      result += '@';
    }

    //
    // Trailing colon is removed from `url.host` when it is parsed. If it still
    // ends with a colon, then add back the trailing colon that was removed. This
    // prevents an invalid URL from being transformed into a valid one.
    //
    if (host[host.length - 1] === ':' || port.test(url.hostname) && !url.port) {
      host += ':';
    }
    result += host + url.pathname;
    query = 'object' === typeof url.query ? stringify(url.query) : url.query;
    if (query) result += '?' !== query.charAt(0) ? '?' + query : query;
    if (url.hash) result += url.hash;
    return result;
  }
  Url.prototype = {
    set: set$1,
    toString: toString$2
  };

  //
  // Expose the URL parser and some additional properties that might be useful for
  // others or testing.
  //
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = qs;
  var urlParse = Url;

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof$1(obj);
  }
  function _defineProperties$8(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$8(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$8(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$8(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _classCallCheck$8(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _inherits$1(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf$1(subClass, superClass);
  }
  function _createSuper$1(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct$1();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf$1(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf$1(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn$1(this, result);
    };
  }
  function _possibleConstructorReturn$1(self, call) {
    if (call && (_typeof$1(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized$1(self);
  }
  function _assertThisInitialized$1(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;
      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf$1(this).constructor);
      }
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf$1(Wrapper, Class);
    };
    return _wrapNativeSuper(Class);
  }
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct$1()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf$1(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
  }
  function _isNativeReflectConstruct$1() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
  function _setPrototypeOf$1(o, p) {
    _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf$1(o, p);
  }
  function _getPrototypeOf$1(o) {
    _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf$1(o);
  }
  var DetailedError = /*#__PURE__*/function (_Error) {
    _inherits$1(DetailedError, _Error);
    var _super = _createSuper$1(DetailedError);
    function DetailedError(message) {
      var _this;
      var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      _classCallCheck$8(this, DetailedError);
      _this = _super.call(this, message);
      _this.originalRequest = req;
      _this.originalResponse = res;
      _this.causingError = causingErr;
      if (causingErr != null) {
        message += ", caused by ".concat(causingErr.toString());
      }
      if (req != null) {
        var requestId = req.getHeader('X-Request-ID') || 'n/a';
        var method = req.getMethod();
        var url = req.getURL();
        var status = res ? res.getStatus() : 'n/a';
        var body = res ? res.getBody() || '' : 'n/a';
        message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
      }
      _this.message = message;
      return _this;
    }
    return _createClass$8(DetailedError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));

  /* eslint no-console: "off" */
  function log(msg) {
    return;
  }

  /**
   * Generate a UUID v4 based on random numbers. We intentioanlly use the less
   * secure Math.random function here since the more secure crypto.getRandomNumbers
   * is not available on all platforms.
   * This is not a problem for us since we use the UUID only for generating a
   * request ID, so we can correlate server logs to client errors.
   *
   * This function is taken from following site:
   * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
   *
   * @return {string} The generate UUID
   */
  function uuid() {
    /* eslint-disable no-bitwise */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function ownKeys$1(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread$1(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty$1(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck$7(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$7(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$7(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$7(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$7(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var defaultOptions$1 = {
    endpoint: null,
    uploadUrl: null,
    metadata: {},
    fingerprint: null,
    uploadSize: null,
    onProgress: null,
    onChunkComplete: null,
    onSuccess: null,
    onError: null,
    _onUploadUrlAvailable: null,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    onBeforeRequest: null,
    onAfterResponse: null,
    onShouldRetry: null,
    chunkSize: Infinity,
    retryDelays: [0, 1000, 3000, 5000],
    parallelUploads: 1,
    parallelUploadBoundaries: null,
    storeFingerprintForResuming: true,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
    urlStorage: null,
    fileReader: null,
    httpStack: null
  };
  var BaseUpload = /*#__PURE__*/function () {
    function BaseUpload(file, options) {
      _classCallCheck$7(this, BaseUpload);

      // Warn about removed options from previous versions
      if ('resume' in options) {
        console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.'); // eslint-disable-line no-console
      } // The default options will already be added from the wrapper classes.

      this.options = options; // Cast chunkSize to integer

      this.options.chunkSize = Number(this.options.chunkSize); // The storage module used to store URLs

      this._urlStorage = this.options.urlStorage; // The underlying File/Blob object

      this.file = file; // The URL against which the file will be uploaded

      this.url = null; // The underlying request object for the current PATCH request

      this._req = null; // The fingerpinrt for the current file (set after start())

      this._fingerprint = null; // The key that the URL storage returned when saving an URL with a fingerprint,

      this._urlStorageKey = null; // The offset used in the current PATCH request

      this._offset = null; // True if the current PATCH request has been aborted

      this._aborted = false; // The file's size in bytes

      this._size = null; // The Source object which will wrap around the given file and provides us
      // with a unified interface for getting its size and slice chunks from its
      // content allowing us to easily handle Files, Blobs, Buffers and Streams.

      this._source = null; // The current count of attempts which have been made. Zero indicates none.

      this._retryAttempt = 0; // The timeout's ID which is used to delay the next retry

      this._retryTimeout = null; // The offset of the remote upload before the latest attempt was started.

      this._offsetBeforeRetry = 0; // An array of BaseUpload instances which are used for uploading the different
      // parts, if the parallelUploads option is used.

      this._parallelUploads = null; // An array of upload URLs which are used for uploading the different
      // parts, if the parallelUploads option is used.

      this._parallelUploadUrls = null;
    }
    /**
     * Use the Termination extension to delete an upload from the server by sending a DELETE
     * request to the specified upload URL. This is only possible if the server supports the
     * Termination extension. If the `options.retryDelays` property is set, the method will
     * also retry if an error ocurrs.
     *
     * @param {String} url The upload's URL which will be terminated.
     * @param {object} options Optional options for influencing HTTP requests.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */

    _createClass$7(BaseUpload, [{
      key: "findPreviousUploads",
      value: function findPreviousUploads() {
        var _this = this;
        return this.options.fingerprint(this.file, this.options).then(function (fingerprint) {
          return _this._urlStorage.findUploadsByFingerprint(fingerprint);
        });
      }
    }, {
      key: "resumeFromPreviousUpload",
      value: function resumeFromPreviousUpload(previousUpload) {
        this.url = previousUpload.uploadUrl || null;
        this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
        this._urlStorageKey = previousUpload.urlStorageKey;
      }
    }, {
      key: "start",
      value: function start() {
        var _this2 = this;
        var file = this.file;
        if (!file) {
          this._emitError(new Error('tus: no file or stream to upload provided'));
          return;
        }
        if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
          this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));
          return;
        }
        var retryDelays = this.options.retryDelays;
        if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
          this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));
          return;
        }
        if (this.options.parallelUploads > 1) {
          // Test which options are incompatible with parallel uploads.
          for (var _i = 0, _arr = ['uploadUrl', 'uploadSize', 'uploadLengthDeferred']; _i < _arr.length; _i++) {
            var optionName = _arr[_i];
            if (this.options[optionName]) {
              this._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
              return;
            }
          }
        }
        if (this.options.parallelUploadBoundaries) {
          if (this.options.parallelUploads <= 1) {
            this._emitError(new Error('tus: cannot use the `parallelUploadBoundaries` option when `parallelUploads` is disabled'));
            return;
          }
          if (this.options.parallelUploads !== this.options.parallelUploadBoundaries.length) {
            this._emitError(new Error('tus: the `parallelUploadBoundaries` must have the same length as the value of `parallelUploads`'));
            return;
          }
        }
        this.options.fingerprint(file, this.options).then(function (fingerprint) {
          _this2._fingerprint = fingerprint;
          if (_this2._source) {
            return _this2._source;
          }
          return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
        }).then(function (source) {
          _this2._source = source; // First, we look at the uploadLengthDeferred option.
          // Next, we check if the caller has supplied a manual upload size.
          // Finally, we try to use the calculated size from the source object.

          if (_this2.options.uploadLengthDeferred) {
            _this2._size = null;
          } else if (_this2.options.uploadSize != null) {
            _this2._size = Number(_this2.options.uploadSize);
            if (Number.isNaN(_this2._size)) {
              _this2._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));
              return;
            }
          } else {
            _this2._size = _this2._source.size;
            if (_this2._size == null) {
              _this2._emitError(new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option"));
              return;
            }
          } // If the upload was configured to use multiple requests or if we resume from
          // an upload which used multiple requests, we start a parallel upload.

          if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
            _this2._startParallelUpload();
          } else {
            _this2._startSingleUpload();
          }
        })["catch"](function (err) {
          _this2._emitError(err);
        });
      }
      /**
       * Initiate the uploading procedure for a parallelized upload, where one file is split into
       * multiple request which are run in parallel.
       *
       * @api private
       */
    }, {
      key: "_startParallelUpload",
      value: function _startParallelUpload() {
        var _this$options$paralle,
          _this3 = this;
        var totalSize = this._size;
        var totalProgress = 0;
        this._parallelUploads = [];
        var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads; // The input file will be split into multiple slices which are uploaded in separate
        // requests. Here we get the start and end position for the slices.

        var parts = (_this$options$paralle = this.options.parallelUploadBoundaries) !== null && _this$options$paralle !== void 0 ? _this$options$paralle : splitSizeIntoParts(this._source.size, partCount); // Attach URLs from previous uploads, if available.

        if (this._parallelUploadUrls) {
          parts.forEach(function (part, index) {
            part.uploadUrl = _this3._parallelUploadUrls[index] || null;
          });
        } // Create an empty list for storing the upload URLs

        this._parallelUploadUrls = new Array(parts.length); // Generate a promise for each slice that will be resolve if the respective
        // upload is completed.

        var uploads = parts.map(function (part, index) {
          var lastPartProgress = 0;
          return _this3._source.slice(part.start, part.end).then(function (_ref) {
            var value = _ref.value;
            return new Promise(function (resolve, reject) {
              // Merge with the user supplied options but overwrite some values.
              var options = _objectSpread$1(_objectSpread$1({}, _this3.options), {}, {
                // If available, the partial upload should be resumed from a previous URL.
                uploadUrl: part.uploadUrl || null,
                // We take manually care of resuming for partial uploads, so they should
                // not be stored in the URL storage.
                storeFingerprintForResuming: false,
                removeFingerprintOnSuccess: false,
                // Reset the parallelUploads option to not cause recursion.
                parallelUploads: 1,
                // Reset this option as we are not doing a parallel upload.
                parallelUploadBoundaries: null,
                metadata: {},
                // Add the header to indicate the this is a partial upload.
                headers: _objectSpread$1(_objectSpread$1({}, _this3.options.headers), {}, {
                  'Upload-Concat': 'partial'
                }),
                // Reject or resolve the promise if the upload errors or completes.
                onSuccess: resolve,
                onError: reject,
                // Based in the progress for this partial upload, calculate the progress
                // for the entire final upload.
                onProgress: function onProgress(newPartProgress) {
                  totalProgress = totalProgress - lastPartProgress + newPartProgress;
                  lastPartProgress = newPartProgress;
                  _this3._emitProgress(totalProgress, totalSize);
                },
                // Wait until every partial upload has an upload URL, so we can add
                // them to the URL storage.
                _onUploadUrlAvailable: function _onUploadUrlAvailable() {
                  _this3._parallelUploadUrls[index] = upload.url; // Test if all uploads have received an URL

                  if (_this3._parallelUploadUrls.filter(function (u) {
                    return Boolean(u);
                  }).length === parts.length) {
                    _this3._saveUploadInUrlStorage();
                  }
                }
              });
              var upload = new BaseUpload(value, options);
              upload.start(); // Store the upload in an array, so we can later abort them if necessary.

              _this3._parallelUploads.push(upload);
            });
          });
        });
        var req; // Wait until all partial uploads are finished and we can send the POST request for
        // creating the final upload.

        Promise.all(uploads).then(function () {
          req = _this3._openRequest('POST', _this3.options.endpoint);
          req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' '))); // Add metadata if values have been added

          var metadata = encodeMetadata(_this3.options.metadata);
          if (metadata !== '') {
            req.setHeader('Upload-Metadata', metadata);
          }
          return _this3._sendRequest(req, null);
        }).then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this3._emitHttpError(req, res, 'tus: unexpected response while creating upload');
            return;
          }
          var location = res.getHeader('Location');
          if (location == null) {
            _this3._emitHttpError(req, res, 'tus: invalid or missing Location header');
            return;
          }
          _this3.url = resolveUrl(_this3.options.endpoint, location);
          log("Created upload at ".concat(_this3.url));
          _this3._emitSuccess();
        })["catch"](function (err) {
          _this3._emitError(err);
        });
      }
      /**
       * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
       * uploaded in a sequential matter.
       *
       * @api private
       */
    }, {
      key: "_startSingleUpload",
      value: function _startSingleUpload() {
        // Reset the aborted flag when the upload is started or else the
        // _performUpload will stop before sending a request if the upload has been
        // aborted previously.
        this._aborted = false; // The upload had been started previously and we should reuse this URL.

        if (this.url != null) {
          log("Resuming upload from previous URL: ".concat(this.url));
          this._resumeUpload();
          return;
        } // A URL has manually been specified, so we try to resume

        if (this.options.uploadUrl != null) {
          log("Resuming upload from provided URL: ".concat(this.options.uploadUrl));
          this.url = this.options.uploadUrl;
          this._resumeUpload();
          return;
        } // An upload has not started for the file yet, so we start a new one
        this._createUpload();
      }
      /**
       * Abort any running request and stop the current upload. After abort is called, no event
       * handler will be invoked anymore. You can use the `start` method to resume the upload
       * again.
       * If `shouldTerminate` is true, the `terminate` function will be called to remove the
       * current upload from the server.
       *
       * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
       * @return {Promise} The Promise will be resolved/rejected when the requests finish.
       */
    }, {
      key: "abort",
      value: function abort(shouldTerminate) {
        var _this4 = this;

        // Stop any parallel partial uploads, that have been started in _startParallelUploads.
        if (this._parallelUploads != null) {
          this._parallelUploads.forEach(function (upload) {
            upload.abort(shouldTerminate);
          });
        } // Stop any current running request.

        if (this._req !== null) {
          this._req.abort(); // Note: We do not close the file source here, so the user can resume in the future.
        }

        this._aborted = true; // Stop any timeout used for initiating a retry.

        if (this._retryTimeout != null) {
          clearTimeout(this._retryTimeout);
          this._retryTimeout = null;
        }
        if (!shouldTerminate || this.url == null) {
          return Promise.resolve();
        }
        return BaseUpload.terminate(this.url, this.options) // Remove entry from the URL storage since the upload URL is no longer valid.
        .then(function () {
          return _this4._removeFromUrlStorage();
        });
      }
    }, {
      key: "_emitHttpError",
      value: function _emitHttpError(req, res, message, causingErr) {
        this._emitError(new DetailedError(message, causingErr, req, res));
      }
    }, {
      key: "_emitError",
      value: function _emitError(err) {
        var _this5 = this;

        // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.
        if (this._aborted) return; // Check if we should retry, when enabled, before sending the error to the user.

        if (this.options.retryDelays != null) {
          // We will reset the attempt counter if
          // - we were already able to connect to the server (offset != null) and
          // - we were able to upload a small chunk of data to the server
          var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
          if (shouldResetDelays) {
            this._retryAttempt = 0;
          }
          if (shouldRetry(err, this._retryAttempt, this.options)) {
            var delay = this.options.retryDelays[this._retryAttempt++];
            this._offsetBeforeRetry = this._offset;
            this._retryTimeout = setTimeout(function () {
              _this5.start();
            }, delay);
            return;
          }
        }
        if (typeof this.options.onError === 'function') {
          this.options.onError(err);
        } else {
          throw err;
        }
      }
      /**
       * Publishes notification if the upload has been successfully completed.
       *
       * @api private
       */
    }, {
      key: "_emitSuccess",
      value: function _emitSuccess() {
        if (this.options.removeFingerprintOnSuccess) {
          // Remove stored fingerprint and corresponding endpoint. This causes
          // new uploads of the same file to be treated as a different file.
          this._removeFromUrlStorage();
        }
        if (typeof this.options.onSuccess === 'function') {
          this.options.onSuccess();
        }
      }
      /**
       * Publishes notification when data has been sent to the server. This
       * data may not have been accepted by the server yet.
       *
       * @param {number} bytesSent  Number of bytes sent to the server.
       * @param {number} bytesTotal Total number of bytes to be sent to the server.
       * @api private
       */
    }, {
      key: "_emitProgress",
      value: function _emitProgress(bytesSent, bytesTotal) {
        if (typeof this.options.onProgress === 'function') {
          this.options.onProgress(bytesSent, bytesTotal);
        }
      }
      /**
       * Publishes notification when a chunk of data has been sent to the server
       * and accepted by the server.
       * @param {number} chunkSize  Size of the chunk that was accepted by the server.
       * @param {number} bytesAccepted Total number of bytes that have been
       *                                accepted by the server.
       * @param {number} bytesTotal Total number of bytes to be sent to the server.
       * @api private
       */
    }, {
      key: "_emitChunkComplete",
      value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
        if (typeof this.options.onChunkComplete === 'function') {
          this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
        }
      }
      /**
       * Create a new upload using the creation extension by sending a POST
       * request to the endpoint. After successful creation the file will be
       * uploaded
       *
       * @api private
       */
    }, {
      key: "_createUpload",
      value: function _createUpload() {
        var _this6 = this;
        if (!this.options.endpoint) {
          this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));
          return;
        }
        var req = this._openRequest('POST', this.options.endpoint);
        if (this.options.uploadLengthDeferred) {
          req.setHeader('Upload-Defer-Length', 1);
        } else {
          req.setHeader('Upload-Length', this._size);
        } // Add metadata if values have been added

        var metadata = encodeMetadata(this.options.metadata);
        if (metadata !== '') {
          req.setHeader('Upload-Metadata', metadata);
        }
        var promise;
        if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
          this._offset = 0;
          promise = this._addChunkToRequest(req);
        } else {
          promise = this._sendRequest(req, null);
        }
        promise.then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this6._emitHttpError(req, res, 'tus: unexpected response while creating upload');
            return;
          }
          var location = res.getHeader('Location');
          if (location == null) {
            _this6._emitHttpError(req, res, 'tus: invalid or missing Location header');
            return;
          }
          _this6.url = resolveUrl(_this6.options.endpoint, location);
          log("Created upload at ".concat(_this6.url));
          if (typeof _this6.options._onUploadUrlAvailable === 'function') {
            _this6.options._onUploadUrlAvailable();
          }
          if (_this6._size === 0) {
            // Nothing to upload and file was successfully created
            _this6._emitSuccess();
            _this6._source.close();
            return;
          }
          _this6._saveUploadInUrlStorage().then(function () {
            if (_this6.options.uploadDataDuringCreation) {
              _this6._handleUploadResponse(req, res);
            } else {
              _this6._offset = 0;
              _this6._performUpload();
            }
          });
        })["catch"](function (err) {
          _this6._emitHttpError(req, null, 'tus: failed to create upload', err);
        });
      }
      /*
       * Try to resume an existing upload. First a HEAD request will be sent
       * to retrieve the offset. If the request fails a new upload will be
       * created. In the case of a successful response the file will be uploaded.
       *
       * @api private
       */
    }, {
      key: "_resumeUpload",
      value: function _resumeUpload() {
        var _this7 = this;
        var req = this._openRequest('HEAD', this.url);
        var promise = this._sendRequest(req, null);
        promise.then(function (res) {
          var status = res.getStatus();
          if (!inStatusCategory(status, 200)) {
            // If the upload is locked (indicated by the 423 Locked status code), we
            // emit an error instead of directly starting a new upload. This way the
            // retry logic can catch the error and will retry the upload. An upload
            // is usually locked for a short period of time and will be available
            // afterwards.
            if (status === 423) {
              _this7._emitHttpError(req, res, 'tus: upload is currently locked; retry later');
              return;
            }
            if (inStatusCategory(status, 400)) {
              // Remove stored fingerprint and corresponding endpoint,
              // on client errors since the file can not be found
              _this7._removeFromUrlStorage();
            }
            if (!_this7.options.endpoint) {
              // Don't attempt to create a new upload if no endpoint is provided.
              _this7._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');
              return;
            } // Try to create a new upload

            _this7.url = null;
            _this7._createUpload();
            return;
          }
          var offset = parseInt(res.getHeader('Upload-Offset'), 10);
          if (Number.isNaN(offset)) {
            _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');
            return;
          }
          var length = parseInt(res.getHeader('Upload-Length'), 10);
          if (Number.isNaN(length) && !_this7.options.uploadLengthDeferred) {
            _this7._emitHttpError(req, res, 'tus: invalid or missing length value');
            return;
          }
          if (typeof _this7.options._onUploadUrlAvailable === 'function') {
            _this7.options._onUploadUrlAvailable();
          }
          _this7._saveUploadInUrlStorage().then(function () {
            // Upload has already been completed and we do not need to send additional
            // data to the server
            if (offset === length) {
              _this7._emitProgress(length, length);
              _this7._emitSuccess();
              return;
            }
            _this7._offset = offset;
            _this7._performUpload();
          });
        })["catch"](function (err) {
          _this7._emitHttpError(req, null, 'tus: failed to resume upload', err);
        });
      }
      /**
       * Start uploading the file using PATCH requests. The file will be divided
       * into chunks as specified in the chunkSize option. During the upload
       * the onProgress event handler may be invoked multiple times.
       *
       * @api private
       */
    }, {
      key: "_performUpload",
      value: function _performUpload() {
        var _this8 = this;

        // If the upload has been aborted, we will not send the next PATCH request.
        // This is important if the abort method was called during a callback, such
        // as onChunkComplete or onProgress.
        if (this._aborted) {
          return;
        }
        var req; // Some browser and servers may not support the PATCH method. For those
        // cases, you can tell tus-js-client to use a POST request with the
        // X-HTTP-Method-Override header for simulating a PATCH request.

        if (this.options.overridePatchMethod) {
          req = this._openRequest('POST', this.url);
          req.setHeader('X-HTTP-Method-Override', 'PATCH');
        } else {
          req = this._openRequest('PATCH', this.url);
        }
        req.setHeader('Upload-Offset', this._offset);
        var promise = this._addChunkToRequest(req);
        promise.then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this8._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');
            return;
          }
          _this8._handleUploadResponse(req, res);
        })["catch"](function (err) {
          // Don't emit an error if the upload was aborted manually
          if (_this8._aborted) {
            return;
          }
          _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err);
        });
      }
      /**
       * _addChunktoRequest reads a chunk from the source and sends it using the
       * supplied request object. It will not handle the response.
       *
       * @api private
       */
    }, {
      key: "_addChunkToRequest",
      value: function _addChunkToRequest(req) {
        var _this9 = this;
        var start = this._offset;
        var end = this._offset + this.options.chunkSize;
        req.setProgressHandler(function (bytesSent) {
          _this9._emitProgress(start + bytesSent, _this9._size);
        });
        req.setHeader('Content-Type', 'application/offset+octet-stream'); // The specified chunkSize may be Infinity or the calcluated end position
        // may exceed the file's size. In both cases, we limit the end position to
        // the input's total size for simpler calculations and correctness.

        if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
          end = this._size;
        }
        return this._source.slice(start, end).then(function (_ref2) {
          var value = _ref2.value,
            done = _ref2.done;

          // If the upload length is deferred, the upload size was not specified during
          // upload creation. So, if the file reader is done reading, we know the total
          // upload size and can tell the tus server.
          if (_this9.options.uploadLengthDeferred && done) {
            _this9._size = _this9._offset + (value && value.size ? value.size : 0);
            req.setHeader('Upload-Length', _this9._size);
          }
          if (value === null) {
            return _this9._sendRequest(req);
          }
          _this9._emitProgress(_this9._offset, _this9._size);
          return _this9._sendRequest(req, value);
        });
      }
      /**
       * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
       * and already have received a response.
       *
       * @api private
       */
    }, {
      key: "_handleUploadResponse",
      value: function _handleUploadResponse(req, res) {
        var offset = parseInt(res.getHeader('Upload-Offset'), 10);
        if (Number.isNaN(offset)) {
          this._emitHttpError(req, res, 'tus: invalid or missing offset value');
          return;
        }
        this._emitProgress(offset, this._size);
        this._emitChunkComplete(offset - this._offset, offset, this._size);
        this._offset = offset;
        if (offset === this._size) {
          // Yay, finally done :)
          this._emitSuccess();
          this._source.close();
          return;
        }
        this._performUpload();
      }
      /**
       * Create a new HTTP request object with the given method and URL.
       *
       * @api private
       */
    }, {
      key: "_openRequest",
      value: function _openRequest(method, url) {
        var req = openRequest(method, url, this.options);
        this._req = req;
        return req;
      }
      /**
       * Remove the entry in the URL storage, if it has been saved before.
       *
       * @api private
       */
    }, {
      key: "_removeFromUrlStorage",
      value: function _removeFromUrlStorage() {
        var _this10 = this;
        if (!this._urlStorageKey) return;
        this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function (err) {
          _this10._emitError(err);
        });
        this._urlStorageKey = null;
      }
      /**
       * Add the upload URL to the URL storage, if possible.
       *
       * @api private
       */
    }, {
      key: "_saveUploadInUrlStorage",
      value: function _saveUploadInUrlStorage() {
        var _this11 = this;

        // We do not store the upload URL
        // - if it was disabled in the option, or
        // - if no fingerprint was calculated for the input (i.e. a stream), or
        // - if the URL is already stored (i.e. key is set alread).
        if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey !== null) {
          return Promise.resolve();
        }
        var storedUpload = {
          size: this._size,
          metadata: this.options.metadata,
          creationTime: new Date().toString()
        };
        if (this._parallelUploads) {
          // Save multiple URLs if the parallelUploads option is used ...
          storedUpload.parallelUploadUrls = this._parallelUploadUrls;
        } else {
          // ... otherwise we just save the one available URL.
          storedUpload.uploadUrl = this.url;
        }
        return this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function (urlStorageKey) {
          _this11._urlStorageKey = urlStorageKey;
        });
      }
      /**
       * Send a request with the provided body.
       *
       * @api private
       */
    }, {
      key: "_sendRequest",
      value: function _sendRequest(req) {
        var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return sendRequest(req, body, this.options);
      }
    }], [{
      key: "terminate",
      value: function terminate(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var req = openRequest('DELETE', url, options);
        return sendRequest(req, null, options).then(function (res) {
          // A 204 response indicates a successfull request
          if (res.getStatus() === 204) {
            return;
          }
          throw new DetailedError('tus: unexpected response while terminating upload', null, req, res);
        })["catch"](function (err) {
          if (!(err instanceof DetailedError)) {
            err = new DetailedError('tus: failed to terminate upload', err, req, null);
          }
          if (!shouldRetry(err, 0, options)) {
            throw err;
          } // Instead of keeping track of the retry attempts, we remove the first element from the delays
          // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
          // We recursively call the terminate function will removing elements from the retryDelays array.

          var delay = options.retryDelays[0];
          var remainingDelays = options.retryDelays.slice(1);
          var newOptions = _objectSpread$1(_objectSpread$1({}, options), {}, {
            retryDelays: remainingDelays
          });
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          }).then(function () {
            return BaseUpload.terminate(url, newOptions);
          });
        });
      }
    }]);
    return BaseUpload;
  }();
  function encodeMetadata(metadata) {
    return Object.entries(metadata).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];
      return "".concat(key, " ").concat(gBase64.encode(String(value)));
    }).join(',');
  }
  /**
   * Checks whether a given status is in the range of the expected category.
   * For example, only a status between 200 and 299 will satisfy the category 200.
   *
   * @api private
   */

  function inStatusCategory(status, category) {
    return status >= category && status < category + 100;
  }
  /**
   * Create a new HTTP request with the specified method and URL.
   * The necessary headers that are included in every request
   * will be added, including the request ID.
   *
   * @api private
   */

  function openRequest(method, url, options) {
    var req = options.httpStack.createRequest(method, url);
    req.setHeader('Tus-Resumable', '1.0.0');
    var headers = options.headers || {};
    Object.entries(headers).forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        name = _ref6[0],
        value = _ref6[1];
      req.setHeader(name, value);
    });
    if (options.addRequestId) {
      var requestId = uuid();
      req.setHeader('X-Request-ID', requestId);
    }
    return req;
  }
  /**
   * Send a request with the provided body while invoking the onBeforeRequest
   * and onAfterResponse callbacks.
   *
   * @api private
   */

  function sendRequest(req, body, options) {
    var onBeforeRequestPromise = typeof options.onBeforeRequest === 'function' ? Promise.resolve(options.onBeforeRequest(req)) : Promise.resolve();
    return onBeforeRequestPromise.then(function () {
      return req.send(body).then(function (res) {
        var onAfterResponsePromise = typeof options.onAfterResponse === 'function' ? Promise.resolve(options.onAfterResponse(req, res)) : Promise.resolve();
        return onAfterResponsePromise.then(function () {
          return res;
        });
      });
    });
  }
  /**
   * Checks whether the browser running this code has internet access.
   * This function will always return true in the node.js environment
   *
   * @api private
   */

  function isOnline() {
    var online = true;
    if (typeof window !== 'undefined' && 'navigator' in window // eslint-disable-line no-undef
    && window.navigator.onLine === false) {
      // eslint-disable-line no-undef
      online = false;
    }
    return online;
  }
  /**
   * Checks whether or not it is ok to retry a request.
   * @param {Error} err the error returned from the last request
   * @param {number} retryAttempt the number of times the request has already been retried
   * @param {object} options tus Upload options
   *
   * @api private
   */

  function shouldRetry(err, retryAttempt, options) {
    // We only attempt a retry if
    // - retryDelays option is set
    // - we didn't exceed the maxium number of retries, yet, and
    // - this error was caused by a request or it's response and
    // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
    // a onShouldRetry is specified and returns true
    // - the browser does not indicate that we are offline
    if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
      return false;
    }
    if (options && typeof options.onShouldRetry === 'function') {
      return options.onShouldRetry(err, retryAttempt, options);
    }
    var status = err.originalResponse ? err.originalResponse.getStatus() : 0;
    return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
  }
  /**
   * Resolve a relative link given the origin as source. For example,
   * if a HTTP request to http://example.com/files/ returns a Location
   * header with the value /upload/abc, the resolved URL will be:
   * http://example.com/upload/abc
   */

  function resolveUrl(origin, link) {
    return new urlParse(link, origin).toString();
  }
  /**
   * Calculate the start and end positions for the parts if an upload
   * is split into multiple parallel requests.
   *
   * @param {number} totalSize The byte size of the upload, which will be split.
   * @param {number} partCount The number in how many parts the upload will be split.
   * @return {object[]}
   * @api private
   */

  function splitSizeIntoParts(totalSize, partCount) {
    var partSize = Math.floor(totalSize / partCount);
    var parts = [];
    for (var i = 0; i < partCount; i++) {
      parts.push({
        start: partSize * i,
        end: partSize * (i + 1)
      });
    }
    parts[partCount - 1].end = totalSize;
    return parts;
  }
  BaseUpload.defaultOptions = defaultOptions$1;

  function _classCallCheck$6(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$6(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$6(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$6(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$6(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  /* eslint no-unused-vars: "off" */
  var NoopUrlStorage = /*#__PURE__*/function () {
    function NoopUrlStorage() {
      _classCallCheck$6(this, NoopUrlStorage);
    }
    _createClass$6(NoopUrlStorage, [{
      key: "listAllUploads",
      value: function listAllUploads() {
        return Promise.resolve([]);
      }
    }, {
      key: "findUploadsByFingerprint",
      value: function findUploadsByFingerprint(fingerprint) {
        return Promise.resolve([]);
      }
    }, {
      key: "removeUpload",
      value: function removeUpload(urlStorageKey) {
        return Promise.resolve();
      }
    }, {
      key: "addUpload",
      value: function addUpload(fingerprint, upload) {
        return Promise.resolve(null);
      }
    }]);
    return NoopUrlStorage;
  }();

  function _classCallCheck$5(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$5(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$5(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$5(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$5(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var hasStorage = false;
  try {
    hasStorage = 'localStorage' in window; // Attempt to store and read entries from the local storage to detect Private
    // Mode on Safari on iOS (see #49)

    var key = 'tusSupport';
    localStorage.setItem(key, localStorage.getItem(key));
  } catch (e) {
    // If we try to access localStorage inside a sandboxed iframe, a SecurityError
    // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
    // thrown (see #49)
    if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
      hasStorage = false;
    } else {
      throw e;
    }
  }
  var canStoreURLs = hasStorage;
  var WebStorageUrlStorage = /*#__PURE__*/function () {
    function WebStorageUrlStorage() {
      _classCallCheck$5(this, WebStorageUrlStorage);
    }
    _createClass$5(WebStorageUrlStorage, [{
      key: "findAllUploads",
      value: function findAllUploads() {
        var results = this._findEntries('tus::');
        return Promise.resolve(results);
      }
    }, {
      key: "findUploadsByFingerprint",
      value: function findUploadsByFingerprint(fingerprint) {
        var results = this._findEntries("tus::".concat(fingerprint, "::"));
        return Promise.resolve(results);
      }
    }, {
      key: "removeUpload",
      value: function removeUpload(urlStorageKey) {
        localStorage.removeItem(urlStorageKey);
        return Promise.resolve();
      }
    }, {
      key: "addUpload",
      value: function addUpload(fingerprint, upload) {
        var id = Math.round(Math.random() * 1e12);
        var key = "tus::".concat(fingerprint, "::").concat(id);
        localStorage.setItem(key, JSON.stringify(upload));
        return Promise.resolve(key);
      }
    }, {
      key: "_findEntries",
      value: function _findEntries(prefix) {
        var results = [];
        for (var i = 0; i < localStorage.length; i++) {
          var _key = localStorage.key(i);
          if (_key.indexOf(prefix) !== 0) continue;
          try {
            var upload = JSON.parse(localStorage.getItem(_key));
            upload.urlStorageKey = _key;
            results.push(upload);
          } catch (e) {// The JSON parse error is intentionally ignored here, so a malformed
            // entry in the storage cannot prevent an upload.
          }
        }
        return results;
      }
    }]);
    return WebStorageUrlStorage;
  }();

  function _classCallCheck$4(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$4(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$4(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$4(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$4(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  /* eslint-disable max-classes-per-file */
  var XHRHttpStack = /*#__PURE__*/function () {
    function XHRHttpStack() {
      _classCallCheck$4(this, XHRHttpStack);
    }
    _createClass$4(XHRHttpStack, [{
      key: "createRequest",
      value: function createRequest(method, url) {
        return new Request(method, url);
      }
    }, {
      key: "getName",
      value: function getName() {
        return 'XHRHttpStack';
      }
    }]);
    return XHRHttpStack;
  }();
  var Request = /*#__PURE__*/function () {
    function Request(method, url) {
      _classCallCheck$4(this, Request);
      this._xhr = new XMLHttpRequest();
      this._xhr.open(method, url, true);
      this._method = method;
      this._url = url;
      this._headers = {};
    }
    _createClass$4(Request, [{
      key: "getMethod",
      value: function getMethod() {
        return this._method;
      }
    }, {
      key: "getURL",
      value: function getURL() {
        return this._url;
      }
    }, {
      key: "setHeader",
      value: function setHeader(header, value) {
        this._xhr.setRequestHeader(header, value);
        this._headers[header] = value;
      }
    }, {
      key: "getHeader",
      value: function getHeader(header) {
        return this._headers[header];
      }
    }, {
      key: "setProgressHandler",
      value: function setProgressHandler(progressHandler) {
        // Test support for progress events before attaching an event listener
        if (!('upload' in this._xhr)) {
          return;
        }
        this._xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }
          progressHandler(e.loaded);
        };
      }
    }, {
      key: "send",
      value: function send() {
        var _this = this;
        var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        return new Promise(function (resolve, reject) {
          _this._xhr.onload = function () {
            resolve(new Response(_this._xhr));
          };
          _this._xhr.onerror = function (err) {
            reject(err);
          };
          _this._xhr.send(body);
        });
      }
    }, {
      key: "abort",
      value: function abort() {
        this._xhr.abort();
        return Promise.resolve();
      }
    }, {
      key: "getUnderlyingObject",
      value: function getUnderlyingObject() {
        return this._xhr;
      }
    }]);
    return Request;
  }();
  var Response = /*#__PURE__*/function () {
    function Response(xhr) {
      _classCallCheck$4(this, Response);
      this._xhr = xhr;
    }
    _createClass$4(Response, [{
      key: "getStatus",
      value: function getStatus() {
        return this._xhr.status;
      }
    }, {
      key: "getHeader",
      value: function getHeader(header) {
        return this._xhr.getResponseHeader(header);
      }
    }, {
      key: "getBody",
      value: function getBody() {
        return this._xhr.responseText;
      }
    }, {
      key: "getUnderlyingObject",
      value: function getUnderlyingObject() {
        return this._xhr;
      }
    }]);
    return Response;
  }();

  var isReactNative = function isReactNative() {
    return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
  };

  /**
   * uriToBlob resolves a URI to a Blob object. This is used for
   * React Native to retrieve a file (identified by a file://
   * URI) as a blob.
   */
  function uriToBlob(uri) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var blob = xhr.response;
        resolve(blob);
      };
      xhr.onerror = function (err) {
        reject(err);
      };
      xhr.open('GET', uri);
      xhr.send();
    });
  }

  var isCordova = function isCordova() {
    return typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');
  };

  /**
   * readAsByteArray converts a File object to a Uint8Array.
   * This function is only used on the Apache Cordova platform.
   * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
   */
  function readAsByteArray(chunk) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var value = new Uint8Array(reader.result);
        resolve({
          value: value
        });
      };
      reader.onerror = function (err) {
        reject(err);
      };
      reader.readAsArrayBuffer(chunk);
    });
  }

  function _classCallCheck$3(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$3(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$3(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$3(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$3(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var FileSource = /*#__PURE__*/function () {
    // Make this.size a method
    function FileSource(file) {
      _classCallCheck$3(this, FileSource);
      this._file = file;
      this.size = file.size;
    }
    _createClass$3(FileSource, [{
      key: "slice",
      value: function slice(start, end) {
        // In Apache Cordova applications, a File must be resolved using
        // FileReader instances, see
        // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
        if (isCordova()) {
          return readAsByteArray(this._file.slice(start, end));
        }
        var value = this._file.slice(start, end);
        return Promise.resolve({
          value: value
        });
      }
    }, {
      key: "close",
      value: function close() {// Nothing to do here since we don't need to release any resources.
      }
    }]);
    return FileSource;
  }();

  function _classCallCheck$2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$2(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$2(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function len(blobOrArray) {
    if (blobOrArray === undefined) return 0;
    if (blobOrArray.size !== undefined) return blobOrArray.size;
    return blobOrArray.length;
  }
  /*
    Typed arrays and blobs don't have a concat method.
    This function helps StreamSource accumulate data to reach chunkSize.
  */

  function concat(a, b) {
    if (a.concat) {
      // Is `a` an Array?
      return a.concat(b);
    }
    if (a instanceof Blob) {
      return new Blob([a, b], {
        type: a.type
      });
    }
    if (a.set) {
      // Is `a` a typed array?
      var c = new a.constructor(a.length + b.length);
      c.set(a);
      c.set(b, a.length);
      return c;
    }
    throw new Error('Unknown data type');
  }
  var StreamSource = /*#__PURE__*/function () {
    function StreamSource(reader) {
      _classCallCheck$2(this, StreamSource);
      this._buffer = undefined;
      this._bufferOffset = 0;
      this._reader = reader;
      this._done = false;
    }
    _createClass$2(StreamSource, [{
      key: "slice",
      value: function slice(start, end) {
        if (start < this._bufferOffset) {
          return Promise.reject(new Error("Requested data is before the reader's current offset"));
        }
        return this._readUntilEnoughDataOrDone(start, end);
      }
    }, {
      key: "_readUntilEnoughDataOrDone",
      value: function _readUntilEnoughDataOrDone(start, end) {
        var _this = this;
        var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
        if (this._done || hasEnoughData) {
          var value = this._getDataFromBuffer(start, end);
          var done = value == null ? this._done : false;
          return Promise.resolve({
            value: value,
            done: done
          });
        }
        return this._reader.read().then(function (_ref) {
          var value = _ref.value,
            done = _ref.done;
          if (done) {
            _this._done = true;
          } else if (_this._buffer === undefined) {
            _this._buffer = value;
          } else {
            _this._buffer = concat(_this._buffer, value);
          }
          return _this._readUntilEnoughDataOrDone(start, end);
        });
      }
    }, {
      key: "_getDataFromBuffer",
      value: function _getDataFromBuffer(start, end) {
        // Remove data from buffer before `start`.
        // Data might be reread from the buffer if an upload fails, so we can only
        // safely delete data when it comes *before* what is currently being read.
        if (start > this._bufferOffset) {
          this._buffer = this._buffer.slice(start - this._bufferOffset);
          this._bufferOffset = start;
        } // If the buffer is empty after removing old data, all data has been read.

        var hasAllDataBeenRead = len(this._buffer) === 0;
        if (this._done && hasAllDataBeenRead) {
          return null;
        } // We already removed data before `start`, so we just return the first
        // chunk from the buffer.

        return this._buffer.slice(0, end - start);
      }
    }, {
      key: "close",
      value: function close() {
        if (this._reader.cancel) {
          this._reader.cancel();
        }
      }
    }]);
    return StreamSource;
  }();

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var FileReader$1 = /*#__PURE__*/function () {
    function FileReader() {
      _classCallCheck$1(this, FileReader);
    }
    _createClass$1(FileReader, [{
      key: "openFile",
      value: function openFile(input, chunkSize) {
        // In React Native, when user selects a file, instead of a File or Blob,
        // you usually get a file object {} with a uri property that contains
        // a local path to the file. We use XMLHttpRequest to fetch
        // the file blob, before uploading with tus.
        if (isReactNative() && input && typeof input.uri !== 'undefined') {
          return uriToBlob(input.uri).then(function (blob) {
            return new FileSource(blob);
          })["catch"](function (err) {
            throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(err));
          });
        } // Since we emulate the Blob type in our tests (not all target browsers
        // support it), we cannot use `instanceof` for testing whether the input value
        // can be handled. Instead, we simply check is the slice() function and the
        // size property are available.

        if (typeof input.slice === 'function' && typeof input.size !== 'undefined') {
          return Promise.resolve(new FileSource(input));
        }
        if (typeof input.read === 'function') {
          chunkSize = Number(chunkSize);
          if (!Number.isFinite(chunkSize)) {
            return Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option'));
          }
          return Promise.resolve(new StreamSource(input, chunkSize));
        }
        return Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment'));
      }
    }]);
    return FileReader;
  }();

  /**
   * Generate a fingerprint for a file which will be used the store the endpoint
   *
   * @param {File} file
   * @param {Object} options
   * @param {Function} callback
   */

  function fingerprint(file, options) {
    if (isReactNative()) {
      return Promise.resolve(reactNativeFingerprint(file, options));
    }
    return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
  }
  function reactNativeFingerprint(file, options) {
    var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
    return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
  }
  function hashCode(str) {
    /* eslint-disable no-bitwise */
    // from https://stackoverflow.com/a/8831937/151666
    var hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (var i = 0; i < str.length; i++) {
      var _char = str.charCodeAt(i);
      hash = (hash << 5) - hash + _char;
      hash &= hash; // Convert to 32bit integer
    }

    return hash;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var defaultOptions = _objectSpread(_objectSpread({}, BaseUpload.defaultOptions), {}, {
    httpStack: new XHRHttpStack(),
    fileReader: new FileReader$1(),
    urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
    fingerprint: fingerprint
  });
  var Upload$1 = /*#__PURE__*/function (_BaseUpload) {
    _inherits(Upload, _BaseUpload);
    var _super = _createSuper(Upload);
    function Upload() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck(this, Upload);
      options = _objectSpread(_objectSpread({}, defaultOptions), options);
      return _super.call(this, file, options);
    }
    _createClass(Upload, null, [{
      key: "terminate",
      value: function terminate(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        options = _objectSpread(_objectSpread({}, defaultOptions), options);
        return BaseUpload.terminate(url, options);
      }
    }]);
    return Upload;
  }(BaseUpload);

  class TusUpload extends BaseUpload$1 {
    constructor(_ref) {
      let {
        chunkSize,
        csrfToken,
        fieldName,
        file,
        formId,
        retryDelays,
        uploadIndex,
        uploadUrl
      } = _ref;
      super({
        name: file.name,
        status: "uploading",
        type: "tus",
        uploadIndex
      });
      _defineProperty$2(this, "onError", void 0);
      _defineProperty$2(this, "onProgress", void 0);
      _defineProperty$2(this, "onSuccess", void 0);
      _defineProperty$2(this, "upload", void 0);
      _defineProperty$2(this, "csrfToken", void 0);
      _defineProperty$2(this, "handleError", error => {
        if (this.onError) {
          this.onError(error);
        } else {
          throw error;
        }
      });
      _defineProperty$2(this, "handleProgress", (bytesUploaded, bytesTotal) => {
        if (this.onProgress) {
          this.onProgress(bytesUploaded, bytesTotal);
        }
      });
      _defineProperty$2(this, "handleSucces", () => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      });
      _defineProperty$2(this, "addCsrTokenToRequest", request => {
        request.setHeader("X-CSRFToken", this.csrfToken);
      });
      this.csrfToken = csrfToken;
      this.upload = new Upload$1(file, {
        chunkSize,
        endpoint: uploadUrl,
        metadata: {
          fieldName: fieldName,
          filename: file.name,
          formId: formId
        },
        onBeforeRequest: this.addCsrTokenToRequest,
        onError: this.handleError,
        onProgress: this.handleProgress,
        onSuccess: this.handleSucces,
        retryDelays: retryDelays || [0, 1000, 3000, 5000]
      });
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
    }
    async abort() {
      await this.upload.abort(true);
    }
    async delete() {
      if (!this.upload.url) {
        return Promise.resolve();
      }
      await deleteUpload(this.upload.url, this.csrfToken);
    }
    getSize() {
      return this.upload.file.size;
    }
    start() {
      this.upload.start();
    }
    getInitialFile() {
      return {
        id: this.name,
        name: this.name,
        size: this.getSize(),
        type: "tus",
        url: ""
      };
    }
  }

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global$a =
    // eslint-disable-next-line es/no-global-this -- safe
    check(typeof globalThis == 'object' && globalThis) ||
    check(typeof window == 'object' && window) ||
    // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == 'object' && self) ||
    check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
    // eslint-disable-next-line no-new-func -- fallback
    (function () { return this; })() || Function('return this')();

  var fails$7 = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var fails$6 = fails$7;

  // Detect IE8's incomplete defineProperty implementation
  var descriptors = !fails$6(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
  });

  var makeBuiltIn$2 = {exports: {}};

  var documentAll$2 = typeof document == 'object' && document.all;

  // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
  var IS_HTMLDDA = typeof documentAll$2 == 'undefined' && documentAll$2 !== undefined;

  var documentAll_1 = {
    all: documentAll$2,
    IS_HTMLDDA: IS_HTMLDDA
  };

  var $documentAll$1 = documentAll_1;

  var documentAll$1 = $documentAll$1.all;

  // `IsCallable` abstract operation
  // https://tc39.es/ecma262/#sec-iscallable
  var isCallable$8 = $documentAll$1.IS_HTMLDDA ? function (argument) {
    return typeof argument == 'function' || argument === documentAll$1;
  } : function (argument) {
    return typeof argument == 'function';
  };

  var fails$5 = fails$7;

  var functionBindNative = !fails$5(function () {
    // eslint-disable-next-line es/no-function-prototype-bind -- safe
    var test = (function () { /* empty */ }).bind();
    // eslint-disable-next-line no-prototype-builtins -- safe
    return typeof test != 'function' || test.hasOwnProperty('prototype');
  });

  var NATIVE_BIND$1 = functionBindNative;

  var FunctionPrototype$1 = Function.prototype;
  var call$3 = FunctionPrototype$1.call;
  var uncurryThisWithBind = NATIVE_BIND$1 && FunctionPrototype$1.bind.bind(call$3, call$3);

  var functionUncurryThisRaw = function (fn) {
    return NATIVE_BIND$1 ? uncurryThisWithBind(fn) : function () {
      return call$3.apply(fn, arguments);
    };
  };

  var uncurryThisRaw$1 = functionUncurryThisRaw;

  var toString$1 = uncurryThisRaw$1({}.toString);
  var stringSlice = uncurryThisRaw$1(''.slice);

  var classofRaw$1 = function (it) {
    return stringSlice(toString$1(it), 8, -1);
  };

  var classofRaw = classofRaw$1;
  var uncurryThisRaw = functionUncurryThisRaw;

  var functionUncurryThis = function (fn) {
    // Nashorn bug:
    //   https://github.com/zloirock/core-js/issues/1128
    //   https://github.com/zloirock/core-js/issues/1130
    if (classofRaw(fn) === 'Function') return uncurryThisRaw(fn);
  };

  // we can't use just `it == null` since of `document.all` special case
  // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
  var isNullOrUndefined$2 = function (it) {
    return it === null || it === undefined;
  };

  var isNullOrUndefined$1 = isNullOrUndefined$2;

  var $TypeError$5 = TypeError;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.es/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible$1 = function (it) {
    if (isNullOrUndefined$1(it)) throw $TypeError$5("Can't call method on " + it);
    return it;
  };

  var requireObjectCoercible = requireObjectCoercible$1;

  var $Object$1 = Object;

  // `ToObject` abstract operation
  // https://tc39.es/ecma262/#sec-toobject
  var toObject$1 = function (argument) {
    return $Object$1(requireObjectCoercible(argument));
  };

  var uncurryThis$3 = functionUncurryThis;
  var toObject = toObject$1;

  var hasOwnProperty = uncurryThis$3({}.hasOwnProperty);

  // `HasOwnProperty` abstract operation
  // https://tc39.es/ecma262/#sec-hasownproperty
  // eslint-disable-next-line es/no-object-hasown -- safe
  var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
    return hasOwnProperty(toObject(it), key);
  };

  var DESCRIPTORS$6 = descriptors;
  var hasOwn$3 = hasOwnProperty_1;

  var FunctionPrototype = Function.prototype;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var getDescriptor = DESCRIPTORS$6 && Object.getOwnPropertyDescriptor;

  var EXISTS$1 = hasOwn$3(FunctionPrototype, 'name');
  // additional protection from minified / mangled / dropped function names
  var PROPER = EXISTS$1 && (function something() { /* empty */ }).name === 'something';
  var CONFIGURABLE$1 = EXISTS$1 && (!DESCRIPTORS$6 || (DESCRIPTORS$6 && getDescriptor(FunctionPrototype, 'name').configurable));

  var functionName = {
    EXISTS: EXISTS$1,
    PROPER: PROPER,
    CONFIGURABLE: CONFIGURABLE$1
  };

  var global$9 = global$a;

  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var defineProperty$2 = Object.defineProperty;

  var defineGlobalProperty$1 = function (key, value) {
    try {
      defineProperty$2(global$9, key, { value: value, configurable: true, writable: true });
    } catch (error) {
      global$9[key] = value;
    } return value;
  };

  var global$8 = global$a;
  var defineGlobalProperty = defineGlobalProperty$1;

  var SHARED = '__core-js_shared__';
  var store$3 = global$8[SHARED] || defineGlobalProperty(SHARED, {});

  var sharedStore = store$3;

  var uncurryThis$2 = functionUncurryThis;
  var isCallable$7 = isCallable$8;
  var store$2 = sharedStore;

  var functionToString = uncurryThis$2(Function.toString);

  // this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
  if (!isCallable$7(store$2.inspectSource)) {
    store$2.inspectSource = function (it) {
      return functionToString(it);
    };
  }

  var inspectSource$1 = store$2.inspectSource;

  var global$7 = global$a;
  var isCallable$6 = isCallable$8;

  var WeakMap$1 = global$7.WeakMap;

  var weakMapBasicDetection = isCallable$6(WeakMap$1) && /native code/.test(String(WeakMap$1));

  var isCallable$5 = isCallable$8;
  var $documentAll = documentAll_1;

  var documentAll = $documentAll.all;

  var isObject$6 = $documentAll.IS_HTMLDDA ? function (it) {
    return typeof it == 'object' ? it !== null : isCallable$5(it) || it === documentAll;
  } : function (it) {
    return typeof it == 'object' ? it !== null : isCallable$5(it);
  };

  var objectDefineProperty = {};

  var global$6 = global$a;
  var isObject$5 = isObject$6;

  var document$1 = global$6.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS = isObject$5(document$1) && isObject$5(document$1.createElement);

  var documentCreateElement$1 = function (it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  var DESCRIPTORS$5 = descriptors;
  var fails$4 = fails$7;
  var createElement = documentCreateElement$1;

  // Thanks to IE8 for its funny defineProperty
  var ie8DomDefine = !DESCRIPTORS$5 && !fails$4(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty(createElement('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });

  var DESCRIPTORS$4 = descriptors;
  var fails$3 = fails$7;

  // V8 ~ Chrome 36-
  // https://bugs.chromium.org/p/v8/issues/detail?id=3334
  var v8PrototypeDefineBug = DESCRIPTORS$4 && fails$3(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty(function () { /* empty */ }, 'prototype', {
      value: 42,
      writable: false
    }).prototype != 42;
  });

  var isObject$4 = isObject$6;

  var $String$1 = String;
  var $TypeError$4 = TypeError;

  // `Assert: Type(argument) is Object`
  var anObject$2 = function (argument) {
    if (isObject$4(argument)) return argument;
    throw $TypeError$4($String$1(argument) + ' is not an object');
  };

  var NATIVE_BIND = functionBindNative;

  var call$2 = Function.prototype.call;

  var functionCall = NATIVE_BIND ? call$2.bind(call$2) : function () {
    return call$2.apply(call$2, arguments);
  };

  var global$5 = global$a;
  var isCallable$4 = isCallable$8;

  var aFunction = function (argument) {
    return isCallable$4(argument) ? argument : undefined;
  };

  var getBuiltIn$2 = function (namespace, method) {
    return arguments.length < 2 ? aFunction(global$5[namespace]) : global$5[namespace] && global$5[namespace][method];
  };

  var uncurryThis$1 = functionUncurryThis;

  var objectIsPrototypeOf = uncurryThis$1({}.isPrototypeOf);

  var getBuiltIn$1 = getBuiltIn$2;

  var engineUserAgent = getBuiltIn$1('navigator', 'userAgent') || '';

  var global$4 = global$a;
  var userAgent = engineUserAgent;

  var process = global$4.process;
  var Deno = global$4.Deno;
  var versions = process && process.versions || Deno && Deno.version;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    // in old Chrome, versions of V8 isn't V8 = Chrome / 10
    // but their correct versions are not interesting for us
    version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
  }

  // BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
  // so check `userAgent` even if `.v8` exists, but 0
  if (!version && userAgent) {
    match = userAgent.match(/Edge\/(\d+)/);
    if (!match || match[1] >= 74) {
      match = userAgent.match(/Chrome\/(\d+)/);
      if (match) version = +match[1];
    }
  }

  var engineV8Version = version;

  /* eslint-disable es/no-symbol -- required for testing */

  var V8_VERSION = engineV8Version;
  var fails$2 = fails$7;

  // eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
  var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$2(function () {
    var symbol = Symbol();
    // Chrome 38 Symbol has incorrect toString conversion
    // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
    return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
      // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      !Symbol.sham && V8_VERSION && V8_VERSION < 41;
  });

  /* eslint-disable es/no-symbol -- required for testing */

  var NATIVE_SYMBOL$1 = symbolConstructorDetection;

  var useSymbolAsUid = NATIVE_SYMBOL$1
    && !Symbol.sham
    && typeof Symbol.iterator == 'symbol';

  var getBuiltIn = getBuiltIn$2;
  var isCallable$3 = isCallable$8;
  var isPrototypeOf = objectIsPrototypeOf;
  var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

  var $Object = Object;

  var isSymbol$2 = USE_SYMBOL_AS_UID$1 ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    var $Symbol = getBuiltIn('Symbol');
    return isCallable$3($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
  };

  var $String = String;

  var tryToString$1 = function (argument) {
    try {
      return $String(argument);
    } catch (error) {
      return 'Object';
    }
  };

  var isCallable$2 = isCallable$8;
  var tryToString = tryToString$1;

  var $TypeError$3 = TypeError;

  // `Assert: IsCallable(argument) is true`
  var aCallable$1 = function (argument) {
    if (isCallable$2(argument)) return argument;
    throw $TypeError$3(tryToString(argument) + ' is not a function');
  };

  var aCallable = aCallable$1;
  var isNullOrUndefined = isNullOrUndefined$2;

  // `GetMethod` abstract operation
  // https://tc39.es/ecma262/#sec-getmethod
  var getMethod$1 = function (V, P) {
    var func = V[P];
    return isNullOrUndefined(func) ? undefined : aCallable(func);
  };

  var call$1 = functionCall;
  var isCallable$1 = isCallable$8;
  var isObject$3 = isObject$6;

  var $TypeError$2 = TypeError;

  // `OrdinaryToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-ordinarytoprimitive
  var ordinaryToPrimitive$1 = function (input, pref) {
    var fn, val;
    if (pref === 'string' && isCallable$1(fn = input.toString) && !isObject$3(val = call$1(fn, input))) return val;
    if (isCallable$1(fn = input.valueOf) && !isObject$3(val = call$1(fn, input))) return val;
    if (pref !== 'string' && isCallable$1(fn = input.toString) && !isObject$3(val = call$1(fn, input))) return val;
    throw $TypeError$2("Can't convert object to primitive value");
  };

  var shared$3 = {exports: {}};

  var store$1 = sharedStore;

  (shared$3.exports = function (key, value) {
    return store$1[key] || (store$1[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.25.5',
    mode: 'global',
    copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
    license: 'https://github.com/zloirock/core-js/blob/v3.25.5/LICENSE',
    source: 'https://github.com/zloirock/core-js'
  });

  var uncurryThis = functionUncurryThis;

  var id = 0;
  var postfix = Math.random();
  var toString = uncurryThis(1.0.toString);

  var uid$2 = function (key) {
    return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
  };

  var global$3 = global$a;
  var shared$2 = shared$3.exports;
  var hasOwn$2 = hasOwnProperty_1;
  var uid$1 = uid$2;
  var NATIVE_SYMBOL = symbolConstructorDetection;
  var USE_SYMBOL_AS_UID = useSymbolAsUid;

  var WellKnownSymbolsStore = shared$2('wks');
  var Symbol$1 = global$3.Symbol;
  var symbolFor = Symbol$1 && Symbol$1['for'];
  var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

  var wellKnownSymbol$1 = function (name) {
    if (!hasOwn$2(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
      var description = 'Symbol.' + name;
      if (NATIVE_SYMBOL && hasOwn$2(Symbol$1, name)) {
        WellKnownSymbolsStore[name] = Symbol$1[name];
      } else if (USE_SYMBOL_AS_UID && symbolFor) {
        WellKnownSymbolsStore[name] = symbolFor(description);
      } else {
        WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
      }
    } return WellKnownSymbolsStore[name];
  };

  var call = functionCall;
  var isObject$2 = isObject$6;
  var isSymbol$1 = isSymbol$2;
  var getMethod = getMethod$1;
  var ordinaryToPrimitive = ordinaryToPrimitive$1;
  var wellKnownSymbol = wellKnownSymbol$1;

  var $TypeError$1 = TypeError;
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

  // `ToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-toprimitive
  var toPrimitive$1 = function (input, pref) {
    if (!isObject$2(input) || isSymbol$1(input)) return input;
    var exoticToPrim = getMethod(input, TO_PRIMITIVE);
    var result;
    if (exoticToPrim) {
      if (pref === undefined) pref = 'default';
      result = call(exoticToPrim, input, pref);
      if (!isObject$2(result) || isSymbol$1(result)) return result;
      throw $TypeError$1("Can't convert object to primitive value");
    }
    if (pref === undefined) pref = 'number';
    return ordinaryToPrimitive(input, pref);
  };

  var toPrimitive = toPrimitive$1;
  var isSymbol = isSymbol$2;

  // `ToPropertyKey` abstract operation
  // https://tc39.es/ecma262/#sec-topropertykey
  var toPropertyKey$1 = function (argument) {
    var key = toPrimitive(argument, 'string');
    return isSymbol(key) ? key : key + '';
  };

  var DESCRIPTORS$3 = descriptors;
  var IE8_DOM_DEFINE = ie8DomDefine;
  var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
  var anObject$1 = anObject$2;
  var toPropertyKey = toPropertyKey$1;

  var $TypeError = TypeError;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var $defineProperty = Object.defineProperty;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var ENUMERABLE = 'enumerable';
  var CONFIGURABLE = 'configurable';
  var WRITABLE = 'writable';

  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  objectDefineProperty.f = DESCRIPTORS$3 ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
    anObject$1(O);
    P = toPropertyKey(P);
    anObject$1(Attributes);
    if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
      var current = $getOwnPropertyDescriptor(O, P);
      if (current && current[WRITABLE]) {
        O[P] = Attributes.value;
        Attributes = {
          configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
          enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
          writable: false
        };
      }
    } return $defineProperty(O, P, Attributes);
  } : $defineProperty : function defineProperty(O, P, Attributes) {
    anObject$1(O);
    P = toPropertyKey(P);
    anObject$1(Attributes);
    if (IE8_DOM_DEFINE) try {
      return $defineProperty(O, P, Attributes);
    } catch (error) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw $TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var createPropertyDescriptor$1 = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var DESCRIPTORS$2 = descriptors;
  var definePropertyModule = objectDefineProperty;
  var createPropertyDescriptor = createPropertyDescriptor$1;

  var createNonEnumerableProperty$1 = DESCRIPTORS$2 ? function (object, key, value) {
    return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var shared$1 = shared$3.exports;
  var uid = uid$2;

  var keys = shared$1('keys');

  var sharedKey$1 = function (key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var NATIVE_WEAK_MAP = weakMapBasicDetection;
  var global$2 = global$a;
  var isObject$1 = isObject$6;
  var createNonEnumerableProperty = createNonEnumerableProperty$1;
  var hasOwn$1 = hasOwnProperty_1;
  var shared = sharedStore;
  var sharedKey = sharedKey$1;

  var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
  var TypeError$1 = global$2.TypeError;
  var WeakMap = global$2.WeakMap;
  var set, get, has;

  var enforce = function (it) {
    return has(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject$1(it) || (state = get(it)).type !== TYPE) {
        throw TypeError$1('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (NATIVE_WEAK_MAP || shared.state) {
    var store = shared.state || (shared.state = new WeakMap());
    /* eslint-disable no-self-assign -- prototype methods protection */
    store.get = store.get;
    store.has = store.has;
    store.set = store.set;
    /* eslint-enable no-self-assign -- prototype methods protection */
    set = function (it, metadata) {
      if (store.has(it)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      store.set(it, metadata);
      return metadata;
    };
    get = function (it) {
      return store.get(it) || {};
    };
    has = function (it) {
      return store.has(it);
    };
  } else {
    var STATE = sharedKey('state');
    set = function (it, metadata) {
      if (hasOwn$1(it, STATE)) throw TypeError$1(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };
    get = function (it) {
      return hasOwn$1(it, STATE) ? it[STATE] : {};
    };
    has = function (it) {
      return hasOwn$1(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has,
    enforce: enforce,
    getterFor: getterFor
  };

  var fails$1 = fails$7;
  var isCallable = isCallable$8;
  var hasOwn = hasOwnProperty_1;
  var DESCRIPTORS$1 = descriptors;
  var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
  var inspectSource = inspectSource$1;
  var InternalStateModule = internalState;

  var enforceInternalState = InternalStateModule.enforce;
  var getInternalState = InternalStateModule.get;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var defineProperty$1 = Object.defineProperty;

  var CONFIGURABLE_LENGTH = DESCRIPTORS$1 && !fails$1(function () {
    return defineProperty$1(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
  });

  var TEMPLATE = String(String).split('String');

  var makeBuiltIn$1 = makeBuiltIn$2.exports = function (value, name, options) {
    if (String(name).slice(0, 7) === 'Symbol(') {
      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (options && options.getter) name = 'get ' + name;
    if (options && options.setter) name = 'set ' + name;
    if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
      if (DESCRIPTORS$1) defineProperty$1(value, 'name', { value: name, configurable: true });
      else value.name = name;
    }
    if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
      defineProperty$1(value, 'length', { value: options.arity });
    }
    try {
      if (options && hasOwn(options, 'constructor') && options.constructor) {
        if (DESCRIPTORS$1) defineProperty$1(value, 'prototype', { writable: false });
      // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
      } else if (value.prototype) value.prototype = undefined;
    } catch (error) { /* empty */ }
    var state = enforceInternalState(value);
    if (!hasOwn(state, 'source')) {
      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
    } return value;
  };

  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  // eslint-disable-next-line no-extend-native -- required
  Function.prototype.toString = makeBuiltIn$1(function toString() {
    return isCallable(this) && getInternalState(this).source || inspectSource(this);
  }, 'toString');

  var makeBuiltIn = makeBuiltIn$2.exports;
  var defineProperty = objectDefineProperty;

  var defineBuiltInAccessor$1 = function (target, name, descriptor) {
    if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
    if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
    return defineProperty.f(target, name, descriptor);
  };

  var anObject = anObject$2;

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
  var regexpFlags = function () {
    var that = anObject(this);
    var result = '';
    if (that.hasIndices) result += 'd';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.unicodeSets) result += 'v';
    if (that.sticky) result += 'y';
    return result;
  };

  var global$1 = global$a;
  var DESCRIPTORS = descriptors;
  var defineBuiltInAccessor = defineBuiltInAccessor$1;
  var regExpFlags = regexpFlags;
  var fails = fails$7;

  // babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
  var RegExp$1 = global$1.RegExp;
  var RegExpPrototype = RegExp$1.prototype;

  var FORCED = DESCRIPTORS && fails(function () {
    var INDICES_SUPPORT = true;
    try {
      RegExp$1('.', 'd');
    } catch (error) {
      INDICES_SUPPORT = false;
    }

    var O = {};
    // modern V8 bug
    var calls = '';
    var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

    var addGetter = function (key, chr) {
      // eslint-disable-next-line es/no-object-defineproperty -- safe
      Object.defineProperty(O, key, { get: function () {
        calls += chr;
        return true;
      } });
    };

    var pairs = {
      dotAll: 's',
      global: 'g',
      ignoreCase: 'i',
      multiline: 'm',
      sticky: 'y'
    };

    if (INDICES_SUPPORT) pairs.hasIndices = 'd';

    for (var key in pairs) addGetter(key, pairs[key]);

    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var result = Object.getOwnPropertyDescriptor(RegExpPrototype, 'flags').get.call(O);

    return result !== expected || calls !== expected;
  });

  // `RegExp.prototype.flags` getter
  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
  if (FORCED) defineBuiltInAccessor(RegExpPrototype, 'flags', {
    configurable: true,
    get: regExpFlags
  });

  var isArray = Array.isArray;
  function isStringOrNumber(o) {
    var type = typeof o;
    return type === 'string' || type === 'number';
  }
  function isNullOrUndef(o) {
    return o === void 0 || o === null;
  }
  function isInvalid(o) {
    return o === null || o === false || o === true || o === void 0;
  }
  function isFunction(o) {
    return typeof o === 'function';
  }
  function isString(o) {
    return typeof o === 'string';
  }
  function isNumber(o) {
    return typeof o === 'number';
  }
  function isNull(o) {
    return o === null;
  }
  function isUndefined(o) {
    return o === void 0;
  }
  function combineFrom(first, second) {
    var out = {};
    if (first) {
      for (var key in first) {
        out[key] = first[key];
      }
    }
    if (second) {
      for (var key$1 in second) {
        out[key$1] = second[key$1];
      }
    }
    return out;
  }
  // object.event should always be function, otherwise its badly created object.
  function isLinkEventObject(o) {
    return !isNull(o) && typeof o === 'object';
  }

  // We need EMPTY_OBJ defined in one place.
  // Its used for comparison so we cant inline it into shared
  var EMPTY_OBJ = {};
  function normalizeEventName(name) {
    return name.substr(2).toLowerCase();
  }
  function appendChild(parentDOM, dom) {
    parentDOM.appendChild(dom);
  }
  function insertOrAppend(parentDOM, newNode, nextNode) {
    if (isNull(nextNode)) {
      appendChild(parentDOM, newNode);
    } else {
      parentDOM.insertBefore(newNode, nextNode);
    }
  }
  function documentCreateElement(tag, isSVG) {
    if (isSVG) {
      return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }
    return document.createElement(tag);
  }
  function replaceChild(parentDOM, newDom, lastDom) {
    parentDOM.replaceChild(newDom, lastDom);
  }
  function removeChild(parentDOM, childNode) {
    parentDOM.removeChild(childNode);
  }
  function callAll(arrayFn) {
    for (var i = 0; i < arrayFn.length; i++) {
      arrayFn[i]();
    }
  }
  function findChildVNode(vNode, startEdge, flags) {
    var children = vNode.children;
    if (flags & 4 /* ComponentClass */) {
      return children.$LI;
    }
    if (flags & 8192 /* Fragment */) {
      return vNode.childFlags === 2 /* HasVNodeChildren */ ? children : children[startEdge ? 0 : children.length - 1];
    }
    return children;
  }
  function findDOMfromVNode(vNode, startEdge) {
    var flags;
    while (vNode) {
      flags = vNode.flags;
      if (flags & 2033 /* DOMRef */) {
        return vNode.dom;
      }
      vNode = findChildVNode(vNode, startEdge, flags);
    }
    return null;
  }
  function removeVNodeDOM(vNode, parentDOM) {
    do {
      var flags = vNode.flags;
      if (flags & 2033 /* DOMRef */) {
        removeChild(parentDOM, vNode.dom);
        return;
      }
      var children = vNode.children;
      if (flags & 4 /* ComponentClass */) {
        vNode = children.$LI;
      }
      if (flags & 8 /* ComponentFunction */) {
        vNode = children;
      }
      if (flags & 8192 /* Fragment */) {
        if (vNode.childFlags === 2 /* HasVNodeChildren */) {
          vNode = children;
        } else {
          for (var i = 0, len = children.length; i < len; ++i) {
            removeVNodeDOM(children[i], parentDOM);
          }
          return;
        }
      }
    } while (vNode);
  }
  function moveVNodeDOM(vNode, parentDOM, nextNode) {
    do {
      var flags = vNode.flags;
      if (flags & 2033 /* DOMRef */) {
        insertOrAppend(parentDOM, vNode.dom, nextNode);
        return;
      }
      var children = vNode.children;
      if (flags & 4 /* ComponentClass */) {
        vNode = children.$LI;
      }
      if (flags & 8 /* ComponentFunction */) {
        vNode = children;
      }
      if (flags & 8192 /* Fragment */) {
        if (vNode.childFlags === 2 /* HasVNodeChildren */) {
          vNode = children;
        } else {
          for (var i = 0, len = children.length; i < len; ++i) {
            moveVNodeDOM(children[i], parentDOM, nextNode);
          }
          return;
        }
      }
    } while (vNode);
  }
  function createDerivedState(instance, nextProps, state) {
    if (instance.constructor.getDerivedStateFromProps) {
      return combineFrom(state, instance.constructor.getDerivedStateFromProps(nextProps, state));
    }
    return state;
  }
  var renderCheck = {
    v: false
  };
  var options = {
    componentComparator: null,
    createVNode: null,
    renderComplete: null
  };
  function setTextContent(dom, children) {
    dom.textContent = children;
  }
  // Calling this function assumes, nextValue is linkEvent
  function isLastValueSameLinkEvent(lastValue, nextValue) {
    return isLinkEventObject(lastValue) && lastValue.event === nextValue.event && lastValue.data === nextValue.data;
  }
  function mergeUnsetProperties(to, from) {
    for (var propName in from) {
      if (isUndefined(to[propName])) {
        to[propName] = from[propName];
      }
    }
    return to;
  }
  function safeCall1(method, arg1) {
    return !!isFunction(method) && (method(arg1), true);
  }
  var keyPrefix = '$';
  function V(childFlags, children, className, flags, key, props, ref, type) {
    this.childFlags = childFlags;
    this.children = children;
    this.className = className;
    this.dom = null;
    this.flags = flags;
    this.key = key === void 0 ? null : key;
    this.props = props === void 0 ? null : props;
    this.ref = ref === void 0 ? null : ref;
    this.type = type;
  }
  function createVNode(flags, type, className, children, childFlags, props, key, ref) {
    var childFlag = childFlags === void 0 ? 1 /* HasInvalidChildren */ : childFlags;
    var vNode = new V(childFlag, children, className, flags, key, props, ref, type);
    if (childFlag === 0 /* UnknownChildren */) {
      normalizeChildren(vNode, vNode.children);
    }
    return vNode;
  }
  function mergeDefaultHooks(flags, type, ref) {
    if (flags & 4 /* ComponentClass */) {
      return ref;
    }
    var defaultHooks = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultHooks;
    if (isNullOrUndef(defaultHooks)) {
      return ref;
    }
    if (isNullOrUndef(ref)) {
      return defaultHooks;
    }
    return mergeUnsetProperties(ref, defaultHooks);
  }
  function mergeDefaultProps(flags, type, props) {
    // set default props
    var defaultProps = (flags & 32768 /* ForwardRef */ ? type.render : type).defaultProps;
    if (isNullOrUndef(defaultProps)) {
      return props;
    }
    if (isNullOrUndef(props)) {
      return combineFrom(defaultProps, null);
    }
    return mergeUnsetProperties(props, defaultProps);
  }
  function resolveComponentFlags(flags, type) {
    if (flags & 12 /* ComponentKnown */) {
      return flags;
    }
    if (type.prototype && type.prototype.render) {
      return 4 /* ComponentClass */;
    }

    if (type.render) {
      return 32776 /* ForwardRefComponent */;
    }

    return 8 /* ComponentFunction */;
  }

  function createComponentVNode(flags, type, props, key, ref) {
    flags = resolveComponentFlags(flags, type);
    var vNode = new V(1 /* HasInvalidChildren */, null, null, flags, key, mergeDefaultProps(flags, type, props), mergeDefaultHooks(flags, type, ref), type);
    return vNode;
  }
  function createTextVNode(text, key) {
    return new V(1 /* HasInvalidChildren */, isNullOrUndef(text) || text === true || text === false ? '' : text, null, 16 /* Text */, key, null, null, null);
  }
  function createFragment(children, childFlags, key) {
    var fragment = createVNode(8192 /* Fragment */, 8192 /* Fragment */, null, children, childFlags, null, key, null);
    switch (fragment.childFlags) {
      case 1 /* HasInvalidChildren */:
        fragment.children = createVoidVNode();
        fragment.childFlags = 2 /* HasVNodeChildren */;
        break;
      case 16 /* HasTextChildren */:
        fragment.children = [createTextVNode(children)];
        fragment.childFlags = 4 /* HasNonKeyedChildren */;
        break;
    }
    return fragment;
  }
  function normalizeProps(vNode) {
    var props = vNode.props;
    if (props) {
      var flags = vNode.flags;
      if (flags & 481 /* Element */) {
        if (props.children !== void 0 && isNullOrUndef(vNode.children)) {
          normalizeChildren(vNode, props.children);
        }
        if (props.className !== void 0) {
          if (isNullOrUndef(vNode.className)) {
            vNode.className = props.className || null;
          }
          props.className = undefined;
        }
      }
      if (props.key !== void 0) {
        vNode.key = props.key;
        props.key = undefined;
      }
      if (props.ref !== void 0) {
        if (flags & 8 /* ComponentFunction */) {
          vNode.ref = combineFrom(vNode.ref, props.ref);
        } else {
          vNode.ref = props.ref;
        }
        props.ref = undefined;
      }
    }
    return vNode;
  }
  /*
   * Fragment is different than normal vNode,
   * because when it needs to be cloned we need to clone its children too
   * But not normalize, because otherwise those possibly get KEY and re-mount
   */
  function cloneFragment(vNodeToClone) {
    var oldChildren = vNodeToClone.children;
    var childFlags = vNodeToClone.childFlags;
    return createFragment(childFlags === 2 /* HasVNodeChildren */ ? directClone(oldChildren) : oldChildren.map(directClone), childFlags, vNodeToClone.key);
  }
  function directClone(vNodeToClone) {
    var flags = vNodeToClone.flags & -16385 /* ClearInUse */;
    var props = vNodeToClone.props;
    if (flags & 14 /* Component */) {
      if (!isNull(props)) {
        var propsToClone = props;
        props = {};
        for (var key in propsToClone) {
          props[key] = propsToClone[key];
        }
      }
    }
    if ((flags & 8192 /* Fragment */) === 0) {
      return new V(vNodeToClone.childFlags, vNodeToClone.children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
    }
    return cloneFragment(vNodeToClone);
  }
  function createVoidVNode() {
    return createTextVNode('', null);
  }
  function _normalizeVNodes(nodes, result, index, currentKey) {
    for (var len = nodes.length; index < len; index++) {
      var n = nodes[index];
      if (!isInvalid(n)) {
        var newKey = currentKey + keyPrefix + index;
        if (isArray(n)) {
          _normalizeVNodes(n, result, 0, newKey);
        } else {
          if (isStringOrNumber(n)) {
            n = createTextVNode(n, newKey);
          } else {
            var oldKey = n.key;
            var isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;
            if (n.flags & 81920 /* InUseOrNormalized */ || isPrefixedKey) {
              n = directClone(n);
            }
            n.flags |= 65536 /* Normalized */;
            if (!isPrefixedKey) {
              if (isNull(oldKey)) {
                n.key = newKey;
              } else {
                n.key = currentKey + oldKey;
              }
            } else if (oldKey.substring(0, currentKey.length) !== currentKey) {
              n.key = currentKey + oldKey;
            }
          }
          result.push(n);
        }
      }
    }
  }

  function normalizeChildren(vNode, children) {
    var newChildren;
    var newChildFlags = 1 /* HasInvalidChildren */;
    // Don't change children to match strict equal (===) true in patching
    if (isInvalid(children)) {
      newChildren = children;
    } else if (isStringOrNumber(children)) {
      newChildFlags = 16 /* HasTextChildren */;
      newChildren = children;
    } else if (isArray(children)) {
      var len = children.length;
      for (var i = 0; i < len; ++i) {
        var n = children[i];
        if (isInvalid(n) || isArray(n)) {
          newChildren = newChildren || children.slice(0, i);
          _normalizeVNodes(children, newChildren, i, '');
          break;
        } else if (isStringOrNumber(n)) {
          newChildren = newChildren || children.slice(0, i);
          newChildren.push(createTextVNode(n, keyPrefix + i));
        } else {
          var key = n.key;
          var needsCloning = (n.flags & 81920 /* InUseOrNormalized */) > 0;
          var isNullKey = isNull(key);
          var isPrefixed = isString(key) && key[0] === keyPrefix;
          if (needsCloning || isNullKey || isPrefixed) {
            newChildren = newChildren || children.slice(0, i);
            if (needsCloning || isPrefixed) {
              n = directClone(n);
            }
            if (isNullKey || isPrefixed) {
              n.key = keyPrefix + i;
            }
            newChildren.push(n);
          } else if (newChildren) {
            newChildren.push(n);
          }
          n.flags |= 65536 /* Normalized */;
        }
      }

      newChildren = newChildren || children;
      if (newChildren.length === 0) {
        newChildFlags = 1 /* HasInvalidChildren */;
      } else {
        newChildFlags = 8 /* HasKeyedChildren */;
      }
    } else {
      newChildren = children;
      newChildren.flags |= 65536 /* Normalized */;
      if (children.flags & 81920 /* InUseOrNormalized */) {
        newChildren = directClone(children);
      }
      newChildFlags = 2 /* HasVNodeChildren */;
    }

    vNode.children = newChildren;
    vNode.childFlags = newChildFlags;
    return vNode;
  }
  function normalizeRoot(input) {
    if (isInvalid(input) || isStringOrNumber(input)) {
      return createTextVNode(input, null);
    }
    if (isArray(input)) {
      return createFragment(input, 0 /* UnknownChildren */, null);
    }
    return input.flags & 16384 /* InUse */ ? directClone(input) : input;
  }
  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var xmlNS = 'http://www.w3.org/XML/1998/namespace';
  var namespaces = {
    'xlink:actuate': xlinkNS,
    'xlink:arcrole': xlinkNS,
    'xlink:href': xlinkNS,
    'xlink:role': xlinkNS,
    'xlink:show': xlinkNS,
    'xlink:title': xlinkNS,
    'xlink:type': xlinkNS,
    'xml:base': xmlNS,
    'xml:lang': xmlNS,
    'xml:space': xmlNS
  };
  function getDelegatedEventObject(v) {
    return {
      onClick: v,
      onDblClick: v,
      onFocusIn: v,
      onFocusOut: v,
      onKeyDown: v,
      onKeyPress: v,
      onKeyUp: v,
      onMouseDown: v,
      onMouseMove: v,
      onMouseUp: v,
      onTouchEnd: v,
      onTouchMove: v,
      onTouchStart: v
    };
  }
  var attachedEventCounts = getDelegatedEventObject(0);
  var attachedEvents = getDelegatedEventObject(null);
  var syntheticEvents = getDelegatedEventObject(true);
  function updateOrAddSyntheticEvent(name, dom) {
    var eventsObject = dom.$EV;
    if (!eventsObject) {
      eventsObject = dom.$EV = getDelegatedEventObject(null);
    }
    if (!eventsObject[name]) {
      if (++attachedEventCounts[name] === 1) {
        attachedEvents[name] = attachEventToDocument(name);
      }
    }
    return eventsObject;
  }
  function unmountSyntheticEvent(name, dom) {
    var eventsObject = dom.$EV;
    if (eventsObject && eventsObject[name]) {
      if (--attachedEventCounts[name] === 0) {
        document.removeEventListener(normalizeEventName(name), attachedEvents[name]);
        attachedEvents[name] = null;
      }
      eventsObject[name] = null;
    }
  }
  function handleSyntheticEvent(name, lastEvent, nextEvent, dom) {
    if (isFunction(nextEvent)) {
      updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
    } else if (isLinkEventObject(nextEvent)) {
      if (isLastValueSameLinkEvent(lastEvent, nextEvent)) {
        return;
      }
      updateOrAddSyntheticEvent(name, dom)[name] = nextEvent;
    } else {
      unmountSyntheticEvent(name, dom);
    }
  }
  // When browsers fully support event.composedPath we could loop it through instead of using parentNode property
  function getTargetNode(event) {
    return isFunction(event.composedPath) ? event.composedPath()[0] : event.target;
  }
  function dispatchEvents(event, isClick, name, eventData) {
    var dom = getTargetNode(event);
    do {
      // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
      // because the event listener is on document.body
      // Don't process clicks on disabled elements
      if (isClick && dom.disabled) {
        return;
      }
      var eventsObject = dom.$EV;
      if (eventsObject) {
        var currentEvent = eventsObject[name];
        if (currentEvent) {
          // linkEvent object
          eventData.dom = dom;
          currentEvent.event ? currentEvent.event(currentEvent.data, event) : currentEvent(event);
          if (event.cancelBubble) {
            return;
          }
        }
      }
      dom = dom.parentNode;
    } while (!isNull(dom));
  }
  function stopPropagation() {
    this.cancelBubble = true;
    if (!this.immediatePropagationStopped) {
      this.stopImmediatePropagation();
    }
  }
  function isDefaultPrevented() {
    return this.defaultPrevented;
  }
  function isPropagationStopped() {
    return this.cancelBubble;
  }
  function extendEventProperties(event) {
    // Event data needs to be object to save reference to currentTarget getter
    var eventData = {
      dom: document
    };
    event.isDefaultPrevented = isDefaultPrevented;
    event.isPropagationStopped = isPropagationStopped;
    event.stopPropagation = stopPropagation;
    Object.defineProperty(event, 'currentTarget', {
      configurable: true,
      get: function get() {
        return eventData.dom;
      }
    });
    return eventData;
  }
  function rootClickEvent(name) {
    return function (event) {
      if (event.button !== 0) {
        // Firefox incorrectly triggers click event for mid/right mouse buttons.
        // This bug has been active for 17 years.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=184051
        event.stopPropagation();
        return;
      }
      dispatchEvents(event, true, name, extendEventProperties(event));
    };
  }
  function rootEvent(name) {
    return function (event) {
      dispatchEvents(event, false, name, extendEventProperties(event));
    };
  }
  function attachEventToDocument(name) {
    var attachedEvent = name === 'onClick' || name === 'onDblClick' ? rootClickEvent(name) : rootEvent(name);
    document.addEventListener(normalizeEventName(name), attachedEvent);
    return attachedEvent;
  }
  function isSameInnerHTML(dom, innerHTML) {
    var tempdom = document.createElement('i');
    tempdom.innerHTML = innerHTML;
    return tempdom.innerHTML === dom.innerHTML;
  }
  function triggerEventListener(props, methodName, e) {
    if (props[methodName]) {
      var listener = props[methodName];
      if (listener.event) {
        listener.event(listener.data, e);
      } else {
        listener(e);
      }
    } else {
      var nativeListenerName = methodName.toLowerCase();
      if (props[nativeListenerName]) {
        props[nativeListenerName](e);
      }
    }
  }
  function createWrappedFunction(methodName, applyValue) {
    var fnMethod = function (e) {
      var vNode = this.$V;
      // If vNode is gone by the time event fires, no-op
      if (!vNode) {
        return;
      }
      var props = vNode.props || EMPTY_OBJ;
      var dom = vNode.dom;
      if (isString(methodName)) {
        triggerEventListener(props, methodName, e);
      } else {
        for (var i = 0; i < methodName.length; ++i) {
          triggerEventListener(props, methodName[i], e);
        }
      }
      if (isFunction(applyValue)) {
        var newVNode = this.$V;
        var newProps = newVNode.props || EMPTY_OBJ;
        applyValue(newProps, dom, false, newVNode);
      }
    };
    Object.defineProperty(fnMethod, 'wrapped', {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false
    });
    return fnMethod;
  }
  function attachEvent(dom, eventName, handler) {
    var previousKey = "$" + eventName;
    var previousArgs = dom[previousKey];
    if (previousArgs) {
      if (previousArgs[1].wrapped) {
        return;
      }
      dom.removeEventListener(previousArgs[0], previousArgs[1]);
      dom[previousKey] = null;
    }
    if (isFunction(handler)) {
      dom.addEventListener(eventName, handler);
      dom[previousKey] = [eventName, handler];
    }
  }
  function isCheckedType(type) {
    return type === 'checkbox' || type === 'radio';
  }
  var onTextInputChange = createWrappedFunction('onInput', applyValueInput);
  var wrappedOnChange = createWrappedFunction(['onClick', 'onChange'], applyValueInput);
  /* tslint:disable-next-line:no-empty */
  function emptywrapper(event) {
    event.stopPropagation();
  }
  emptywrapper.wrapped = true;
  function inputEvents(dom, nextPropsOrEmpty) {
    if (isCheckedType(nextPropsOrEmpty.type)) {
      attachEvent(dom, 'change', wrappedOnChange);
      attachEvent(dom, 'click', emptywrapper);
    } else {
      attachEvent(dom, 'input', onTextInputChange);
    }
  }
  function applyValueInput(nextPropsOrEmpty, dom) {
    var type = nextPropsOrEmpty.type;
    var value = nextPropsOrEmpty.value;
    var checked = nextPropsOrEmpty.checked;
    var multiple = nextPropsOrEmpty.multiple;
    var defaultValue = nextPropsOrEmpty.defaultValue;
    var hasValue = !isNullOrUndef(value);
    if (type && type !== dom.type) {
      dom.setAttribute('type', type);
    }
    if (!isNullOrUndef(multiple) && multiple !== dom.multiple) {
      dom.multiple = multiple;
    }
    if (!isNullOrUndef(defaultValue) && !hasValue) {
      dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
      if (hasValue) {
        dom.value = value;
      }
      if (!isNullOrUndef(checked)) {
        dom.checked = checked;
      }
    } else {
      if (hasValue && dom.value !== value) {
        dom.defaultValue = value;
        dom.value = value;
      } else if (!isNullOrUndef(checked)) {
        dom.checked = checked;
      }
    }
  }
  function updateChildOptions(vNode, value) {
    if (vNode.type === 'option') {
      updateChildOption(vNode, value);
    } else {
      var children = vNode.children;
      var flags = vNode.flags;
      if (flags & 4 /* ComponentClass */) {
        updateChildOptions(children.$LI, value);
      } else if (flags & 8 /* ComponentFunction */) {
        updateChildOptions(children, value);
      } else if (vNode.childFlags === 2 /* HasVNodeChildren */) {
        updateChildOptions(children, value);
      } else if (vNode.childFlags & 12 /* MultipleChildren */) {
        for (var i = 0, len = children.length; i < len; ++i) {
          updateChildOptions(children[i], value);
        }
      }
    }
  }
  function updateChildOption(vNode, value) {
    var props = vNode.props || EMPTY_OBJ;
    var dom = vNode.dom;
    // we do this as multiple may have changed
    dom.value = props.value;
    if (props.value === value || isArray(value) && value.indexOf(props.value) !== -1) {
      dom.selected = true;
    } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
      dom.selected = props.selected || false;
    }
  }
  var onSelectChange = createWrappedFunction('onChange', applyValueSelect);
  function selectEvents(dom) {
    attachEvent(dom, 'change', onSelectChange);
  }
  function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
    var multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);
    if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
      dom.multiple = multiplePropInBoolean;
    }
    var index = nextPropsOrEmpty.selectedIndex;
    if (index === -1) {
      dom.selectedIndex = -1;
    }
    var childFlags = vNode.childFlags;
    if (childFlags !== 1 /* HasInvalidChildren */) {
      var value = nextPropsOrEmpty.value;
      if (isNumber(index) && index > -1 && dom.options[index]) {
        value = dom.options[index].value;
      }
      if (mounting && isNullOrUndef(value)) {
        value = nextPropsOrEmpty.defaultValue;
      }
      updateChildOptions(vNode, value);
    }
  }
  var onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
  var wrappedOnChange$1 = createWrappedFunction('onChange');
  function textAreaEvents(dom, nextPropsOrEmpty) {
    attachEvent(dom, 'input', onTextareaInputChange);
    if (nextPropsOrEmpty.onChange) {
      attachEvent(dom, 'change', wrappedOnChange$1);
    }
  }
  function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
    var value = nextPropsOrEmpty.value;
    var domValue = dom.value;
    if (isNullOrUndef(value)) {
      if (mounting) {
        var defaultValue = nextPropsOrEmpty.defaultValue;
        if (!isNullOrUndef(defaultValue) && defaultValue !== domValue) {
          dom.defaultValue = defaultValue;
          dom.value = defaultValue;
        }
      }
    } else if (domValue !== value) {
      /* There is value so keep it controlled */
      dom.defaultValue = value;
      dom.value = value;
    }
  }
  function processElement(flags, vNode, dom, nextPropsOrEmpty, mounting, isControlled) {
    if (flags & 64 /* InputElement */) {
      applyValueInput(nextPropsOrEmpty, dom);
    } else if (flags & 256 /* SelectElement */) {
      applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode);
    } else if (flags & 128 /* TextareaElement */) {
      applyValueTextArea(nextPropsOrEmpty, dom, mounting);
    }
    if (isControlled) {
      dom.$V = vNode;
    }
  }
  function addFormElementEventHandlers(flags, dom, nextPropsOrEmpty) {
    if (flags & 64 /* InputElement */) {
      inputEvents(dom, nextPropsOrEmpty);
    } else if (flags & 256 /* SelectElement */) {
      selectEvents(dom);
    } else if (flags & 128 /* TextareaElement */) {
      textAreaEvents(dom, nextPropsOrEmpty);
    }
  }
  function isControlledFormElement(nextPropsOrEmpty) {
    return nextPropsOrEmpty.type && isCheckedType(nextPropsOrEmpty.type) ? !isNullOrUndef(nextPropsOrEmpty.checked) : !isNullOrUndef(nextPropsOrEmpty.value);
  }
  function unmountRef(ref) {
    if (ref) {
      if (!safeCall1(ref, null) && ref.current) {
        ref.current = null;
      }
    }
  }
  function mountRef(ref, value, lifecycle) {
    if (ref && (isFunction(ref) || ref.current !== void 0)) {
      lifecycle.push(function () {
        if (!safeCall1(ref, value) && ref.current !== void 0) {
          ref.current = value;
        }
      });
    }
  }
  function remove(vNode, parentDOM) {
    unmount(vNode);
    removeVNodeDOM(vNode, parentDOM);
  }
  function unmount(vNode) {
    var flags = vNode.flags;
    var children = vNode.children;
    var ref;
    if (flags & 481 /* Element */) {
      ref = vNode.ref;
      var props = vNode.props;
      unmountRef(ref);
      var childFlags = vNode.childFlags;
      if (!isNull(props)) {
        var keys = Object.keys(props);
        for (var i = 0, len = keys.length; i < len; i++) {
          var key = keys[i];
          if (syntheticEvents[key]) {
            unmountSyntheticEvent(key, vNode.dom);
          }
        }
      }
      if (childFlags & 12 /* MultipleChildren */) {
        unmountAllChildren(children);
      } else if (childFlags === 2 /* HasVNodeChildren */) {
        unmount(children);
      }
    } else if (children) {
      if (flags & 4 /* ComponentClass */) {
        if (isFunction(children.componentWillUnmount)) {
          children.componentWillUnmount();
        }
        unmountRef(vNode.ref);
        children.$UN = true;
        unmount(children.$LI);
      } else if (flags & 8 /* ComponentFunction */) {
        ref = vNode.ref;
        if (!isNullOrUndef(ref) && isFunction(ref.onComponentWillUnmount)) {
          ref.onComponentWillUnmount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
        }
        unmount(children);
      } else if (flags & 1024 /* Portal */) {
        remove(children, vNode.ref);
      } else if (flags & 8192 /* Fragment */) {
        if (vNode.childFlags & 12 /* MultipleChildren */) {
          unmountAllChildren(children);
        }
      }
    }
  }
  function unmountAllChildren(children) {
    for (var i = 0, len = children.length; i < len; ++i) {
      unmount(children[i]);
    }
  }
  function clearDOM(dom) {
    // Optimization for clearing dom
    dom.textContent = '';
  }
  function removeAllChildren(dom, vNode, children) {
    unmountAllChildren(children);
    if (vNode.flags & 8192 /* Fragment */) {
      removeVNodeDOM(vNode, dom);
    } else {
      clearDOM(dom);
    }
  }
  function wrapLinkEvent(nextValue) {
    // This variable makes sure there is no "this" context in callback
    var ev = nextValue.event;
    return function (e) {
      ev(nextValue.data, e);
    };
  }
  function patchEvent(name, lastValue, nextValue, dom) {
    if (isLinkEventObject(nextValue)) {
      if (isLastValueSameLinkEvent(lastValue, nextValue)) {
        return;
      }
      nextValue = wrapLinkEvent(nextValue);
    }
    attachEvent(dom, normalizeEventName(name), nextValue);
  }
  // We are assuming here that we come from patchProp routine
  // -nextAttrValue cannot be null or undefined
  function patchStyle(lastAttrValue, nextAttrValue, dom) {
    if (isNullOrUndef(nextAttrValue)) {
      dom.removeAttribute('style');
      return;
    }
    var domStyle = dom.style;
    var style;
    var value;
    if (isString(nextAttrValue)) {
      domStyle.cssText = nextAttrValue;
      return;
    }
    if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
      for (style in nextAttrValue) {
        // do not add a hasOwnProperty check here, it affects performance
        value = nextAttrValue[style];
        if (value !== lastAttrValue[style]) {
          domStyle.setProperty(style, value);
        }
      }
      for (style in lastAttrValue) {
        if (isNullOrUndef(nextAttrValue[style])) {
          domStyle.removeProperty(style);
        }
      }
    } else {
      for (style in nextAttrValue) {
        value = nextAttrValue[style];
        domStyle.setProperty(style, value);
      }
    }
  }
  function patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom) {
    var lastHtml = lastValue && lastValue.__html || '';
    var nextHtml = nextValue && nextValue.__html || '';
    if (lastHtml !== nextHtml) {
      if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
        if (!isNull(lastVNode)) {
          if (lastVNode.childFlags & 12 /* MultipleChildren */) {
            unmountAllChildren(lastVNode.children);
          } else if (lastVNode.childFlags === 2 /* HasVNodeChildren */) {
            unmount(lastVNode.children);
          }
          lastVNode.children = null;
          lastVNode.childFlags = 1 /* HasInvalidChildren */;
        }

        dom.innerHTML = nextHtml;
      }
    }
  }
  function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode) {
    switch (prop) {
      case 'children':
      case 'childrenType':
      case 'className':
      case 'defaultValue':
      case 'key':
      case 'multiple':
      case 'ref':
      case 'selectedIndex':
        break;
      case 'autoFocus':
        dom.autofocus = !!nextValue;
        break;
      case 'allowfullscreen':
      case 'autoplay':
      case 'capture':
      case 'checked':
      case 'controls':
      case 'default':
      case 'disabled':
      case 'hidden':
      case 'indeterminate':
      case 'loop':
      case 'muted':
      case 'novalidate':
      case 'open':
      case 'readOnly':
      case 'required':
      case 'reversed':
      case 'scoped':
      case 'seamless':
      case 'selected':
        dom[prop] = !!nextValue;
        break;
      case 'defaultChecked':
      case 'value':
      case 'volume':
        if (hasControlledValue && prop === 'value') {
          break;
        }
        var value = isNullOrUndef(nextValue) ? '' : nextValue;
        if (dom[prop] !== value) {
          dom[prop] = value;
        }
        break;
      case 'style':
        patchStyle(lastValue, nextValue, dom);
        break;
      case 'dangerouslySetInnerHTML':
        patchDangerInnerHTML(lastValue, nextValue, lastVNode, dom);
        break;
      default:
        if (syntheticEvents[prop]) {
          handleSyntheticEvent(prop, lastValue, nextValue, dom);
        } else if (prop.charCodeAt(0) === 111 && prop.charCodeAt(1) === 110) {
          patchEvent(prop, lastValue, nextValue, dom);
        } else if (isNullOrUndef(nextValue)) {
          dom.removeAttribute(prop);
        } else if (isSVG && namespaces[prop]) {
          // We optimize for isSVG being false
          // If we end up in this path we can read property again
          dom.setAttributeNS(namespaces[prop], prop, nextValue);
        } else {
          dom.setAttribute(prop, nextValue);
        }
        break;
    }
  }
  function mountProps(vNode, flags, props, dom, isSVG) {
    var hasControlledValue = false;
    var isFormElement = (flags & 448 /* FormElement */) > 0;
    if (isFormElement) {
      hasControlledValue = isControlledFormElement(props);
      if (hasControlledValue) {
        addFormElementEventHandlers(flags, dom, props);
      }
    }
    for (var prop in props) {
      // do not add a hasOwnProperty check here, it affects performance
      patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue, null);
    }
    if (isFormElement) {
      processElement(flags, vNode, dom, props, true, hasControlledValue);
    }
  }
  function renderNewInput(instance, props, context) {
    var nextInput = normalizeRoot(instance.render(props, instance.state, context));
    var childContext = context;
    if (isFunction(instance.getChildContext)) {
      childContext = combineFrom(context, instance.getChildContext());
    }
    instance.$CX = childContext;
    return nextInput;
  }
  function createClassComponentInstance(vNode, Component, props, context, isSVG, lifecycle) {
    var instance = new Component(props, context);
    var usesNewAPI = instance.$N = Boolean(Component.getDerivedStateFromProps || instance.getSnapshotBeforeUpdate);
    instance.$SVG = isSVG;
    instance.$L = lifecycle;
    vNode.children = instance;
    instance.$BS = false;
    instance.context = context;
    if (instance.props === EMPTY_OBJ) {
      instance.props = props;
    }
    if (!usesNewAPI) {
      if (isFunction(instance.componentWillMount)) {
        instance.$BR = true;
        instance.componentWillMount();
        var pending = instance.$PS;
        if (!isNull(pending)) {
          var state = instance.state;
          if (isNull(state)) {
            instance.state = pending;
          } else {
            for (var key in pending) {
              state[key] = pending[key];
            }
          }
          instance.$PS = null;
        }
        instance.$BR = false;
      }
    } else {
      instance.state = createDerivedState(instance, props, instance.state);
    }
    instance.$LI = renderNewInput(instance, props, context);
    return instance;
  }
  function renderFunctionalComponent(vNode, context) {
    var props = vNode.props || EMPTY_OBJ;
    return vNode.flags & 32768 /* ForwardRef */ ? vNode.type.render(props, vNode.ref, context) : vNode.type(props, context);
  }
  function mount(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var flags = vNode.flags |= 16384 /* InUse */;
    if (flags & 481 /* Element */) {
      mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
    } else if (flags & 4 /* ComponentClass */) {
      mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
    } else if (flags & 8 /* ComponentFunction */) {
      mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle);
      mountFunctionalComponentCallbacks(vNode, lifecycle);
    } else if (flags & 512 /* Void */ || flags & 16 /* Text */) {
      mountText(vNode, parentDOM, nextNode);
    } else if (flags & 8192 /* Fragment */) {
      mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle);
    } else if (flags & 1024 /* Portal */) {
      mountPortal(vNode, context, parentDOM, nextNode, lifecycle);
    } else ;
  }
  function mountPortal(vNode, context, parentDOM, nextNode, lifecycle) {
    mount(vNode.children, vNode.ref, context, false, null, lifecycle);
    var placeHolderVNode = createVoidVNode();
    mountText(placeHolderVNode, parentDOM, nextNode);
    vNode.dom = placeHolderVNode.dom;
  }
  function mountFragment(vNode, context, parentDOM, isSVG, nextNode, lifecycle) {
    var children = vNode.children;
    var childFlags = vNode.childFlags;
    // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
    // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
    if (childFlags & 12 /* MultipleChildren */ && children.length === 0) {
      childFlags = vNode.childFlags = 2 /* HasVNodeChildren */;
      children = vNode.children = createVoidVNode();
    }
    if (childFlags === 2 /* HasVNodeChildren */) {
      mount(children, parentDOM, context, isSVG, nextNode, lifecycle);
    } else {
      mountArrayChildren(children, parentDOM, context, isSVG, nextNode, lifecycle);
    }
  }
  function mountText(vNode, parentDOM, nextNode) {
    var dom = vNode.dom = document.createTextNode(vNode.children);
    if (!isNull(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
  }
  function mountElement(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var flags = vNode.flags;
    var props = vNode.props;
    var className = vNode.className;
    var childFlags = vNode.childFlags;
    var dom = vNode.dom = documentCreateElement(vNode.type, isSVG = isSVG || (flags & 32 /* SvgElement */) > 0);
    var children = vNode.children;
    if (!isNullOrUndef(className) && className !== '') {
      if (isSVG) {
        dom.setAttribute('class', className);
      } else {
        dom.className = className;
      }
    }
    if (childFlags === 16 /* HasTextChildren */) {
      setTextContent(dom, children);
    } else if (childFlags !== 1 /* HasInvalidChildren */) {
      var childrenIsSVG = isSVG && vNode.type !== 'foreignObject';
      if (childFlags === 2 /* HasVNodeChildren */) {
        if (children.flags & 16384 /* InUse */) {
          vNode.children = children = directClone(children);
        }
        mount(children, dom, context, childrenIsSVG, null, lifecycle);
      } else if (childFlags === 8 /* HasKeyedChildren */ || childFlags === 4 /* HasNonKeyedChildren */) {
        mountArrayChildren(children, dom, context, childrenIsSVG, null, lifecycle);
      }
    }
    if (!isNull(parentDOM)) {
      insertOrAppend(parentDOM, dom, nextNode);
    }
    if (!isNull(props)) {
      mountProps(vNode, flags, props, dom, isSVG);
    }
    mountRef(vNode.ref, dom, lifecycle);
  }
  function mountArrayChildren(children, dom, context, isSVG, nextNode, lifecycle) {
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      if (child.flags & 16384 /* InUse */) {
        children[i] = child = directClone(child);
      }
      mount(child, dom, context, isSVG, nextNode, lifecycle);
    }
  }
  function mountClassComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var instance = createClassComponentInstance(vNode, vNode.type, vNode.props || EMPTY_OBJ, context, isSVG, lifecycle);
    mount(instance.$LI, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
    mountClassComponentCallbacks(vNode.ref, instance, lifecycle);
  }
  function mountFunctionalComponent(vNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    mount(vNode.children = normalizeRoot(renderFunctionalComponent(vNode, context)), parentDOM, context, isSVG, nextNode, lifecycle);
  }
  function createClassMountCallback(instance) {
    return function () {
      instance.componentDidMount();
    };
  }
  function mountClassComponentCallbacks(ref, instance, lifecycle) {
    mountRef(ref, instance, lifecycle);
    if (isFunction(instance.componentDidMount)) {
      lifecycle.push(createClassMountCallback(instance));
    }
  }
  function createOnMountCallback(ref, vNode) {
    return function () {
      ref.onComponentDidMount(findDOMfromVNode(vNode, true), vNode.props || EMPTY_OBJ);
    };
  }
  function mountFunctionalComponentCallbacks(vNode, lifecycle) {
    var ref = vNode.ref;
    if (!isNullOrUndef(ref)) {
      safeCall1(ref.onComponentWillMount, vNode.props || EMPTY_OBJ);
      if (isFunction(ref.onComponentDidMount)) {
        lifecycle.push(createOnMountCallback(ref, vNode));
      }
    }
  }
  function replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle) {
    unmount(lastVNode);
    if ((nextVNode.flags & lastVNode.flags & 2033 /* DOMRef */) !== 0) {
      mount(nextVNode, null, context, isSVG, null, lifecycle);
      // Single DOM operation, when we have dom references available
      replaceChild(parentDOM, nextVNode.dom, lastVNode.dom);
    } else {
      mount(nextVNode, parentDOM, context, isSVG, findDOMfromVNode(lastVNode, true), lifecycle);
      removeVNodeDOM(lastVNode, parentDOM);
    }
  }
  function patch(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var nextFlags = nextVNode.flags |= 16384 /* InUse */;
    if (lastVNode.flags !== nextFlags || lastVNode.type !== nextVNode.type || lastVNode.key !== nextVNode.key || nextFlags & 2048 /* ReCreate */) {
      if (lastVNode.flags & 16384 /* InUse */) {
        replaceWithNewNode(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
      } else {
        // Last vNode is not in use, it has crashed at application level. Just mount nextVNode and ignore last one
        mount(nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
      }
    } else if (nextFlags & 481 /* Element */) {
      patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle);
    } else if (nextFlags & 4 /* ComponentClass */) {
      patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
    } else if (nextFlags & 8 /* ComponentFunction */) {
      patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle);
    } else if (nextFlags & 16 /* Text */) {
      patchText(lastVNode, nextVNode);
    } else if (nextFlags & 512 /* Void */) {
      nextVNode.dom = lastVNode.dom;
    } else if (nextFlags & 8192 /* Fragment */) {
      patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle);
    } else {
      patchPortal(lastVNode, nextVNode, context, lifecycle);
    }
  }
  function patchSingleTextChild(lastChildren, nextChildren, parentDOM) {
    if (lastChildren !== nextChildren) {
      if (lastChildren !== '') {
        parentDOM.firstChild.nodeValue = nextChildren;
      } else {
        setTextContent(parentDOM, nextChildren);
      }
    }
  }
  function patchContentEditableChildren(dom, nextChildren) {
    if (dom.textContent !== nextChildren) {
      dom.textContent = nextChildren;
    }
  }
  function patchFragment(lastVNode, nextVNode, parentDOM, context, isSVG, lifecycle) {
    var lastChildren = lastVNode.children;
    var nextChildren = nextVNode.children;
    var lastChildFlags = lastVNode.childFlags;
    var nextChildFlags = nextVNode.childFlags;
    var nextNode = null;
    // When fragment is optimized for multiple children, check if there is no children and change flag to invalid
    // This is the only normalization always done, to keep optimization flags API same for fragments and regular elements
    if (nextChildFlags & 12 /* MultipleChildren */ && nextChildren.length === 0) {
      nextChildFlags = nextVNode.childFlags = 2 /* HasVNodeChildren */;
      nextChildren = nextVNode.children = createVoidVNode();
    }
    var nextIsSingle = (nextChildFlags & 2 /* HasVNodeChildren */) !== 0;
    if (lastChildFlags & 12 /* MultipleChildren */) {
      var lastLen = lastChildren.length;
      // We need to know Fragment's edge node when
      if (
      // It uses keyed algorithm
      lastChildFlags & 8 /* HasKeyedChildren */ && nextChildFlags & 8 /* HasKeyedChildren */ ||
      // It transforms from many to single
      nextIsSingle ||
      // It will append more nodes
      !nextIsSingle && nextChildren.length > lastLen) {
        // When fragment has multiple children there is always at least one vNode
        nextNode = findDOMfromVNode(lastChildren[lastLen - 1], false).nextSibling;
      }
    }
    patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lastVNode, lifecycle);
  }
  function patchPortal(lastVNode, nextVNode, context, lifecycle) {
    var lastContainer = lastVNode.ref;
    var nextContainer = nextVNode.ref;
    var nextChildren = nextVNode.children;
    patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, lastContainer, context, false, null, lastVNode, lifecycle);
    nextVNode.dom = lastVNode.dom;
    if (lastContainer !== nextContainer && !isInvalid(nextChildren)) {
      var node = nextChildren.dom;
      removeChild(lastContainer, node);
      appendChild(nextContainer, node);
    }
  }
  function patchElement(lastVNode, nextVNode, context, isSVG, nextFlags, lifecycle) {
    var dom = nextVNode.dom = lastVNode.dom;
    var lastProps = lastVNode.props;
    var nextProps = nextVNode.props;
    var isFormElement = false;
    var hasControlledValue = false;
    var nextPropsOrEmpty;
    isSVG = isSVG || (nextFlags & 32 /* SvgElement */) > 0;
    // inlined patchProps  -- starts --
    if (lastProps !== nextProps) {
      var lastPropsOrEmpty = lastProps || EMPTY_OBJ;
      nextPropsOrEmpty = nextProps || EMPTY_OBJ;
      if (nextPropsOrEmpty !== EMPTY_OBJ) {
        isFormElement = (nextFlags & 448 /* FormElement */) > 0;
        if (isFormElement) {
          hasControlledValue = isControlledFormElement(nextPropsOrEmpty);
        }
        for (var prop in nextPropsOrEmpty) {
          var lastValue = lastPropsOrEmpty[prop];
          var nextValue = nextPropsOrEmpty[prop];
          if (lastValue !== nextValue) {
            patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue, lastVNode);
          }
        }
      }
      if (lastPropsOrEmpty !== EMPTY_OBJ) {
        for (var prop$1 in lastPropsOrEmpty) {
          if (isNullOrUndef(nextPropsOrEmpty[prop$1]) && !isNullOrUndef(lastPropsOrEmpty[prop$1])) {
            patchProp(prop$1, lastPropsOrEmpty[prop$1], null, dom, isSVG, hasControlledValue, lastVNode);
          }
        }
      }
    }
    var nextChildren = nextVNode.children;
    var nextClassName = nextVNode.className;
    // inlined patchProps  -- ends --
    if (lastVNode.className !== nextClassName) {
      if (isNullOrUndef(nextClassName)) {
        dom.removeAttribute('class');
      } else if (isSVG) {
        dom.setAttribute('class', nextClassName);
      } else {
        dom.className = nextClassName;
      }
    }
    if (nextFlags & 4096 /* ContentEditable */) {
      patchContentEditableChildren(dom, nextChildren);
    } else {
      patchChildren(lastVNode.childFlags, nextVNode.childFlags, lastVNode.children, nextChildren, dom, context, isSVG && nextVNode.type !== 'foreignObject', null, lastVNode, lifecycle);
    }
    if (isFormElement) {
      processElement(nextFlags, nextVNode, dom, nextPropsOrEmpty, false, hasControlledValue);
    }
    var nextRef = nextVNode.ref;
    var lastRef = lastVNode.ref;
    if (lastRef !== nextRef) {
      unmountRef(lastRef);
      mountRef(nextRef, dom, lifecycle);
    }
  }
  function replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle) {
    unmount(lastChildren);
    mountArrayChildren(nextChildren, parentDOM, context, isSVG, findDOMfromVNode(lastChildren, true), lifecycle);
    removeVNodeDOM(lastChildren, parentDOM);
  }
  function patchChildren(lastChildFlags, nextChildFlags, lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, parentVNode, lifecycle) {
    switch (lastChildFlags) {
      case 2 /* HasVNodeChildren */:
        switch (nextChildFlags) {
          case 2 /* HasVNodeChildren */:
            patch(lastChildren, nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
          case 1 /* HasInvalidChildren */:
            remove(lastChildren, parentDOM);
            break;
          case 16 /* HasTextChildren */:
            unmount(lastChildren);
            setTextContent(parentDOM, nextChildren);
            break;
          default:
            replaceOneVNodeWithMultipleVNodes(lastChildren, nextChildren, parentDOM, context, isSVG, lifecycle);
            break;
        }
        break;
      case 1 /* HasInvalidChildren */:
        switch (nextChildFlags) {
          case 2 /* HasVNodeChildren */:
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
          case 1 /* HasInvalidChildren */:
            break;
          case 16 /* HasTextChildren */:
            setTextContent(parentDOM, nextChildren);
            break;
          default:
            mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
        }
        break;
      case 16 /* HasTextChildren */:
        switch (nextChildFlags) {
          case 16 /* HasTextChildren */:
            patchSingleTextChild(lastChildren, nextChildren, parentDOM);
            break;
          case 2 /* HasVNodeChildren */:
            clearDOM(parentDOM);
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
          case 1 /* HasInvalidChildren */:
            clearDOM(parentDOM);
            break;
          default:
            clearDOM(parentDOM);
            mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
        }
        break;
      default:
        switch (nextChildFlags) {
          case 16 /* HasTextChildren */:
            unmountAllChildren(lastChildren);
            setTextContent(parentDOM, nextChildren);
            break;
          case 2 /* HasVNodeChildren */:
            removeAllChildren(parentDOM, parentVNode, lastChildren);
            mount(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
            break;
          case 1 /* HasInvalidChildren */:
            removeAllChildren(parentDOM, parentVNode, lastChildren);
            break;
          default:
            var lastLength = lastChildren.length | 0;
            var nextLength = nextChildren.length | 0;
            // Fast path's for both algorithms
            if (lastLength === 0) {
              if (nextLength > 0) {
                mountArrayChildren(nextChildren, parentDOM, context, isSVG, nextNode, lifecycle);
              }
            } else if (nextLength === 0) {
              removeAllChildren(parentDOM, parentVNode, lastChildren);
            } else if (nextChildFlags === 8 /* HasKeyedChildren */ && lastChildFlags === 8 /* HasKeyedChildren */) {
              patchKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, parentVNode, lifecycle);
            } else {
              patchNonKeyedChildren(lastChildren, nextChildren, parentDOM, context, isSVG, lastLength, nextLength, nextNode, lifecycle);
            }
            break;
        }
        break;
    }
  }
  function createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle) {
    lifecycle.push(function () {
      instance.componentDidUpdate(lastProps, lastState, snapshot);
    });
  }
  function updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, force, nextNode, lifecycle) {
    var lastState = instance.state;
    var lastProps = instance.props;
    var usesNewAPI = Boolean(instance.$N);
    var hasSCU = isFunction(instance.shouldComponentUpdate);
    if (usesNewAPI) {
      nextState = createDerivedState(instance, nextProps, nextState !== lastState ? combineFrom(lastState, nextState) : nextState);
    }
    if (force || !hasSCU || hasSCU && instance.shouldComponentUpdate(nextProps, nextState, context)) {
      if (!usesNewAPI && isFunction(instance.componentWillUpdate)) {
        instance.componentWillUpdate(nextProps, nextState, context);
      }
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
      var snapshot = null;
      var nextInput = renderNewInput(instance, nextProps, context);
      if (usesNewAPI && isFunction(instance.getSnapshotBeforeUpdate)) {
        snapshot = instance.getSnapshotBeforeUpdate(lastProps, lastState);
      }
      patch(instance.$LI, nextInput, parentDOM, instance.$CX, isSVG, nextNode, lifecycle);
      // Dont update Last input, until patch has been succesfully executed
      instance.$LI = nextInput;
      if (isFunction(instance.componentDidUpdate)) {
        createDidUpdate(instance, lastProps, lastState, snapshot, lifecycle);
      }
    } else {
      instance.props = nextProps;
      instance.state = nextState;
      instance.context = context;
    }
  }
  function patchClassComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var instance = nextVNode.children = lastVNode.children;
    // If Component has crashed, ignore it to stay functional
    if (isNull(instance)) {
      return;
    }
    instance.$L = lifecycle;
    var nextProps = nextVNode.props || EMPTY_OBJ;
    var nextRef = nextVNode.ref;
    var lastRef = lastVNode.ref;
    var nextState = instance.state;
    if (!instance.$N) {
      if (isFunction(instance.componentWillReceiveProps)) {
        instance.$BR = true;
        instance.componentWillReceiveProps(nextProps, context);
        // If instance component was removed during its own update do nothing.
        if (instance.$UN) {
          return;
        }
        instance.$BR = false;
      }
      if (!isNull(instance.$PS)) {
        nextState = combineFrom(nextState, instance.$PS);
        instance.$PS = null;
      }
    }
    updateClassComponent(instance, nextState, nextProps, parentDOM, context, isSVG, false, nextNode, lifecycle);
    if (lastRef !== nextRef) {
      unmountRef(lastRef);
      mountRef(nextRef, instance, lifecycle);
    }
  }
  function patchFunctionalComponent(lastVNode, nextVNode, parentDOM, context, isSVG, nextNode, lifecycle) {
    var shouldUpdate = true;
    var nextProps = nextVNode.props || EMPTY_OBJ;
    var nextRef = nextVNode.ref;
    var lastProps = lastVNode.props;
    var nextHooksDefined = !isNullOrUndef(nextRef);
    var lastInput = lastVNode.children;
    if (nextHooksDefined && isFunction(nextRef.onComponentShouldUpdate)) {
      shouldUpdate = nextRef.onComponentShouldUpdate(lastProps, nextProps);
    }
    if (shouldUpdate !== false) {
      if (nextHooksDefined && isFunction(nextRef.onComponentWillUpdate)) {
        nextRef.onComponentWillUpdate(lastProps, nextProps);
      }
      var nextInput = normalizeRoot(renderFunctionalComponent(nextVNode, context));
      patch(lastInput, nextInput, parentDOM, context, isSVG, nextNode, lifecycle);
      nextVNode.children = nextInput;
      if (nextHooksDefined && isFunction(nextRef.onComponentDidUpdate)) {
        nextRef.onComponentDidUpdate(lastProps, nextProps);
      }
    } else {
      nextVNode.children = lastInput;
    }
  }
  function patchText(lastVNode, nextVNode) {
    var nextText = nextVNode.children;
    var dom = nextVNode.dom = lastVNode.dom;
    if (nextText !== lastVNode.children) {
      dom.nodeValue = nextText;
    }
  }
  function patchNonKeyedChildren(lastChildren, nextChildren, dom, context, isSVG, lastChildrenLength, nextChildrenLength, nextNode, lifecycle) {
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    var nextChild;
    var lastChild;
    for (; i < commonLength; ++i) {
      nextChild = nextChildren[i];
      lastChild = lastChildren[i];
      if (nextChild.flags & 16384 /* InUse */) {
        nextChild = nextChildren[i] = directClone(nextChild);
      }
      patch(lastChild, nextChild, dom, context, isSVG, nextNode, lifecycle);
      lastChildren[i] = nextChild;
    }
    if (lastChildrenLength < nextChildrenLength) {
      for (i = commonLength; i < nextChildrenLength; ++i) {
        nextChild = nextChildren[i];
        if (nextChild.flags & 16384 /* InUse */) {
          nextChild = nextChildren[i] = directClone(nextChild);
        }
        mount(nextChild, dom, context, isSVG, nextNode, lifecycle);
      }
    } else if (lastChildrenLength > nextChildrenLength) {
      for (i = commonLength; i < lastChildrenLength; ++i) {
        remove(lastChildren[i], dom);
      }
    }
  }
  function patchKeyedChildren(a, b, dom, context, isSVG, aLength, bLength, outerEdge, parentVNode, lifecycle) {
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var j = 0;
    var aNode = a[j];
    var bNode = b[j];
    var nextPos;
    var nextNode;
    // Step 1
    // tslint:disable-next-line
    outer: {
      // Sync nodes with the same key at the beginning.
      while (aNode.key === bNode.key) {
        if (bNode.flags & 16384 /* InUse */) {
          b[j] = bNode = directClone(bNode);
        }
        patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
        a[j] = bNode;
        ++j;
        if (j > aEnd || j > bEnd) {
          break outer;
        }
        aNode = a[j];
        bNode = b[j];
      }
      aNode = a[aEnd];
      bNode = b[bEnd];
      // Sync nodes with the same key at the end.
      while (aNode.key === bNode.key) {
        if (bNode.flags & 16384 /* InUse */) {
          b[bEnd] = bNode = directClone(bNode);
        }
        patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
        a[aEnd] = bNode;
        aEnd--;
        bEnd--;
        if (j > aEnd || j > bEnd) {
          break outer;
        }
        aNode = a[aEnd];
        bNode = b[bEnd];
      }
    }
    if (j > aEnd) {
      if (j <= bEnd) {
        nextPos = bEnd + 1;
        nextNode = nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge;
        while (j <= bEnd) {
          bNode = b[j];
          if (bNode.flags & 16384 /* InUse */) {
            b[j] = bNode = directClone(bNode);
          }
          ++j;
          mount(bNode, dom, context, isSVG, nextNode, lifecycle);
        }
      }
    } else if (j > bEnd) {
      while (j <= aEnd) {
        remove(a[j++], dom);
      }
    } else {
      patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle);
    }
  }
  function patchKeyedChildrenComplex(a, b, context, aLength, bLength, aEnd, bEnd, j, dom, isSVG, outerEdge, parentVNode, lifecycle) {
    var aNode;
    var bNode;
    var nextPos;
    var i = 0;
    var aStart = j;
    var bStart = j;
    var aLeft = aEnd - j + 1;
    var bLeft = bEnd - j + 1;
    var sources = new Int32Array(bLeft + 1);
    // Keep track if its possible to remove whole DOM using textContent = '';
    var canRemoveWholeContent = aLeft === aLength;
    var moved = false;
    var pos = 0;
    var patched = 0;
    // When sizes are small, just loop them through
    if (bLength < 4 || (aLeft | bLeft) < 32) {
      for (i = aStart; i <= aEnd; ++i) {
        aNode = a[i];
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j];
            if (aNode.key === bNode.key) {
              sources[j - bStart] = i + 1;
              if (canRemoveWholeContent) {
                canRemoveWholeContent = false;
                while (aStart < i) {
                  remove(a[aStart++], dom);
                }
              }
              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              if (bNode.flags & 16384 /* InUse */) {
                b[j] = bNode = directClone(bNode);
              }
              patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
              ++patched;
              break;
            }
          }
          if (!canRemoveWholeContent && j > bEnd) {
            remove(aNode, dom);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom);
        }
      }
    } else {
      var keyIndex = {};
      // Map keys by their index
      for (i = bStart; i <= bEnd; ++i) {
        keyIndex[b[i].key] = i;
      }
      // Try to patch same keys
      for (i = aStart; i <= aEnd; ++i) {
        aNode = a[i];
        if (patched < bLeft) {
          j = keyIndex[aNode.key];
          if (j !== void 0) {
            if (canRemoveWholeContent) {
              canRemoveWholeContent = false;
              while (i > aStart) {
                remove(a[aStart++], dom);
              }
            }
            sources[j - bStart] = i + 1;
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            bNode = b[j];
            if (bNode.flags & 16384 /* InUse */) {
              b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, dom, context, isSVG, outerEdge, lifecycle);
            ++patched;
          } else if (!canRemoveWholeContent) {
            remove(aNode, dom);
          }
        } else if (!canRemoveWholeContent) {
          remove(aNode, dom);
        }
      }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (canRemoveWholeContent) {
      removeAllChildren(dom, parentVNode, a);
      mountArrayChildren(b, dom, context, isSVG, outerEdge, lifecycle);
    } else if (moved) {
      var seq = lis_algorithm(sources);
      j = seq.length - 1;
      for (i = bLeft - 1; i >= 0; i--) {
        if (sources[i] === 0) {
          pos = i + bStart;
          bNode = b[pos];
          if (bNode.flags & 16384 /* InUse */) {
            b[pos] = bNode = directClone(bNode);
          }
          nextPos = pos + 1;
          mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
        } else if (j < 0 || i !== seq[j]) {
          pos = i + bStart;
          bNode = b[pos];
          nextPos = pos + 1;
          moveVNodeDOM(bNode, dom, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge);
        } else {
          j--;
        }
      }
    } else if (patched !== bLeft) {
      // when patched count doesn't match b length we need to insert those new ones
      // loop backwards so we can use insertBefore
      for (i = bLeft - 1; i >= 0; i--) {
        if (sources[i] === 0) {
          pos = i + bStart;
          bNode = b[pos];
          if (bNode.flags & 16384 /* InUse */) {
            b[pos] = bNode = directClone(bNode);
          }
          nextPos = pos + 1;
          mount(bNode, dom, context, isSVG, nextPos < bLength ? findDOMfromVNode(b[nextPos], true) : outerEdge, lifecycle);
        }
      }
    }
  }
  var result;
  var p;
  var maxLen = 0;
  // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
  function lis_algorithm(arr) {
    var arrI = 0;
    var i = 0;
    var j = 0;
    var k = 0;
    var u = 0;
    var v = 0;
    var c = 0;
    var len = arr.length;
    if (len > maxLen) {
      maxLen = len;
      result = new Int32Array(len);
      p = new Int32Array(len);
    }
    for (; i < len; ++i) {
      arrI = arr[i];
      if (arrI !== 0) {
        j = result[k];
        if (arr[j] < arrI) {
          p[i] = j;
          result[++k] = i;
          continue;
        }
        u = 0;
        v = k;
        while (u < v) {
          c = u + v >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = k + 1;
    var seq = new Int32Array(u);
    v = result[u - 1];
    while (u-- > 0) {
      seq[u] = v;
      v = p[v];
      result[u] = 0;
    }
    return seq;
  }
  var hasDocumentAvailable = typeof document !== 'undefined';
  if (hasDocumentAvailable) {
    /*
     * Defining $EV and $V properties on Node.prototype
     * fixes v8 "wrong map" de-optimization
     */
    if (window.Node) {
      Node.prototype.$EV = null;
      Node.prototype.$V = null;
    }
  }
  function __render(input, parentDOM, callback, context) {
    var lifecycle = [];
    var rootInput = parentDOM.$V;
    renderCheck.v = true;
    if (isNullOrUndef(rootInput)) {
      if (!isNullOrUndef(input)) {
        if (input.flags & 16384 /* InUse */) {
          input = directClone(input);
        }
        mount(input, parentDOM, context, false, null, lifecycle);
        parentDOM.$V = input;
        rootInput = input;
      }
    } else {
      if (isNullOrUndef(input)) {
        remove(rootInput, parentDOM);
        parentDOM.$V = null;
      } else {
        if (input.flags & 16384 /* InUse */) {
          input = directClone(input);
        }
        patch(rootInput, input, parentDOM, context, false, null, lifecycle);
        rootInput = parentDOM.$V = input;
      }
    }
    callAll(lifecycle);
    renderCheck.v = false;
    if (isFunction(callback)) {
      callback();
    }
    if (isFunction(options.renderComplete)) {
      options.renderComplete(rootInput, parentDOM);
    }
  }
  function render(input, parentDOM, callback, context) {
    if (callback === void 0) callback = null;
    if (context === void 0) context = EMPTY_OBJ;
    __render(input, parentDOM, callback, context);
  }
  var QUEUE = [];
  var nextTick = typeof Promise !== 'undefined' ? Promise.resolve().then.bind(Promise.resolve()) : function (a) {
    window.setTimeout(a, 0);
  };
  var microTaskPending = false;
  function queueStateChanges(component, newState, callback, force) {
    var pending = component.$PS;
    if (isFunction(newState)) {
      newState = newState(pending ? combineFrom(component.state, pending) : component.state, component.props, component.context);
    }
    if (isNullOrUndef(pending)) {
      component.$PS = newState;
    } else {
      for (var stateKey in newState) {
        pending[stateKey] = newState[stateKey];
      }
    }
    if (!component.$BR) {
      if (!renderCheck.v) {
        if (QUEUE.length === 0) {
          applyState(component, force);
          if (isFunction(callback)) {
            callback.call(component);
          }
          return;
        }
      }
      if (QUEUE.indexOf(component) === -1) {
        QUEUE.push(component);
      }
      if (force) {
        component.$F = true;
      }
      if (!microTaskPending) {
        microTaskPending = true;
        nextTick(rerender);
      }
      if (isFunction(callback)) {
        var QU = component.$QU;
        if (!QU) {
          QU = component.$QU = [];
        }
        QU.push(callback);
      }
    } else if (isFunction(callback)) {
      component.$L.push(callback.bind(component));
    }
  }
  function callSetStateCallbacks(component) {
    var queue = component.$QU;
    for (var i = 0; i < queue.length; ++i) {
      queue[i].call(component);
    }
    component.$QU = null;
  }
  function rerender() {
    var component;
    microTaskPending = false;
    while (component = QUEUE.shift()) {
      if (!component.$UN) {
        var force = component.$F;
        component.$F = false;
        applyState(component, force);
        if (component.$QU) {
          callSetStateCallbacks(component);
        }
      }
    }
  }
  function applyState(component, force) {
    if (force || !component.$BR) {
      var pendingState = component.$PS;
      component.$PS = null;
      var lifecycle = [];
      renderCheck.v = true;
      updateClassComponent(component, combineFrom(component.state, pendingState), component.props, findDOMfromVNode(component.$LI, true).parentNode, component.context, component.$SVG, force, null, lifecycle);
      callAll(lifecycle);
      renderCheck.v = false;
    } else {
      component.state = component.$PS;
      component.$PS = null;
    }
  }
  var Component = function Component(props, context) {
    // Public
    this.state = null;
    // Internal properties
    this.$BR = false; // BLOCK RENDER
    this.$BS = true; // BLOCK STATE
    this.$PS = null; // PENDING STATE (PARTIAL or FULL)
    this.$LI = null; // LAST INPUT
    this.$UN = false; // UNMOUNTED
    this.$CX = null; // CHILDCONTEXT
    this.$QU = null; // QUEUE
    this.$N = false; // Uses new lifecycle API Flag
    this.$L = null; // Current lifecycle of this component
    this.$SVG = false; // Flag to keep track if component is inside SVG tree
    this.$F = false; // Force update flag
    this.props = props || EMPTY_OBJ;
    this.context = context || EMPTY_OBJ; // context should not be mutable
  };

  Component.prototype.forceUpdate = function forceUpdate(callback) {
    if (this.$UN) {
      return;
    }
    // Do not allow double render during force update
    queueStateChanges(this, {}, callback, true);
  };
  Component.prototype.setState = function setState(newState, callback) {
    if (this.$UN) {
      return;
    }
    if (!this.$BS) {
      queueStateChanges(this, newState, callback, false);
    }
  };
  Component.prototype.render = function render(_nextProps, _nextState, _nextContext) {
    return null;
  };

  /**
   * @param typeMap [Object] Map of MIME type -> Array[extensions]
   * @param ...
   */
  function Mime$1() {
    this._types = Object.create(null);
    this._extensions = Object.create(null);
    for (let i = 0; i < arguments.length; i++) {
      this.define(arguments[i]);
    }
    this.define = this.define.bind(this);
    this.getType = this.getType.bind(this);
    this.getExtension = this.getExtension.bind(this);
  }

  /**
   * Define mimetype -> extension mappings.  Each key is a mime-type that maps
   * to an array of extensions associated with the type.  The first extension is
   * used as the default extension for the type.
   *
   * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
   *
   * If a type declares an extension that has already been defined, an error will
   * be thrown.  To suppress this error and force the extension to be associated
   * with the new type, pass `force`=true.  Alternatively, you may prefix the
   * extension with "*" to map the type to extension, without mapping the
   * extension to the type.
   *
   * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
   *
   *
   * @param map (Object) type definitions
   * @param force (Boolean) if true, force overriding of existing definitions
   */
  Mime$1.prototype.define = function (typeMap, force) {
    for (let type in typeMap) {
      let extensions = typeMap[type].map(function (t) {
        return t.toLowerCase();
      });
      type = type.toLowerCase();
      for (let i = 0; i < extensions.length; i++) {
        const ext = extensions[i];

        // '*' prefix = not the preferred type for this extension.  So fixup the
        // extension, and skip it.
        if (ext[0] === '*') {
          continue;
        }
        if (!force && ext in this._types) {
          throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
        }
        this._types[ext] = type;
      }

      // Use first extension as default
      if (force || !this._extensions[type]) {
        const ext = extensions[0];
        this._extensions[type] = ext[0] !== '*' ? ext : ext.substr(1);
      }
    }
  };

  /**
   * Lookup a mime type based on extension
   */
  Mime$1.prototype.getType = function (path) {
    path = String(path);
    let last = path.replace(/^.*[/\\]/, '').toLowerCase();
    let ext = last.replace(/^.*\./, '').toLowerCase();
    let hasPath = last.length < path.length;
    let hasDot = ext.length < last.length - 1;
    return (hasDot || !hasPath) && this._types[ext] || null;
  };

  /**
   * Return file extension associated with a mime type
   */
  Mime$1.prototype.getExtension = function (type) {
    type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
    return type && this._extensions[type.toLowerCase()] || null;
  };
  var Mime_1 = Mime$1;

  var standard = {
    "application/andrew-inset": ["ez"],
    "application/applixware": ["aw"],
    "application/atom+xml": ["atom"],
    "application/atomcat+xml": ["atomcat"],
    "application/atomdeleted+xml": ["atomdeleted"],
    "application/atomsvc+xml": ["atomsvc"],
    "application/atsc-dwd+xml": ["dwd"],
    "application/atsc-held+xml": ["held"],
    "application/atsc-rsat+xml": ["rsat"],
    "application/bdoc": ["bdoc"],
    "application/calendar+xml": ["xcs"],
    "application/ccxml+xml": ["ccxml"],
    "application/cdfx+xml": ["cdfx"],
    "application/cdmi-capability": ["cdmia"],
    "application/cdmi-container": ["cdmic"],
    "application/cdmi-domain": ["cdmid"],
    "application/cdmi-object": ["cdmio"],
    "application/cdmi-queue": ["cdmiq"],
    "application/cu-seeme": ["cu"],
    "application/dash+xml": ["mpd"],
    "application/davmount+xml": ["davmount"],
    "application/docbook+xml": ["dbk"],
    "application/dssc+der": ["dssc"],
    "application/dssc+xml": ["xdssc"],
    "application/ecmascript": ["es", "ecma"],
    "application/emma+xml": ["emma"],
    "application/emotionml+xml": ["emotionml"],
    "application/epub+zip": ["epub"],
    "application/exi": ["exi"],
    "application/express": ["exp"],
    "application/fdt+xml": ["fdt"],
    "application/font-tdpfr": ["pfr"],
    "application/geo+json": ["geojson"],
    "application/gml+xml": ["gml"],
    "application/gpx+xml": ["gpx"],
    "application/gxf": ["gxf"],
    "application/gzip": ["gz"],
    "application/hjson": ["hjson"],
    "application/hyperstudio": ["stk"],
    "application/inkml+xml": ["ink", "inkml"],
    "application/ipfix": ["ipfix"],
    "application/its+xml": ["its"],
    "application/java-archive": ["jar", "war", "ear"],
    "application/java-serialized-object": ["ser"],
    "application/java-vm": ["class"],
    "application/javascript": ["js", "mjs"],
    "application/json": ["json", "map"],
    "application/json5": ["json5"],
    "application/jsonml+json": ["jsonml"],
    "application/ld+json": ["jsonld"],
    "application/lgr+xml": ["lgr"],
    "application/lost+xml": ["lostxml"],
    "application/mac-binhex40": ["hqx"],
    "application/mac-compactpro": ["cpt"],
    "application/mads+xml": ["mads"],
    "application/manifest+json": ["webmanifest"],
    "application/marc": ["mrc"],
    "application/marcxml+xml": ["mrcx"],
    "application/mathematica": ["ma", "nb", "mb"],
    "application/mathml+xml": ["mathml"],
    "application/mbox": ["mbox"],
    "application/mediaservercontrol+xml": ["mscml"],
    "application/metalink+xml": ["metalink"],
    "application/metalink4+xml": ["meta4"],
    "application/mets+xml": ["mets"],
    "application/mmt-aei+xml": ["maei"],
    "application/mmt-usd+xml": ["musd"],
    "application/mods+xml": ["mods"],
    "application/mp21": ["m21", "mp21"],
    "application/mp4": ["mp4s", "m4p"],
    "application/msword": ["doc", "dot"],
    "application/mxf": ["mxf"],
    "application/n-quads": ["nq"],
    "application/n-triples": ["nt"],
    "application/node": ["cjs"],
    "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"],
    "application/oda": ["oda"],
    "application/oebps-package+xml": ["opf"],
    "application/ogg": ["ogx"],
    "application/omdoc+xml": ["omdoc"],
    "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"],
    "application/oxps": ["oxps"],
    "application/p2p-overlay+xml": ["relo"],
    "application/patch-ops-error+xml": ["xer"],
    "application/pdf": ["pdf"],
    "application/pgp-encrypted": ["pgp"],
    "application/pgp-signature": ["asc", "sig"],
    "application/pics-rules": ["prf"],
    "application/pkcs10": ["p10"],
    "application/pkcs7-mime": ["p7m", "p7c"],
    "application/pkcs7-signature": ["p7s"],
    "application/pkcs8": ["p8"],
    "application/pkix-attr-cert": ["ac"],
    "application/pkix-cert": ["cer"],
    "application/pkix-crl": ["crl"],
    "application/pkix-pkipath": ["pkipath"],
    "application/pkixcmp": ["pki"],
    "application/pls+xml": ["pls"],
    "application/postscript": ["ai", "eps", "ps"],
    "application/provenance+xml": ["provx"],
    "application/pskc+xml": ["pskcxml"],
    "application/raml+yaml": ["raml"],
    "application/rdf+xml": ["rdf", "owl"],
    "application/reginfo+xml": ["rif"],
    "application/relax-ng-compact-syntax": ["rnc"],
    "application/resource-lists+xml": ["rl"],
    "application/resource-lists-diff+xml": ["rld"],
    "application/rls-services+xml": ["rs"],
    "application/route-apd+xml": ["rapd"],
    "application/route-s-tsid+xml": ["sls"],
    "application/route-usd+xml": ["rusd"],
    "application/rpki-ghostbusters": ["gbr"],
    "application/rpki-manifest": ["mft"],
    "application/rpki-roa": ["roa"],
    "application/rsd+xml": ["rsd"],
    "application/rss+xml": ["rss"],
    "application/rtf": ["rtf"],
    "application/sbml+xml": ["sbml"],
    "application/scvp-cv-request": ["scq"],
    "application/scvp-cv-response": ["scs"],
    "application/scvp-vp-request": ["spq"],
    "application/scvp-vp-response": ["spp"],
    "application/sdp": ["sdp"],
    "application/senml+xml": ["senmlx"],
    "application/sensml+xml": ["sensmlx"],
    "application/set-payment-initiation": ["setpay"],
    "application/set-registration-initiation": ["setreg"],
    "application/shf+xml": ["shf"],
    "application/sieve": ["siv", "sieve"],
    "application/smil+xml": ["smi", "smil"],
    "application/sparql-query": ["rq"],
    "application/sparql-results+xml": ["srx"],
    "application/srgs": ["gram"],
    "application/srgs+xml": ["grxml"],
    "application/sru+xml": ["sru"],
    "application/ssdl+xml": ["ssdl"],
    "application/ssml+xml": ["ssml"],
    "application/swid+xml": ["swidtag"],
    "application/tei+xml": ["tei", "teicorpus"],
    "application/thraud+xml": ["tfi"],
    "application/timestamped-data": ["tsd"],
    "application/toml": ["toml"],
    "application/trig": ["trig"],
    "application/ttml+xml": ["ttml"],
    "application/ubjson": ["ubj"],
    "application/urc-ressheet+xml": ["rsheet"],
    "application/urc-targetdesc+xml": ["td"],
    "application/voicexml+xml": ["vxml"],
    "application/wasm": ["wasm"],
    "application/widget": ["wgt"],
    "application/winhlp": ["hlp"],
    "application/wsdl+xml": ["wsdl"],
    "application/wspolicy+xml": ["wspolicy"],
    "application/xaml+xml": ["xaml"],
    "application/xcap-att+xml": ["xav"],
    "application/xcap-caps+xml": ["xca"],
    "application/xcap-diff+xml": ["xdf"],
    "application/xcap-el+xml": ["xel"],
    "application/xcap-ns+xml": ["xns"],
    "application/xenc+xml": ["xenc"],
    "application/xhtml+xml": ["xhtml", "xht"],
    "application/xliff+xml": ["xlf"],
    "application/xml": ["xml", "xsl", "xsd", "rng"],
    "application/xml-dtd": ["dtd"],
    "application/xop+xml": ["xop"],
    "application/xproc+xml": ["xpl"],
    "application/xslt+xml": ["*xsl", "xslt"],
    "application/xspf+xml": ["xspf"],
    "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"],
    "application/yang": ["yang"],
    "application/yin+xml": ["yin"],
    "application/zip": ["zip"],
    "audio/3gpp": ["*3gpp"],
    "audio/adpcm": ["adp"],
    "audio/amr": ["amr"],
    "audio/basic": ["au", "snd"],
    "audio/midi": ["mid", "midi", "kar", "rmi"],
    "audio/mobile-xmf": ["mxmf"],
    "audio/mp3": ["*mp3"],
    "audio/mp4": ["m4a", "mp4a"],
    "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
    "audio/ogg": ["oga", "ogg", "spx", "opus"],
    "audio/s3m": ["s3m"],
    "audio/silk": ["sil"],
    "audio/wav": ["wav"],
    "audio/wave": ["*wav"],
    "audio/webm": ["weba"],
    "audio/xm": ["xm"],
    "font/collection": ["ttc"],
    "font/otf": ["otf"],
    "font/ttf": ["ttf"],
    "font/woff": ["woff"],
    "font/woff2": ["woff2"],
    "image/aces": ["exr"],
    "image/apng": ["apng"],
    "image/avif": ["avif"],
    "image/bmp": ["bmp"],
    "image/cgm": ["cgm"],
    "image/dicom-rle": ["drle"],
    "image/emf": ["emf"],
    "image/fits": ["fits"],
    "image/g3fax": ["g3"],
    "image/gif": ["gif"],
    "image/heic": ["heic"],
    "image/heic-sequence": ["heics"],
    "image/heif": ["heif"],
    "image/heif-sequence": ["heifs"],
    "image/hej2k": ["hej2"],
    "image/hsj2": ["hsj2"],
    "image/ief": ["ief"],
    "image/jls": ["jls"],
    "image/jp2": ["jp2", "jpg2"],
    "image/jpeg": ["jpeg", "jpg", "jpe"],
    "image/jph": ["jph"],
    "image/jphc": ["jhc"],
    "image/jpm": ["jpm"],
    "image/jpx": ["jpx", "jpf"],
    "image/jxr": ["jxr"],
    "image/jxra": ["jxra"],
    "image/jxrs": ["jxrs"],
    "image/jxs": ["jxs"],
    "image/jxsc": ["jxsc"],
    "image/jxsi": ["jxsi"],
    "image/jxss": ["jxss"],
    "image/ktx": ["ktx"],
    "image/ktx2": ["ktx2"],
    "image/png": ["png"],
    "image/sgi": ["sgi"],
    "image/svg+xml": ["svg", "svgz"],
    "image/t38": ["t38"],
    "image/tiff": ["tif", "tiff"],
    "image/tiff-fx": ["tfx"],
    "image/webp": ["webp"],
    "image/wmf": ["wmf"],
    "message/disposition-notification": ["disposition-notification"],
    "message/global": ["u8msg"],
    "message/global-delivery-status": ["u8dsn"],
    "message/global-disposition-notification": ["u8mdn"],
    "message/global-headers": ["u8hdr"],
    "message/rfc822": ["eml", "mime"],
    "model/3mf": ["3mf"],
    "model/gltf+json": ["gltf"],
    "model/gltf-binary": ["glb"],
    "model/iges": ["igs", "iges"],
    "model/mesh": ["msh", "mesh", "silo"],
    "model/mtl": ["mtl"],
    "model/obj": ["obj"],
    "model/step+xml": ["stpx"],
    "model/step+zip": ["stpz"],
    "model/step-xml+zip": ["stpxz"],
    "model/stl": ["stl"],
    "model/vrml": ["wrl", "vrml"],
    "model/x3d+binary": ["*x3db", "x3dbz"],
    "model/x3d+fastinfoset": ["x3db"],
    "model/x3d+vrml": ["*x3dv", "x3dvz"],
    "model/x3d+xml": ["x3d", "x3dz"],
    "model/x3d-vrml": ["x3dv"],
    "text/cache-manifest": ["appcache", "manifest"],
    "text/calendar": ["ics", "ifb"],
    "text/coffeescript": ["coffee", "litcoffee"],
    "text/css": ["css"],
    "text/csv": ["csv"],
    "text/html": ["html", "htm", "shtml"],
    "text/jade": ["jade"],
    "text/jsx": ["jsx"],
    "text/less": ["less"],
    "text/markdown": ["markdown", "md"],
    "text/mathml": ["mml"],
    "text/mdx": ["mdx"],
    "text/n3": ["n3"],
    "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"],
    "text/richtext": ["rtx"],
    "text/rtf": ["*rtf"],
    "text/sgml": ["sgml", "sgm"],
    "text/shex": ["shex"],
    "text/slim": ["slim", "slm"],
    "text/spdx": ["spdx"],
    "text/stylus": ["stylus", "styl"],
    "text/tab-separated-values": ["tsv"],
    "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
    "text/turtle": ["ttl"],
    "text/uri-list": ["uri", "uris", "urls"],
    "text/vcard": ["vcard"],
    "text/vtt": ["vtt"],
    "text/xml": ["*xml"],
    "text/yaml": ["yaml", "yml"],
    "video/3gpp": ["3gp", "3gpp"],
    "video/3gpp2": ["3g2"],
    "video/h261": ["h261"],
    "video/h263": ["h263"],
    "video/h264": ["h264"],
    "video/iso.segment": ["m4s"],
    "video/jpeg": ["jpgv"],
    "video/jpm": ["*jpm", "jpgm"],
    "video/mj2": ["mj2", "mjp2"],
    "video/mp2t": ["ts"],
    "video/mp4": ["mp4", "mp4v", "mpg4"],
    "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
    "video/ogg": ["ogv"],
    "video/quicktime": ["qt", "mov"],
    "video/webm": ["webm"]
  };

  let Mime = Mime_1;
  var lite = new Mime(standard);

  var picomatch$2 = {exports: {}};

  const basename = path => {
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;
    for (i = path.length - 1; i >= 0; --i) {
      if (path.charCodeAt(i) === 47) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }
    if (end === -1) {
      return '';
    }
    return path.slice(start, end);
  };
  var path$1 = {
    basename
  };

  var utils$3 = {};

  const WIN_SLASH = '\\\\/';
  const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

  /**
   * Posix glob regex
   */

  const DOT_LITERAL = '\\.';
  const PLUS_LITERAL = '\\+';
  const QMARK_LITERAL = '\\?';
  const SLASH_LITERAL = '\\/';
  const ONE_CHAR = '(?=.)';
  const QMARK = '[^/]';
  const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  const NO_DOT = `(?!${DOT_LITERAL})`;
  const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  const STAR = `${QMARK}*?`;
  const POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  };

  /**
   * Windows glob regex
   */

  const WINDOWS_CHARS = {
    ...POSIX_CHARS,
    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
  };

  /**
   * POSIX Bracket Regex
   */

  const POSIX_REGEX_SOURCE$1 = {
    alnum: 'a-zA-Z0-9',
    alpha: 'a-zA-Z',
    ascii: '\\x00-\\x7F',
    blank: ' \\t',
    cntrl: '\\x00-\\x1F\\x7F',
    digit: '0-9',
    graph: '\\x21-\\x7E',
    lower: 'a-z',
    print: '\\x20-\\x7E ',
    punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
    space: ' \\t\\r\\n\\v\\f',
    upper: 'A-Z',
    word: 'A-Za-z0-9_',
    xdigit: 'A-Fa-f0-9'
  };
  var constants$2 = {
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
    // regular expressions
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    // Replace globs with equivalent patterns to reduce parsing time.
    REPLACEMENTS: {
      '***': '*',
      '**/**': '**',
      '**/**/**': '**'
    },
    // Digits
    CHAR_0: 48,
    /* 0 */
    CHAR_9: 57,
    /* 9 */

    // Alphabet chars.
    CHAR_UPPERCASE_A: 65,
    /* A */
    CHAR_LOWERCASE_A: 97,
    /* a */
    CHAR_UPPERCASE_Z: 90,
    /* Z */
    CHAR_LOWERCASE_Z: 122,
    /* z */

    CHAR_LEFT_PARENTHESES: 40,
    /* ( */
    CHAR_RIGHT_PARENTHESES: 41,
    /* ) */

    CHAR_ASTERISK: 42,
    /* * */

    // Non-alphabetic chars.
    CHAR_AMPERSAND: 38,
    /* & */
    CHAR_AT: 64,
    /* @ */
    CHAR_BACKWARD_SLASH: 92,
    /* \ */
    CHAR_CARRIAGE_RETURN: 13,
    /* \r */
    CHAR_CIRCUMFLEX_ACCENT: 94,
    /* ^ */
    CHAR_COLON: 58,
    /* : */
    CHAR_COMMA: 44,
    /* , */
    CHAR_DOT: 46,
    /* . */
    CHAR_DOUBLE_QUOTE: 34,
    /* " */
    CHAR_EQUAL: 61,
    /* = */
    CHAR_EXCLAMATION_MARK: 33,
    /* ! */
    CHAR_FORM_FEED: 12,
    /* \f */
    CHAR_FORWARD_SLASH: 47,
    /* / */
    CHAR_GRAVE_ACCENT: 96,
    /* ` */
    CHAR_HASH: 35,
    /* # */
    CHAR_HYPHEN_MINUS: 45,
    /* - */
    CHAR_LEFT_ANGLE_BRACKET: 60,
    /* < */
    CHAR_LEFT_CURLY_BRACE: 123,
    /* { */
    CHAR_LEFT_SQUARE_BRACKET: 91,
    /* [ */
    CHAR_LINE_FEED: 10,
    /* \n */
    CHAR_NO_BREAK_SPACE: 160,
    /* \u00A0 */
    CHAR_PERCENT: 37,
    /* % */
    CHAR_PLUS: 43,
    /* + */
    CHAR_QUESTION_MARK: 63,
    /* ? */
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    /* > */
    CHAR_RIGHT_CURLY_BRACE: 125,
    /* } */
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    /* ] */
    CHAR_SEMICOLON: 59,
    /* ; */
    CHAR_SINGLE_QUOTE: 39,
    /* ' */
    CHAR_SPACE: 32,
    /*   */
    CHAR_TAB: 9,
    /* \t */
    CHAR_UNDERSCORE: 95,
    /* _ */
    CHAR_VERTICAL_LINE: 124,
    /* | */
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    /* \uFEFF */

    SEP: '/',
    /**
     * Create EXTGLOB_CHARS
     */

    extglobChars(chars) {
      return {
        '!': {
          type: 'negate',
          open: '(?:(?!(?:',
          close: `))${chars.STAR})`
        },
        '?': {
          type: 'qmark',
          open: '(?:',
          close: ')?'
        },
        '+': {
          type: 'plus',
          open: '(?:',
          close: ')+'
        },
        '*': {
          type: 'star',
          open: '(?:',
          close: ')*'
        },
        '@': {
          type: 'at',
          open: '(?:',
          close: ')'
        }
      };
    },
    /**
     * Create GLOB_CHARS
     */

    globChars() {
      let win32 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    }
  };

  (function (exports) {

    const {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = constants$2;
    exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
    exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
    exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
    exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
    exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');
    exports.removeBackslashes = str => {
      return str.replace(REGEX_REMOVE_BACKSLASH, match => {
        return match === '\\' ? '' : match;
      });
    };
    exports.isWindows = options => {
      if (options && typeof options.windows === 'boolean') {
        return options.windows;
      }
      return false;
    };
    exports.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports.removePrefix = function (input) {
      let state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let output = input;
      if (output.startsWith('./')) {
        output = output.slice(2);
        state.prefix = './';
      }
      return output;
    };
    exports.wrapOutput = function (input) {
      let state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const prepend = options.contains ? '' : '^';
      const append = options.contains ? '' : '$';
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  })(utils$3);

  const utils$2 = utils$3;
  const {
    CHAR_ASTERISK,
    /* * */
    CHAR_AT,
    /* @ */
    CHAR_BACKWARD_SLASH,
    /* \ */
    CHAR_COMMA,
    /* , */
    CHAR_DOT,
    /* . */
    CHAR_EXCLAMATION_MARK,
    /* ! */
    CHAR_FORWARD_SLASH,
    /* / */
    CHAR_LEFT_CURLY_BRACE,
    /* { */
    CHAR_LEFT_PARENTHESES,
    /* ( */
    CHAR_LEFT_SQUARE_BRACKET,
    /* [ */
    CHAR_PLUS,
    /* + */
    CHAR_QUESTION_MARK,
    /* ? */
    CHAR_RIGHT_CURLY_BRACE,
    /* } */
    CHAR_RIGHT_PARENTHESES,
    /* ) */
    CHAR_RIGHT_SQUARE_BRACKET /* ] */
  } = constants$2;
  const isPathSeparator = code => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };
  const depth = token => {
    if (token.isPrefix !== true) {
      token.depth = token.isGlobstar ? Infinity : 1;
    }
  };

  /**
   * Quickly scans a glob pattern and returns an object with a handful of
   * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
   * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
   * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
   *
   * ```js
   * const pm = require('picomatch');
   * console.log(pm.scan('foo/bar/*.js'));
   * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
   * ```
   * @param {String} `str`
   * @param {Object} `options`
   * @return {Object} Returns an object with tokens and regex source string.
   * @api public
   */

  const scan$1 = (input, options) => {
    const opts = options || {};
    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];
    let str = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob = false;
    let isExtglob = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let negatedExtglob = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token = {
      value: '',
      depth: 0,
      isGlob: false
    };
    const eos = () => index >= length;
    const peek = () => str.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str.charCodeAt(++index);
    };
    while (index < length) {
      code = advance();
      let next;
      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }
        continue;
      }
      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }
          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;
            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = {
          value: '',
          depth: 0,
          isGlob: false
        };
        if (finished === true) continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }
        lastIndex = index + 1;
        continue;
      }
      if (opts.noext !== true) {
        const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          isExtglob = token.isExtglob = true;
          finished = true;
          if (code === CHAR_EXCLAMATION_MARK && index === start) {
            negatedExtglob = true;
          }
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }
      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_QUESTION_MARK) {
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob = token.isGlob = true;
            finished = true;
            break;
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token.negated = true;
        start++;
        continue;
      }
      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
      if (isGlob === true) {
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
    }
    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }
    let base = str;
    let prefix = '';
    let glob = '';
    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }
    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = '';
      glob = str;
    } else {
      base = str;
    }
    if (base && base !== '' && base !== '/' && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }
    if (opts.unescape === true) {
      if (glob) glob = utils$2.removeBackslashes(glob);
      if (base && backslashes === true) {
        base = utils$2.removeBackslashes(base);
      }
    }
    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob,
      isExtglob,
      isGlobstar,
      negated,
      negatedExtglob
    };
    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) {
        tokens.push(token);
      }
      state.tokens = tokens;
    }
    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;
      for (let idx = 0; idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== '') {
          parts.push(value);
        }
        prevIndex = i;
      }
      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);
        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }
      state.slashes = slashes;
      state.parts = parts;
    }
    return state;
  };
  var scan_1 = scan$1;

  const constants$1 = constants$2;
  const utils$1 = utils$3;

  /**
   * Constants
   */

  const {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS
  } = constants$1;

  /**
   * Helpers
   */

  const expandRange = (args, options) => {
    if (typeof options.expandRange === 'function') {
      return options.expandRange(...args, options);
    }
    args.sort();
    const value = `[${args.join('-')}]`;
    try {
      /* eslint-disable-next-line no-new */
      new RegExp(value);
    } catch (ex) {
      return args.map(v => utils$1.escapeRegex(v)).join('..');
    }
    return value;
  };

  /**
   * Create the message for a syntax error
   */

  const syntaxError = (type, char) => {
    return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  };

  /**
   * Parse the given input string.
   * @param {String} input
   * @param {Object} options
   * @return {Object}
   */

  const parse$1 = (input, options) => {
    if (typeof input !== 'string') {
      throw new TypeError('Expected a string');
    }
    input = REPLACEMENTS[input] || input;
    const opts = {
      ...options
    };
    const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    let len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    const bos = {
      type: 'bos',
      value: '',
      output: opts.prepend || ''
    };
    const tokens = [bos];
    const capture = opts.capture ? '' : '?:';
    const PLATFORM_CHARS = constants$1.globChars();
    const EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    } = PLATFORM_CHARS;
    const globstar = opts => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const nodot = opts.dot ? '' : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }

    // minimatch options support
    if (typeof opts.noext === 'boolean') {
      opts.noextglob = opts.noext;
    }
    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: '',
      output: '',
      prefix: '',
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens
    };
    input = utils$1.removePrefix(input, state);
    len = input.length;
    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;

    /**
     * Tokenizing helpers
     */

    const eos = () => state.index === len - 1;
    const peek = state.peek = function () {
      let n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      return input[state.index + n];
    };
    const advance = state.advance = () => input[++state.index] || '';
    const remaining = () => input.slice(state.index + 1);
    const consume = function () {
      let value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      let num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      state.consumed += value;
      state.index += num;
    };
    const append = token => {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };
    const negate = () => {
      let count = 1;
      while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
        advance();
        state.start++;
        count++;
      }
      if (count % 2 === 0) {
        return false;
      }
      state.negated = true;
      state.start++;
      return true;
    };
    const increment = type => {
      state[type]++;
      stack.push(type);
    };
    const decrement = type => {
      state[type]--;
      stack.pop();
    };

    /**
     * Push tokens onto the tokens array. This helper speeds up
     * tokenizing by 1) helping us avoid backtracking as much as possible,
     * and 2) helping us avoid creating extra tokens when consecutive
     * characters are plain text. This improves performance and simplifies
     * lookbehinds.
     */

    const push = tok => {
      if (prev.type === 'globstar') {
        const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
        const isExtglob = tok.extglob === true || extglobs.length && (tok.type === 'pipe' || tok.type === 'paren');
        if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = 'star';
          prev.value = '*';
          prev.output = star;
          state.output += prev.output;
        }
      }
      if (extglobs.length && tok.type !== 'paren') {
        extglobs[extglobs.length - 1].inner += tok.value;
      }
      if (tok.value || tok.output) append(tok);
      if (prev && prev.type === 'text' && tok.type === 'text') {
        prev.value += tok.value;
        prev.output = (prev.output || '') + tok.value;
        return;
      }
      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };
    const extglobOpen = (type, value) => {
      const token = {
        ...EXTGLOB_CHARS[value],
        conditions: 1,
        inner: ''
      };
      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      const output = (opts.capture ? '(' : '') + token.open;
      increment('parens');
      push({
        type,
        value,
        output: state.output ? '' : ONE_CHAR
      });
      push({
        type: 'paren',
        extglob: true,
        value: advance(),
        output
      });
      extglobs.push(token);
    };
    const extglobClose = token => {
      let output = token.close + (opts.capture ? ')' : '');
      let rest;
      if (token.type === 'negate') {
        let extglobStar = star;
        if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
          extglobStar = globstar(opts);
        }
        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output = token.close = `)$))${extglobStar}`;
        }
        if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
          // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
          // In this case, we need to parse the string and use it in the output of the original pattern.
          // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
          //
          // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
          const expression = parse$1(rest, {
            ...options,
            fastpaths: false
          }).output;
          output = token.close = `)${expression})${extglobStar})`;
        }
        if (token.prev.type === 'bos') {
          state.negatedExtglob = true;
        }
      }
      push({
        type: 'paren',
        extglob: true,
        value,
        output
      });
      decrement('parens');
    };

    /**
     * Fast paths
     */

    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;
      let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
        if (first === '\\') {
          backslashes = true;
          return m;
        }
        if (first === '?') {
          if (esc) {
            return esc + first + (rest ? QMARK.repeat(rest.length) : '');
          }
          if (index === 0) {
            return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
          }
          return QMARK.repeat(chars.length);
        }
        if (first === '.') {
          return DOT_LITERAL.repeat(chars.length);
        }
        if (first === '*') {
          if (esc) {
            return esc + first + (rest ? star : '');
          }
          return star;
        }
        return esc ? m : `\\${m}`;
      });
      if (backslashes === true) {
        if (opts.unescape === true) {
          output = output.replace(/\\/g, '');
        } else {
          output = output.replace(/\\+/g, m => {
            return m.length % 2 === 0 ? '\\\\' : m ? '\\' : '';
          });
        }
      }
      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }
      state.output = utils$1.wrapOutput(output, state, options);
      return state;
    }

    /**
     * Tokenize input until we reach end-of-string
     */

    while (!eos()) {
      value = advance();
      if (value === '\u0000') {
        continue;
      }

      /**
       * Escaped characters
       */

      if (value === '\\') {
        const next = peek();
        if (next === '/' && opts.bash !== true) {
          continue;
        }
        if (next === '.' || next === ';') {
          continue;
        }
        if (!next) {
          value += '\\';
          push({
            type: 'text',
            value
          });
          continue;
        }

        // collapse slashes to reduce potential for exploits
        const match = /^\\+/.exec(remaining());
        let slashes = 0;
        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) {
            value += '\\';
          }
        }
        if (opts.unescape === true) {
          value = advance();
        } else {
          value += advance();
        }
        if (state.brackets === 0) {
          push({
            type: 'text',
            value
          });
          continue;
        }
      }

      /**
       * If we're inside a regex character class, continue
       * until we reach the closing bracket.
       */

      if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
        if (opts.posix !== false && value === ':') {
          const inner = prev.value.slice(1);
          if (inner.includes('[')) {
            prev.posix = true;
            if (inner.includes(':')) {
              const idx = prev.value.lastIndexOf('[');
              const pre = prev.value.slice(0, idx);
              const rest = prev.value.slice(idx + 2);
              const posix = POSIX_REGEX_SOURCE[rest];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();
                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }
                continue;
              }
            }
          }
        }
        if (value === '[' && peek() !== ':' || value === '-' && peek() === ']') {
          value = `\\${value}`;
        }
        if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
          value = `\\${value}`;
        }
        if (opts.posix === true && value === '!' && prev.value === '[') {
          value = '^';
        }
        prev.value += value;
        append({
          value
        });
        continue;
      }

      /**
       * If we're inside a quoted string, continue
       * until we reach the closing double quote.
       */

      if (state.quotes === 1 && value !== '"') {
        value = utils$1.escapeRegex(value);
        prev.value += value;
        append({
          value
        });
        continue;
      }

      /**
       * Double quotes
       */

      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true) {
          push({
            type: 'text',
            value
          });
        }
        continue;
      }

      /**
       * Parentheses
       */

      if (value === '(') {
        increment('parens');
        push({
          type: 'paren',
          value
        });
        continue;
      }
      if (value === ')') {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '('));
        }
        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }
        push({
          type: 'paren',
          value,
          output: state.parens ? ')' : '\\)'
        });
        decrement('parens');
        continue;
      }

      /**
       * Square brackets
       */

      if (value === '[') {
        if (opts.nobracket === true || !remaining().includes(']')) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError('closing', ']'));
          }
          value = `\\${value}`;
        } else {
          increment('brackets');
        }
        push({
          type: 'bracket',
          value
        });
        continue;
      }
      if (value === ']') {
        if (opts.nobracket === true || prev && prev.type === 'bracket' && prev.value.length === 1) {
          push({
            type: 'text',
            value,
            output: `\\${value}`
          });
          continue;
        }
        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError('opening', '['));
          }
          push({
            type: 'text',
            value,
            output: `\\${value}`
          });
          continue;
        }
        decrement('brackets');
        const prevValue = prev.value.slice(1);
        if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
          value = `/${value}`;
        }
        prev.value += value;
        append({
          value
        });

        // when literal brackets are explicitly disabled
        // assume we should match with a regex character class
        if (opts.literalBrackets === false || utils$1.hasRegexChars(prevValue)) {
          continue;
        }
        const escaped = utils$1.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);

        // when literal brackets are explicitly enabled
        // assume we should escape the brackets to match literal characters
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }

        // when the user specifies nothing, try to match both
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }

      /**
       * Braces
       */

      if (value === '{' && opts.nobrace !== true) {
        increment('braces');
        const open = {
          type: 'brace',
          value,
          output: '(',
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length
        };
        braces.push(open);
        push(open);
        continue;
      }
      if (value === '}') {
        const brace = braces[braces.length - 1];
        if (opts.nobrace === true || !brace) {
          push({
            type: 'text',
            value,
            output: value
          });
          continue;
        }
        let output = ')';
        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];
          for (let i = arr.length - 1; i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === 'brace') {
              break;
            }
            if (arr[i].type !== 'dots') {
              range.unshift(arr[i].value);
            }
          }
          output = expandRange(range, opts);
          state.backtrack = true;
        }
        if (brace.comma !== true && brace.dots !== true) {
          const out = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = '\\{';
          value = output = '\\}';
          state.output = out;
          for (const t of toks) {
            state.output += t.output || t.value;
          }
        }
        push({
          type: 'brace',
          value,
          output
        });
        decrement('braces');
        braces.pop();
        continue;
      }

      /**
       * Pipes
       */

      if (value === '|') {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }
        push({
          type: 'text',
          value
        });
        continue;
      }

      /**
       * Commas
       */

      if (value === ',') {
        let output = value;
        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === 'braces') {
          brace.comma = true;
          output = '|';
        }
        push({
          type: 'comma',
          value,
          output
        });
        continue;
      }

      /**
       * Slashes
       */

      if (value === '/') {
        // if the beginning of the glob is "./", advance the start
        // to the current index, and don't add the "./" characters
        // to the state. This greatly simplifies lookbehinds when
        // checking for BOS characters like "!" and "." (not "./")
        if (prev.type === 'dot' && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = '';
          state.output = '';
          tokens.pop();
          prev = bos; // reset "prev" to the first token
          continue;
        }
        push({
          type: 'slash',
          value,
          output: SLASH_LITERAL
        });
        continue;
      }

      /**
       * Dots
       */

      if (value === '.') {
        if (state.braces > 0 && prev.type === 'dot') {
          if (prev.value === '.') prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = 'dots';
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }
        if (state.braces + state.parens === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
          push({
            type: 'text',
            value,
            output: DOT_LITERAL
          });
          continue;
        }
        push({
          type: 'dot',
          value,
          output: DOT_LITERAL
        });
        continue;
      }

      /**
       * Question marks
       */

      if (value === '?') {
        const isGroup = prev && prev.value === '(';
        if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          extglobOpen('qmark', value);
          continue;
        }
        if (prev && prev.type === 'paren') {
          const next = peek();
          let output = value;
          if (prev.value === '(' && !/[!=<:]/.test(next) || next === '<' && !/<([!=]|\w+>)/.test(remaining())) {
            output = `\\${value}`;
          }
          push({
            type: 'text',
            value,
            output
          });
          continue;
        }
        if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
          push({
            type: 'qmark',
            value,
            output: QMARK_NO_DOT
          });
          continue;
        }
        push({
          type: 'qmark',
          value,
          output: QMARK
        });
        continue;
      }

      /**
       * Exclamation
       */

      if (value === '!') {
        if (opts.noextglob !== true && peek() === '(') {
          if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
            extglobOpen('negate', value);
            continue;
          }
        }
        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }

      /**
       * Plus
       */

      if (value === '+') {
        if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          extglobOpen('plus', value);
          continue;
        }
        if (prev && prev.value === '(' || opts.regex === false) {
          push({
            type: 'plus',
            value,
            output: PLUS_LITERAL
          });
          continue;
        }
        if (prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace') || state.parens > 0) {
          push({
            type: 'plus',
            value
          });
          continue;
        }
        push({
          type: 'plus',
          value: PLUS_LITERAL
        });
        continue;
      }

      /**
       * Plain text
       */

      if (value === '@') {
        if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          push({
            type: 'at',
            extglob: true,
            value,
            output: ''
          });
          continue;
        }
        push({
          type: 'text',
          value
        });
        continue;
      }

      /**
       * Plain text
       */

      if (value !== '*') {
        if (value === '$' || value === '^') {
          value = `\\${value}`;
        }
        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }
        push({
          type: 'text',
          value
        });
        continue;
      }

      /**
       * Stars
       */

      if (prev && (prev.type === 'globstar' || prev.star === true)) {
        prev.type = 'star';
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }
      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen('star', value);
        continue;
      }
      if (prev.type === 'star') {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }
        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === 'slash' || prior.type === 'bos';
        const afterStar = before && (before.type === 'star' || before.type === 'globstar');
        if (opts.bash === true && (!isStart || rest[0] && rest[0] !== '/')) {
          push({
            type: 'star',
            value,
            output: ''
          });
          continue;
        }
        const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
        const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
        if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
          push({
            type: 'star',
            value,
            output: ''
          });
          continue;
        }

        // strip consecutive `/**/`
        while (rest.slice(0, 3) === '/**') {
          const after = input[state.index + 4];
          if (after && after !== '/') {
            break;
          }
          rest = rest.slice(3);
          consume('/**', 3);
        }
        if (prior.type === 'bos' && eos()) {
          prev.type = 'globstar';
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = 'globstar';
          prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }
        if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
          const end = rest[1] !== void 0 ? '|$' : '';
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = 'globstar';
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: 'slash',
            value: '/',
            output: ''
          });
          continue;
        }
        if (prior.type === 'bos' && rest[0] === '/') {
          prev.type = 'globstar';
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: 'slash',
            value: '/',
            output: ''
          });
          continue;
        }

        // remove single star from output
        state.output = state.output.slice(0, -prev.output.length);

        // reset previous token to globstar
        prev.type = 'globstar';
        prev.output = globstar(opts);
        prev.value += value;

        // reset output with globstar
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      const token = {
        type: 'star',
        value,
        output: star
      };
      if (opts.bash === true) {
        token.output = '.*?';
        if (prev.type === 'bos' || prev.type === 'slash') {
          token.output = nodot + token.output;
        }
        push(token);
        continue;
      }
      if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
        token.output = value;
        push(token);
        continue;
      }
      if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
        if (prev.type === 'dot') {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }
        if (peek() !== '*') {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }
      push(token);
    }
    while (state.brackets > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
      state.output = utils$1.escapeLast(state.output, '[');
      decrement('brackets');
    }
    while (state.parens > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
      state.output = utils$1.escapeLast(state.output, '(');
      decrement('parens');
    }
    while (state.braces > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
      state.output = utils$1.escapeLast(state.output, '{');
      decrement('braces');
    }
    if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
      push({
        type: 'maybe_slash',
        value: '',
        output: `${SLASH_LITERAL}?`
      });
    }

    // rebuild the output if we had to backtrack at any point
    if (state.backtrack === true) {
      state.output = '';
      for (const token of state.tokens) {
        state.output += token.output != null ? token.output : token.value;
        if (token.suffix) {
          state.output += token.suffix;
        }
      }
    }
    return state;
  };

  /**
   * Fast paths for creating regular expressions for common glob patterns.
   * This can significantly speed up processing and has very little downside
   * impact when none of the fast paths match.
   */

  parse$1.fastpaths = (input, options) => {
    const opts = {
      ...options
    };
    const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    const len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    input = REPLACEMENTS[input] || input;

    // create constants based on platform, for windows or posix
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR
    } = constants$1.globChars();
    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? '' : '?:';
    const state = {
      negated: false,
      prefix: ''
    };
    let star = opts.bash === true ? '.*?' : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    const globstar = opts => {
      if (opts.noglobstar === true) return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const create = str => {
      switch (str) {
        case '*':
          return `${nodot}${ONE_CHAR}${star}`;
        case '.*':
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;
        case '*.*':
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case '*/*':
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
        case '**':
          return nodot + globstar(opts);
        case '**/*':
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
        case '**/*.*':
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case '**/.*':
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
        default:
          {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source = create(match[1]);
            if (!source) return;
            return source + DOT_LITERAL + match[2];
          }
      }
    };
    const output = utils$1.removePrefix(input, state);
    let source = create(output);
    if (source && opts.strictSlashes !== true) {
      source += `${SLASH_LITERAL}?`;
    }
    return source;
  };
  var parse_1 = parse$1;

  const path = path$1;
  const scan = scan_1;
  const parse = parse_1;
  const utils = utils$3;
  const constants = constants$2;
  const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

  /**
   * Creates a matcher function from one or more glob patterns. The
   * returned function takes a string to match as its first argument,
   * and returns true if the string is a match. The returned matcher
   * function also takes a boolean as the second argument that, when true,
   * returns an object with additional information.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch(glob[, options]);
   *
   * const isMatch = picomatch('*.!(*a)');
   * console.log(isMatch('a.a')); //=> false
   * console.log(isMatch('a.b')); //=> true
   * ```
   * @name picomatch
   * @param {String|Array} `globs` One or more glob patterns.
   * @param {Object=} `options`
   * @return {Function=} Returns a matcher function.
   * @api public
   */

  const picomatch$1 = function (glob, options) {
    let returnState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (Array.isArray(glob)) {
      const fns = glob.map(input => picomatch$1(input, options, returnState));
      const arrayMatcher = str => {
        for (const isMatch of fns) {
          const state = isMatch(str);
          if (state) return state;
        }
        return false;
      };
      return arrayMatcher;
    }
    const isState = isObject(glob) && glob.tokens && glob.input;
    if (glob === '' || typeof glob !== 'string' && !isState) {
      throw new TypeError('Expected pattern to be a non-empty string');
    }
    const opts = options || {};
    const posix = utils.isWindows(options);
    const regex = isState ? picomatch$1.compileRe(glob, options) : picomatch$1.makeRe(glob, options, false, true);
    const state = regex.state;
    delete regex.state;
    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = {
        ...options,
        ignore: null,
        onMatch: null,
        onResult: null
      };
      isIgnored = picomatch$1(opts.ignore, ignoreOpts, returnState);
    }
    const matcher = function (input) {
      let returnObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      const {
        isMatch,
        match,
        output
      } = picomatch$1.test(input, regex, options, {
        glob,
        posix
      });
      const result = {
        glob,
        state,
        regex,
        posix,
        input,
        output,
        match,
        isMatch
      };
      if (typeof opts.onResult === 'function') {
        opts.onResult(result);
      }
      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (isIgnored(input)) {
        if (typeof opts.onIgnore === 'function') {
          opts.onIgnore(result);
        }
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (typeof opts.onMatch === 'function') {
        opts.onMatch(result);
      }
      return returnObject ? result : true;
    };
    if (returnState) {
      matcher.state = state;
    }
    return matcher;
  };

  /**
   * Test `input` with the given `regex`. This is used by the main
   * `picomatch()` function to test the input string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.test(input, regex[, options]);
   *
   * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
   * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp} `regex`
   * @return {Object} Returns an object with matching info.
   * @api public
   */

  picomatch$1.test = function (input, regex, options) {
    let {
      glob,
      posix
    } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    if (typeof input !== 'string') {
      throw new TypeError('Expected input to be a string');
    }
    if (input === '') {
      return {
        isMatch: false,
        output: ''
      };
    }
    const opts = options || {};
    const format = opts.format || (posix ? utils.toPosixSlashes : null);
    let match = input === glob;
    let output = match && format ? format(input) : input;
    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }
    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch$1.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }
    return {
      isMatch: Boolean(match),
      match,
      output
    };
  };

  /**
   * Match the basename of a filepath.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.matchBase(input, glob[, options]);
   * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
   * @return {Boolean}
   * @api public
   */

  picomatch$1.matchBase = function (input, glob, options) {
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : utils.isWindows(options);
    const regex = glob instanceof RegExp ? glob : picomatch$1.makeRe(glob, options);
    return regex.test(path.basename(input));
  };

  /**
   * Returns true if **any** of the given glob `patterns` match the specified `string`.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.isMatch(string, patterns[, options]);
   *
   * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
   * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
   * ```
   * @param {String|Array} str The string to test.
   * @param {String|Array} patterns One or more glob patterns to use for matching.
   * @param {Object} [options] See available [options](#options).
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */

  picomatch$1.isMatch = (str, patterns, options) => picomatch$1(patterns, options)(str);

  /**
   * Parse a glob pattern to create the source string for a regular
   * expression.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const result = picomatch.parse(pattern[, options]);
   * ```
   * @param {String} `pattern`
   * @param {Object} `options`
   * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
   * @api public
   */

  picomatch$1.parse = (pattern, options) => {
    if (Array.isArray(pattern)) return pattern.map(p => picomatch$1.parse(p, options));
    return parse(pattern, {
      ...options,
      fastpaths: false
    });
  };

  /**
   * Scan a glob pattern to separate the pattern into segments.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.scan(input[, options]);
   *
   * const result = picomatch.scan('!./foo/*.js');
   * console.log(result);
   * { prefix: '!./',
   *   input: '!./foo/*.js',
   *   start: 3,
   *   base: 'foo',
   *   glob: '*.js',
   *   isBrace: false,
   *   isBracket: false,
   *   isGlob: true,
   *   isExtglob: false,
   *   isGlobstar: false,
   *   negated: true }
   * ```
   * @param {String} `input` Glob pattern to scan.
   * @param {Object} `options`
   * @return {Object} Returns an object with
   * @api public
   */

  picomatch$1.scan = (input, options) => scan(input, options);

  /**
   * Compile a regular expression from the `state` object returned by the
   * [parse()](#parse) method.
   *
   * @param {Object} `state`
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
   * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
   * @return {RegExp}
   * @api public
   */

  picomatch$1.compileRe = function (state, options) {
    let returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (returnOutput === true) {
      return state.output;
    }
    const opts = options || {};
    const prepend = opts.contains ? '' : '^';
    const append = opts.contains ? '' : '$';
    let source = `${prepend}(?:${state.output})${append}`;
    if (state && state.negated === true) {
      source = `^(?!${source}).*$`;
    }
    const regex = picomatch$1.toRegex(source, options);
    if (returnState === true) {
      regex.state = state;
    }
    return regex;
  };

  /**
   * Create a regular expression from a parsed glob pattern.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const state = picomatch.parse('*.js');
   * // picomatch.compileRe(state[, options]);
   *
   * console.log(picomatch.compileRe(state));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `state` The object returned from the `.parse` method.
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
   * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
   * @return {RegExp} Returns a regex created from the given pattern.
   * @api public
   */

  picomatch$1.makeRe = function (input) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (!input || typeof input !== 'string') {
      throw new TypeError('Expected a non-empty string');
    }
    let parsed = {
      negated: false,
      fastpaths: true
    };
    if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
      parsed.output = parse.fastpaths(input, options);
    }
    if (!parsed.output) {
      parsed = parse(input, options);
    }
    return picomatch$1.compileRe(parsed, options, returnOutput, returnState);
  };

  /**
   * Create a regular expression from the given regex source string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.toRegex(source[, options]);
   *
   * const { output } = picomatch.parse('*.js');
   * console.log(picomatch.toRegex(output));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `source` Regular expression source string.
   * @param {Object} `options`
   * @return {RegExp}
   * @api public
   */

  picomatch$1.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
    } catch (err) {
      if (options && options.debug === true) throw err;
      return /$^/;
    }
  };

  /**
   * Picomatch constants.
   * @return {Object}
   */

  picomatch$1.constants = constants;

  /**
   * Expose "picomatch"
   */

  var picomatch_1 = picomatch$1;

  (function (module) {

    module.exports = picomatch_1;
  })(picomatch$2);
  var picomatch = /*@__PURE__*/getDefaultExportFromCjs(picomatch$2.exports);

  const parseInputAccept = inputAccept => {
    const extensions = [];
    const mimeTypes = [];
    inputAccept.split(",").map(mimeType => mimeType.trim()).filter(Boolean).forEach(fileType => {
      if (fileType.startsWith(".")) {
        extensions.push(`*${fileType}`);
      } else {
        mimeTypes.push(fileType);
      }
    });
    return [extensions, mimeTypes];
  };
  class AcceptedFileTypes {
    constructor(inputAccept) {
      _defineProperty$2(this, "extensions", void 0);
      _defineProperty$2(this, "mimeTypes", void 0);
      const [extensions, mimeTypes] = parseInputAccept(inputAccept);
      this.extensions = extensions;
      this.mimeTypes = mimeTypes;
    }
    isAccepted(fileName) {
      if (this.extensions.length === 0 && this.mimeTypes.length === 0) {
        return true;
      }
      return this.isMimeTypeAccepted(lite.getType(fileName)) || this.isExtensionAccepted(fileName);
    }
    isMimeTypeAccepted(mimeType) {
      if (this.mimeTypes.length === 0) {
        return false;
      }
      return picomatch.isMatch(mimeType, this.mimeTypes);
    }
    isExtensionAccepted(fileName) {
      if (this.extensions.length === 0) {
        return false;
      }
      return picomatch.isMatch(fileName, this.extensions);
    }
  }

  const getEntriesFromDirectory = async directoryEntry => new Promise((resolve, reject) => directoryEntry.createReader().readEntries(resolve, reject));
  const getFileFromFileEntry = async fileEntry => new Promise((resolve, reject) => fileEntry.file(resolve, reject));
  const getFilesFromFileSystemEntries = async entries => {
    const result = [];
    for await (const entry of entries) {
      if (entry.isFile) {
        const file = await getFileFromFileEntry(entry);
        result.push(file);
      } else if (entry.isDirectory) {
        const entriesFromDirectory = await getEntriesFromDirectory(entry);
        const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
        files.forEach(file => result.push(file));
      }
    }
    return result;
  };
  const getFilesFromDataTransfer = async dataTransfer => {
    if (dataTransfer.items) {
      const entries = [...dataTransfer.items].map(item => item.webkitGetAsEntry());
      const files = await getFilesFromFileSystemEntries(entries);
      return files;
    } else {
      // backwards compatibility
      return [...dataTransfer.files];
    }
  };

  const CancelLink = _ref => {
    let {
      onDelete,
      translations,
      upload
    } = _ref;
    const handleCancel = () => onDelete(upload);
    const cancelling = upload.deleteStatus === "in_progress";
    return createVNode(1, "a", "dff-cancel", translations.Cancel, 0, {
      "href": "#",
      "onClick": cancelling ? undefined : handleCancel
    });
  };
  const UploadInProgress = _ref2 => {
    let {
      onDelete,
      translations,
      upload
    } = _ref2;
    return createVNode(1, "div", `dff-file dff-file-id-${upload.uploadIndex}`, [createVNode(1, "span", null, upload.name, 0), createVNode(1, "span", "dff-progress", createVNode(1, "span", "dff-progress-inner", null, 1, {
      "style": {
        width: `${upload.progress.toFixed(2)}%`
      }
    }), 2), createComponentVNode(2, CancelLink, {
      "onDelete": onDelete,
      "translations": translations,
      "upload": upload
    })], 4);
  };

  const DeleteLink = _ref => {
    let {
      onDelete,
      translations,
      upload
    } = _ref;
    const handleDelete = () => onDelete(upload);
    const deleting = upload.deleteStatus === "in_progress";
    return createVNode(1, "a", "dff-delete", translations.Delete, 0, {
      "href": "#",
      "onClick": deleting ? undefined : handleDelete
    });
  };
  const DefaultFileInfo = _ref2 => {
    let {
      upload
    } = _ref2;
    const size = upload.getSize();
    return createFragment([createVNode(1, "span", null, upload.name, 0), size != null && createVNode(1, "span", "dff-filesize", formatBytes(size, 2), 0)], 0);
  };
  const UploadDone = _ref3 => {
    let {
      CustomFileInfo,
      onDelete,
      translations,
      upload
    } = _ref3;
    const FileInfo = CustomFileInfo ?? DefaultFileInfo;
    return createVNode(1, "div", `dff-file dff-upload-success dff-file-id-${upload.uploadIndex}`, [createComponentVNode(2, FileInfo, {
      "upload": upload
    }), createComponentVNode(2, DeleteLink, {
      "onDelete": onDelete,
      "translations": translations,
      "upload": upload
    }), upload.deleteStatus === "error" && createVNode(1, "span", "dff-error", translations["Delete failed"], 0)], 0);
  };

  const UploadError = _ref => {
    let {
      translations,
      upload
    } = _ref;
    const getErrorMessage = () => {
      switch (upload.status) {
        case "error":
          return translations["Upload failed"];
        case "invalid":
          return translations["Invalid file type"];
        default:
          return "";
      }
    };
    return createVNode(1, "div", `dff-file dff-upload-fail dff-file-id-${upload.uploadIndex}`, [createVNode(1, "span", null, upload.name, 0), createVNode(1, "span", "dff-error", getErrorMessage(), 0)], 4);
  };

  const Upload = _ref => {
    let {
      CustomFileInfo,
      onDelete,
      translations,
      upload
    } = _ref;
    switch (upload.status) {
      case "done":
        return createComponentVNode(2, UploadDone, {
          "CustomFileInfo": CustomFileInfo,
          "onDelete": onDelete,
          "translations": translations,
          "upload": upload
        });
      case "error":
      case "invalid":
        return createComponentVNode(2, UploadError, {
          "translations": translations,
          "upload": upload
        });
      case "uploading":
        return createComponentVNode(2, UploadInProgress, {
          "onDelete": onDelete,
          "translations": translations,
          "upload": upload
        });
    }
  };

  class Uploads extends Component {
    constructor(props) {
      super(props);
      _defineProperty$2(this, "acceptedFileTypes", void 0);
      _defineProperty$2(this, "handleDragEnter", () => {
        this.setState({
          dropping: true
        });
      });
      _defineProperty$2(this, "handleDragLeave", () => {
        this.setState({
          dropping: false
        });
      });
      _defineProperty$2(this, "handleDragOver", e => {
        e.preventDefault();
        this.setState({
          dropping: true
        });
      });
      _defineProperty$2(this, "handleDrop", e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
          dropping: false
        });
        const uploadFiles = async () => {
          try {
            if (e.dataTransfer) {
              const files = await getFilesFromDataTransfer(e.dataTransfer);
              const acceptedFiles = files.filter(file => this.acceptedFileTypes.isAccepted(file.name));
              await this.props.onUploadFiles(acceptedFiles);
            }
          } catch (error) {
            console.error(error);
          }
        };
        void uploadFiles();
      });
      this.state = {
        dropping: false
      };
      this.acceptedFileTypes = new AcceptedFileTypes(props.inputAccept);
    }
    render() {
      var _this$state;
      const {
        CustomFileInfo,
        onDelete,
        supportDropArea,
        translations,
        uploads
      } = this.props;
      const dropping = (_this$state = this.state) === null || _this$state === void 0 ? void 0 : _this$state.dropping;
      const dragProps = supportDropArea ? {
        onDragEnter: this.handleDragEnter,
        onDragLeave: this.handleDragLeave,
        onDragOver: this.handleDragOver,
        onDrop: this.handleDrop
      } : {};
      const className = `dff-drop-area${dropping ? " dff-dropping" : ""}`;
      return normalizeProps(createVNode(1, "div", className, [supportDropArea && !uploads.length && createVNode(1, "div", "dff-drop-hint", translations["Drop your files here"], 0), uploads.map(upload => createComponentVNode(2, Upload, {
        "CustomFileInfo": CustomFileInfo,
        "onDelete": onDelete,
        "upload": upload,
        "translations": translations
      }, upload.uploadIndex))], 0, {
        ...dragProps
      }));
    }
  }

  const renderUploads = _ref => {
    let {
      container,
      CustomFileInfo,
      inputAccept,
      onDelete,
      onUploadFiles,
      supportDropArea,
      translations,
      uploads
    } = _ref;
    render(createComponentVNode(2, Uploads, {
      "CustomFileInfo": CustomFileInfo,
      "inputAccept": inputAccept,
      "onDelete": onDelete,
      "onUploadFiles": onUploadFiles,
      "supportDropArea": supportDropArea,
      "translations": translations,
      "uploads": uploads
    }), container);
  };

  class FileField {
    constructor(_ref) {
      let {
        callbacks,
        chunkSize,
        csrfToken,
        CustomFileInfo,
        eventEmitter,
        fieldName,
        form,
        formId,
        initial,
        input,
        multiple,
        parent: _parent,
        prefix,
        retryDelays,
        s3UploadDir,
        skipRequired,
        supportDropArea,
        translations,
        uploadUrl
      } = _ref;
      _defineProperty$2(this, "acceptedFileTypes", void 0);
      _defineProperty$2(this, "callbacks", void 0);
      _defineProperty$2(this, "chunkSize", void 0);
      _defineProperty$2(this, "container", void 0);
      _defineProperty$2(this, "csrfToken", void 0);
      _defineProperty$2(this, "CustomFileInfo", void 0);
      _defineProperty$2(this, "eventEmitter", void 0);
      _defineProperty$2(this, "fieldName", void 0);
      _defineProperty$2(this, "form", void 0);
      _defineProperty$2(this, "formId", void 0);
      _defineProperty$2(this, "input", void 0);
      _defineProperty$2(this, "multiple", void 0);
      _defineProperty$2(this, "nextUploadIndex", void 0);
      _defineProperty$2(this, "prefix", void 0);
      _defineProperty$2(this, "retryDelays", void 0);
      _defineProperty$2(this, "s3UploadDir", void 0);
      _defineProperty$2(this, "skipRequired", void 0);
      _defineProperty$2(this, "supportDropArea", void 0);
      _defineProperty$2(this, "translations", void 0);
      _defineProperty$2(this, "uploads", void 0);
      _defineProperty$2(this, "uploadUrl", void 0);
      _defineProperty$2(this, "uploadFiles", async files => {
        if (files.length === 0) {
          return;
        }
        if (!this.multiple) {
          this.uploads = [];
        }
        for await (const file of files) {
          await this.uploadFile(file);
        }
        this.checkDropHint();
      });
      _defineProperty$2(this, "onChange", e => {
        const files = e.target.files || [];
        const acceptedFiles = [];
        const invalidFiles = [];
        for (const file of files) {
          if (this.acceptedFileTypes.isAccepted(file.name)) {
            acceptedFiles.push(file);
          } else {
            invalidFiles.push(file);
          }
        }
        if (invalidFiles) {
          invalidFiles.forEach(file => {
            this.uploads.push(new InvalidFile({
              name: file.name,
              uploadIndex: this.nextUploadIndex
            }));
            this.nextUploadIndex += 1;
          });
          this.render();
        }
        if (acceptedFiles) {
          void this.uploadFiles([...acceptedFiles]);
        }
      });
      _defineProperty$2(this, "handleProgress", (upload, bytesUploaded, bytesTotal) => {
        upload.progress = bytesUploaded / bytesTotal * 100;
        const {
          onProgress
        } = this.callbacks;
        if (onProgress) {
          if (upload instanceof TusUpload) {
            onProgress(bytesUploaded, bytesTotal, upload);
          }
        }
        this.render();
      });
      _defineProperty$2(this, "handleError", (upload, error) => {
        upload.status = "error";
        this.render();
        const {
          onError
        } = this.callbacks;
        if (onError) {
          if (upload instanceof TusUpload) {
            onError(error, upload);
          }
        }
      });
      _defineProperty$2(this, "handleSuccess", upload => {
        this.updatePlaceholderInput();
        this.input.value = "";
        upload.status = "done";
        this.emitEvent("uploadComplete", upload);
        const {
          onSuccess
        } = this.callbacks;
        if (onSuccess && upload.type === "tus") {
          onSuccess(upload);
        }
        this.render();
      });
      _defineProperty$2(this, "createFilesContainer", parent => {
        const div = document.createElement("div");
        div.className = "dff-files";
        parent.appendChild(div);
        return div;
      });
      _defineProperty$2(this, "handleDelete", upload => {
        void this.removeExistingUpload(upload);
      });
      this.callbacks = callbacks;
      this.chunkSize = chunkSize;
      this.csrfToken = csrfToken;
      this.CustomFileInfo = CustomFileInfo;
      this.eventEmitter = eventEmitter;
      this.fieldName = fieldName;
      this.form = form;
      this.formId = formId;
      this.input = input;
      this.multiple = multiple;
      this.prefix = prefix;
      this.retryDelays = retryDelays;
      this.s3UploadDir = s3UploadDir;
      this.skipRequired = skipRequired;
      this.supportDropArea = supportDropArea;
      this.translations = translations;
      this.uploadUrl = uploadUrl;
      this.acceptedFileTypes = new AcceptedFileTypes(input.accept);
      this.uploads = [];
      this.nextUploadIndex = 0;
      this.container = this.createFilesContainer(_parent);
      if (initial) {
        this.addInitialFiles(initial);
      }
      this.checkDropHint();
      input.addEventListener("change", this.onChange);
      this.render();
    }
    addInitialFiles(initialFiles) {
      if (initialFiles.length === 0) {
        return;
      }
      const {
        multiple
      } = this;
      const addInitialFile = initialFile => {
        const upload = createUploadedFile({
          csrfToken: this.csrfToken,
          initialFile,
          uploadIndex: this.nextUploadIndex,
          uploadUrl: this.uploadUrl
        });
        this.uploads.push(upload);
        upload.render = this.render.bind(this);
        upload.updateMetadata = () => {
          this.updateMetadata(upload.name, upload.metadata);
        };
      };
      if (multiple) {
        initialFiles.forEach(file => {
          addInitialFile(file);
          this.nextUploadIndex += 1;
        });
      } else {
        addInitialFile(initialFiles[0]);
      }
    }
    updateMetadata(fileName, metadata) {
      const metaDataFieldName = getMetadataFieldName(this.fieldName, this.prefix);
      const metaDataInput = findInput(this.form, metaDataFieldName, this.prefix);
      if (!metaDataInput) {
        return;
      }
      const data = metaDataInput.value;
      const metaDataPerFile = data ? JSON.parse(data) : {};
      metaDataPerFile[fileName] = metadata;
      metaDataInput.value = JSON.stringify(metaDataPerFile);
    }
    async uploadFile(file) {
      const createUpload = () => {
        const {
          csrfToken,
          s3UploadDir
        } = this;
        if (s3UploadDir != null) {
          return new S3Upload({
            csrfToken,
            endpoint: uploadUrl,
            file,
            s3UploadDir,
            uploadIndex: newUploadIndex
          });
        } else {
          return new TusUpload({
            chunkSize: this.chunkSize,
            csrfToken: this.csrfToken,
            fieldName,
            file,
            formId,
            retryDelays: this.retryDelays,
            uploadIndex: newUploadIndex,
            uploadUrl
          });
        }
      };
      const {
        fieldName,
        formId,
        uploadUrl
      } = this;
      const fileName = file.name;
      const existingUpload = this.findUploadByName(fileName);
      const newUploadIndex = existingUpload ? existingUpload.uploadIndex : this.nextUploadIndex;
      if (!existingUpload) {
        this.nextUploadIndex += 1;
      }
      if (existingUpload) {
        await this.removeExistingUpload(existingUpload);
      }
      const upload = createUpload();
      upload.onError = error => this.handleError(upload, error);
      upload.onProgress = (bytesUploaded, bytesTotal) => this.handleProgress(upload, bytesUploaded, bytesTotal);
      upload.onSuccess = () => this.handleSuccess(upload);
      upload.start();
      upload.render = this.render.bind(this);
      upload.updateMetadata = () => {
        this.updateMetadata(upload.name, upload.metadata);
      };
      this.uploads.push(upload);
      this.render();
      this.emitEvent("addUpload", upload);
    }
    findUploadByName(fileName) {
      return this.uploads.find(upload => upload.name === fileName);
    }
    async removeExistingUpload(upload) {
      this.emitEvent("removeUpload", upload);
      if (upload.status === "uploading") {
        this.render();
        await upload.abort();
      } else if (upload.status === "done") {
        try {
          upload.deleteStatus = "in_progress";
          this.render();
          await upload.delete();
        } catch {
          upload.deleteStatus = "error";
          this.render();
          return;
        }
      }
      this.removeUploadFromList(upload);
      this.updatePlaceholderInput();
      this.render();
    }
    removeUploadFromList(upload) {
      const index = this.uploads.indexOf(upload);
      if (index >= 0) {
        this.uploads.splice(index, 1);
      }
      this.checkDropHint();
      const {
        onDelete
      } = this.callbacks;
      if (onDelete) {
        onDelete(upload);
      }
    }
    async handleCancel(upload) {
      await upload.abort();
      this.removeUploadFromList(upload);
    }
    checkDropHint() {
      if (!this.supportDropArea) {
        return;
      }
    }
    updatePlaceholderInput() {
      const input = findInput(this.form, getUploadsFieldName(this.fieldName, this.prefix), this.prefix);
      if (!input) {
        return;
      }
      const placeholdersInfo = this.uploads.map(upload => upload.getInitialFile()).filter(upload => Boolean(upload));
      input.value = JSON.stringify(placeholdersInfo);
    }
    emitEvent(eventName, upload) {
      if (this.eventEmitter) {
        this.eventEmitter.emit(eventName, {
          fieldName: this.fieldName,
          fileName: upload.name,
          upload
        });
      }
    }
    render() {
      this.updateInputRequired();
      renderUploads({
        container: this.container,
        CustomFileInfo: this.CustomFileInfo,
        inputAccept: this.input.accept,
        onDelete: this.handleDelete,
        onUploadFiles: this.uploadFiles,
        supportDropArea: this.supportDropArea,
        translations: this.translations,
        uploads: this.uploads
      });
    }
    updateInputRequired() {
      this.input.required = !this.skipRequired && !this.uploads.length;
    }
  }

  const initUploadFields = function (form) {
    var _findInput;
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const matchesPrefix = fieldName => {
      if (!(options && options.prefix)) {
        return true;
      }
      return fieldName.startsWith(`${options.prefix}-`);
    };
    const getPrefix = () => options && options.prefix ? options.prefix : null;
    const getInputValue = fieldName => getInputValueForFormAndPrefix(form, fieldName, getPrefix());
    const getMetadataPerFile = fieldName => {
      const data = getInputValue(getMetadataFieldName(fieldName, getPrefix()));
      if (!data) {
        return {};
      }
      return JSON.parse(data);
    };
    const setInitialMetadata = (fieldName, initialFiles) => {
      const metadataPerFilename = getMetadataPerFile(fieldName);
      initialFiles.forEach(initialFile => {
        initialFile.metadata = metadataPerFilename[initialFile.name];
      });
    };
    const getInitialFiles = fieldName => {
      const data = getInputValue(getUploadsFieldName(fieldName, getPrefix()));
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    };
    const uploadUrl = getInputValue("upload_url");
    const formId = getInputValue("form_id");
    const s3UploadDir = getInputValue("s3_upload_dir");
    const skipRequired = options.skipRequired || false;
    const prefix = getPrefix();
    const csrfToken = (_findInput = findInput(form, "csrfmiddlewaretoken", null)) === null || _findInput === void 0 ? void 0 : _findInput.value;
    if (!csrfToken) {
      throw Error("Csrf token not found");
    }
    if (!formId || !uploadUrl) {
      return;
    }
    form.querySelectorAll(".dff-uploader").forEach(uploaderDiv => {
      const container = uploaderDiv.querySelector(".dff-container");
      if (!container) {
        return;
      }
      const input = container.querySelector("input[type=file]");
      if (!(input && matchesPrefix(input.name))) {
        return;
      }
      const fieldName = input.name;
      const {
        multiple
      } = input;
      const initial = getInitialFiles(fieldName);
      setInitialMetadata(fieldName, initial);
      const dataTranslations = container.getAttribute("data-translations");
      const translations = dataTranslations ? JSON.parse(dataTranslations) : {};
      const supportDropArea = !(options.supportDropArea === false);
      new FileField({
        callbacks: options.callbacks || {},
        chunkSize: options.chunkSize || 2621440,
        csrfToken,
        CustomFileInfo: options.CustomFileInfo,
        eventEmitter: options.eventEmitter,
        fieldName,
        form,
        formId,
        s3UploadDir: s3UploadDir || null,
        initial,
        input,
        multiple,
        parent: container,
        prefix,
        retryDelays: options.retryDelays || null,
        skipRequired,
        supportDropArea,
        translations,
        uploadUrl
      });
    });
  };

  const initFormSet = (form, optionsParam) => {
    let options;
    if (typeof optionsParam === "string") {
      options = {
        prefix: optionsParam
      };
    } else {
      options = optionsParam;
    }
    const prefix = options.prefix || "form";
    const totalFormsValue = getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix);
    if (!totalFormsValue) {
      return;
    }
    const formCount = parseInt(totalFormsValue, 10);
    for (let i = 0; i < formCount; i += 1) {
      const subFormPrefix = getInputNameWithPrefix(`${i}`, null);
      initUploadFields(form, {
        ...options,
        prefix: `${prefix}-${subFormPrefix}`
      });
    }
  };

  // eslint-disable-line @typescript-eslint/no-explicit-any

  window.autoInitFileForms = autoInitFileForms; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
  window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
  window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

  window.djangoFileForm = {
    formatBytes
  }; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

})();
//# sourceMappingURL=file_form.debug.js.map
