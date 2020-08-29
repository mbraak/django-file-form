const fileForm = initUploadFields(
    document.getElementById("example-form"),
    {
      prefix: "example",
      retryDelays: [],
      skipRequired: true,
      supportDropArea: true
    }
);

fileForm.on('addUpload', ({ element, fieldName, upload }) => {
  console.log('addUpload', element, fieldName, upload);
});

fileForm.on('removeUpload', ({ element, fieldName, upload }) => {
  console.log('removeUpload', element, fieldName, upload);
});
