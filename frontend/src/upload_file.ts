import { Upload } from "tus-js-client";
import { findInput, getPlaceholderFieldName } from "./util";
import RenderUploadFile from "./render_upload_file";
import DropArea from "./drop_area";


// const { Plugin } = require('@uppy/core')
// const { Socket, Provider, RequestClient } = require('@uppy/companion-client')
// const EventTracker = require('@uppy/utils/lib/EventTracker')
// const emitSocketProgress = require('@uppy/utils/lib/emitSocketProgress')
// const getSocketHost = require('@uppy/utils/lib/getSocketHost')
// const RateLimitedQueue = require('@uppy/utils/lib/RateLimitedQueue')
const Uploader = require('./MultipartUploader')
// const AwsS3Multipart = require('@uppy/aws-s3-multipart')


     



export interface InitialFile {
  id: string;
  name: string;
  placeholder?: boolean;
  size: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  placeholder: boolean;
  size: number;
}

export type Translations = { [key: string]: string };

export interface Callbacks {
  onDelete?: (upload: Upload | UploadedFile) => void;
  onError?: (error: Error, upload: Upload) => void;
  onProgress?: (
    bytesUploaded: number,
    bytesTotal: number,
    upload: Upload
  ) => void;
  onSuccess?: (upload: Upload) => void;
}

class UploadFile {
  callbacks: Callbacks;
  fieldName: string;
  form: Element;
  formId: string;
  multiple: boolean;
  prefix: string | null;
  renderer: RenderUploadFile;
  retryDelays: number[] | null;
  supportDropArea: boolean;
  uploadIndex: number;
  uploadUrl: string;
  uploads: (Upload | UploadedFile)[];

  constructor({
    callbacks,
    fieldName,
    form,
    formId,
    initial,
    input,
    multiple,
    parent,
    prefix,
    retryDelays,
    skipRequired,
    supportDropArea,
    translations,
    uploadUrl
  }: {
    callbacks: Callbacks;
    fieldName: string;
    form: Element;
    formId: string;
    initial: InitialFile[];
    input: HTMLInputElement;
    multiple: boolean;
    parent: Element;
    prefix: string | null;
    retryDelays: number[] | null;
    skipRequired: boolean;
    supportDropArea: boolean;
    translations: Translations;
    uploadUrl: string;
  }) {
    this.callbacks = callbacks;
    this.fieldName = fieldName;
    this.form = form;
    this.formId = formId;
    this.multiple = multiple;
    this.prefix = prefix;
    this.retryDelays = retryDelays;
    this.supportDropArea = supportDropArea;
    this.uploadUrl = uploadUrl;

    this.uploadIndex = 0;
    this.uploads = [];

    this.renderer = new RenderUploadFile({
      parent,
      input,
      skipRequired,
      translations
    });
    const filesContainer = this.renderer.container;

    if (supportDropArea) {
      this.initDropArea(filesContainer);
    }

    if (initial) {
      this.addInitialFiles(initial);
    }

    this.checkDropHint();

    input.addEventListener("change", this.onChange);
    filesContainer.addEventListener("click", this.onClick);
  }

  createMultipartUpload(file){
      // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
      var csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
      return fetch('/s3/multipart', {
      method: 'post',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        "X-CSRFToken": csrftoken
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      })
    }).then((response) => {
      return response.json()
    }).then((data)=>{
      console.log("createMultipartUpload ",data)
      return data
    })
   }

   listParts(file, {key,uploadId}){
            const filename=encodeURIComponent(key)
            const uploadIdEnc = encodeURIComponent(uploadId)
              return fetch('/s3/multipart/'+uploadIdEnc+"?key="+filename,{
                method: 'get'
              }).then((response)=>{
              return response.json()
            }).then((data)=>{
              console.log("listParts ",data)
              return data["parts"]
            })               
          }

   prepareUploadPart(file,{key,uploadId,number}){
            const filename = encodeURIComponent(key)
             // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
             var csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
            return fetch('/s3/multipart/'+uploadId+"/"+parseInt(number)+"?key="+filename,{
                method: 'get',
                headers: {
                    "X-CSRFToken": csrftoken
                }
            }).then((response)=>{
              return response.json()
            }).then((data)=>{
              console.log("prepareUploadPart ",data)
              return data
            })   

          }

    completeMultipartUpload(file, { key, uploadId, parts }){
              const filename = encodeURIComponent(key)
              const uploadIdEnc = encodeURIComponent(uploadId)
              // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
              var csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
              return fetch('/s3/multipart/'+uploadIdEnc+"/complete?key="+filename,{
                    method: 'post',
                    headers: {
                        "X-CSRFToken": csrftoken
                    },
                    body: JSON.stringify({
                      parts: parts
                   })
                }).then((response)=>{
                  return response.json()
                }).then((data)=>{
                  console.log("Complete multi upload ",data)
                  return data
                })   

              }

    abortMultipartUpload(file, {key, uploadId}){
              // const filename = encodeURIComponent(key)
              const uploadIdEnc = encodeURIComponent(uploadId)
                // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
              var csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
              return fetch('/s3/multipart/'+uploadIdEnc+"/",{
                    method: 'delete',
                    headers: {
                        "X-CSRFToken": csrftoken
                    }
                }).then((response)=>{
                  return response.json()
                }).then((data)=>{
                  return data
                })   
            }

  addInitialFiles(initialFiles: InitialFile[]): void {
    if (initialFiles.length === 0) {
      return;
    }

    const { multiple, renderer } = this;

    const addInitialFile = (file: InitialFile, i: number): void => {
      const { id, name, size } = file;
      renderer.addUploadedFile(name, i, size);

      if (file.placeholder) {
        this.uploads.push({ id, name, placeholder: true, size });
      } else {
        const url = `${this.uploadUrl}${file.id}`;
        this.uploads.push({ id, name, placeholder: false, size, url });
      }
    };

    if (multiple) {
      let uploadIndex = 0;

      initialFiles.forEach((file: InitialFile): void => {
        addInitialFile(file, uploadIndex);
        uploadIndex += 1;
      });
    } else {
      addInitialFile(initialFiles[0], 0);
    }
  }

  uploadFiles = (files: File[]): void => {
    if (files.length === 0) {
      return;
    }

    if (!this.multiple && this.uploads.length !== 0) {
      this.renderer.deleteFile(0);
      this.uploads = [];
    }

    files.forEach(file => {
      const { fieldName, formId, renderer, uploads, uploadUrl } = this;
      const filename = file.name;
      const uploadIndex = uploads.length;
      console.log(file, fieldName,formId,uploadUrl)


      const upload = new Uploader(file, {
          // .bind to pass the file object to each handler.
          createMultipartUpload: this.createMultipartUpload.bind(this,file) ,
          listParts: this.listParts.bind(this,file) ,
          prepareUploadPart: this.prepareUploadPart.bind(this,file) ,
          completeMultipartUpload: this.completeMultipartUpload.bind(this,file),
          abortMultipartUpload: this.abortMultipartUpload.bind(this,file),
          getChunkSize: null
          // onStart,
          // onProgress,
          // onError,
          // onSuccess,
          // onPartComplete,

        })
      upload.start();





      // const upload = new Upload(file, {
      //   endpoint: uploadUrl,
      //   metadata: { fieldName, filename, formId },
      //   onError: (error: Error): void => this.handleError(uploadIndex, error),
      //   onProgress: (bytesUploaded: number, bytesTotal: number): void =>
      //     this.handleProgress(uploadIndex, bytesUploaded, bytesTotal),
      //   onSuccess: (): void =>
      //     this.handleSuccess(uploadIndex, (upload.file as File).size),
      //   retryDelays: this.retryDelays || [0, 1000, 3000, 5000]
      // });
      // console.log("start upload")

      // upload.start();
      renderer.addNewUpload(filename, uploadIndex);

      this.uploads.push(upload);
    });

    this.checkDropHint();
  };

  onChange = (e: Event): void => {
    this.uploadFiles([...(e.target as HTMLInputElement).files]);
  };

  onClick = (e: Event): void => {
    const target = e.target as HTMLInputElement;

    const getUploadIndex = (): number | null => {
      const dataIndex = target.getAttribute("data-index");

      if (!dataIndex) {
        return null;
      }

      return parseInt(dataIndex, 10);
    };

    if (target.classList.contains("dff-delete")) {
      const uploadIndex = getUploadIndex();

      if (uploadIndex !== null) {
        this.handleDelete(uploadIndex);
      }

      e.preventDefault();
    } else if (target.classList.contains("dff-cancel")) {
      const uploadIndex = getUploadIndex();

      if (uploadIndex !== null) {
        this.handleCancel(uploadIndex);
      }

      e.preventDefault();
    }
  };

  handleProgress = (
    uploadIndex: number,
    bytesUploaded: number,
    bytesTotal: number
  ): void => {
    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);

    this.renderer.updateProgress(uploadIndex, percentage);

    const { onProgress } = this.callbacks;

    if (onProgress) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onProgress(bytesUploaded, bytesTotal, upload);
      }
    }
  };

  handleError = (uploadIndex: number, error: Error): void => {
    this.renderer.setError(uploadIndex);

    const { onError } = this.callbacks;

    if (onError) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onError(error, upload);
      }
    }
  };

  handleSuccess = (uploadIndex: number, uploadedSize: number): void => {
    const { renderer } = this;

    renderer.clearInput();
    renderer.setSuccess(uploadIndex, uploadedSize);

    const { onSuccess } = this.callbacks;

    if (onSuccess) {
      const upload = this.uploads[uploadIndex];

      if (upload instanceof Upload) {
        onSuccess(upload);
      }
    }
  };

  handleDelete(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (upload instanceof Upload) {
      this.deleteFromServer(uploadIndex);
    } else {
      this.deletePlaceholder(uploadIndex);
    }
  }

  deleteUpload(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    this.renderer.deleteFile(uploadIndex);
    delete this.uploads[uploadIndex];
    this.checkDropHint();

    const { onDelete } = this.callbacks;
    if (onDelete) {
      onDelete(upload);
    }
  }

  deleteFromServer(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (!(upload instanceof Upload)) {
      return;
    }

    const { url } = upload;

    if (!url) {
      return;
    }

    const xhr = new window.XMLHttpRequest();
    xhr.open("DELETE", url);

    xhr.onload = (): void => {
      if (xhr.status === 204) {
        this.deleteUpload(uploadIndex);
      } else {
        this.renderer.setDeleteFailed(uploadIndex);
      }
    };
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.send(null);
  }

  deletePlaceholder(uploadIndex: number): void {
    this.deleteUpload(uploadIndex);
    this.updatePlaceholderInput();
  }

  handleCancel(uploadIndex: number): void {
    const upload = this.uploads[uploadIndex];

    if (upload instanceof Upload) {
      void upload.abort(true);

      this.deleteUpload(uploadIndex);
    }
  }

  initDropArea(container: Element): void {
    new DropArea({
      container,
      onUploadFiles: this.uploadFiles
    });
  }

  checkDropHint(): void {
    if (!this.supportDropArea) {
      return;
    }

    const nonEmptyUploads = this.uploads.filter(e => e);

    if (nonEmptyUploads.length === 0) {
      this.renderer.renderDropHint();
    } else {
      this.renderer.removeDropHint();
    }
  }

  updatePlaceholderInput(): void {
    const placeholdersInfo = this.uploads.filter(
      upload => !(upload instanceof Upload) && upload.placeholder
    ) as UploadedFile[];

    const input = findInput(
      this.form,
      getPlaceholderFieldName(this.fieldName, this.prefix),
      this.prefix
    );
    if (input) {
      input.value = JSON.stringify(placeholdersInfo);
    }
  }
}

export default UploadFile;
