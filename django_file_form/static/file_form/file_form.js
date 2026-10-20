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

  let nextId = 0;
  const createId = prefix => {
    nextId += 1;
    return `${prefix}-${nextId.toString()}`;
  };
  class RenderUploadFile {
    _container;
    _clickableFilenames;
    _errors;
    _input;
    // Whether this code set aria-invalid on the input, and not the server
    _isInvalidSetHere = false;
    _status;
    _translations;
    constructor({
      _clickableFilenames: clickableFilenames = false,
      _input: input,
      _parent: parent,
      _skipRequired: skipRequired,
      _translations: translations
    }) {
      this._clickableFilenames = clickableFilenames;
      this._container = this._createFilesContainer(parent);
      this._labelFilesContainer(input);
      this._errors = this._createErrorContainer(parent);
      this._describeInputWithErrors(input);
      this._status = this._createStatusContainer(parent);
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
      progressSpan.setAttribute("role", "progressbar");
      progressSpan.setAttribute("aria-label", this._formatTranslation("Upload progress for {filename}", filename));
      progressSpan.setAttribute("aria-valuemin", "0");
      progressSpan.setAttribute("aria-valuemax", "100");
      progressSpan.setAttribute("aria-valuenow", "0");
      const innerSpan = document.createElement("span");
      innerSpan.className = "dff-progress-inner";
      progressSpan.append(innerSpan);
      div.append(progressSpan);
      div.append(this._createButton("dff-cancel", this._getTranslation("Cancel"), uploadIndex));
      return div;
    }
    _addUploadedFile(filename, uploadIndex, filesize) {
      const element = this._addFile(filename, uploadIndex);
      this._setSuccess(uploadIndex, filesize);
      return element;
    }

    // Tells screen reader users what happened to a file: the status element is a
    // live region, which is read out when its text changes.
    _announce(key, filename) {
      this._status.replaceChildren(document.createTextNode(this._formatTranslation(key, filename)));
    }
    _clearInput() {
      this._input.value = "";
    }

    // With moveFocus, the focus goes to the next file, the previous file or the
    // input, instead of being lost when the element that has it is removed.
    _deleteFile(index, moveFocus = false) {
      const div = this._findFileDiv(index);
      if (!div) {
        return;
      }
      const focusTarget = moveFocus && this._mayMoveFocus(div) ? this._findFocusTarget(div) : null;
      div.remove();
      focusTarget?.focus();
    }
    _disableCancel(index) {
      const cancelButton = this._findCancelButton(index);
      if (cancelButton) {
        this._setButtonDisabled(cancelButton, true);
      }
    }
    _disableDelete(index) {
      const deleteButton = this._findDeleteButton(index);
      if (deleteButton) {
        this._setButtonDisabled(deleteButton, true);
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
      // Dropping only works with a mouse, and the files container is a list,
      // which may only contain list items
      dropHint.setAttribute("aria-hidden", "true");
      this._setTextContent(dropHint, this._getTranslation("Drop your files here"));
      this._container.append(dropHint);
    }
    _setDeleteFailed(index, moveFocus = false) {
      this._setErrorMessage(index, this._getTranslation("Delete failed"));
      this._enableDelete(index);
      const div = this._findFileDiv(index);

      // Disabling the delete button may have taken the focus away from it
      if (moveFocus && div && this._mayMoveFocus(div)) {
        this._findDeleteButton(index)?.focus();
      }
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
      this._clearInput();
      if (files.length === 0) {
        this._errors.replaceChildren();
        this._setInputInvalid(false);
        return;
      }
      const errorsMessages = document.createElement("ul");
      for (const file of files) {
        const msg = document.createElement("li");
        const invalidFileTypeMessage = this._getTranslation("Invalid file type");
        this._setTextContent(msg, `${file.name}: ${invalidFileTypeMessage}`);
        msg.className = "dff-error";
        errorsMessages.append(msg);
      }
      this._errors.replaceChildren(errorsMessages);
      this._setInputInvalid(true);
    }
    _setSuccess(index, size) {
      const el = this._findFileDiv(index);
      if (el) {
        el.classList.add("dff-upload-success");
        if (this._clickableFilenames) {
          this._makeFilenameClickable(el, index);
        }
        if (size != null) {
          const fileSizeInfo = document.createElement("span");
          this._setTextContent(fileSizeInfo, formatBytes(size, 2));
          fileSizeInfo.className = "dff-filesize";
          el.append(fileSizeInfo);
        }
        el.append(this._createButton("dff-delete", this._getTranslation("Delete"), index));
      }
      this._removeProgress(index);
      this._removeCancel(index);
    }
    _updateProgress(index, percentage) {
      const el = this._container.querySelector(`.dff-file-id-${index.toString()}`);
      const progressSpan = el?.querySelector(".dff-progress");
      if (!progressSpan) {
        return;
      }
      progressSpan.setAttribute("aria-valuenow", percentage);
      const innerProgressSpan = progressSpan.querySelector(".dff-progress-inner");
      if (innerProgressSpan) {
        innerProgressSpan.style.width = `${percentage}%`;
      }
    }
    _addFile(filename, uploadIndex) {
      const div = document.createElement("div");
      div.className = `dff-file dff-file-id-${uploadIndex.toString()}`;
      div.setAttribute("role", "listitem");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = filename;
      nameSpan.className = "dff-filename";
      nameSpan.dataset.index = uploadIndex.toString();
      div.append(nameSpan);
      this._container.append(div);
      this._input.required = false;
      return div;
    }
    _createButton(className, text, uploadIndex) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.index = uploadIndex.toString();
      this._setTextContent(button, text);
      return button;
    }
    _createErrorContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-invalid-files";
      div.setAttribute("role", "alert");
      parent.append(div);
      return div;
    };
    _createFilesContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-files";
      div.setAttribute("role", "list");
      parent.append(div);
      return div;
    };
    _createStatusContainer = parent => {
      const div = document.createElement("div");
      div.className = "dff-status";
      div.setAttribute("role", "status");
      parent.append(div);
      return div;
    };

    // A screen reader reads the errors when the input has the focus. Django may
    // have set aria-describedby already, for the help text.
    _describeInputWithErrors(input) {
      this._errors.id = createId("dff-errors");
      const describedBy = input.getAttribute("aria-describedby");
      input.setAttribute("aria-describedby", describedBy ? `${describedBy} ${this._errors.id}` : this._errors.id);
    }
    _enableDelete(index) {
      const deleteButton = this._findDeleteButton(index);
      if (deleteButton) {
        this._setButtonDisabled(deleteButton, false);
      }
    }
    _findCancelButton(index) {
      const el = this._findFileDiv(index);
      if (!el) {
        return null;
      }
      return el.querySelector(".dff-cancel");
    }
    _findDeleteButton(index) {
      const div = this._findFileDiv(index);
      if (!div) {
        return div;
      }
      return div.querySelector(".dff-delete");
    }

    // The delete or cancel button of the next file, or else of the previous file,
    // or else the input. Landing on the same kind of button makes it easy to
    // remove several files in a row.
    _findFocusTarget(div) {
      const siblings = Array.from(this._container.querySelectorAll(".dff-file"));
      const index = siblings.indexOf(div);
      const candidates = [...siblings.slice(index + 1), ...siblings.slice(0, index).reverse()];
      for (const candidate of candidates) {
        const button = candidate.querySelector(".dff-delete:enabled, .dff-cancel:enabled") ?? candidate.querySelector("button:enabled");
        if (button) {
          return button;
        }
      }
      return this._input;
    }
    _formatTranslation(key, filename) {
      // A replacer function, so that "$&" in the filename is not a pattern
      return this._getTranslation(key).replace("{filename}", () => filename);
    }
    _getTranslation(key) {
      return this._translations[key] ?? key;
    }

    // Names the list of files after the label of the field, so that the lists
    // of several fields can be told apart. A label that wraps the input is
    // skipped: its name would include the text of the input itself.
    _labelFilesContainer(input) {
      const label = input.labels?.[0];
      if (!label || label.contains(input)) {
        return;
      }
      if (!label.id) {
        label.id = createId("dff-label");
      }
      this._container.setAttribute("aria-labelledby", label.id);
    }

    // A filename that can be clicked is a button, so that it can be reached and
    // pressed with the keyboard
    _makeFilenameClickable(el, index) {
      const nameSpan = el.querySelector("span.dff-filename");
      if (nameSpan) {
        nameSpan.replaceWith(this._createButton("dff-filename", nameSpan.textContent, index));
      }
    }

    // Only when the focus is still in the file, or was lost because a button in
    // it was disabled: the focus is not taken away from somewhere else.
    _mayMoveFocus(div) {
      const active = document.activeElement;
      return active == null || active === document.body || div.contains(active);
    }
    _removeCancel(index) {
      const cancelButton = this._findCancelButton(index);
      if (cancelButton) {
        cancelButton.remove();
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
    _setButtonDisabled(button, disabled) {
      button.disabled = disabled;
      // Keep the class for existing stylesheets
      button.classList.toggle("dff-disabled", disabled);
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

    // Django sets aria-invalid when the server rejected the field; that is left
    // alone
    _setInputInvalid(invalid) {
      if (invalid) {
        if (this._input.getAttribute("aria-invalid") !== "true") {
          this._input.setAttribute("aria-invalid", "true");
          this._isInvalidSetHere = true;
        }
      } else if (this._isInvalidSetHere) {
        this._input.removeAttribute("aria-invalid");
        this._isInvalidSetHere = false;
      }
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
    const uploadIdEnc = encodeURIComponent(uploadId);
    const headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    const url = urlJoin(endpoint, uploadIdEnc, number.toString(), `?key=${filename}`);
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

  function _typeof$8(o) {
    "@babel/helpers - typeof";

    return _typeof$8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$8(o);
  }
  function _createClass$8(Constructor, protoProps, staticProps) {
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
  function _callSuper$1(t, o, e) {
    return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e));
  }
  function _possibleConstructorReturn$1(self, call) {
    if (call && (_typeof$8(call) === "object" || typeof call === "function")) {
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
  function _construct(t, e, r) {
    if (_isNativeReflectConstruct$1()) return Reflect.construct.apply(null, arguments);
    var o = [null];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && _setPrototypeOf$1(p, r.prototype), p;
  }
  function _isNativeReflectConstruct$1() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (t) {}
    return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() {
      return !!t;
    })();
  }
  function _isNativeFunction(fn) {
    try {
      return Function.toString.call(fn).indexOf("[native code]") !== -1;
    } catch (e) {
      return typeof fn === "function";
    }
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
    function DetailedError(message) {
      var _this;
      var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      _classCallCheck$8(this, DetailedError);
      _this = _callSuper$1(this, DetailedError, [message]);
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
    _inherits$1(DetailedError, _Error);
    return _createClass$8(DetailedError);
  }(/*#__PURE__*/_wrapNativeSuper(Error));

  function log(msg) {
    return;
  }

  function _typeof$7(o) {
    "@babel/helpers - typeof";

    return _typeof$7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$7(o);
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
      Object.defineProperty(target, _toPropertyKey$7(descriptor.key), descriptor);
    }
  }
  function _createClass$7(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$7(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$7(t) {
    var i = _toPrimitive$7(t, "string");
    return "symbol" == _typeof$7(i) ? i : i + "";
  }
  function _toPrimitive$7(t, r) {
    if ("object" != _typeof$7(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$7(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var NoopUrlStorage = /*#__PURE__*/function () {
    function NoopUrlStorage() {
      _classCallCheck$7(this, NoopUrlStorage);
    }
    return _createClass$7(NoopUrlStorage, [{
      key: "listAllUploads",
      value: function listAllUploads() {
        return Promise.resolve([]);
      }
    }, {
      key: "findUploadsByFingerprint",
      value: function findUploadsByFingerprint(_fingerprint) {
        return Promise.resolve([]);
      }
    }, {
      key: "removeUpload",
      value: function removeUpload(_urlStorageKey) {
        return Promise.resolve();
      }
    }, {
      key: "addUpload",
      value: function addUpload(_fingerprint, _upload) {
        return Promise.resolve(null);
      }
    }]);
  }();

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
  const version = '3.9.4';
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function _regeneratorRuntime$1() {

    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
    _regeneratorRuntime$1 = function _regeneratorRuntime() {
      return e;
    };
    var t,
      e = {},
      r = Object.prototype,
      n = r.hasOwnProperty,
      o = Object.defineProperty || function (t, e, r) {
        t[e] = r.value;
      },
      i = "function" == typeof Symbol ? Symbol : {},
      a = i.iterator || "@@iterator",
      c = i.asyncIterator || "@@asyncIterator",
      u = i.toStringTag || "@@toStringTag";
    function define(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true
      }), t[e];
    }
    try {
      define({}, "");
    } catch (t) {
      define = function define(t, e, r) {
        return t[e] = r;
      };
    }
    function wrap(t, e, r, n) {
      var i = e && e.prototype instanceof Generator ? e : Generator,
        a = Object.create(i.prototype),
        c = new Context(n || []);
      return o(a, "_invoke", {
        value: makeInvokeMethod(t, r, c)
      }), a;
    }
    function tryCatch(t, e, r) {
      try {
        return {
          type: "normal",
          arg: t.call(e, r)
        };
      } catch (t) {
        return {
          type: "throw",
          arg: t
        };
      }
    }
    e.wrap = wrap;
    var h = "suspendedStart",
      l = "suspendedYield",
      f = "executing",
      s = "completed",
      y = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var p = {};
    define(p, a, function () {
      return this;
    });
    var d = Object.getPrototypeOf,
      v = d && d(d(values([])));
    v && v !== r && n.call(v, a) && (p = v);
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
      ["next", "throw", "return"].forEach(function (e) {
        define(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function AsyncIterator(t, e) {
      function invoke(r, o, i, a) {
        var c = tryCatch(t[r], t, o);
        if ("throw" !== c.type) {
          var u = c.arg,
            h = u.value;
          return h && "object" == _typeof$6(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          }) : e.resolve(h).then(function (t) {
            u.value = t, i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
        a(c.arg);
      }
      var r;
      o(this, "_invoke", {
        value: function value(t, n) {
          function callInvokeWithMethodAndArg() {
            return new e(function (e, r) {
              invoke(t, n, e, r);
            });
          }
          return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(e, r, n) {
      var o = h;
      return function (i, a) {
        if (o === f) throw Error("Generator is already running");
        if (o === s) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: true
          };
        }
        for (n.method = i, n.arg = a;;) {
          var c = n.delegate;
          if (c) {
            var u = maybeInvokeDelegate(c, n);
            if (u) {
              if (u === y) continue;
              return u;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (o === h) throw o = s, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = f;
          var p = tryCatch(e, r, n);
          if ("normal" === p.type) {
            if (o = n.done ? s : l, p.arg === y) continue;
            return {
              value: p.arg,
              done: n.done
            };
          }
          "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
        }
      };
    }
    function maybeInvokeDelegate(e, r) {
      var n = r.method,
        o = e.iterator[n];
      if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
      var i = tryCatch(o, e.iterator, r.arg);
      if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
      var a = i.arg;
      return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
    }
    function pushTryEntry(t) {
      var e = {
        tryLoc: t[0]
      };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function resetTryEntry(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function Context(t) {
      this.tryEntries = [{
        tryLoc: "root"
      }], t.forEach(pushTryEntry, this), this.reset(true);
    }
    function values(e) {
      if (e || "" === e) {
        var r = e[a];
        if (r) return r.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) {
          var o = -1,
            i = function next() {
              for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next;
              return next.value = t, next.done = true, next;
            };
          return i.next = i;
        }
      }
      throw new TypeError(_typeof$6(e) + " is not iterable");
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: true
    }), o(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: true
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
      var e = "function" == typeof t && t.constructor;
      return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
    }, e.mark = function (t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
    }, e.awrap = function (t) {
      return {
        __await: t
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
      return this;
    }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
      void 0 === i && (i = Promise);
      var a = new AsyncIterator(wrap(t, r, n, o), i);
      return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
        return t.done ? t.value : a.next();
      });
    }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
      return this;
    }), define(g, "toString", function () {
      return "[object Generator]";
    }), e.keys = function (t) {
      var e = Object(t),
        r = [];
      for (var n in e) r.push(n);
      return r.reverse(), function next() {
        for (; r.length;) {
          var t = r.pop();
          if (t in e) return next.value = t, next.done = false, next;
        }
        return next.done = true, next;
      };
    }, e.values = values, Context.prototype = {
      constructor: Context,
      reset: function reset(e) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
      },
      stop: function stop() {
        this.done = true;
        var t = this.tryEntries[0].completion;
        if ("throw" === t.type) throw t.arg;
        return this.rval;
      },
      dispatchException: function dispatchException(e) {
        if (this.done) throw e;
        var r = this;
        function handle(n, o) {
          return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
        }
        for (var o = this.tryEntries.length - 1; o >= 0; --o) {
          var i = this.tryEntries[o],
            a = i.completion;
          if ("root" === i.tryLoc) return handle("end");
          if (i.tryLoc <= this.prev) {
            var c = n.call(i, "catchLoc"),
              u = n.call(i, "finallyLoc");
            if (c && u) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            } else if (c) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
            } else {
              if (!u) throw Error("try statement without catch or finally");
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            }
          }
        }
      },
      abrupt: function abrupt(t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var o = this.tryEntries[r];
          if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
            var i = o;
            break;
          }
        }
        i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
        var a = i ? i.completion : {};
        return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
      },
      complete: function complete(t, e) {
        if ("throw" === t.type) throw t.arg;
        return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
      },
      finish: function finish(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
        }
      },
      "catch": function _catch(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var n = r.completion;
            if ("throw" === n.type) {
              var o = n.arg;
              resetTryEntry(r);
            }
            return o;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function delegateYield(e, r, n) {
        return this.delegate = {
          iterator: values(e),
          resultName: r,
          nextLoc: n
        }, "next" === this.method && (this.arg = t), y;
      }
    }, e;
  }
  function asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator$1(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = true,
        o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = true, n = r;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _typeof$6(o) {
    "@babel/helpers - typeof";

    return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$6(o);
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F = function F() {};
        return {
          s: F,
          n: function n() {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function e(_e) {
            throw _e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function s() {
        it = it.call(o);
      },
      n: function n() {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function e(_e2) {
        didErr = true;
        err = _e2;
      },
      f: function f() {
        try {
          if (!normalCompletion && it["return"] != null) it["return"]();
        } finally {
          if (didErr) throw err;
        }
      }
    };
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function ownKeys$1(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) {
        _defineProperty$1(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _defineProperty$1(obj, key, value) {
    key = _toPropertyKey$6(key);
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
      Object.defineProperty(target, _toPropertyKey$6(descriptor.key), descriptor);
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
  function _toPropertyKey$6(t) {
    var i = _toPrimitive$6(t, "string");
    return "symbol" == _typeof$6(i) ? i : i + "";
  }
  function _toPrimitive$6(t, r) {
    if ("object" != _typeof$6(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$6(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var PROTOCOL_TUS_V1 = 'tus-v1';
  var PROTOCOL_IETF_DRAFT_03 = 'ietf-draft-03';
  var PROTOCOL_IETF_DRAFT_05 = 'ietf-draft-05';
  var defaultOptions$1 = {
    endpoint: null,
    uploadUrl: null,
    metadata: {},
    metadataForPartialUploads: {},
    fingerprint: null,
    uploadSize: null,
    onProgress: null,
    onChunkComplete: null,
    onSuccess: null,
    onError: null,
    onUploadUrlAvailable: null,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    onBeforeRequest: null,
    onAfterResponse: null,
    onShouldRetry: defaultOnShouldRetry,
    chunkSize: Number.POSITIVE_INFINITY,
    retryDelays: [0, 1000, 3000, 5000],
    parallelUploads: 1,
    parallelUploadBoundaries: null,
    storeFingerprintForResuming: true,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
    urlStorage: null,
    fileReader: null,
    httpStack: null,
    protocol: PROTOCOL_TUS_V1
  };
  var BaseUpload = /*#__PURE__*/function () {
    function BaseUpload(file, options) {
      _classCallCheck$6(this, BaseUpload);
      // Warn about removed options from previous versions
      if ('resume' in options) {
        console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.');
      }

      // The default options will already be added from the wrapper classes.
      this.options = options;

      // Cast chunkSize to integer
      this.options.chunkSize = Number(this.options.chunkSize);

      // The storage module used to store URLs
      this._urlStorage = this.options.urlStorage;

      // The underlying File/Blob object
      this.file = file;

      // The URL against which the file will be uploaded
      this.url = null;

      // The underlying request object for the current PATCH request
      this._req = null;

      // The fingerpinrt for the current file (set after start())
      this._fingerprint = null;

      // The key that the URL storage returned when saving an URL with a fingerprint,
      this._urlStorageKey = null;

      // The offset used in the current PATCH request
      this._offset = null;

      // True if the current PATCH request has been aborted
      this._aborted = false;

      // The file's size in bytes
      this._size = null;

      // The Source object which will wrap around the given file and provides us
      // with a unified interface for getting its size and slice chunks from its
      // content allowing us to easily handle Files, Blobs, Buffers and Streams.
      this._source = null;

      // The current count of attempts which have been made. Zero indicates none.
      this._retryAttempt = 0;

      // The timeout's ID which is used to delay the next retry
      this._retryTimeout = null;

      // The offset of the remote upload before the latest attempt was started.
      this._offsetBeforeRetry = 0;

      // An array of BaseUpload instances which are used for uploading the different
      // parts, if the parallelUploads option is used.
      this._parallelUploads = null;

      // An array of upload URLs which are used for uploading the different
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
    return _createClass$6(BaseUpload, [{
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
        if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
          this._emitError(new Error("tus: unsupported protocol ".concat(this.options.protocol)));
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
          _this2._source = source;

          // First, we look at the uploadLengthDeferred option.
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
          }

          // If the upload was configured to use multiple requests or if we resume from
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
        var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;

        // The input file will be split into multiple slices which are uploaded in separate
        // requests. Here we get the start and end position for the slices.
        var parts = (_this$options$paralle = this.options.parallelUploadBoundaries) !== null && _this$options$paralle !== void 0 ? _this$options$paralle : splitSizeIntoParts(this._source.size, partCount);

        // Attach URLs from previous uploads, if available.
        if (this._parallelUploadUrls) {
          parts.forEach(function (part, index) {
            part.uploadUrl = _this3._parallelUploadUrls[index] || null;
          });
        }

        // Create an empty list for storing the upload URLs
        this._parallelUploadUrls = new Array(parts.length);

        // Generate a promise for each slice that will be resolve if the respective
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
                metadata: _this3.options.metadataForPartialUploads,
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
                onUploadUrlAvailable: function onUploadUrlAvailable() {
                  _this3._parallelUploadUrls[index] = upload.url;
                  // Test if all uploads have received an URL
                  if (_this3._parallelUploadUrls.filter(function (u) {
                    return Boolean(u);
                  }).length === parts.length) {
                    _this3._saveUploadInUrlStorage();
                  }
                }
              });
              var upload = new BaseUpload(value, options);
              upload.start();

              // Store the upload in an array, so we can later abort them if necessary.
              _this3._parallelUploads.push(upload);
            });
          });
        });
        var req;
        // Wait until all partial uploads are finished and we can send the POST request for
        // creating the final upload.
        Promise.all(uploads).then(function () {
          req = _this3._openRequest('POST', _this3.options.endpoint);
          req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' ')));

          // Add metadata if values have been added
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
          _this3._emitSuccess(res);
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
        this._aborted = false;

        // The upload had been started previously and we should reuse this URL.
        if (this.url != null) {
          log("Resuming upload from previous URL: ".concat(this.url));
          this._resumeUpload();
          return;
        }

        // A URL has manually been specified, so we try to resume
        if (this.options.uploadUrl != null) {
          log("Resuming upload from provided URL: ".concat(this.options.uploadUrl));
          this.url = this.options.uploadUrl;
          this._resumeUpload();
          return;
        }
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
          var _iterator = _createForOfIteratorHelper(this._parallelUploads),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var upload = _step.value;
              upload.abort(shouldTerminate);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }

        // Stop any current running request.
        if (this._req !== null) {
          this._req.abort();
          // Note: We do not close the file source here, so the user can resume in the future.
        }
        this._aborted = true;

        // Stop any timeout used for initiating a retry.
        if (this._retryTimeout != null) {
          clearTimeout(this._retryTimeout);
          this._retryTimeout = null;
        }
        if (!shouldTerminate || this.url == null) {
          return Promise.resolve();
        }
        return BaseUpload.terminate(this.url, this.options)
        // Remove entry from the URL storage since the upload URL is no longer valid.
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
        if (this._aborted) return;

        // Check if we should retry, when enabled, before sending the error to the user.
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
       * @param {object} lastResponse Last HTTP response.
       * @api private
       */
    }, {
      key: "_emitSuccess",
      value: function _emitSuccess(lastResponse) {
        if (this.options.removeFingerprintOnSuccess) {
          // Remove stored fingerprint and corresponding endpoint. This causes
          // new uploads of the same file to be treated as a different file.
          this._removeFromUrlStorage();
        }
        if (typeof this.options.onSuccess === 'function') {
          this.options.onSuccess({
            lastResponse: lastResponse
          });
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
          req.setHeader('Upload-Defer-Length', '1');
        } else {
          req.setHeader('Upload-Length', "".concat(this._size));
        }

        // Add metadata if values have been added
        var metadata = encodeMetadata(this.options.metadata);
        if (metadata !== '') {
          req.setHeader('Upload-Metadata', metadata);
        }
        var promise;
        if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
          this._offset = 0;
          promise = this._addChunkToRequest(req);
        } else {
          if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
            req.setHeader('Upload-Complete', '?0');
          }
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
          if (typeof _this6.options.onUploadUrlAvailable === 'function') {
            _this6.options.onUploadUrlAvailable();
          }
          if (_this6._size === 0) {
            // Nothing to upload and file was successfully created
            _this6._emitSuccess(res);
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
            }

            // Try to create a new upload
            _this7.url = null;
            _this7._createUpload();
            return;
          }
          var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
          if (Number.isNaN(offset)) {
            _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');
            return;
          }
          var length = Number.parseInt(res.getHeader('Upload-Length'), 10);
          if (Number.isNaN(length) && !_this7.options.uploadLengthDeferred && _this7.options.protocol === PROTOCOL_TUS_V1) {
            _this7._emitHttpError(req, res, 'tus: invalid or missing length value');
            return;
          }
          if (typeof _this7.options.onUploadUrlAvailable === 'function') {
            _this7.options.onUploadUrlAvailable();
          }
          _this7._saveUploadInUrlStorage().then(function () {
            // Upload has already been completed and we do not need to send additional
            // data to the server
            if (offset === length) {
              _this7._emitProgress(length, length);
              _this7._emitSuccess(res);
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
        var req;

        // Some browser and servers may not support the PATCH method. For those
        // cases, you can tell tus-js-client to use a POST request with the
        // X-HTTP-Method-Override header for simulating a PATCH request.
        if (this.options.overridePatchMethod) {
          req = this._openRequest('POST', this.url);
          req.setHeader('X-HTTP-Method-Override', 'PATCH');
        } else {
          req = this._openRequest('PATCH', this.url);
        }
        req.setHeader('Upload-Offset', "".concat(this._offset));
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
        if (this.options.protocol === PROTOCOL_TUS_V1) {
          req.setHeader('Content-Type', 'application/offset+octet-stream');
        } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
          req.setHeader('Content-Type', 'application/partial-upload');
        }

        // The specified chunkSize may be Infinity or the calcluated end position
        // may exceed the file's size. In both cases, we limit the end position to
        // the input's total size for simpler calculations and correctness.
        if ((end === Number.POSITIVE_INFINITY || end > this._size) && !this.options.uploadLengthDeferred) {
          end = this._size;
        }
        return this._source.slice(start, end).then(function (_ref2) {
          var value = _ref2.value,
            done = _ref2.done;
          var valueSize = value !== null && value !== void 0 && value.size ? value.size : 0;

          // If the upload length is deferred, the upload size was not specified during
          // upload creation. So, if the file reader is done reading, we know the total
          // upload size and can tell the tus server.
          if (_this9.options.uploadLengthDeferred && done) {
            _this9._size = _this9._offset + valueSize;
            req.setHeader('Upload-Length', "".concat(_this9._size));
          }

          // The specified uploadSize might not match the actual amount of data that a source
          // provides. In these cases, we cannot successfully complete the upload, so we
          // rather error out and let the user know. If not, tus-js-client will be stuck
          // in a loop of repeating empty PATCH requests.
          // See https://community.transloadit.com/t/how-to-abort-hanging-companion-uploads/16488/13
          var newSize = _this9._offset + valueSize;
          if (!_this9.options.uploadLengthDeferred && done && newSize !== _this9._size) {
            return Promise.reject(new Error("upload was configured with a size of ".concat(_this9._size, " bytes, but the source is done after ").concat(newSize, " bytes")));
          }
          if (value === null) {
            return _this9._sendRequest(req);
          }
          if (_this9.options.protocol === PROTOCOL_IETF_DRAFT_03 || _this9.options.protocol === PROTOCOL_IETF_DRAFT_05) {
            req.setHeader('Upload-Complete', done ? '?1' : '?0');
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
        var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
        if (Number.isNaN(offset)) {
          this._emitHttpError(req, res, 'tus: invalid or missing offset value');
          return;
        }
        this._emitProgress(offset, this._size);
        this._emitChunkComplete(offset - this._offset, offset, this._size);
        this._offset = offset;
        if (offset === this._size) {
          // Yay, finally done :)
          this._emitSuccess(res);
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
          }

          // Instead of keeping track of the retry attempts, we remove the first element from the delays
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
    if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
      req.setHeader('Upload-Draft-Interop-Version', '5');
    } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
      req.setHeader('Upload-Draft-Interop-Version', '6');
    } else {
      req.setHeader('Tus-Resumable', '1.0.0');
    }
    var headers = options.headers || {};
    for (var _i2 = 0, _Object$entries = Object.entries(headers); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        name = _Object$entries$_i[0],
        value = _Object$entries$_i[1];
      req.setHeader(name, value);
    }
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
  function sendRequest(_x, _x2, _x3) {
    return _sendRequest2.apply(this, arguments);
  }
  /**
   * Checks whether the browser running this code has internet access.
   * This function will always return true in the node.js environment
   *
   * @api private
   */
  function _sendRequest2() {
    _sendRequest2 = _asyncToGenerator$1(/*#__PURE__*/_regeneratorRuntime$1().mark(function _callee(req, body, options) {
      var res;
      return _regeneratorRuntime$1().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof options.onBeforeRequest === 'function')) {
              _context.next = 3;
              break;
            }
            _context.next = 3;
            return options.onBeforeRequest(req);
          case 3:
            _context.next = 5;
            return req.send(body);
          case 5:
            res = _context.sent;
            if (!(typeof options.onAfterResponse === 'function')) {
              _context.next = 9;
              break;
            }
            _context.next = 9;
            return options.onAfterResponse(req, res);
          case 9:
            return _context.abrupt("return", res);
          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _sendRequest2.apply(this, arguments);
  }
  function isOnline() {
    var online = true;
    // Note: We don't reference `window` here because the navigator object also exists
    // in a Web Worker's context.
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
    if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
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
    return new URL(link, origin).toString();
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

  function _typeof$5(o) {
    "@babel/helpers - typeof";

    return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$5(o);
  }
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
      Object.defineProperty(target, _toPropertyKey$5(descriptor.key), descriptor);
    }
  }
  function _createClass$5(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$5(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$5(t) {
    var i = _toPrimitive$5(t, "string");
    return "symbol" == _typeof$5(i) ? i : i + "";
  }
  function _toPrimitive$5(t, r) {
    if ("object" != _typeof$5(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$5(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var FileSource = /*#__PURE__*/function () {
    // Make this.size a method
    function FileSource(file) {
      _classCallCheck$5(this, FileSource);
      this._file = file;
      this.size = file.size;
    }
    return _createClass$5(FileSource, [{
      key: "slice",
      value: function slice(start, end) {
        // In Apache Cordova applications, a File must be resolved using
        // FileReader instances, see
        // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
        if (isCordova()) {
          return readAsByteArray(this._file.slice(start, end));
        }
        var value = this._file.slice(start, end);
        var done = end >= this.size;
        return Promise.resolve({
          value: value,
          done: done
        });
      }
    }, {
      key: "close",
      value: function close() {
        // Nothing to do here since we don't need to release any resources.
      }
    }]);
  }();

  function _typeof$4(o) {
    "@babel/helpers - typeof";

    return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$4(o);
  }
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
      Object.defineProperty(target, _toPropertyKey$4(descriptor.key), descriptor);
    }
  }
  function _createClass$4(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$4(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$4(t) {
    var i = _toPrimitive$4(t, "string");
    return "symbol" == _typeof$4(i) ? i : i + "";
  }
  function _toPrimitive$4(t, r) {
    if ("object" != _typeof$4(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$4(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
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
      _classCallCheck$4(this, StreamSource);
      this._buffer = undefined;
      this._bufferOffset = 0;
      this._reader = reader;
      this._done = false;
    }
    return _createClass$4(StreamSource, [{
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
        }
        // If the buffer is empty after removing old data, all data has been read.
        var hasAllDataBeenRead = len(this._buffer) === 0;
        if (this._done && hasAllDataBeenRead) {
          return null;
        }
        // We already removed data before `start`, so we just return the first
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
  }();

  function _typeof$3(o) {
    "@babel/helpers - typeof";

    return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$3(o);
  }
  function _regeneratorRuntime() {

    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
    _regeneratorRuntime = function _regeneratorRuntime() {
      return e;
    };
    var t,
      e = {},
      r = Object.prototype,
      n = r.hasOwnProperty,
      o = Object.defineProperty || function (t, e, r) {
        t[e] = r.value;
      },
      i = "function" == typeof Symbol ? Symbol : {},
      a = i.iterator || "@@iterator",
      c = i.asyncIterator || "@@asyncIterator",
      u = i.toStringTag || "@@toStringTag";
    function define(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true
      }), t[e];
    }
    try {
      define({}, "");
    } catch (t) {
      define = function define(t, e, r) {
        return t[e] = r;
      };
    }
    function wrap(t, e, r, n) {
      var i = e && e.prototype instanceof Generator ? e : Generator,
        a = Object.create(i.prototype),
        c = new Context(n || []);
      return o(a, "_invoke", {
        value: makeInvokeMethod(t, r, c)
      }), a;
    }
    function tryCatch(t, e, r) {
      try {
        return {
          type: "normal",
          arg: t.call(e, r)
        };
      } catch (t) {
        return {
          type: "throw",
          arg: t
        };
      }
    }
    e.wrap = wrap;
    var h = "suspendedStart",
      l = "suspendedYield",
      f = "executing",
      s = "completed",
      y = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var p = {};
    define(p, a, function () {
      return this;
    });
    var d = Object.getPrototypeOf,
      v = d && d(d(values([])));
    v && v !== r && n.call(v, a) && (p = v);
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
      ["next", "throw", "return"].forEach(function (e) {
        define(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function AsyncIterator(t, e) {
      function invoke(r, o, i, a) {
        var c = tryCatch(t[r], t, o);
        if ("throw" !== c.type) {
          var u = c.arg,
            h = u.value;
          return h && "object" == _typeof$3(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          }) : e.resolve(h).then(function (t) {
            u.value = t, i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
        a(c.arg);
      }
      var r;
      o(this, "_invoke", {
        value: function value(t, n) {
          function callInvokeWithMethodAndArg() {
            return new e(function (e, r) {
              invoke(t, n, e, r);
            });
          }
          return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(e, r, n) {
      var o = h;
      return function (i, a) {
        if (o === f) throw Error("Generator is already running");
        if (o === s) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: true
          };
        }
        for (n.method = i, n.arg = a;;) {
          var c = n.delegate;
          if (c) {
            var u = maybeInvokeDelegate(c, n);
            if (u) {
              if (u === y) continue;
              return u;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (o === h) throw o = s, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = f;
          var p = tryCatch(e, r, n);
          if ("normal" === p.type) {
            if (o = n.done ? s : l, p.arg === y) continue;
            return {
              value: p.arg,
              done: n.done
            };
          }
          "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
        }
      };
    }
    function maybeInvokeDelegate(e, r) {
      var n = r.method,
        o = e.iterator[n];
      if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
      var i = tryCatch(o, e.iterator, r.arg);
      if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
      var a = i.arg;
      return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
    }
    function pushTryEntry(t) {
      var e = {
        tryLoc: t[0]
      };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function resetTryEntry(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function Context(t) {
      this.tryEntries = [{
        tryLoc: "root"
      }], t.forEach(pushTryEntry, this), this.reset(true);
    }
    function values(e) {
      if (e || "" === e) {
        var r = e[a];
        if (r) return r.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) {
          var o = -1,
            i = function next() {
              for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next;
              return next.value = t, next.done = true, next;
            };
          return i.next = i;
        }
      }
      throw new TypeError(_typeof$3(e) + " is not iterable");
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: true
    }), o(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: true
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
      var e = "function" == typeof t && t.constructor;
      return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
    }, e.mark = function (t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
    }, e.awrap = function (t) {
      return {
        __await: t
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
      return this;
    }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
      void 0 === i && (i = Promise);
      var a = new AsyncIterator(wrap(t, r, n, o), i);
      return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
        return t.done ? t.value : a.next();
      });
    }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
      return this;
    }), define(g, "toString", function () {
      return "[object Generator]";
    }), e.keys = function (t) {
      var e = Object(t),
        r = [];
      for (var n in e) r.push(n);
      return r.reverse(), function next() {
        for (; r.length;) {
          var t = r.pop();
          if (t in e) return next.value = t, next.done = false, next;
        }
        return next.done = true, next;
      };
    }, e.values = values, Context.prototype = {
      constructor: Context,
      reset: function reset(e) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
      },
      stop: function stop() {
        this.done = true;
        var t = this.tryEntries[0].completion;
        if ("throw" === t.type) throw t.arg;
        return this.rval;
      },
      dispatchException: function dispatchException(e) {
        if (this.done) throw e;
        var r = this;
        function handle(n, o) {
          return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
        }
        for (var o = this.tryEntries.length - 1; o >= 0; --o) {
          var i = this.tryEntries[o],
            a = i.completion;
          if ("root" === i.tryLoc) return handle("end");
          if (i.tryLoc <= this.prev) {
            var c = n.call(i, "catchLoc"),
              u = n.call(i, "finallyLoc");
            if (c && u) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            } else if (c) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, true);
            } else {
              if (!u) throw Error("try statement without catch or finally");
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            }
          }
        }
      },
      abrupt: function abrupt(t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var o = this.tryEntries[r];
          if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
            var i = o;
            break;
          }
        }
        i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
        var a = i ? i.completion : {};
        return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
      },
      complete: function complete(t, e) {
        if ("throw" === t.type) throw t.arg;
        return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
      },
      finish: function finish(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
        }
      },
      "catch": function _catch(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var n = r.completion;
            if ("throw" === n.type) {
              var o = n.arg;
              resetTryEntry(r);
            }
            return o;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function delegateYield(e, r, n) {
        return this.delegate = {
          iterator: values(e),
          resultName: r,
          nextLoc: n
        }, "next" === this.method && (this.arg = t), y;
      }
    }, e;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
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
      Object.defineProperty(target, _toPropertyKey$3(descriptor.key), descriptor);
    }
  }
  function _createClass$3(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$3(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$3(t) {
    var i = _toPrimitive$3(t, "string");
    return "symbol" == _typeof$3(i) ? i : i + "";
  }
  function _toPrimitive$3(t, r) {
    if ("object" != _typeof$3(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$3(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var FileReader$1 = /*#__PURE__*/function () {
    function FileReader() {
      _classCallCheck$3(this, FileReader);
    }
    return _createClass$3(FileReader, [{
      key: "openFile",
      value: function () {
        var _openFile = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(input, chunkSize) {
          var blob;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(isReactNative() && input && typeof input.uri !== 'undefined')) {
                  _context.next = 11;
                  break;
                }
                _context.prev = 1;
                _context.next = 4;
                return uriToBlob(input.uri);
              case 4:
                blob = _context.sent;
                return _context.abrupt("return", new FileSource(blob));
              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](1);
                throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(_context.t0));
              case 11:
                if (!(typeof input.slice === 'function' && typeof input.size !== 'undefined')) {
                  _context.next = 13;
                  break;
                }
                return _context.abrupt("return", Promise.resolve(new FileSource(input)));
              case 13:
                if (!(typeof input.read === 'function')) {
                  _context.next = 18;
                  break;
                }
                chunkSize = Number(chunkSize);
                if (Number.isFinite(chunkSize)) {
                  _context.next = 17;
                  break;
                }
                return _context.abrupt("return", Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option')));
              case 17:
                return _context.abrupt("return", Promise.resolve(new StreamSource(input, chunkSize)));
              case 18:
                return _context.abrupt("return", Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment')));
              case 19:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[1, 8]]);
        }));
        function openFile(_x, _x2) {
          return _openFile.apply(this, arguments);
        }
        return openFile;
      }()
    }]);
  }();

  // TODO: Differenciate between input types

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

  function _typeof$2(o) {
    "@babel/helpers - typeof";

    return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$2(o);
  }
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
      Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor);
    }
  }
  function _createClass$2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$2(t) {
    var i = _toPrimitive$2(t, "string");
    return "symbol" == _typeof$2(i) ? i : i + "";
  }
  function _toPrimitive$2(t, r) {
    if ("object" != _typeof$2(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$2(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var XHRHttpStack = /*#__PURE__*/function () {
    function XHRHttpStack() {
      _classCallCheck$2(this, XHRHttpStack);
    }
    return _createClass$2(XHRHttpStack, [{
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
  }();
  var Request = /*#__PURE__*/function () {
    function Request(method, url) {
      _classCallCheck$2(this, Request);
      this._xhr = new XMLHttpRequest();
      this._xhr.open(method, url, true);
      this._method = method;
      this._url = url;
      this._headers = {};
    }
    return _createClass$2(Request, [{
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
  }();
  var Response = /*#__PURE__*/function () {
    function Response(xhr) {
      _classCallCheck$2(this, Response);
      this._xhr = xhr;
    }
    return _createClass$2(Response, [{
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
  }();

  function _typeof$1(o) {
    "@babel/helpers - typeof";

    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof$1(o);
  }
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
      Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor);
    }
  }
  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPropertyKey$1(t) {
    var i = _toPrimitive$1(t, "string");
    return "symbol" == _typeof$1(i) ? i : i + "";
  }
  function _toPrimitive$1(t, r) {
    if ("object" != _typeof$1(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$1(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  var hasStorage = false;
  try {
    // Note: localStorage does not exist in the Web Worker's context, so we must use window here.
    hasStorage = 'localStorage' in window;

    // Attempt to store and read entries from the local storage to detect Private
    // Mode on Safari on iOS (see #49)
    // If the key was not used before, we remove it from local storage again to
    // not cause confusion where the entry came from.
    var key = 'tusSupport';
    var originalValue = localStorage.getItem(key);
    localStorage.setItem(key, originalValue);
    if (originalValue === null) localStorage.removeItem(key);
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
      _classCallCheck$1(this, WebStorageUrlStorage);
    }
    return _createClass$1(WebStorageUrlStorage, [{
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
          } catch (_e) {
            // The JSON parse error is intentionally ignored here, so a malformed
            // entry in the storage cannot prevent an upload.
          }
        }
        return results;
      }
    }]);
  }();

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
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
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
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
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
      return !!t;
    })();
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
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
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
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
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  var defaultOptions = _objectSpread(_objectSpread({}, BaseUpload.defaultOptions), {}, {
    httpStack: new XHRHttpStack(),
    fileReader: new FileReader$1(),
    urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
    fingerprint: fingerprint
  });
  var Upload = /*#__PURE__*/function (_BaseUpload) {
    function Upload() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck(this, Upload);
      options = _objectSpread(_objectSpread({}, defaultOptions), options);
      return _callSuper(this, Upload, [file, options]);
    }
    _inherits(Upload, _BaseUpload);
    return _createClass(Upload, null, [{
      key: "terminate",
      value: function terminate(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        options = _objectSpread(_objectSpread({}, defaultOptions), options);
        return BaseUpload.terminate(url, options);
      }
    }]);
  }(BaseUpload); // Note: We don't reference `window` here because these classes also exist in a Web Worker's context.

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
        _clickableFilenames: callbacks.onClick != null,
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
        _multiple: multiple,
        _renderer: renderer
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
    async _handleCancel(upload, moveFocus = false) {
      this._renderer._disableCancel(upload.uploadIndex);
      await upload.abort();
      this._removeUploadFromList(upload, moveFocus);
      this._renderer._announce("{filename} removed", upload.name);
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
      if (target.classList.contains("dff-delete")) {
        const upload = getUpload();
        if (upload) {
          void this._removeExistingUpload(upload, true);
        }
      } else if (target.classList.contains("dff-cancel")) {
        const upload = getUpload();
        if (upload) {
          void this._handleCancel(upload, true);
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
      this._renderer._announce("Upload failed: {filename}", upload.name);
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
        _renderer: renderer
      } = this;
      this._updatePlaceholderInput();
      renderer._clearInput();
      renderer._setSuccess(upload.uploadIndex, upload.getSize());
      renderer._announce("{filename} uploaded", upload.name);
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

    // moveFocus: whether the user removed the file, with the delete or cancel
    // button, and the focus should not be lost
    async _removeExistingUpload(upload, moveFocus = false) {
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
          this._renderer._setDeleteFailed(upload.uploadIndex, moveFocus);
          this._renderer._announce("Delete failed: {filename}", upload.name);
          return;
        }
      }
      this._removeUploadFromList(upload, moveFocus);
      this._updatePlaceholderInput();
      this._renderer._announce("{filename} removed", upload.name);
    }
    _removeUploadFromList(upload, moveFocus = false) {
      this._renderer._deleteFile(upload.uploadIndex, moveFocus);
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
          _csrfToken: csrfToken,
          _s3UploadDir: s3UploadDir
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
        _fieldName: fieldName,
        _formId: formId,
        _renderer: renderer,
        _uploadUrl: uploadUrl
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
