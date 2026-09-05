## Javascript events

There are javascript events for adding and removing an upload. The events are `addUpload`, `removeUpload`,
and `uploadComplete`.

The events are dispatched on the form element as a `CustomEvent`. The event data is in `event.detail`.
The events bubble, so you can also listen on a parent element or on `document`.

```js
const form = document.getElementById("example-form");

form.addEventListener('addUpload', ({ detail: { element, fieldName, fileName, metaDataField, upload } }) => {
  //
});

form.addEventListener('removeUpload', ({ detail: { element, fieldName, fileName, metaDataField, upload } }) => {
  //
});

form.addEventListener('uploadComplete', ({ detail: { element, fieldName, fileName, metaDataField, upload } }) => {
  //
});

initUploadFields(form);
```

* `element`: the html element that renders the upload
* `fieldName`: the name of the form field
* `fileName`: the file name
* `metaDataField`: the metadata input. See 'Additional file metadata' in this document.
* `upload`: the upload object
* This api is experimental.
