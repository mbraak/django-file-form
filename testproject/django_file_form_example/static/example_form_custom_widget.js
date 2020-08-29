const eventEmitter = new EventEmitter3();

function getMetaDataField(fieldName) {
  // no consideration of prefix??
  // not sure how to use functions in .utils
  const name = fieldName + '-metadata';
  const form = document.getElementById("example-form");
  return field = form.querySelector(`[name="${name}"]`);
}

function descriptionChanged(evt) {
  let field = getMetaDataField(evt.target.getAttribute('fieldName'));
  let descriptions = document.getElementsByClassName('dff-description');
  let data = {}
  for (let i = 0; i < descriptions.length; ++i) {
    let desc = descriptions[i];
    data[desc.getAttribute('fileName')] = {
      'description': desc.value
    }
  }
  field.value = JSON.stringify(data);
}

eventEmitter.on('addUpload', ({ element, fieldName, upload }) => {
  // console.log('addUpload', element, fieldName, upload);
  let field = getMetaDataField(fieldName);
  if (!field || !field.value) {
    return;
  }
  let metadata = JSON.parse(field.value);
  // add a widget
  let descElem = document.createElement('input');
  descElem.value = metadata[upload.name] ? metadata[upload.name]['description'] : '';

  descElem.className = 'dff-description';
  descElem.setAttribute('fileName', upload.name);
  descElem.setAttribute('fieldName', fieldName);
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
