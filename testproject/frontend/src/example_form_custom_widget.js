const { formatBytes } = window.djangoFileForm;

const CustomFileInfo = ({ upload }) => {
  const handleDescriptionChange = (e) => {
    upload.setMetadata({ description: e.target.value });
  };

  return (
    <>
      <span>{upload.name}</span>
      <span className="dff-filesize">{formatBytes(upload.getSize(), 2)}</span>
      <input className="dff-description" onInput={handleDescriptionChange} value={upload?.metadata?.description} />
    </>
  );
};

initUploadFields(document.getElementById("example-form"), {
  CustomFileInfo,
  prefix: "example",
  retryDelays: [],
  skipRequired: true,
  supportDropArea: true,
});
