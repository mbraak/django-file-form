const eventEmitter = new EventEmitter3();

eventEmitter.on('addUpload', ({ element, fieldName, metaDataField, upload }) => {
  function descriptionChanged(evt) {
    const metaData = JSON.parse(metaDataField.value);

    const inputValue = evt.target.value;
    metaData[upload.name] = inputValue;

    metaDataField.value = JSON.stringify(metaData);
  }

  console.log(fieldName, metaDataField)

  if (!metaDataField || !metaDataField.value) {
    return;
  }

  let metadata = JSON.parse(metaDataField.value);

  // add a widget
  let descElem = document.createElement('input');
  descElem.value = metadata[upload.name] ? metadata[upload.name]['description'] : '';

  descElem.className = 'dff-description';
  descElem.addEventListener('change', descriptionChanged);
  element.appendChild(descElem);
});

eventEmitter.on('removeUpload', ({ element, fieldName, upload }) => {
  // do not need to update hidden data since returned metadata will be ignored
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
