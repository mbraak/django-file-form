const form = document.getElementById("example-form");

form.addEventListener(
  "addUpload",
  ({ detail: { element, fieldName, fileName, metaDataField, upload } }) => {
    function descriptionChanged(evt) {
      const metaData = JSON.parse(metaDataField.value);

      const inputValue = evt.target.value;
      metaData[fileName] = { description: inputValue };

      metaDataField.value = JSON.stringify(metaData);
    }

    if (!metaDataField || !metaDataField.value) {
      return;
    }

    console.log(`Added file ${fileName}`);

    const metadata = JSON.parse(metaDataField.value);

    // add a widget
    const descElem = document.createElement("input");
    descElem.value = metadata[fileName]
      ? metadata[fileName]["description"]
      : "";

    descElem.className = "dff-description";
    descElem.addEventListener("change", descriptionChanged);
    element.insertBefore(
      descElem,
      element.firstElementChild.nextElementSibling,
    );
  },
);

form.addEventListener(
  "removeUpload",
  ({ detail: { element, fieldName, fileName, metaDataField, upload } }) => {
    console.log(`Removed file ${fileName}`);
  },
);

initUploadFields(form, {
  prefix: "example",
  retryDelays: [],
  skipRequired: true,
  supportDropArea: true,
});
