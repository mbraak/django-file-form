export const deleteUpload = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = (): void => {
      if (xhr.status === 204) {
        resolve();
      } else {
        reject();
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  });
};
