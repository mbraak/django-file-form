## Javascript events

There are javascript events for adding and removing an upload. The events are `addUpload`, `removeUpload`,
and `uploadComplete`.

```js
import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

eventEmitter.on('addUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});

eventEmitter.on('removeUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});

eventEmitter.on('uploadComplete', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});


initUploadFields(
  document.getElementById("example-form"),
  {
    eventEmitter,
  }
);
```

* You need the `eventemitter3` package to use this.
* The `metaDataField` is the metadata input. See 'Additional file metadata' in this document.
* This api is experimental.
