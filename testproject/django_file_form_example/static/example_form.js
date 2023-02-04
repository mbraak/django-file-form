const handleClick = ({ fileName, fieldName, id }) => {
  console.log("handleClick id", id);
  const div = document.createElement("div");
  div.innerText = `Clicked ${fileName} on field ${fieldName}`;
  document.querySelector("#messages").append(div);
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
