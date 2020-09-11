const eventEmitter = new EventEmitter3();

eventEmitter.on('addUpload', ({ element, fieldName, upload }) => {
  console.log('addUpload', element, fieldName, upload);
});

eventEmitter.on('removeUpload', ({ element, fieldName, upload }) => {
  console.log('removeUpload', element, fieldName, upload);
});

eventEmitter.on('uploadComplete', ({ element, fieldName, upload }) => {
  console.log('uploadComplete', element, fieldName, upload);
});

initUploadFields(
    document.getElementById("example-form"),
    {
      eventEmitter,
      prefix: "example",
      retryDelays: [],
      skipRequired: true,
      supportDropArea: true
    }
);
