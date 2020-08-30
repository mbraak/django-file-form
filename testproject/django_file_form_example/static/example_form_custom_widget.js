const eventEmitter = new EventEmitter3();

function getMetaDataField(fieldName) {
  // no consideration of prefix??
  // not sure how to use functions in .utils
  const name = fieldName + '-metadata';
  const form = document.getElementById("example-form");
  return field = form.querySelector(`[name="${name}"]`);
}

eventEmitter.on('addUpload', ({ element, fieldName, upload }) => {
  function descriptionChanged(evt) {
    const metaDataField = getMetaDataField(fieldName);
    const metaData = JSON.parse(metaDataField.value);

    const inputValue = evt.target.value;
    metaData[upload.name] = inputValue;

    metaDataField.value = JSON.stringify(metaData);
  }

  let field = getMetaDataField(fieldName);
  if (!field || !field.value) {
    return;
  }
  let metadata = JSON.parse(field.value);
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
