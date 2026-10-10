export const deleteUpload = async (
  url: string,
  csrfToken: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.addEventListener("load", (): void => {
      if (xhr.status === 204) {
        resolve();
      } else {
        reject(new Error("Delete failed"));
      }
    });
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.send(null);
  });
