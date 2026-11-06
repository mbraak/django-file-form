## Javascript options

Signature of `initUploadFields` is:

```
initUploadFields(formDomElement, options);
```

- `formDomElement` (required); e.g. `document.getElementById("example-form")`
- options (optional)
  - `callbacks`: callbacks for things like upload progress and errors.
  - `chunkSize`: the maximum size of an upload. Default is 2.5 MB.
    - Note that Django limits the size of a request. See https://docs.djangoproject.com/en/4.1/ref/settings/#data-upload-max-memory-size.
  - `prefix`: set this if the Django form has a prefix; default is empty
  - `retryDelays`: set retry delays
    - The wait times in milliseconds before retrying a failed request; there is one retry for each value.
    - Applies to tus uploads and to the parts of an S3 upload.
    - Also see `https://github.com/tus/tus-js-client#tusdefaultoptions`
    - Default is `[0, 1000, 3000, 5000]`
  - `skipRequired` : don't set the `required` field of the file input; default is `false`
  - `supportDropArea` : add a drop area; default is `true`

The callbacks are:

- `onClick`

  - Called when the filename of an uploaded file is clicked
  - Signature of callback is `function({ fileName, fieldName, type })`
    - fileName: the file name
    - fieldName: the name of the form field
    - id: the id of the temporary uploaded file
    - type:
      - `tus` or `uploadedTus`: uploaded file
      - `placeholder`: placeholder
      - `existing`: existing file
    - The filename is rendered with the `dff-filename` class. You can use this class to change the styling.
    - When this callback is set, the filename of an uploaded file is rendered as a `<button>`, so that it can also be
      clicked using the keyboard. While a file is uploading, the filename is plain text.

- `onDelete`
  - Called when file is deleted
  - Signature of callback is `function(upload)`
- `onError`:
  - Called when an upload error occurs; for tus and S3 uploads
  - Signature of callback is `function(error, upload)`
    - `error`: javascript Error
- `onProgress`:
  - Called each time when progress information is available; for tus and S3 uploads
  - Signature of callback is `function(bytesUploaded, bytesTotal, upload)`
- `onSuccess`:
  - Called when file upload is done; for tus and S3 uploads
  - Signature of callback is `function(upload)`

The `upload` parameter of the callbacks is an upload object of django-file-form. It has these properties and methods:

- `name`: the file name
- `type`: the kind of upload
  - `tus`: a tus upload
  - `s3`: an S3 upload
  - `uploadedTus` or `uploadedS3`: a file that was uploaded before the form was rendered, e.g. when the form had validation errors
  - `placeholder`: a placeholder
  - `existing`: an existing file
- `status`: `uploading`, `done` or `error`
- `uploadIndex`: a number that identifies the upload within its form field
- `getId()`: the id of the upload on the server; `undefined` when the upload isn't created yet
- `getSize()`: the size of the file in bytes, if it's known

`onDelete` can receive any kind of upload; `onError`, `onProgress` and `onSuccess` receive a `tus` or `s3` upload.

Examples:

```js
initUploadFields(document.getElementById("example-form"));
```

```js
initUploadFields(document.getElementById("example-form"), {
  prefix: "example",
  skipRequired: true,
  supportDropArea: true,
});
```
