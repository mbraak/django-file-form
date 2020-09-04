const eventEmitter = new EventEmitter3();

eventEmitter.on('addUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
  function descriptionChanged(evt) {
    const metaData = JSON.parse(metaDataField.value);

    const inputValue = evt.target.value;
    metaData[fileName] = { description: inputValue };

    metaDataField.value = JSON.stringify(metaData);
  }

  if (!metaDataField || !metaDataField.value) {
    return;
  }

  const metadata = JSON.parse(metaDataField.value);

  // add a widget
  const descElem = document.createElement('input');
  descElem.value = metadata[fileName] ? metadata[fileName]['description'] : '';

  descElem.className = 'dff-description';
  descElem.addEventListener('change', descriptionChanged);
  element.insertBefore(descElem, element.firstElementChild.nextElementSibling);
});

eventEmitter.on('removeUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
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
