const eventEmitter = new EventEmitter3();

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

eventEmitter.on('addUpload', ({ element, fieldName, upload }) => {
  console.log('addUpload', element, fieldName, upload);
});

eventEmitter.on('removeUpload', ({ element, fieldName, upload }) => {
  console.log('removeUpload', element, fieldName, upload);
});
