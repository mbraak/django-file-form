import EventEmitter from "eventemitter3";

const { formatBytes } = window.djangoFileForm;

const eventEmitter = new EventEmitter();

eventEmitter.on("addUpload", ({ element, fieldName, fileName, metaDataField, upload }) => {
  const descriptionChanged = (evt) => {
    const metaData = JSON.parse(metaDataField.value);

    const inputValue = evt.target.value;
    metaData[fileName] = { description: inputValue };

    metaDataField.value = JSON.stringify(metaData);
  };

  if (!metaDataField || !metaDataField.value) {
    return;
  }

  const metadata = JSON.parse(metaDataField.value);

  // add a widget
  const descElem = document.createElement("input");
  descElem.value = metadata[fileName] ? metadata[fileName]["description"] : "";

  descElem.className = "dff-description";
  descElem.addEventListener("change", descriptionChanged);
  element.insertBefore(descElem, element.firstElementChild.nextElementSibling);
});

eventEmitter.on("removeUpload", ({ element, fieldName, fileName, metaDataField, upload }) => {
  // do not need to update hidden data since returned metadata will be ignored
});

const CustomFileInfo = ({ upload }) => (
  <>
    <span>{upload.name}</span>
    <span className="dff-filesize">{formatBytes(upload.getSize(), 2)}</span>
  </>
);

initUploadFields(document.getElementById("example-form"), {
  CustomFileInfo,
  eventEmitter,
  prefix: "example",
  retryDelays: [],
  skipRequired: true,
  supportDropArea: true,
});
