const handleClick = ({ fileName, fieldName }) => {
  console.log(fileName, fieldName);
};

initUploadFields(document.getElementById("example-form"), {
  prefix: "example",
  retryDelays: [],
  skipRequired: true,
  supportDropArea: true,
  callbacks: {
    onClick: handleClick,
  },
});
