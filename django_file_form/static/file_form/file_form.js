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
  const unique = values => Array.from(new Set(values));
  const autoInitFileForms = () => {
    const forms = unique(Array.from(document.querySelectorAll(".dff-uploader")).map(findForm));
    for (const form of forms) {
      if (form) {
        window.initUploadFields(form);
      }
    }
  };

  const parseInputAccept = inputAccept => {
    const extensions = [];
    const mimeTypes = [];
    const fileTypes = inputAccept.split(",").map(fileType => fileType.trim().toLowerCase()).filter(Boolean);
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
  const matchesMimeType = (mimeType, pattern) => {
    const [type, subtype] = mimeType.split("/");
    const [patternType, patternSubtype] = pattern.split("/");
    const matchesPart = (part, patternPart) => patternPart === "*" || part !== undefined && part === patternPart;
    return matchesPart(type, patternType) && matchesPart(subtype, patternSubtype);
  };
  class AcceptedFileTypes {
    _extensions;
    _mimeTypes;
    constructor(inputAccept) {
      const [extensions, mimeTypes] = parseInputAccept(inputAccept);
      this._extensions = extensions;
      this._mimeTypes = mimeTypes;
    }
    _isAccepted(file) {
      if (this._extensions.length === 0 && this._mimeTypes.length === 0) {
        return true;
      }
      return this._isMimeTypeAccepted(file.type) || this._isExtensionAccepted(file.name);
    }
    _isExtensionAccepted(fileName) {
      const lowerCaseFileName = fileName.toLowerCase();
      return this._extensions.some(extension => lowerCaseFileName.endsWith(extension));
    }
    _isMimeTypeAccepted(mimeType) {
      if (!mimeType) {
        return false;
      }
      const lowerCaseMimeType = mimeType.toLowerCase();
      return this._mimeTypes.some(pattern => matchesMimeType(lowerCaseMimeType, pattern));
    }
  }

  const getEntriesFromDirectory = async directoryEntry => new Promise((resolve, reject) => {
    directoryEntry.createReader().readEntries(resolve, reject);
  });
  const getFileFromFileSystemFileEntry = async fileEntry => new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
  const getFilesFromFileSystemEntries = async entries => {
    const result = [];
    for (const entry of entries) {
      const filesFromEntry = await getFilesFromFileSystemEntry(entry);
      result.push(...filesFromEntry);
    }
    return result;
  };
  const getFilesFromFileSystemEntry = async entry => {
    const result = [];
    if (entry.isFile) {
      const file = await getFileFromFileSystemFileEntry(entry);
      result.push(file);
    } else if (entry.isDirectory) {
      const entriesFromDirectory = await getEntriesFromDirectory(entry);
      const files = await getFilesFromFileSystemEntries(entriesFromDirectory);
      result.push(...files);
    }
    return result;
  };
  const getFilesFromDataTransfer = async dataTransfer => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- items is missing in older browsers
    if (dataTransfer.items) {
      const files = [];
      for (const item of dataTransfer.items) {
        const fileSystemEntry = item.webkitGetAsEntry();
        if (fileSystemEntry) {
          const filesFromEntry = await getFilesFromFileSystemEntry(fileSystemEntry);
          files.push(...filesFromEntry);
        } else {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      return files;
    } else {
      // backwards compatibility
      return [...dataTransfer.files];
    }
  };
  class DropArea {
    _acceptedFileTypes;
    _container;
    _onUploadFiles;
    _renderer;
    constructor({
      _container: container,
      _inputAccept: inputAccept,
      _onUploadFiles: onUploadFiles,
      _renderer: renderer
    }) {
      this._container = container;
      this._onUploadFiles = onUploadFiles;
      this._acceptedFileTypes = new AcceptedFileTypes(inputAccept);
      this._renderer = renderer;
      container.addEventListener("dragenter", () => {
        container.classList.add("dff-dropping");
      });
      container.addEventListener("dragleave", () => {
        container.classList.remove("dff-dropping");
      });
      container.addEventListener("dragover", e => {
        container.classList.add("dff-dropping");
        e.preventDefault();
      });
      container.addEventListener("drop", this._onDrop);
    }
    _onDrop = e => {
      const dragEvent = e;
      this._container.classList.remove("dff-dropping");
      dragEvent.preventDefault();
      dragEvent.stopPropagation();
      const uploadFiles = async () => {
        try {
          if (dragEvent.dataTransfer) {
            const files = await getFilesFromDataTransfer(dragEvent.dataTransfer);
            const acceptedFiles = [];
            const invalidFiles = [];
            for (const file of files) {
              if (this._acceptedFileTypes._isAccepted(file)) {
                acceptedFiles.push(file);
              } else {
                invalidFiles.push(file);
              }
            }
            this._renderer._setErrorInvalidFiles(invalidFiles);
            void this._onUploadFiles(acceptedFiles);
          }
        } catch (error) {
          console.error(error);
        }
      };
      void uploadFiles();
    };
  }

  const formatBytes = (bytes, decimals) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const n = Number.parseFloat((bytes / k ** i).toFixed(dm));
    const size = sizes[i];
    if (size == null) {
      return "";
    } else {
      return `${n.toString()} ${size}`;
    }
  };
  const getInputNameWithPrefix = (fieldName, prefix) => prefix ? `${prefix}-${fieldName}` : fieldName;
  const getInputNameWithoutPrefix = (fieldName, prefix) => prefix ? fieldName.slice(prefix.length + 1) : fieldName;
  const findInput = (form, fieldName, prefix) => {
    const inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
    const input = form.querySelector(`[name="${CSS.escape(inputNameWithPrefix)}"]`);
    if (!input) {
      return null;
    }
    return input;
  };
  const getUploadsFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-uploads`;
  const getInputValueForFormAndPrefix = (form, fieldName, prefix) => findInput(form, fieldName, prefix)?.value;
  const getMetadataFieldName = (fieldName, prefix) => `${getInputNameWithoutPrefix(fieldName, prefix)}-metadata`;

  class RenderUploadFile {
    _container;
    _errors;
    _input;
    _translations;
    constructor({
      _input: input,
      _parent: parent,
      _skipRequired: skipRequired,
      _translations: translations
    }) {
      this._container = this._createFilesContainer(parent);
      this._errors = this._createErrorContainer(parent);
      this._input = input;
      this._translations = translations;
      if (skipRequired) {
        this._input.required = false;
      }
    }
    _addNewUpload(filename, uploadIndex) {
      const div = this._addFile(filename, uploadIndex);
      const progressSpan = document.createElement("span");
      progressSpan.className = "dff-progress";
      const innerSpan = document.createElement("span");
      innerSpan.className = "dff-progress-inner";
      progressSpan.append(innerSpan);
      div.append(progressSpan);
      const cancelLink = document.createElement("a");
      cancelLink.className = "dff-cancel";
      this._setTextContent(cancelLink, this._getTranslation("Cancel"));
      cancelLink.dataset.index = uploadIndex.toString();
      cancelLink.href = "#";
      div.append(cancelLink);
      return div;
    }
    _addUploadedFile(filename, uploadIndex, filesize) {
      const element = this._addFile(filename, uploadIndex);
      this._setSuccess(uploadIndex, filesize);
      return element;
    }
    _clearInput() {
      const {
        _input: input
      } = this;
      input.value = "";
    }
    _deleteFile(index) {
      const div = this._findFileDiv(index);
      if (div) {
        div.remove();
      }
    }
    _disableCancel(index) {
      const cancelSpan = this._findCancelSpan(index);
      if (cancelSpan) {
        cancelSpan.classList.add("dff-disabled");
      }
    }
    _disableDelete(index) {
      const deleteLink = this._findDeleteLink(index);
      if (deleteLink) {
        deleteLink.classList.add("dff-disabled");
      }
    }
    _findFileDiv(index) {
      return this._container.querySelector(`.dff-file-id-${index.toString()}`);
    }
    _removeDropHint() {
      const dropHint = this._container.querySelector(".dff-drop-hint");
      if (dropHint) {
        dropHint.remove();
      }
    }
    _renderDropHint() {
      if (this._container.querySelector(".dff-drop-hint")) {
        return;
      }
      const dropHint = document.createElement("div");
      dropHint.className = "dff-drop-hint";
      this._setTextContent(dropHint, this._getTranslation("Drop your files here"));
      this._container.append(dropHint);
    }
    _setDeleteFailed(index) {
      this._setErrorMessage(index, this._getTranslation("Delete failed"));
      this._enableDelete(index);
    }
    _setError(index) {
      this._setErrorMessage(index, this._getTranslation("Upload failed"));
      const el = this._findFileDiv(index);
      if (el) {
        el.classList.add("dff-upload-fail");
      }
      this._removeProgress(index);
      this._removeCancel(index);
    }
    _setErrorInvalidFiles(files) {
      const errorsMessages = document.createElement("ul");
      for (const file of files) {
        const msg = document.createElement("li");
        const invalidFileTypeMessage = this._getTranslation("Invalid file type");
        this._setTextContent(msg, `${file.name}: ${invalidFileTypeMessage}`);
        msg.className = "dff-error";
        errorsMessages.append(msg);
      }
      this._errors.replaceChildren(errorsMessages);
      this._clearInput();
    }
    _setSuccess(index, size) {
      const el = this._findFileDiv(index);
      if (el) {
        el.classList.add("dff-upload-success");
        if (size != null) {
          const fileSizeInfo = document.createElement("span");
          this._setTextContent(fileSizeInfo, formatBytes(size, 2));
          fileSizeInfo.className = "dff-filesize";
          el.append(fileSizeInfo);
        }
        const deleteLink = document.createElement("a");
        this._setTextContent(deleteLink, this._getTranslation("Delete"));
        deleteLink.className = "dff-delete";
        deleteLink.dataset.index = index.toString();
        deleteLink.href = "#";
        el.append(deleteLink);
      }
      this._removeProgress(index);
      this._removeCancel(index);
    }
    _updateProgress(index, percentage) {
      const el = this._container.querySelector(`.dff-file-id-${index.toString()}`);
      if (el) {
        const innerProgressSpan = el.querySelector(".dff-progress-inner");
        if (innerProgressSpan) {
          innerProgressSpan.style.width = `${percentage}%`;
        }
      }
    }
    _addFile(filename, uploadIndex) {
      const div = document.createElement("div");
      div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;
      const nameSpan = document.createElement("span");
      nameSpan.textContent = filename;
      nameSpan.className = "dff-filename";
      nameSpan.dataset.index = uploadIndex.toString();
      div.append(nameSpan);
      this._container.append(div);
      this._input.required = false;
      return div;
    }
    _createErrorContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-invalid-files";
      parent.append(div);
      return div;
    };
    _createFilesContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-files";
      parent.append(div);
      return div;
    };
    _enableDelete(index) {
      const deleteLink = this._findDeleteLink(index);
      if (deleteLink) {
        deleteLink.classList.remove("dff-disabled");
      }
    }
    _findCancelSpan(index) {
      const el = this._findFileDiv(index);
      if (!el) {
        return null;
      }
      return el.querySelector(".dff-cancel");
    }
    _findDeleteLink(index) {
      const div = this._findFileDiv(index);
      if (!div) {
        return div;
      }
      return div.querySelector(".dff-delete");
    }
    _getTranslation(key) {
      return this._translations[key] ?? key;
    }
    _removeCancel(index) {
      const cancelSpan = this._findCancelSpan(index);
      if (cancelSpan) {
        cancelSpan.remove();
      }
    }
    _removeProgress(index) {
      const el = this._findFileDiv(index);
      if (el) {
        const progressSpan = el.querySelector(".dff-progress");
        if (progressSpan) {
          progressSpan.remove();
        }
      }
    }
    _setErrorMessage(index, message) {
      const el = this._findFileDiv(index);
      if (!el) {
        return;
      }
      const originalMessageSpan = el.querySelector(".dff-error");
      if (originalMessageSpan) {
        originalMessageSpan.remove();
      }
      const span = document.createElement("span");
      span.classList.add("dff-error");
      this._setTextContent(span, message);
      el.append(span);
    }
    _setTextContent(element, text) {
      element.append(document.createTextNode(text));
    }
  }

  let BaseUpload$1 = class BaseUpload {
    name;
    status;
    type;
    uploadIndex;
    constructor({
      name,
      status,
      type,
      uploadIndex
    }) {
      this.name = name;
      this.status = status;
      this.type = type;
      this.uploadIndex = uploadIndex;
    }
    async abort() {
      //
    }
    async delete() {
      //
    }
  };

  function normalize (strArray) {
    var resultArray = [];
    if (strArray.length === 0) { return ''; }

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

      if (component === '') { continue; }

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
    str = parts.shift() + (parts.length > 0 ? '?': '') + parts.join('&');

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
  const abortMultipartUpload = ({
    _csrfToken: csrfToken,
    _endpoint: endpoint,
    _key: key,
    _uploadId: uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, `?key=${filename}`);
    return fetch(url, {
      headers: headers,
      method: "delete"
    }).then(response => {
      return response.json();
    });
  };
  const completeMultipartUpload = ({
    _csrfToken: csrfToken,
    _endpoint: endpoint,
    _key: key,
    _parts: parts,
    _uploadId: uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, "complete", `?key=${filename}`);
    return fetch(url, {
      body: JSON.stringify({
        parts: parts
      }),
      headers: headers,
      method: "post"
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const createMultipartUpload = ({
    _csrfToken: csrfToken,
    _endpoint: endpoint,
    _file: file,
    _s3UploadDir: s3UploadDir
  }) => {
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
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const getChunkSize = file => Math.ceil(file.size / 10000);
  const prepareUploadPart = ({
    _csrfToken: csrfToken,
    _endpoint: endpoint,
    _key: key,
    _number: number,
    _uploadId: uploadId
  }) => {
    const filename = encodeURIComponent(key);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadId, number.toString(), `?key=${filename}`);
    return fetch(url, {
      headers: headers
    }).then(response => {
      return response.json();
    }).then(data => {
      return data;
    });
  };
  const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i !== -1) {
      arr.splice(i, 1);
    }
  };

  // The following code is adapted from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
  // which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

  class S3Upload extends BaseUpload$1 {
    onError;
    onProgress;
    onSuccess;
    _chunks;
    _chunkState;
    _createdPromise;
    _csrfToken;
    _endpoint;
    _file;
    _key;
    _parts;
    _s3UploadDir;
    _uploadId;
    _uploading;
    constructor({
      csrfToken,
      endpoint,
      file,
      s3UploadDir,
      uploadIndex
    }) {
      super({
        name: file.name,
        status: "uploading",
        type: "s3",
        uploadIndex
      });
      this._csrfToken = csrfToken;
      this._endpoint = endpoint;
      this._file = file;
      this._s3UploadDir = s3UploadDir;
      this._key = null;
      this._uploadId = null;
      this._parts = [];

      // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
      // upload was created already. That also ensures that the sequencing is right
      // (so the `OP` definitely happens if the upload is created).
      //
      // This mostly exists to make `abortUpload` work well: only sending the abort request if
      // the upload was already created, and if the createMultipartUpload request is still in flight,
      // aborting it immediately after it finishes.
      this._createdPromise = Promise.reject(new Error("Upload not created"));
      this._chunks = [];
      this._chunkState = [];
      this._uploading = [];
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
      this._initChunks();
      this._createdPromise.catch(() => ({})); // silence uncaught rejection warning
    }
    async abort() {
      for (const xhr of this._uploading.slice()) {
        xhr.abort();
      }
      this._uploading = [];
      await this._createdPromise;
      if (this._key && this._uploadId) {
        await abortMultipartUpload({
          _csrfToken: this._csrfToken,
          _endpoint: this._endpoint,
          _key: this._key,
          _uploadId: this._uploadId
        });
      }
    }
    delete() {
      return Promise.resolve();
    }
    getId() {
      return this._uploadId ?? undefined;
    }
    getInitialFile() {
      return {
        id: this._uploadId ?? "",
        name: this._key ?? "",
        original_name: this._file.name,
        size: this._file.size,
        type: "s3"
      };
    }
    getSize() {
      return this._file.size;
    }
    start() {
      void this._createUpload();
    }
    _completeUpload() {
      // Parts may not have completed uploading in sorted order, if limit > 1.
      this._parts.sort((a, b) => a.PartNumber - b.PartNumber);
      if (!this._uploadId || !this._key) {
        return Promise.resolve();
      }
      return completeMultipartUpload({
        _csrfToken: this._csrfToken,
        _endpoint: this._endpoint,
        _key: this._key,
        _parts: this._parts,
        _uploadId: this._uploadId
      }).then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
      }, err => {
        this._handleError(err);
      });
    }
    _createUpload() {
      this._createdPromise = createMultipartUpload({
        _csrfToken: this._csrfToken,
        _endpoint: this._endpoint,
        _file: this._file,
        _s3UploadDir: this._s3UploadDir
      });
      return this._createdPromise.then(result => {
        const valid = typeof result === "object" && result && typeof result.uploadId === "string" && typeof result.key === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`.");
        }
        this._key = result.key;
        this._uploadId = result.uploadId;
        this._uploadParts();
      }).catch(err => {
        this._handleError(err);
      });
    }
    _handleError(error) {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    }
    _initChunks() {
      const chunks = [];
      const desiredChunkSize = getChunkSize(this._file);
      // at least 5MB per request, at most 10k requests
      const minChunkSize = Math.max(5 * MB, Math.ceil(this._file.size / 10000));
      const chunkSize = Math.max(desiredChunkSize, minChunkSize);
      for (let i = 0; i < this._file.size; i += chunkSize) {
        const end = Math.min(this._file.size, i + chunkSize);
        chunks.push(this._file.slice(i, end));
      }
      this._chunks = chunks;
      this._chunkState = chunks.map(() => ({
        busy: false,
        done: false,
        uploaded: 0
      }));
    }
    _onPartComplete(index, etag) {
      const state = this._chunkState[index];
      if (state) {
        state.etag = etag;
        state.done = true;
      }
      const part = {
        ETag: etag,
        PartNumber: index + 1
      };
      this._parts.push(part);
      this._uploadParts();
    }
    _onPartProgress(index, sent) {
      const state = this._chunkState[index];
      if (state) {
        state.uploaded = sent;
      }
      if (this.onProgress) {
        const totalUploaded = this._chunkState.reduce((n, c) => n + c.uploaded, 0);
        this.onProgress(totalUploaded, this._file.size);
      }
    }
    _uploadPart(index) {
      const state = this._chunkState[index];
      if (state) {
        state.busy = true;
      }
      if (!this._key || !this._uploadId) {
        return Promise.resolve();
      }
      return prepareUploadPart({
        _csrfToken: this._csrfToken,
        _endpoint: this._endpoint,
        _key: this._key,
        _number: index + 1,
        _uploadId: this._uploadId
      }).then(result => {
        const valid = typeof result === "object" && typeof result.url === "string";
        if (!valid) {
          throw new TypeError("AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`.");
        }
        return result;
      }).then(({
        url
      }) => {
        this._uploadPartBytes(index, url);
      }, err => {
        this._handleError(err);
      });
    }
    _uploadPartBytes(index, url) {
      const body = this._chunks[index];
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.responseType = "text";
      this._uploading.push(xhr);
      xhr.upload.addEventListener("progress", ev => {
        if (!ev.lengthComputable) {
          return;
        }
        this._onPartProgress(index, ev.loaded);
      });
      xhr.addEventListener("abort", () => {
        remove(this._uploading, xhr);
        const state = this._chunkState[index];
        if (state) {
          state.busy = false;
        }
      });
      xhr.addEventListener("load", () => {
        remove(this._uploading, xhr);
        const state = this._chunkState[index];
        if (state) {
          state.busy = false;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          this._handleError(new Error("Non 2xx"));
          return;
        }
        this._onPartProgress(index, body?.size ?? 0);

        // NOTE This must be allowed by CORS.
        const etag = xhr.getResponseHeader("ETag");
        if (etag === null) {
          this._handleError(new Error("AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."));
          return;
        }
        this._onPartComplete(index, etag);
      });
      xhr.addEventListener("error", () => {
        remove(this._uploading, xhr);
        const state = this._chunkState[index];
        if (state) {
          state.busy = false;
        }
        const error = new Error("Unknown error");
        this._handleError(error);
      });
      xhr.send(body);
    }
    _uploadParts() {
      const need = 1 - this._uploading.length;
      if (need === 0) {
        return;
      }

      // All parts are uploaded.
      if (this._chunkState.every(state => state.done)) {
        void this._completeUpload();
        return;
      }
      const candidates = [];
      for (let i = 0; i < this._chunkState.length; i++) {
        const state = this._chunkState[i];
        if (!state || state.done || state.busy) {
          continue;
        }
        candidates.push(i);
        if (candidates.length >= need) {
          break;
        }
      }
      for (const index of candidates) {
        void this._uploadPart(index);
      }
    }
  }

  class DetailedError extends Error {
    constructor(message, causingErr, req, res) {
      super(message);
      this.originalRequest = req;
      this.originalResponse = res;
      this.causingError = causingErr;
      if (causingErr != null) {
        message += `, caused by ${causingErr.toString()}`;
      }
      if (req != null) {
        const requestId = req.getHeader('X-Request-ID') || 'n/a';
        const method = req.getMethod();
        const url = req.getURL();
        const status = res ? res.getStatus() : 'n/a';
        const body = res ? res.getBody() || '' : 'n/a';
        message += `, originated from request (method: ${method}, url: ${url}, response code: ${status}, response text: ${body}, request id: ${requestId})`;
      }
      this.message = message;
    }
  }

  function log(msg) {
    return;
  }

  class NoopUrlStorage {
    _findAllUploads() {
      return Promise.resolve([]);
    }
    _findUploadsByFingerprint(_fingerprint) {
      return Promise.resolve([]);
    }
    _removeUpload(_urlStorageKey) {
      return Promise.resolve();
    }
    _addUpload(_urlStorageKey, _upload) {
      return Promise.resolve(undefined);
    }
  }

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
  const version = '3.9.3';
  /**
   * @deprecated use lowercase `version`.
   */
  const VERSION = version;
  const _TD = typeof TextDecoder === 'function' ? new TextDecoder('utf-8', { ignoreBOM: true }) : undefined;
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
      : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
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
  const _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)
      : btoaPolyfill;
  const _fromUint8Array = typeof Uint8Array.prototype.toBase64 === 'function' ? (u8a) => u8a.toBase64()
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
  const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\x00-\x7F]/g;
  /**
   * @deprecated should have been internal use only.
   * @param {string} src UTF-8 string
   * @returns {string} UTF-16 string
   */
  const utob = (u) => u.replace(re_utob, cb_utob);
  //
  const _encode = _TE
      ? (s) => _fromUint8Array(_TE.encode(s))
      : (s) => _btoa(utob(s));
  /**
   * converts a UTF-8-encoded string to a Base64 string.
   * @param {boolean} [urlsafe] if `true` make the result URL-safe
   * @returns {string} Base64 string
   */
  const encode = (src, urlsafe = false) => urlsafe
      ? _mkUriSafe(_encode(src))
      : _encode(src);
  /**
   * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
   * @returns {string} Base64 string
   */
  const encodeURI = (src) => encode(src, true);
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
      let u24, r1, r2;
      let binArray = []; // use array to avoid minor gc in loop
      for (let i = 0; i < asc.length;) {
          u24 = b64tab[asc.charAt(i++)] << 18
              | b64tab[asc.charAt(i++)] << 12
              | (r1 = b64tab[asc.charAt(i++)]) << 6
              | (r2 = b64tab[asc.charAt(i++)]);
          if (r1 === 64) {
              binArray.push(_fromCC(u24 >> 16 & 255));
          }
          else if (r2 === 64) {
              binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
          }
          else {
              binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
          }
      }
      return binArray.join('');
  };
  /**
   * does what `window.atob` of web browsers do.
   * @param {String} asc Base64-encoded string
   * @returns {string} binary string
   */
  const _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))
      : atobPolyfill;
  //
  const _toUint8Array = typeof Uint8Array.fromBase64 === 'function'
      ? (a) => Uint8Array.fromBase64(a) : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
  /**
   * converts a Base64 string to a Uint8Array.
   */
  const toUint8Array = (a) => _toUint8Array(_unURI(a));
  //
  const _decode = _TD
      ? (a) => _TD.decode(_toUint8Array(a))
      : (a) => btou(_atob(a));
  const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
  /**
   * converts a Base64 string to a UTF-8 string.
   * @param {String} src Base64 string.  Both normal and URL-safe are supported
   * @returns {string} UTF-8 string
   */
  const decode = (src) => _decode(_unURI(src));
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
      _add('fromBase64', function () { return decode(this); });
      _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
      _add('toBase64URI', function () { return encode(this, true); });
      _add('toBase64URL', function () { return encode(this, true); });
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
      version: version,
      VERSION: VERSION,
      atob: _atob,
      atobPolyfill: atobPolyfill,
      btoa: _btoa,
      btoaPolyfill: btoaPolyfill,
      fromBase64: decode,
      toBase64: encode,
      encode: encode,
      encodeURI: encodeURI,
      encodeURL: encodeURI,
      utob: utob,
      btou: btou,
      decode: decode,
      isValid: isValid,
      fromUint8Array: fromUint8Array,
      toUint8Array: toUint8Array,
      extendString: extendString,
      extendUint8Array: extendUint8Array,
      extendBuiltins: extendBuiltins
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var requiresPort;
  var hasRequiredRequiresPort;

  function requireRequiresPort () {
  	if (hasRequiredRequiresPort) return requiresPort;
  	hasRequiredRequiresPort = 1;

  	/**
  	 * Check if we're required to add a port number.
  	 *
  	 * @see https://url.spec.whatwg.org/#default-port
  	 * @param {Number|String} port Port number we need to check
  	 * @param {String} protocol Protocol we need to check against.
  	 * @returns {Boolean} Is it a default port for the given protocol
  	 * @api private
  	 */
  	requiresPort = function required(port, protocol) {
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
  	return requiresPort;
  }

  var querystringify = {};

  var hasRequiredQuerystringify;

  function requireQuerystringify () {
  	if (hasRequiredQuerystringify) return querystringify;
  	hasRequiredQuerystringify = 1;

  	var has = Object.prototype.hasOwnProperty
  	  , undef;

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
  	  var parser = /([^=?#&]+)=?([^&]*)/g
  	    , result = {}
  	    , part;

  	  while (part = parser.exec(query)) {
  	    var key = decode(part[1])
  	      , value = decode(part[2]);

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
  	function querystringify$1(obj, prefix) {
  	  prefix = prefix || '';

  	  var pairs = []
  	    , value
  	    , key;

  	  //
  	  // Optionally prefix with a '?' if needed
  	  //
  	  if ('string' !== typeof prefix) prefix = '?';

  	  for (key in obj) {
  	    if (has.call(obj, key)) {
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
  	      pairs.push(key +'='+ value);
  	    }
  	  }

  	  return pairs.length ? prefix + pairs.join('&') : '';
  	}

  	//
  	// Expose the module.
  	//
  	querystringify.stringify = querystringify$1;
  	querystringify.parse = querystring;
  	return querystringify;
  }

  var urlParse;
  var hasRequiredUrlParse;

  function requireUrlParse () {
  	if (hasRequiredUrlParse) return urlParse;
  	hasRequiredUrlParse = 1;

  	var required = requireRequiresPort()
  	  , qs = requireQuerystringify()
  	  , controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
  	  , CRHTLF = /[\n\r\t]/g
  	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  	  , port = /:\d+$/
  	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
  	  , windowsDriveLetter = /^[a-zA-Z]:/;

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
  	var rules = [
  	  ['#', 'hash'],                        // Extract from the back.
  	  ['?', 'query'],                       // Extract from the back.
  	  function sanitize(address, url) {     // Sanitize what is left of the address
  	    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  	  },
  	  ['/', 'pathname'],                    // Extract from the back.
  	  ['@', 'auth', 1],                     // Extract from the front.
  	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  	  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
  	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
  	];

  	/**
  	 * These properties should not be copied or inherited from. This is only needed
  	 * for all non blob URL's as a blob URL does not include a hash, only the
  	 * origin.
  	 *
  	 * @type {Object}
  	 * @private
  	 */
  	var ignore = { hash: 1, query: 1 };

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

  	  if (typeof window !== 'undefined') globalVar = window;
  	  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
  	  else if (typeof self !== 'undefined') globalVar = self;
  	  else globalVar = {};

  	  var location = globalVar.location || {};
  	  loc = loc || location;

  	  var finaldestination = {}
  	    , type = typeof loc
  	    , key;

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
  	  return (
  	    scheme === 'file:' ||
  	    scheme === 'ftp:' ||
  	    scheme === 'http:' ||
  	    scheme === 'https:' ||
  	    scheme === 'ws:' ||
  	    scheme === 'wss:'
  	  );
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

  	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
  	    , i = path.length
  	    , last = path[i - 1]
  	    , unshift = false
  	    , up = 0;

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

  	  var relative, extracted, parse, instruction, index, key
  	    , instructions = rules.slice()
  	    , type = typeof location
  	    , url = this
  	    , i = 0;

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
  	  if (
  	    extracted.protocol === 'file:' && (
  	      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
  	    (!extracted.slashes &&
  	      (extracted.protocol ||
  	        extracted.slashesCount < 2 ||
  	        !isSpecial(url.protocol)))
  	  ) {
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
  	      index = parse === '@'
  	        ? address.lastIndexOf(parse)
  	        : address.indexOf(parse);

  	      if (~index) {
  	        if ('number' === typeof instruction[2]) {
  	          url[key] = address.slice(0, index);
  	          address = address.slice(index + instruction[2]);
  	        } else {
  	          url[key] = address.slice(index);
  	          address = address.slice(0, index);
  	        }
  	      }
  	    } else if ((index = parse.exec(address))) {
  	      url[key] = index[1];
  	      address = address.slice(0, index.index);
  	    }

  	    url[key] = url[key] || (
  	      relative && instruction[3] ? location[key] || '' : ''
  	    );

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
  	  if (
  	      relative
  	    && location.slashes
  	    && url.pathname.charAt(0) !== '/'
  	    && (url.pathname !== '' || location.pathname !== '')
  	  ) {
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

  	    url.auth = url.password ? url.username +':'+ url.password : url.username;
  	  }

  	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
  	    ? url.protocol +'//'+ url.host
  	    : 'null';

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
  	function set(part, value, fn) {
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
  	        url.host = url.hostname +':'+ value;
  	      }

  	      break;

  	    case 'hostname':
  	      url[part] = value;

  	      if (url.port) value += ':'+ url.port;
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

  	  url.auth = url.password ? url.username +':'+ url.password : url.username;

  	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
  	    ? url.protocol +'//'+ url.host
  	    : 'null';

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
  	function toString(stringify) {
  	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  	  var query
  	    , url = this
  	    , host = url.host
  	    , protocol = url.protocol;

  	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  	  var result =
  	    protocol +
  	    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

  	  if (url.username) {
  	    result += url.username;
  	    if (url.password) result += ':'+ url.password;
  	    result += '@';
  	  } else if (url.password) {
  	    result += ':'+ url.password;
  	    result += '@';
  	  } else if (
  	    url.protocol !== 'file:' &&
  	    isSpecial(url.protocol) &&
  	    !host &&
  	    url.pathname !== '/'
  	  ) {
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
  	  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
  	    host += ':';
  	  }

  	  result += host + url.pathname;

  	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  	  if (url.hash) result += url.hash;

  	  return result;
  	}

  	Url.prototype = { set: set, toString: toString };

  	//
  	// Expose the URL parser and some additional properties that might be useful for
  	// others or testing.
  	//
  	Url.extractProtocol = extractProtocol;
  	Url.location = lolcation;
  	Url.trimLeft = trimLeft;
  	Url.qs = qs;

  	urlParse = Url;
  	return urlParse;
  }

  var urlParseExports = requireUrlParse();
  var URL = /*@__PURE__*/getDefaultExportFromCjs(urlParseExports);

  const PROTOCOL_TUS_V1 = 'tus-v1';
  const PROTOCOL_IETF_DRAFT_03 = 'ietf-draft-03';
  const PROTOCOL_IETF_DRAFT_05 = 'ietf-draft-05';

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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  const defaultOptions$1 = {
    endpoint: undefined,
    uploadUrl: undefined,
    metadata: {},
    metadataForPartialUploads: {},
    fingerprint: undefined,
    uploadSize: undefined,
    onProgress: undefined,
    onChunkComplete: undefined,
    onSuccess: undefined,
    onError: undefined,
    onUploadUrlAvailable: undefined,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    onBeforeRequest: undefined,
    onAfterResponse: undefined,
    onShouldRetry: defaultOnShouldRetry,
    chunkSize: Number.POSITIVE_INFINITY,
    retryDelays: [0, 1000, 3000, 5000],
    parallelUploads: 1,
    parallelUploadBoundaries: undefined,
    storeFingerprintForResuming: true,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
    urlStorage: undefined,
    fileReader: undefined,
    httpStack: undefined,
    protocol: PROTOCOL_TUS_V1
  };
  class BaseUpload {
    constructor(file, options) {
      // The URL against which the file will be uploaded
      this.url = null;
      // The fingerpinrt for the current file (set after start())
      this._fingerprint = null;
      // The offset used in the current PATCH request
      this._offset = 0;
      // True if the current PATCH request has been aborted
      this._aborted = false;
      // The file's size in bytes
      this._size = null;
      // The current count of attempts which have been made. Zero indicates none.
      this._retryAttempt = 0;
      // The offset of the remote upload before the latest attempt was started.
      this._offsetBeforeRetry = 0;
      // Warn about removed options from previous versions
      if ('resume' in options) {
        console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.');
      }
      // The default options will already be added from the wrapper classes.
      this.options = options;
      // Cast chunkSize to integer
      // TODO: Remove this cast
      this.options.chunkSize = Number(this.options.chunkSize);
      this._uploadLengthDeferred = this.options.uploadLengthDeferred;
      this.file = file;
    }
    async findPreviousUploads() {
      const fingerprint = await this.options.fingerprint(this.file, this.options);
      if (!fingerprint) {
        throw new Error('tus: unable to calculate fingerprint for this input file');
      }
      return await this.options.urlStorage.findUploadsByFingerprint(fingerprint);
    }
    resumeFromPreviousUpload(previousUpload) {
      this.url = previousUpload.uploadUrl || null;
      this._parallelUploadUrls = previousUpload.parallelUploadUrls;
      this._urlStorageKey = previousUpload.urlStorageKey;
    }
    start() {
      if (!this.file) {
        this._emitError(new Error('tus: no file or stream to upload provided'));
        return;
      }
      if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
        this._emitError(new Error(`tus: unsupported protocol ${this.options.protocol}`));
        return;
      }
      if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));
        return;
      }
      const {
        retryDelays
      } = this.options;
      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));
        return;
      }
      if (this.options.parallelUploads > 1) {
        // Test which options are incompatible with parallel uploads.
        if (this.options.uploadUrl != null) {
          this._emitError(new Error('tus: cannot use the `uploadUrl` option when parallelUploads is enabled'));
          return;
        }
        if (this.options.uploadSize != null) {
          this._emitError(new Error('tus: cannot use the `uploadSize` option when parallelUploads is enabled'));
          return;
        }
        if (this._uploadLengthDeferred) {
          this._emitError(new Error('tus: cannot use the `uploadLengthDeferred` option when parallelUploads is enabled'));
          return;
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
      // Note: `start` does not return a Promise or await the preparation on purpose.
      // Its supposed to return immediately and start the upload in the background.
      this._prepareAndStartUpload().catch(err => {
        if (!(err instanceof Error)) {
          throw new Error(`tus: value thrown that is not an error: ${err}`);
        }
        // Errors from the actual upload requests will bubble up to here, where
        // we then consider retrying them. Other functions should not call _emitError on their own.
        this._retryOrEmitError(err);
      });
    }
    async _prepareAndStartUpload() {
      this._fingerprint = await this.options.fingerprint(this.file, this.options);
      if (this._fingerprint == null) ; else {
        log(`Calculated fingerprint: ${this._fingerprint}`);
      }
      if (this._source == null) {
        this._source = await this.options.fileReader.openFile(this.file, this.options.chunkSize);
      }
      // First, we look at the uploadLengthDeferred option.
      // Next, we check if the caller has supplied a manual upload size.
      // Finally, we try to use the calculated size from the source object.
      if (this._uploadLengthDeferred) {
        this._size = null;
      } else if (this.options.uploadSize != null) {
        this._size = Number(this.options.uploadSize);
        if (Number.isNaN(this._size)) {
          throw new Error('tus: cannot convert `uploadSize` option into a number');
        }
      } else {
        this._size = this._source.size;
        if (this._size == null) {
          throw new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option");
        }
      }
      // If the upload was configured to use multiple requests or if we resume from
      // an upload which used multiple requests, we start a parallel upload.
      if (this.options.parallelUploads > 1 || this._parallelUploadUrls != null) {
        await this._startParallelUpload();
      } else {
        await this._startSingleUpload();
      }
    }
    /**
     * Initiate the uploading procedure for a parallelized upload, where one file is split into
     * multiple request which are run in parallel.
     *
     * @api private
     */
    async _startParallelUpload() {
      var _a;
      const totalSize = this._size;
      let totalProgress = 0;
      this._parallelUploads = [];
      const partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;
      if (this._size == null) {
        throw new Error('tus: Expected _size to be set');
      }
      // The input file will be split into multiple slices which are uploaded in separate
      // requests. Here we get the start and end position for the slices.
      const partsBoundaries = (_a = this.options.parallelUploadBoundaries) !== null && _a !== void 0 ? _a : splitSizeIntoParts(this._size, partCount);
      // Attach URLs from previous uploads, if available.
      const parts = partsBoundaries.map((part, index) => {
        var _a;
        return {
          ...part,
          uploadUrl: ((_a = this._parallelUploadUrls) === null || _a === void 0 ? void 0 : _a[index]) || null
        };
      });
      // Create an empty list for storing the upload URLs
      this._parallelUploadUrls = new Array(parts.length);
      // Generate a promise for each slice that will be resolve if the respective
      // upload is completed.
      const uploads = parts.map(async (part, index) => {
        let lastPartProgress = 0;
        // @ts-expect-error We know that `_source` is not null here.
        const {
          value
        } = await this._source.slice(part.start, part.end);
        return new Promise((resolve, reject) => {
          // Merge with the user supplied options but overwrite some values.
          const options = {
            ...this.options,
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
            metadata: this.options.metadataForPartialUploads,
            // Add the header to indicate the this is a partial upload.
            headers: {
              ...this.options.headers,
              'Upload-Concat': 'partial'
            },
            // Reject or resolve the promise if the upload errors or completes.
            onSuccess: resolve,
            onError: reject,
            // Based in the progress for this partial upload, calculate the progress
            // for the entire final upload.
            onProgress: newPartProgress => {
              totalProgress = totalProgress - lastPartProgress + newPartProgress;
              lastPartProgress = newPartProgress;
              if (totalSize == null) {
                throw new Error('tus: Expected totalSize to be set');
              }
              this._emitProgress(totalProgress, totalSize);
            },
            // Wait until every partial upload has an upload URL, so we can add
            // them to the URL storage.
            onUploadUrlAvailable: async () => {
              // @ts-expect-error We know that _parallelUploadUrls is defined
              this._parallelUploadUrls[index] = upload.url;
              // Test if all uploads have received an URL
              // @ts-expect-error We know that _parallelUploadUrls is defined
              if (this._parallelUploadUrls.filter(u => Boolean(u)).length === parts.length) {
                await this._saveUploadInUrlStorage();
              }
            }
          };
          if (value == null) {
            reject(new Error('tus: no value returned while slicing file for parallel uploads'));
            return;
          }
          // @ts-expect-error `value` is unknown and not an UploadInput
          const upload = new BaseUpload(value, options);
          upload.start();
          // Store the upload in an array, so we can later abort them if necessary.
          // @ts-expect-error We know that _parallelUploadUrls is defined
          this._parallelUploads.push(upload);
        });
      });
      // Wait until all partial uploads are finished and we can send the POST request for
      // creating the final upload.
      await Promise.all(uploads);
      if (this.options.endpoint == null) {
        throw new Error('tus: Expected options.endpoint to be set');
      }
      const req = this._openRequest('POST', this.options.endpoint);
      req.setHeader('Upload-Concat', `final;${this._parallelUploadUrls.join(' ')}`);
      // Add metadata if values have been added
      const metadata = encodeMetadata(this.options.metadata);
      if (metadata !== '') {
        req.setHeader('Upload-Metadata', metadata);
      }
      let res;
      try {
        res = await this._sendRequest(req);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw new Error(`tus: value thrown that is not an error: ${err}`);
        }
        throw new DetailedError('tus: failed to concatenate parallel uploads', err, req, undefined);
      }
      if (!inStatusCategory(res.getStatus(), 200)) {
        throw new DetailedError('tus: unexpected response while creating upload', undefined, req, res);
      }
      const location = res.getHeader('Location');
      if (location == null) {
        throw new DetailedError('tus: invalid or missing Location header', undefined, req, res);
      }
      if (this.options.endpoint == null) {
        throw new Error('tus: Expeced endpoint to be defined.');
      }
      this.url = resolveUrl(this.options.endpoint, location);
      log(`Created upload at ${this.url}`);
      await this._emitSuccess(res);
    }
    /**
     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
     * uploaded in a sequential matter.
     *
     * @api private
     */
    async _startSingleUpload() {
      // Reset the aborted flag when the upload is started or else the
      // _performUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;
      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        log(`Resuming upload from previous URL: ${this.url}`);
        return await this._resumeUpload();
      }
      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        log(`Resuming upload from provided URL: ${this.options.uploadUrl}`);
        this.url = this.options.uploadUrl;
        return await this._resumeUpload();
      }
      return await this._createUpload();
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
    async abort(shouldTerminate = false) {
      // Set the aborted flag before any `await`s, so no new requests are started.
      this._aborted = true;
      // Stop any parallel partial uploads, that have been started in _startParallelUploads.
      if (this._parallelUploads != null) {
        for (const upload of this._parallelUploads) {
          await upload.abort(shouldTerminate);
        }
      }
      // Stop any current running request.
      if (this._req != null) {
        await this._req.abort();
        // Note: We do not close the file source here, so the user can resume in the future.
      }
      // Stop any timeout used for initiating a retry.
      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = undefined;
      }
      if (shouldTerminate && this.url != null) {
        await terminate(this.url, this.options);
        // Remove entry from the URL storage since the upload URL is no longer valid.
        await this._removeFromUrlStorage();
      }
    }
    _emitError(err) {
      // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.
      if (this._aborted) return;
      if (typeof this.options.onError === 'function') {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
    _retryOrEmitError(err) {
      // Do not retry if explicitly aborted
      if (this._aborted) return;
      // Check if we should retry, when enabled, before sending the error to the user.
      if (this.options.retryDelays != null) {
        // We will reset the attempt counter if
        // - we were already able to connect to the server (offset != null) and
        // - we were able to upload a small chunk of data to the server
        const shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
        if (shouldResetDelays) {
          this._retryAttempt = 0;
        }
        if (shouldRetry(err, this._retryAttempt, this.options)) {
          const delay = this.options.retryDelays[this._retryAttempt++];
          this._offsetBeforeRetry = this._offset;
          this._retryTimeout = setTimeout(() => {
            this.start();
          }, delay);
          return;
        }
      }
      // If we are not retrying, emit the error to the user.
      this._emitError(err);
    }
    /**
     * Publishes notification if the upload has been successfully completed.
     *
     * @param {object} lastResponse Last HTTP response.
     * @api private
     */
    async _emitSuccess(lastResponse) {
      if (this.options.removeFingerprintOnSuccess) {
        // Remove stored fingerprint and corresponding endpoint. This causes
        // new uploads of the same file to be treated as a different file.
        await this._removeFromUrlStorage();
      }
      if (typeof this.options.onSuccess === 'function') {
        this.options.onSuccess({
          lastResponse
        });
      }
    }
    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     *
     * @param {number} bytesSent  Number of bytes sent to the server.
     * @param {number|null} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
    _emitProgress(bytesSent, bytesTotal) {
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
     * @param {number|null} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */
    _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
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
    async _createUpload() {
      if (!this.options.endpoint) {
        throw new Error('tus: unable to create upload because no endpoint is provided');
      }
      const req = this._openRequest('POST', this.options.endpoint);
      if (this._uploadLengthDeferred) {
        req.setHeader('Upload-Defer-Length', '1');
      } else {
        if (this._size == null) {
          throw new Error('tus: expected _size to be set');
        }
        req.setHeader('Upload-Length', `${this._size}`);
      }
      // Add metadata if values have been added
      const metadata = encodeMetadata(this.options.metadata);
      if (metadata !== '') {
        req.setHeader('Upload-Metadata', metadata);
      }
      let res;
      try {
        if (this.options.uploadDataDuringCreation && !this._uploadLengthDeferred) {
          this._offset = 0;
          res = await this._addChunkToRequest(req);
        } else {
          if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
            req.setHeader('Upload-Complete', '?0');
          }
          res = await this._sendRequest(req);
        }
      } catch (err) {
        if (!(err instanceof Error)) {
          throw new Error(`tus: value thrown that is not an error: ${err}`);
        }
        throw new DetailedError('tus: failed to create upload', err, req, undefined);
      }
      if (!inStatusCategory(res.getStatus(), 200)) {
        throw new DetailedError('tus: unexpected response while creating upload', undefined, req, res);
      }
      const location = res.getHeader('Location');
      if (location == null) {
        throw new DetailedError('tus: invalid or missing Location header', undefined, req, res);
      }
      if (this.options.endpoint == null) {
        throw new Error('tus: Expected options.endpoint to be set');
      }
      this.url = resolveUrl(this.options.endpoint, location);
      log(`Created upload at ${this.url}`);
      if (typeof this.options.onUploadUrlAvailable === 'function') {
        await this.options.onUploadUrlAvailable();
      }
      if (this._size === 0) {
        // Nothing to upload and file was successfully created
        await this._emitSuccess(res);
        if (this._source) this._source.close();
        return;
      }
      await this._saveUploadInUrlStorage();
      if (this.options.uploadDataDuringCreation) {
        await this._handleUploadResponse(req, res);
      } else {
        this._offset = 0;
        await this._performUpload();
      }
    }
    /**
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */
    async _resumeUpload() {
      if (this.url == null) {
        throw new Error('tus: Expected url to be set');
      }
      const req = this._openRequest('HEAD', this.url);
      let res;
      try {
        res = await this._sendRequest(req);
      } catch (err) {
        if (!(err instanceof Error)) {
          throw new Error(`tus: value thrown that is not an error: ${err}`);
        }
        throw new DetailedError('tus: failed to resume upload', err, req, undefined);
      }
      const status = res.getStatus();
      if (!inStatusCategory(status, 200)) {
        // If the upload is locked (indicated by the 423 Locked status code), we
        // emit an error instead of directly starting a new upload. This way the
        // retry logic can catch the error and will retry the upload. An upload
        // is usually locked for a short period of time and will be available
        // afterwards.
        if (status === 423) {
          throw new DetailedError('tus: upload is currently locked; retry later', undefined, req, res);
        }
        if (inStatusCategory(status, 400)) {
          // Remove stored fingerprint and corresponding endpoint,
          // on client errors since the file can not be found
          await this._removeFromUrlStorage();
        }
        if (!this.options.endpoint) {
          // Don't attempt to create a new upload if no endpoint is provided.
          throw new DetailedError('tus: unable to resume upload (new upload cannot be created without an endpoint)', undefined, req, res);
        }
        // Try to create a new upload
        this.url = null;
        await this._createUpload();
      }
      const offsetStr = res.getHeader('Upload-Offset');
      if (offsetStr === undefined) {
        throw new DetailedError('tus: missing Upload-Offset header', undefined, req, res);
      }
      const offset = Number.parseInt(offsetStr, 10);
      if (Number.isNaN(offset)) {
        throw new DetailedError('tus: invalid Upload-Offset header', undefined, req, res);
      }
      const deferLength = res.getHeader('Upload-Defer-Length');
      this._uploadLengthDeferred = deferLength === '1';
      // @ts-expect-error parseInt also handles undefined as we want it to
      const length = Number.parseInt(res.getHeader('Upload-Length'), 10);
      if (Number.isNaN(length) && !this._uploadLengthDeferred && this.options.protocol === PROTOCOL_TUS_V1) {
        throw new DetailedError('tus: invalid or missing length value', undefined, req, res);
      }
      if (typeof this.options.onUploadUrlAvailable === 'function') {
        await this.options.onUploadUrlAvailable();
      }
      await this._saveUploadInUrlStorage();
      // Upload has already been completed and we do not need to send additional
      // data to the server
      if (offset === length) {
        this._emitProgress(length, length);
        await this._emitSuccess(res);
        return;
      }
      this._offset = offset;
      await this._performUpload();
    }
    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */
    async _performUpload() {
      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }
      let req;
      if (this.url == null) {
        throw new Error('tus: Expected url to be set');
      }
      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        req = this._openRequest('POST', this.url);
        req.setHeader('X-HTTP-Method-Override', 'PATCH');
      } else {
        req = this._openRequest('PATCH', this.url);
      }
      req.setHeader('Upload-Offset', `${this._offset}`);
      let res;
      try {
        res = await this._addChunkToRequest(req);
      } catch (err) {
        // Don't emit an error if the upload was aborted manually
        if (this._aborted) {
          return;
        }
        if (!(err instanceof Error)) {
          throw new Error(`tus: value thrown that is not an error: ${err}`);
        }
        throw new DetailedError(`tus: failed to upload chunk at offset ${this._offset}`, err, req, undefined);
      }
      if (!inStatusCategory(res.getStatus(), 200)) {
        throw new DetailedError('tus: unexpected response while uploading chunk', undefined, req, res);
      }
      await this._handleUploadResponse(req, res);
    }
    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied request object. It will not handle the response.
     *
     * @api private
     */
    async _addChunkToRequest(req) {
      const start = this._offset;
      let end = this._offset + this.options.chunkSize;
      req.setProgressHandler(bytesSent => {
        this._emitProgress(start + bytesSent, this._size);
      });
      if (this.options.protocol === PROTOCOL_TUS_V1) {
        req.setHeader('Content-Type', 'application/offset+octet-stream');
      } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
        req.setHeader('Content-Type', 'application/partial-upload');
      }
      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if (
      // @ts-expect-error _size is set here
      (end === Number.POSITIVE_INFINITY || end > this._size) && !this._uploadLengthDeferred) {
        // @ts-expect-error _size is set here
        end = this._size;
      }
      // TODO: What happens if abort is called during slice?
      // @ts-expect-error _source is set here
      const {
        value,
        size,
        done
      } = await this._source.slice(start, end);
      const sizeOfValue = size !== null && size !== void 0 ? size : 0;
      // If the upload length is deferred, the upload size was not specified during
      // upload creation. So, if the file reader is done reading, we know the total
      // upload size and can tell the tus server.
      if (this._uploadLengthDeferred && done) {
        this._size = this._offset + sizeOfValue;
        req.setHeader('Upload-Length', `${this._size}`);
        this._uploadLengthDeferred = false;
      }
      // The specified uploadSize might not match the actual amount of data that a source
      // provides. In these cases, we cannot successfully complete the upload, so we
      // rather error out and let the user know. If not, tus-js-client will be stuck
      // in a loop of repeating empty PATCH requests.
      // See https://community.transloadit.com/t/how-to-abort-hanging-companion-uploads/16488/13
      const newSize = this._offset + sizeOfValue;
      if (!this._uploadLengthDeferred && done && newSize !== this._size) {
        throw new Error(`upload was configured with a size of ${this._size} bytes, but the source is done after ${newSize} bytes`);
      }
      if (value == null) {
        return await this._sendRequest(req);
      }
      if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
        req.setHeader('Upload-Complete', done ? '?1' : '?0');
      }
      this._emitProgress(this._offset, this._size);
      return await this._sendRequest(req, value);
    }
    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     *
     * @api private
     */
    async _handleUploadResponse(req, res) {
      // TODO: || '' is not very good.
      const offset = Number.parseInt(res.getHeader('Upload-Offset') || '', 10);
      if (Number.isNaN(offset)) {
        throw new DetailedError('tus: invalid or missing offset value', undefined, req, res);
      }
      this._emitProgress(offset, this._size);
      this._emitChunkComplete(offset - this._offset, offset, this._size);
      this._offset = offset;
      if (offset === this._size) {
        // Yay, finally done :)
        await this._emitSuccess(res);
        if (this._source) this._source.close();
        return;
      }
      await this._performUpload();
    }
    /**
     * Create a new HTTP request object with the given method and URL.
     *
     * @api private
     */
    _openRequest(method, url) {
      const req = openRequest(method, url, this.options);
      this._req = req;
      return req;
    }
    /**
     * Remove the entry in the URL storage, if it has been saved before.
     *
     * @api private
     */
    async _removeFromUrlStorage() {
      if (!this._urlStorageKey) return;
      await this.options.urlStorage.removeUpload(this._urlStorageKey);
      this._urlStorageKey = undefined;
    }
    /**
     * Add the upload URL to the URL storage, if possible.
     *
     * @api private
     */
    async _saveUploadInUrlStorage() {
      // We do not store the upload URL
      // - if it was disabled in the option, or
      // - if no fingerprint was calculated for the input (i.e. a stream), or
      // - if the URL is already stored (i.e. key is set alread).
      if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey != null) {
        return;
      }
      const storedUpload = {
        size: this._size,
        metadata: this.options.metadata,
        creationTime: new Date().toString(),
        urlStorageKey: this._fingerprint
      };
      if (this._parallelUploads) {
        // Save multiple URLs if the parallelUploads option is used ...
        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
      } else {
        // ... otherwise we just save the one available URL.
        // @ts-expect-error We still have to figure out the null/undefined situation.
        storedUpload.uploadUrl = this.url;
      }
      const urlStorageKey = await this.options.urlStorage.addUpload(this._fingerprint, storedUpload);
      // TODO: Emit a waring if urlStorageKey is undefined. Should we even allow this?
      this._urlStorageKey = urlStorageKey;
    }
    /**
     * Send a request with the provided body.
     *
     * @api private
     */
    _sendRequest(req, body) {
      return sendRequest(req, body, this.options);
    }
  }
  function encodeMetadata(metadata) {
    return Object.entries(metadata).map(([key, value]) => `${key} ${gBase64.encode(String(value))}`).join(',');
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
    const req = options.httpStack.createRequest(method, url);
    if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
      req.setHeader('Upload-Draft-Interop-Version', '5');
    } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
      req.setHeader('Upload-Draft-Interop-Version', '6');
    } else {
      req.setHeader('Tus-Resumable', '1.0.0');
    }
    const headers = options.headers || {};
    for (const [name, value] of Object.entries(headers)) {
      req.setHeader(name, value);
    }
    if (options.addRequestId) {
      const requestId = uuid();
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
  async function sendRequest(req, body, options) {
    if (typeof options.onBeforeRequest === 'function') {
      await options.onBeforeRequest(req);
    }
    const res = await req.send(body);
    if (typeof options.onAfterResponse === 'function') {
      await options.onAfterResponse(req, res);
    }
    return res;
  }
  /**
   * Checks whether the browser running this code has internet access.
   * This function will always return true in the node.js environment
   * TODO: Move this into a browser-specific location.
   *
   * @api private
   */
  function isOnline() {
    let online = true;
    // Note: We don't reference `window` here because the navigator object also exists
    // in a Web Worker's context.
    // -disable-next-line no-undef
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      online = false;
    }
    return online;
  }
  /**
   * Checks whether or not it is ok to retry a request.
   * @param {Error|DetailedError} err the error returned from the last request
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
    const isNetworkError = 'originalRequest' in err && err._originalRequest != null;
    if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || !isNetworkError) {
      return false;
    }
    if (options && typeof options.onShouldRetry === 'function') {
      return options.onShouldRetry(err, retryAttempt, options);
    }
    return defaultOnShouldRetry(err);
  }
  /**
   * determines if the request should be retried. Will only retry if not a status 4xx except a 409 or 423
   * @param {DetailedError} err
   * @returns {boolean}
   */
  function defaultOnShouldRetry(err) {
    const status = err._originalResponse ? err._originalResponse.getStatus() : 0;
    return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
  }
  /**
   * Resolve a relative link given the origin as source. For example,
   * if a HTTP request to http://example.com/files/ returns a Location
   * header with the value /upload/abc, the resolved URL will be:
   * http://example.com/upload/abc
   */
  function resolveUrl(origin, link) {
    return new URL(link, origin).toString();
  }
  /**
   * Calculate the start and end positions for the parts if an upload
   * is split into multiple parallel requests.
   *
   * @param {number} totalSize The byte size of the upload, which will be split.
   * @param {number} partCount The number in how many parts the upload will be split.
   * @return {Part[]}
   * @api private
   */
  function splitSizeIntoParts(totalSize, partCount) {
    const partSize = Math.floor(totalSize / partCount);
    const parts = [];
    for (let i = 0; i < partCount; i++) {
      parts.push({
        start: partSize * i,
        end: partSize * (i + 1)
      });
    }
    parts[partCount - 1].end = totalSize;
    return parts;
  }
  function wait(delay) {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
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
  async function terminate(url, options) {
    const req = openRequest('DELETE', url, options);
    try {
      const res = await sendRequest(req, undefined, options);
      // A 204 response indicates a successfull request
      if (res.getStatus() === 204) {
        return;
      }
      throw new DetailedError('tus: unexpected response while terminating upload', undefined, req, res);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new Error(`tus: value thrown that is not an error: ${err}`);
      }
      const detailedErr = err instanceof DetailedError ? err : new DetailedError('tus: failed to terminate upload', err, req);
      if (!shouldRetry(detailedErr, 0, options)) {
        throw detailedErr;
      }
      // Instead of keeping track of the retry attempts, we remove the first element from the delays
      // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
      // We recursively call the terminate function will removing elements from the retryDelays array.
      const delay = options.retryDelays[0];
      const remainingDelays = options.retryDelays.slice(1);
      const newOptions = {
        ...options,
        retryDelays: remainingDelays
      };
      await wait(delay);
      await terminate(url, newOptions);
    }
  }

  /**
   * ArrayBufferViewFileSource implements FileSource for ArrayBufferView instances
   * (e.g. TypedArry or DataView).
   *
   * Note that the underlying ArrayBuffer should not change once passed to tus-js-client
   * or it will lead to weird behavior.
   */
  class ArrayBufferViewFileSource {
    constructor(view) {
      this._view = view;
      this.size = view.byteLength;
    }
    _slice(start, end) {
      const buffer = this._view.buffer;
      const startInBuffer = this._view.byteOffset + start;
      end = Math.min(end, this.size); // ensure end is finite and not greater than size
      const byteLength = end - start;
      // Use DataView instead of ArrayBuffer.slice to avoid copying the buffer.
      const value = new DataView(buffer, startInBuffer, byteLength);
      const size = value.byteLength;
      const done = end >= this.size;
      return Promise.resolve({
        value,
        size,
        done
      });
    }
    _close() {
      // Nothing to do here since we don't need to release any resources.
    }
  }

  const isCordova = () => typeof window !== 'undefined' && ('PhoneGap' in window || 'Cordova' in window || 'cordova' in window);

  /**
   * readAsByteArray converts a File/Blob object to a Uint8Array.
   * This function is only used on the Apache Cordova platform.
   * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
   */
  // TODO: Reconsider whether this is a sensible approach or whether we cause
  // high memory usage with `chunkSize` is unset.
  function readAsByteArray(chunk) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!(reader.result instanceof ArrayBuffer)) {
          reject(new Error(`invalid result types for readAsArrayBuffer: ${typeof reader.result}`));
          return;
        }
        const value = new Uint8Array(reader.result);
        resolve(value);
      };
      reader.onerror = err => {
        reject(err);
      };
      reader.readAsArrayBuffer(chunk);
    });
  }

  /**
   * BlobFileSource implements FileSource for Blobs (and therefore also for File instances).
   */
  class BlobFileSource {
    constructor(file) {
      this._file = file;
      this.size = file.size;
    }
    async _slice(start, end) {
      // TODO: This looks fishy. We should test how this actually works in Cordova
      // and consider moving this into the lib/cordova/ directory.
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if (isCordova()) {
        const value = await readAsByteArray(this._file.slice(start, end));
        const size = value.length;
        const done = end >= this.size;
        return {
          value,
          size,
          done
        };
      }
      const value = this._file.slice(start, end);
      const size = value.size;
      const done = end >= this.size;
      return {
        value,
        size,
        done
      };
    }
    _close() {
      // Nothing to do here since we don't need to release any resources.
    }
  }

  function len(blobOrArray) {
    if (blobOrArray === undefined) return 0;
    if (blobOrArray instanceof Blob) return blobOrArray.size;
    return blobOrArray.length;
  }
  /*
    Typed arrays and blobs don't have a concat method.
    This function helps StreamSource accumulate data to reach chunkSize.
  */
  function concat(a, b) {
    if (a instanceof Blob && b instanceof Blob) {
      return new Blob([a, b], {
        type: a.type
      });
    }
    if (a instanceof Uint8Array && b instanceof Uint8Array) {
      const c = new Uint8Array(a.length + b.length);
      c.set(a);
      c.set(b, a.length);
      return c;
    }
    throw new Error('Unknown data type');
  }
  /**
   * WebStreamFileSource implements FileSource for Web Streams.
   */
  // TODO: Can we share code with NodeStreamFileSource?
  class WebStreamFileSource {
    constructor(stream) {
      // _bufferOffset defines at which position the content of _buffer (if it is set)
      // is located in the view of the entire stream. It does not mean at which offset
      // the content in _buffer begins.
      this._bufferOffset = 0;
      this._done = false;
      // Setting the size to null indicates that we have no calculation available
      // for how much data this stream will emit requiring the user to specify
      // it manually (see the `uploadSize` option).
      this.size = null;
      if (stream.locked) {
        throw new Error('Readable stream is already locked to reader. tus-js-client cannot obtain a new reader.');
      }
      this._reader = stream.getReader();
    }
    async _slice(start, end) {
      if (start < this._bufferOffset) {
        throw new Error("Requested data is before the reader's current offset");
      }
      return await this._readUntilEnoughDataOrDone(start, end);
    }
    async _readUntilEnoughDataOrDone(start, end) {
      const hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        const value = this._getDataFromBuffer(start, end);
        if (value === null) {
          return {
            value: null,
            size: null,
            done: true
          };
        }
        const size = value instanceof Blob ? value.size : value.length;
        const done = this._done;
        return {
          value,
          size,
          done
        };
      }
      const {
        value,
        done
      } = await this._reader.read();
      if (done) {
        this._done = true;
      } else {
        const chunkSize = len(value);
        // If all of the chunk occurs before 'start' then drop it and clear the buffer.
        // This greatly improves performance when reading from a stream we haven't started processing yet and 'start' is near the end of the file.
        // Rather than buffering all of the unused data in memory just to only read a chunk near the end, rather immidiately drop data which will never be read.
        if (this._bufferOffset + len(this._buffer) + chunkSize < start) {
          this._buffer = undefined;
          this._bufferOffset += chunkSize;
        } else if (this._buffer === undefined) {
          this._buffer = value;
        } else {
          this._buffer = concat(this._buffer, value);
        }
      }
      return await this._readUntilEnoughDataOrDone(start, end);
    }
    _getDataFromBuffer(start, end) {
      if (this._buffer === undefined) {
        throw new Error('cannot _getDataFromBuffer because _buffer is unset');
      }
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      // If the buffer is empty after removing old data, all data has been read.
      const hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      // We already removed data before `start`, so we just return the first
      // chunk from the buffer.
      return this._buffer.slice(0, end - start);
    }
    _close() {
      this._reader.cancel();
    }
  }

  /**
   * openFile provides FileSources for input types that have to be handled in all environments,
   * including Node.js and browsers.
   */
  function openFile(input, chunkSize) {
    // File is a subtype of Blob, so we only check for Blob here.
    // Note: We could turn Blobs into ArrayBuffers using `input.arrayBuffer()` and then
    // pass it to the ArrayBufferFileSource. However, in browsers, a File instance can
    // represent a file on disk. By keeping it a File instance and passing it to XHR/Fetch,
    // we can avoid reading the entire file into memory.
    if (input instanceof Blob) {
      return new BlobFileSource(input);
    }
    // ArrayBufferViews can be TypedArray (e.g. Uint8Array) or DataView instances.
    // Note that Node.js' Buffers are also Uint8Arrays.
    if (ArrayBuffer.isView(input)) {
      return new ArrayBufferViewFileSource(input);
    }
    // SharedArrayBuffer is not available in all browser context for security reasons.
    // Hence we check if the constructor exists at all.
    if (input instanceof ArrayBuffer || typeof SharedArrayBuffer !== 'undefined' && input instanceof SharedArrayBuffer) {
      const view = new DataView(input);
      return new ArrayBufferViewFileSource(view);
    }
    if (input instanceof ReadableStream) {
      chunkSize = Number(chunkSize);
      if (!Number.isFinite(chunkSize)) {
        throw new Error('cannot create source for stream without a finite value for the `chunkSize` option');
      }
      return new WebStreamFileSource(input);
    }
    return null;
  }
  const supportedTypes = ['File', 'Blob', 'ArrayBuffer', 'SharedArrayBuffer', 'ArrayBufferView', 'ReadableStream (Web Streams)'];

  function isReactNativePlatform() {
    return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
  }
  function isReactNativeFile(input) {
    return input != null && typeof input === 'object' && 'uri' in input && typeof input.uri === 'string';
  }

  /**
   * uriToBlob resolves a URI to a Blob object. This is used for
   * React Native to retrieve a file (identified by a file://
   * URI) as a blob.
   */
  function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const blob = xhr.response;
        resolve(blob);
      };
      xhr.onerror = err => {
        reject(err);
      };
      xhr.open('GET', uri);
      xhr.send();
    });
  }

  class BrowserFileReader {
    async _openFile(input, chunkSize) {
      // In React Native, when user selects a file, instead of a File or Blob,
      // you usually get a file object {} with a uri property that contains
      // a local path to the file. We use XMLHttpRequest to fetch
      // the file blob, before uploading with tus.
      if (isReactNativeFile(input)) {
        if (!isReactNativePlatform()) {
          throw new Error('tus: file objects with `uri` property is only supported in React Native');
        }
        try {
          const blob = await uriToBlob(input.uri);
          return new BlobFileSource(blob);
        } catch (err) {
          throw new Error(`tus: cannot fetch \`file.uri\` as Blob, make sure the uri is correct and accessible. ${err}`);
        }
      }
      const fileSource = openFile(input, chunkSize);
      if (fileSource) return fileSource;
      throw new Error(`in this environment the source object may only be an instance of: ${supportedTypes.join(', ')}`);
    }
  }

  /**
   * Generate a fingerprint for a file which will be used the store the endpoint
   */
  function fingerprint(file, options) {
    if (isReactNativePlatform() && isReactNativeFile(file)) {
      return Promise.resolve(reactNativeFingerprint(file, options));
    }
    if (file instanceof Blob) {
      return Promise.resolve(
      //@ts-expect-error TODO: We have to check the input type here
      // This can be fixed by moving the fingerprint function to the FileReader class
      ['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
    }
    return Promise.resolve(null);
  }
  function reactNativeFingerprint(file, options) {
    const exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
    return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
  }
  function hashCode(str) {
    // from https://stackoverflow.com/a/8831937/151666
    let hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return hash;
  }

  let hasStorage = false;
  try {
    // Note: `window` is absent in a Web Worker and a Service Worker, and a bare
    // reference to it throws a ReferenceError rather than a DOMException, so it
    // would escape the catch below and take this module -- and with it the whole
    // browser entry point -- down on import. `typeof` covers both realms: it is
    // false where there is no storage, and still throws the SecurityError that a
    // sandboxed iframe raises from the getter.
    // The method check is for runtimes that define the global without a working
    // implementation behind it, such as Node without `--localstorage-file`.
    hasStorage = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
    if (hasStorage) {
      // Attempt to store and read entries from the local storage to detect Private
      // Mode on Safari on iOS (see #49)
      // If the key was not used before, we remove it from local storage again to
      // not cause confusion where the entry came from.
      const key = 'tusSupport';
      const originalValue = localStorage.getItem(key);
      localStorage.setItem(key, String(originalValue));
      if (originalValue == null) localStorage.removeItem(key);
    }
  } catch (e) {
    // If we try to access localStorage inside a sandboxed iframe, a SecurityError
    // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
    // thrown (see #49)
    // TODO: Replace `code` with `name`
    if (e instanceof DOMException && (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR)) {
      hasStorage = false;
    } else {
      throw e;
    }
  }
  const canStoreURLs = hasStorage;
  class WebStorageUrlStorage {
    _findAllUploads() {
      const results = this._findEntries('tus::');
      return Promise.resolve(results);
    }
    _findUploadsByFingerprint(fingerprint) {
      const results = this._findEntries(`tus::${fingerprint}::`);
      return Promise.resolve(results);
    }
    _removeUpload(urlStorageKey) {
      localStorage.removeItem(urlStorageKey);
      return Promise.resolve();
    }
    _addUpload(fingerprint, upload) {
      const id = Math.round(Math.random() * 1e12);
      const key = `tus::${fingerprint}::${id}`;
      localStorage.setItem(key, JSON.stringify(upload));
      return Promise.resolve(key);
    }
    _findEntries(prefix) {
      const results = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key == null) {
          throw new Error(`didn't find key for item ${i}`);
        }
        // Ignore entires that are not from tus-js-client
        if (key.indexOf(prefix) !== 0) continue;
        const item = localStorage.getItem(key);
        if (item == null) {
          throw new Error(`didn't find item for key ${key}`);
        }
        try {
          // TODO: Validate JSON
          const upload = JSON.parse(item);
          upload.urlStorageKey = key;
          results.push(upload);
        } catch (_e) {
          // The JSON parse error is intentionally ignored here, so a malformed
          // entry in the storage cannot prevent an upload.
        }
      }
      return results;
    }
  }

  var isStream_1;
  var hasRequiredIsStream;

  function requireIsStream () {
  	if (hasRequiredIsStream) return isStream_1;
  	hasRequiredIsStream = 1;

  	const isStream = stream =>
  		stream !== null &&
  		typeof stream === 'object' &&
  		typeof stream.pipe === 'function';

  	isStream.writable = stream =>
  		isStream(stream) &&
  		stream.writable !== false &&
  		typeof stream._write === 'function' &&
  		typeof stream._writableState === 'object';

  	isStream.readable = stream =>
  		isStream(stream) &&
  		stream.readable !== false &&
  		typeof stream._read === 'function' &&
  		typeof stream._readableState === 'object';

  	isStream.duplex = stream =>
  		isStream.writable(stream) &&
  		isStream.readable(stream);

  	isStream.transform = stream =>
  		isStream.duplex(stream) &&
  		typeof stream._transform === 'function';

  	isStream_1 = isStream;
  	return isStream_1;
  }

  var isStreamExports = requireIsStream();

  class XHRHttpStack {
    _createRequest(method, url) {
      return new XHRRequest(method, url);
    }
    _getName() {
      return 'XHRHttpStack';
    }
  }
  class XHRRequest {
    constructor(method, url) {
      this._xhr = new XMLHttpRequest();
      this._headers = {};
      this._xhr.open(method, url, true);
      this._method = method;
      this._url = url;
    }
    _getMethod() {
      return this._method;
    }
    _getURL() {
      return this._url;
    }
    _setHeader(header, value) {
      this._xhr.setRequestHeader(header, value);
      this._headers[header] = value;
    }
    _getHeader(header) {
      return this._headers[header];
    }
    _setProgressHandler(progressHandler) {
      // Test support for progress events before attaching an event listener
      if (!('upload' in this._xhr)) {
        return;
      }
      this._xhr.upload.onprogress = e => {
        if (!e.lengthComputable) {
          return;
        }
        progressHandler(e.loaded);
      };
    }
    _send(body) {
      if (isStreamExports.readable(body)) {
        throw new Error('Using a Node.js readable stream as HTTP request body is not supported using the XMLHttpRequest HTTP stack.');
      }
      return new Promise((resolve, reject) => {
        this._xhr.onload = () => {
          resolve(new XHRResponse(this._xhr));
        };
        this._xhr.onerror = err => {
          reject(err);
        };
        this._xhr.onabort = () => {
          reject(new DOMException('Request was aborted', 'AbortError'));
        };
        this._xhr.send(body);
      });
    }
    _abort() {
      // Note: Calling abort() triggers the `abort` event, but no `error` event.
      this._xhr.abort();
      return Promise.resolve();
    }
    _getUnderlyingObject() {
      return this._xhr;
    }
  }
  class XHRResponse {
    constructor(xhr) {
      this._xhr = xhr;
    }
    _getStatus() {
      return this._xhr.status;
    }
    _getHeader(header) {
      return this._xhr.getResponseHeader(header) || undefined;
    }
    _getBody() {
      return this._xhr.responseText;
    }
    _getUnderlyingObject() {
      return this._xhr;
    }
  }

  const defaultOptions = {
    ...defaultOptions$1,
    httpStack: new XHRHttpStack(),
    fileReader: new BrowserFileReader(),
    urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
    fingerprint
  };
  class Upload extends BaseUpload {
    constructor(file, options = {}) {
      const allOpts = {
        ...defaultOptions,
        ...options
      };
      super(file, allOpts);
    }
    static _terminate(url, options = {}) {
      const allOpts = {
        ...defaultOptions,
        ...options
      };
      return terminate(url, allOpts);
    }
  }

  const deleteUpload = async (url, csrfToken) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.addEventListener("load", () => {
      if (xhr.status === 204) {
        resolve();
      } else {
        reject(new Error("Delete failed"));
      }
    });
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.send(null);
  });

  class TusUpload extends BaseUpload$1 {
    onError;
    onProgress;
    onSuccess;
    _csrfToken;
    _id;
    _upload;
    constructor({
      chunkSize,
      csrfToken,
      fieldName,
      file,
      formId,
      retryDelays,
      uploadIndex,
      uploadUrl
    }) {
      super({
        name: file.name,
        status: "uploading",
        type: "tus",
        uploadIndex
      });
      this._csrfToken = csrfToken;
      this._upload = new Upload(file, {
        chunkSize,
        endpoint: uploadUrl,
        metadata: {
          fieldName: fieldName,
          filename: file.name,
          formId: formId
        },
        onAfterResponse: this._handleAfterResponse,
        onBeforeRequest: this._addCsrTokenToRequest,
        onError: this._handleError,
        onProgress: this._handleProgress,
        onSuccess: this._handleSuccess,
        retryDelays: retryDelays ?? [0, 1000, 3000, 5000]
      });
      this.onError = undefined;
      this.onProgress = undefined;
      this.onSuccess = undefined;
    }
    async abort() {
      await this._upload.abort(true);
    }
    async delete() {
      if (!this._upload.url) {
        return;
      }
      await deleteUpload(this._upload.url, this._csrfToken);
    }
    getId() {
      return this._id;
    }
    getInitialFile() {
      return {
        id: this._id,
        name: this.name,
        size: this.getSize(),
        type: "tus",
        url: ""
      };
    }
    getSize() {
      return this._upload.file.size;
    }
    start() {
      this._upload.start();
    }
    _addCsrTokenToRequest = request => {
      request.setHeader("X-CSRFToken", this._csrfToken);
    };
    _handleAfterResponse = (_request, response) => {
      const resourceId = response.getHeader("ResourceId");
      if (resourceId) {
        this._id = resourceId;
      }
    };
    _handleError = error => {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    };
    _handleProgress = (bytesSent, bytesTotal) => {
      if (this.onProgress) {
        this.onProgress(bytesSent, bytesTotal ?? 0);
      }
    };
    _handleSuccess = () => {
      if (this.onSuccess) {
        this.onSuccess();
      }
    };
  }

  class BaseUploadedFile extends BaseUpload$1 {
    size;
    constructor({
      name,
      size,
      type,
      uploadIndex
    }) {
      super({
        name,
        status: "done",
        type,
        uploadIndex
      });
      this.size = size;
    }
    abort() {
      return Promise.resolve();
    }
    delete() {
      return Promise.resolve();
    }
    getSize() {
      return this.size;
    }
  }
  class PlaceholderFile extends BaseUploadedFile {
    id;
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "placeholder",
        uploadIndex
      });
      this.id = initialFile.id;
    }
    getId() {
      return undefined;
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
  class ExistingFile extends BaseUploadedFile {
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "existing",
        uploadIndex
      });
    }
    getId() {
      return undefined;
    }
    getInitialFile() {
      return {
        name: this.name,
        size: this.size,
        type: "existing"
      };
    }
  }
  class UploadedS3File extends BaseUploadedFile {
    id;
    key;
    constructor(initialFile, uploadIndex) {
      super({
        name: initialFile.original_name || initialFile.name,
        size: initialFile.size,
        type: "uploadedS3",
        uploadIndex
      });
      this.id = initialFile.id;
      this.key = initialFile.name;
    }
    getId() {
      return this.id;
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
  class UploadedTusFile extends BaseUploadedFile {
    csrfToken;
    id;
    url;
    constructor({
      csrfToken,
      initialFile,
      uploadIndex,
      uploadUrl
    }) {
      super({
        name: initialFile.name,
        size: initialFile.size,
        type: "uploadedTus",
        uploadIndex
      });
      this.csrfToken = csrfToken;
      this.id = initialFile.id;
      this.url = `${uploadUrl}${initialFile.id}`;
    }
    async delete() {
      await deleteUpload(this.url, this.csrfToken);
    }
    getId() {
      return this.id;
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
  const createUploadedFile = ({
    _csrfToken: csrfToken,
    _initialFile: initialFile,
    _uploadIndex: uploadIndex,
    _uploadUrl: uploadUrl
  }) => {
    switch (initialFile.type) {
      case "existing":
        return new ExistingFile(initialFile, uploadIndex);
      case "placeholder":
        return new PlaceholderFile(initialFile, uploadIndex);
      case "s3":
        return new UploadedS3File(initialFile, uploadIndex);
      case "tus":
        return new UploadedTusFile({
          csrfToken,
          initialFile,
          uploadIndex,
          uploadUrl
        });
    }
  };

  class FileField {
    _acceptedFileTypes;
    _callbacks;
    _chunkSize;
    _csrfToken;
    _fieldName;
    _form;
    _formId;
    _multiple;
    _nextUploadIndex;
    _prefix;
    _renderer;
    _retryDelays;
    _s3UploadDir;
    _supportDropArea;
    _uploads;
    _uploadUrl;
    constructor({
      _callbacks: callbacks,
      _chunkSize: chunkSize,
      _csrfToken: csrfToken,
      _fieldName: fieldName,
      _form: form,
      _formId: formId,
      _initial: initial,
      _input: input,
      _multiple: multiple,
      _parent: parent,
      _prefix: prefix,
      _retryDelays: retryDelays,
      _s3UploadDir: s3UploadDir,
      _skipRequired: skipRequired,
      _supportDropArea: supportDropArea,
      _translations: translations,
      _uploadUrl: uploadUrl
    }) {
      this._callbacks = callbacks;
      this._chunkSize = chunkSize;
      this._csrfToken = csrfToken;
      this._fieldName = fieldName;
      this._form = form;
      this._formId = formId;
      this._multiple = multiple;
      this._prefix = prefix;
      this._retryDelays = retryDelays;
      this._s3UploadDir = s3UploadDir;
      this._supportDropArea = supportDropArea && !input.disabled;
      this._uploadUrl = uploadUrl;
      this._acceptedFileTypes = new AcceptedFileTypes(input.accept);
      this._uploads = [];
      this._nextUploadIndex = 0;
      this._renderer = new RenderUploadFile({
        _input: input,
        _parent: parent,
        _skipRequired: skipRequired,
        _translations: translations
      });
      const filesContainer = this._renderer._container;
      if (supportDropArea) {
        this._initDropArea(filesContainer, input.accept);
      }
      this._addInitialFiles(initial);
      this._checkDropHint();
      input.addEventListener("change", this._onChange);
      filesContainer.addEventListener("click", this._handleClick);
    }
    _addInitialFiles(initialFiles) {
      if (initialFiles.length === 0) {
        return;
      }
      const {
        multiple,
        renderer
      } = this;
      const addInitialFile = initialFile => {
        const {
          size
        } = initialFile;
        const name = initialFile.type === "s3" && initialFile.original_name ? initialFile.original_name : initialFile.name;
        const element = renderer._addUploadedFile(name, this._nextUploadIndex, size);
        const upload = createUploadedFile({
          _csrfToken: this._csrfToken,
          _initialFile: initialFile,
          _uploadIndex: this._nextUploadIndex,
          _uploadUrl: this._uploadUrl
        });
        this._uploads.push(upload);
        this._emitEvent("addUpload", element, upload);
      };
      if (multiple) {
        for (const file of initialFiles) {
          addInitialFile(file);
          this._nextUploadIndex += 1;
        }
      } else {
        const initialFile = initialFiles[0];
        if (initialFile) {
          addInitialFile(initialFile);
        }
      }
    }
    _checkDropHint() {
      if (!this._supportDropArea) {
        return;
      }
      const nonEmptyUploads = this._uploads.filter(e => Boolean(e));
      if (nonEmptyUploads.length === 0) {
        this._renderer._renderDropHint();
      } else {
        this._renderer._removeDropHint();
      }
    }
    _emitEvent(eventName, element, upload) {
      const detail = {
        element,
        fieldName: this._fieldName,
        fileName: upload.name,
        metaDataField: this._getMetaDataField(),
        upload
      };
      this._form.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        detail
      }));
    }
    _findUploadByName(fileName) {
      return this._uploads.find(upload => upload.name === fileName);
    }
    _getMetaDataField() {
      return findInput(this._form, getMetadataFieldName(this._fieldName, this._prefix), this._prefix);
    }
    _getUploadByIndex(uploadIndex) {
      return this._uploads.find(upload => upload.uploadIndex === uploadIndex);
    }
    async _handleCancel(upload) {
      this._renderer._disableCancel(upload.uploadIndex);
      await upload.abort();
      this._removeUploadFromList(upload);
    }
    _handleClick = e => {
      const target = e.target;
      const getUpload = () => {
        const dataIndex = target.dataset.index;
        if (!dataIndex) {
          return undefined;
        }
        const uploadIndex = parseInt(dataIndex, 10);
        return this._getUploadByIndex(uploadIndex);
      };
      if (target.classList.contains("dff-delete") && !target.classList.contains("dff-disabled")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload) {
          void this._removeExistingUpload(upload);
        }
      } else if (target.classList.contains("dff-cancel")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload) {
          void this._handleCancel(upload);
        }
      } else if (target.classList.contains("dff-filename")) {
        e.preventDefault();
        const upload = getUpload();
        if (upload?.status === "done" && this._callbacks.onClick) {
          this._callbacks.onClick({
            fieldName: this._fieldName,
            fileName: upload.name,
            id: upload.getId(),
            type: upload.type
          });
        }
      }
    };
    _handleError = (upload, error) => {
      this._renderer._setError(upload.uploadIndex);
      upload.status = "error";
      const {
        onError
      } = this._callbacks;
      if (onError) {
        if (upload instanceof TusUpload) {
          onError(error, upload);
        }
      }
    };
    _handleInvalidFiles = files => {
      this._renderer._setErrorInvalidFiles(files);
    };
    _handleProgress = (upload, bytesUploaded, bytesTotal) => {
      const percentage = bytesTotal === 0 ? "0" : (bytesUploaded / bytesTotal * 100).toFixed(2);
      this._renderer._updateProgress(upload.uploadIndex, percentage);
      const {
        onProgress
      } = this._callbacks;
      if (onProgress) {
        if (upload instanceof TusUpload) {
          onProgress(bytesUploaded, bytesTotal, upload);
        }
      }
    };
    _handleSuccess = upload => {
      const {
        renderer
      } = this;
      this._updatePlaceholderInput();
      renderer._clearInput();
      renderer._setSuccess(upload.uploadIndex, upload.getSize());
      upload.status = "done";
      const {
        onSuccess
      } = this._callbacks;
      const element = this._renderer._findFileDiv(upload.uploadIndex);
      if (element) {
        this._emitEvent("uploadComplete", element, upload);
      }
      if (onSuccess && upload.type === "tus") {
        onSuccess(upload);
      }
    };
    _initDropArea(container, inputAccept) {
      new DropArea({
        _container: container,
        _inputAccept: inputAccept,
        _onUploadFiles: this._uploadFiles,
        _renderer: this._renderer
      });
    }
    _onChange = e => {
      const files = e.target.files ?? [];
      const acceptedFiles = [];
      const invalidFiles = [];
      for (const file of files) {
        if (this._acceptedFileTypes._isAccepted(file)) {
          acceptedFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      }
      this._handleInvalidFiles([...invalidFiles]);
      void this._uploadFiles([...acceptedFiles]);
      this._renderer._clearInput();
    };
    async _removeExistingUpload(upload) {
      const element = this._renderer._findFileDiv(upload.uploadIndex);
      if (element) {
        this._emitEvent("removeUpload", element, upload);
      }
      if (upload.status === "uploading") {
        this._renderer._disableCancel(upload.uploadIndex);
        await upload.abort();
      } else if (upload.status === "done") {
        this._renderer._disableDelete(upload.uploadIndex);
        try {
          await upload.delete();
        } catch {
          this._renderer._setDeleteFailed(upload.uploadIndex);
          return;
        }
      }
      this._removeUploadFromList(upload);
      this._updatePlaceholderInput();
    }
    _removeUploadFromList(upload) {
      this._renderer._deleteFile(upload.uploadIndex);
      const index = this._uploads.indexOf(upload);
      if (index >= 0) {
        this._uploads.splice(index, 1);
      }
      this._checkDropHint();
      const {
        onDelete
      } = this._callbacks;
      if (onDelete) {
        onDelete(upload);
      }
    }
    _updatePlaceholderInput() {
      const input = findInput(this._form, getUploadsFieldName(this._fieldName, this._prefix), this._prefix);
      if (!input) {
        return;
      }
      const placeholdersInfo = this._uploads.map(upload => upload.getInitialFile());
      input.value = JSON.stringify(placeholdersInfo);
    }
    async _uploadFile(file) {
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
            chunkSize: this._chunkSize,
            csrfToken: this._csrfToken,
            fieldName,
            file,
            formId,
            retryDelays: this._retryDelays,
            uploadIndex: newUploadIndex,
            uploadUrl
          });
        }
      };
      const {
        fieldName,
        formId,
        renderer,
        uploadUrl
      } = this;
      const fileName = file.name;
      const existingUpload = this._findUploadByName(fileName);
      const newUploadIndex = existingUpload ? existingUpload.uploadIndex : this._nextUploadIndex;
      if (!existingUpload) {
        this._nextUploadIndex += 1;
      }
      if (existingUpload) {
        await this._removeExistingUpload(existingUpload);
      }
      const upload = createUpload();
      upload.onError = error => {
        this._handleError(upload, error);
      };
      upload.onProgress = (bytesUploaded, bytesTotal) => {
        this._handleProgress(upload, bytesUploaded, bytesTotal);
      };
      upload.onSuccess = () => {
        this._handleSuccess(upload);
      };
      upload.start();
      this._uploads.push(upload);
      const element = renderer._addNewUpload(fileName, newUploadIndex);
      this._emitEvent("addUpload", element, upload);
    }
    _uploadFiles = async files => {
      if (files.length === 0) {
        return;
      }
      if (!this._multiple) {
        for (const upload of this._uploads) {
          this._renderer._deleteFile(upload.uploadIndex);
        }
        this._uploads = [];
        const file = files[0];
        if (file) {
          await this._uploadFile(file);
        }
      } else {
        for (const file of files) {
          await this._uploadFile(file);
        }
      }
      this._checkDropHint();
    };
  }

  const initUploadFields = (form, options = {}) => {
    const matchesPrefix = fieldName => {
      if (!options.prefix) {
        return true;
      }
      return fieldName.startsWith(`${options.prefix}-`);
    };
    const getPrefix = () => options.prefix ?? null;
    const getInputValue = fieldName => getInputValueForFormAndPrefix(form, fieldName, getPrefix());
    const getInitialFiles = fieldName => {
      const data = getInputValue(getUploadsFieldName(fieldName, getPrefix()));
      if (!data) {
        return [];
      }
      return JSON.parse(data).filter(file => file.type);
    };
    const uploadUrl = getInputValue("upload_url");
    const formId = getInputValue("form_id");
    const s3UploadDir = getInputValue("s3_upload_dir");
    const skipRequired = options.skipRequired ?? false;
    const prefix = getPrefix();
    const csrfToken = findInput(form, "csrfmiddlewaretoken", null)?.value;
    if (!csrfToken) {
      throw new Error("Csrf token not found");
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
      const dataTranslations = container.dataset.translations;
      const translations = dataTranslations ? JSON.parse(dataTranslations) : {};
      const supportDropArea = !(options.supportDropArea === false);
      new FileField({
        _callbacks: options.callbacks ?? {},
        _chunkSize: options.chunkSize ?? 2621440,
        _csrfToken: csrfToken,
        _fieldName: fieldName,
        _form: form,
        _formId: formId,
        _initial: initial,
        _input: input,
        _multiple: multiple,
        _parent: container,
        _prefix: prefix,
        _retryDelays: options.retryDelays ?? null,
        _s3UploadDir: s3UploadDir ?? null,
        _skipRequired: skipRequired,
        _supportDropArea: supportDropArea,
        _translations: translations,
        _uploadUrl: uploadUrl
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
    const prefix = options.prefix ?? "form";
    const totalFormsValue = getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix);
    if (!totalFormsValue) {
      return;
    }
    const formCount = parseInt(totalFormsValue, 10);
    for (let i = 0; i < formCount; i += 1) {
      const subFormPrefix = getInputNameWithPrefix(i.toString(), null);
      initUploadFields(form, {
        ...options,
        prefix: `${prefix}-${subFormPrefix}`
      });
    }
  };

  window.autoInitFileForms = autoInitFileForms;
  window.initFormSet = initFormSet;
  window.initUploadFields = initUploadFields;

})();
//# sourceMappingURL=file_form.js.map
