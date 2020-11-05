## Javascript options

Signature of `initUploadFields` is:

```
initUploadFields(formDomElement, options);
```

* `formDomElement` (required); e.g. `document.getElementById("example-form")`
* options (optional)
  * `callbacks`: callbacks for things like upload progress and errors.
  * `chunkSize`: the maximum size of an upload. Default is 2.5 MB.
    * Note that Django limits the size of a request. See https://docs.djangoproject.com/en/3.1/ref/settings/#data-upload-max-memory-size.
  * `eventEmitter`: experimental api for events. See 'Javascript events' section below
  * `prefix`: set this if the Django form has a prefix; default is empty
  * `retryDelays`: set retry delays
    * Also see `https://github.com/tus/tus-js-client#tusdefaultoptions`
    * Default is `[0, 1000, 3000, 5000]`
  * `skipRequired` : don't set the `required` field of the file input; default is `false`
  * `supportDropArea` : add a drop area; default is `true`

The callbacks are:

  * `onDelete`
    * called when file is deleted
    * Signature of callback is `function(upload)`
  * `onError`:
    * called when an upload error occurs
    * Signature of callback is `function(error, upload)`
      * `error`: javascript Error
  * `onProgress`:
    * Called each time when progress information is available.
    * Signature of callback is `function(bytesUploaded, bytesTotal, upload)`
  * `onSuccess`:
    * Called when file upload is done.
    * Signature of callback is `function(upload)`

The callbacks receive an `upload` parameter which is [this class](https://github.com/tus/tus-js-client#new-tusuploadfile-options).

Examples:

```js
initUploadFields(
  document.getElementById("example-form")
);
```

```js
initUploadFields(
  document.getElementById("example-form"),
  {
    prefix: "example",
    skipRequired: true,
    supportDropArea: true
  }
);
```
