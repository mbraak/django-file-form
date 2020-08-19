// The following code is adpated from https://github.com/transloadit/uppy/blob/master/packages/%40uppy/aws-s3-multipart/src/MultipartUploader.js
// which is released under a MIT License (https://github.com/transloadit/uppy/blob/master/LICENSE)

const MB = 1024 * 1024

const defaultOptions = {
  limit: 1,
  getChunkSize (file:any) {
    return Math.ceil(file.size / 10000)
  },
  onStart () {},
  onProgress () {},
  onPartComplete () {},
  onSuccess () {},
  onError (err:any) {
    throw err
  },
  createMultipartUpload(file:any, s3UploadDir:string){
      // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
    var csrftoken = (<HTMLInputElement>document.getElementsByName('csrfmiddlewaretoken')[0]).value;
    var headers = new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      "X-CSRFToken": csrftoken
    })
    return fetch('s3upload/', {
      method: 'post',
      headers: headers,
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        s3UploadDir: s3UploadDir
      })
    } ).then((response) => {
      return response.json()
    }).then((data)=>{
      console.log("createMultipartUpload ",data)
      return data
    })
   },
  listParts({ key, uploadId }:{key:any,uploadId:any}){
        const filename=encodeURIComponent(key)
        const uploadIdEnc = encodeURIComponent(uploadId)
          return fetch('s3upload/'+uploadIdEnc+"?key="+filename,{
            method: 'get'
          }).then((response)=>{
          return response.json()
        }).then((data)=>{
          console.log("listParts ",data)
          return data["parts"]
        })
      },
  prepareUploadPart({ key, uploadId, number }:{key:any,uploadId:any,number:any}){
        const filename = encodeURIComponent(key)
         // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
     var csrftoken = (<HTMLInputElement>document.getElementsByName('csrfmiddlewaretoken')[0]).value;
     var headers = new Headers({ "X-CSRFToken": csrftoken})
        return fetch('s3upload/'+uploadId+"/"+parseInt(number)+"?key="+filename,{
            method: 'get',
            headers: headers
        }).then((response)=>{
          return response.json()
        }).then((data)=>{
          console.log("prepareUploadPart ",data)
          return data
        })

      },
  completeMultipartUpload({ key, uploadId, parts }:{ key:any, uploadId:any, parts:any }){
      const filename = encodeURIComponent(key)
      const uploadIdEnc = encodeURIComponent(uploadId)
      // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
      var csrftoken = (<HTMLInputElement>document.getElementsByName('csrfmiddlewaretoken')[0]).value;
      var headers = new Headers({
        "X-CSRFToken": csrftoken
      })
      return fetch('s3upload/'+uploadIdEnc+"/complete?key="+filename,{
            method: 'post',
            headers: headers,
            body: JSON.stringify({
              parts: parts
           })
        }).then((response)=>{
          return response.json()
        }).then((data)=>{
          console.log("Complete multi upload ",data)
          return data
        })

      },
  abortMultipartUpload({uploadId}:{uploadId:any}){
      // const filename = encodeURIComponent(key)
      const uploadIdEnc = encodeURIComponent(uploadId)
        // var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
      var csrftoken = (<HTMLInputElement>document.getElementsByName('csrfmiddlewaretoken')[0]).value;
      var headers = new Headers({
        "X-CSRFToken": csrftoken
      })
      return fetch('s3upload/'+uploadIdEnc+"/",{
            method: 'delete',
            headers: headers,
        }).then((response)=>{
          return response.json()
        }).then((data)=>{
          return data
        })
    }
}

function remove (arr:any, el:any) {
  const i = arr.indexOf(el)
  if (i !== -1) arr.splice(i, 1)
}

class S3Uploader {
  createdPromise: any;
  uploading: any[];
  chunkState: any[];
  chunks: any[];
  isPaused: boolean;
  parts: any[];
  uploadId: any;
  key: any;
  file: any;
  options: any;
  s3UploadDir: string;
  constructor (file:any, options:any) {
    this.options = {
      ...defaultOptions,
      ...options
    }
    // Use default `getChunkSize` if it was null or something
    if (!this.options.getChunkSize) {
      this.options.getChunkSize = defaultOptions.getChunkSize
    }
   
    this.file = file

    this.key = this.options.key || null
    this.uploadId = this.options.uploadId || null
    this.parts = []
    this.s3UploadDir = this.options.s3UploadDir

    // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
    // upload was created already. That also ensures that the sequencing is right
    // (so the `OP` definitely happens if the upload is created).
    //
    // This mostly exists to make `_abortUpload` work well: only sending the abort request if
    // the upload was already created, and if the createMultipartUpload request is still in flight,
    // aborting it immediately after it finishes.
    this.createdPromise = Promise.reject() // eslint-disable-line prefer-promise-reject-errors
    this.isPaused = false
    this.chunks = []
    this.chunkState = []
    this.uploading = []

    this._initChunks()

    this.createdPromise.catch(() => {}) // silence uncaught rejection warning
  }

  

  _initChunks () {
    const chunks = []
    const desiredChunkSize = this.options.getChunkSize(this.file)
    // at least 5MB per request, at most 10k requests
    const minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000))
    const chunkSize = Math.max(desiredChunkSize, minChunkSize)

    for (let i = 0; i < this.file.size; i += chunkSize) {
      const end = Math.min(this.file.size, i + chunkSize)
      chunks.push(this.file.slice(i, end))
    }

    this.chunks = chunks
    this.chunkState = chunks.map(() => ({
      uploaded: 0,
      busy: false,
      done: false
    }))
  }

  _createUpload () {
    this.createdPromise = new Promise((resolve)=>resolve()).then(() =>
      this.options.createMultipartUpload(this.file, this.s3UploadDir)
    )
    return this.createdPromise.then((result:any) => {
      const valid = typeof result === 'object' && result &&
        typeof result.uploadId === 'string' &&
        typeof result.key === 'string'
      if (!valid) {
        throw new TypeError('AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`.')
      }

      this.key = result.key
      this.uploadId = result.uploadId

      this.options.onStart(result)
      this._uploadParts()
    }).catch((err:any) => {
      this._onError(err)
    })
  }

  _resumeUpload () {
    return Promise.resolve().then(() =>
      this.options.listParts({
        uploadId: this.uploadId,
        key: this.key
      })
    ).then((parts) => {
      parts.forEach((part:any) => {
        const i = part.PartNumber - 1
        this.chunkState[i] = {
          uploaded: part.Size,
          etag: part.ETag,
          done: true
        }

        // Only add if we did not yet know about this part.
        if (!this.parts.some((p) => p.PartNumber === part.PartNumber)) {
          this.parts.push({
            PartNumber: part.PartNumber,
            ETag: part.ETag
          })
        }
      })
      this._uploadParts()
    }).catch((err) => {
      this._onError(err)
    })
  }

  _uploadParts () {
    if (this.isPaused) return

    const need = this.options.limit - this.uploading.length
    if (need === 0) return

    // All parts are uploaded.
    if (this.chunkState.every((state) => state.done)) {
      this._completeUpload()
      return
    }

    const candidates = []
    for (let i = 0; i < this.chunkState.length; i++) {
      const state = this.chunkState[i]
      if (state.done || state.busy) continue

      candidates.push(i)
      if (candidates.length >= need) {
        break
      }
    }

    candidates.forEach((index) => {
      this._uploadPart(index)
    })
  }

  _uploadPart (index:number) {
    const body = this.chunks[index]
    this.chunkState[index].busy = true

    return Promise.resolve().then(() =>
      this.options.prepareUploadPart({
        key: this.key,
        uploadId: this.uploadId,
        body,
        number: index + 1
      })
    ).then((result) => {
      const valid = typeof result === 'object' && result &&
        typeof result.url === 'string'
      if (!valid) {
        throw new TypeError('AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`.')
      }
      return result
    }).then(({ url, headers }) => {
      this._uploadPartBytes(index, url, headers)
    }, (err) => {
      this._onError(err)
    })
  }

  _onPartProgress (index:number, sent:any) {
    this.chunkState[index].uploaded = sent

    const totalUploaded = this.chunkState.reduce((n, c) => n + c.uploaded, 0)
    this.options.onProgress(totalUploaded, this.file.size)
  }

  _onPartComplete (index:number, etag:string) {
    this.chunkState[index].etag = etag
    this.chunkState[index].done = true

    const part = {
      PartNumber: index + 1,
      ETag: etag
    }
    this.parts.push(part)

    this.options.onPartComplete(part)

    this._uploadParts()
  }

  _uploadPartBytes (index:number, url:string, headers:any[]) {
    const body = this.chunks[index]
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    if (headers) {
      Object.keys(headers).map((key:any) => {
        xhr.setRequestHeader(key, headers[key])
      })
    }
    xhr.responseType = 'text'

    this.uploading.push(xhr)

    xhr.upload.addEventListener('progress', (ev) => {
      if (!ev.lengthComputable) return

      this._onPartProgress(index, ev.loaded)
    })

    xhr.addEventListener('abort', (ev) => {
      remove(this.uploading, ev.target)
      this.chunkState[index].busy = false
    })

    xhr.addEventListener('load', (ev:any) => {
      remove(this.uploading, ev.target)
      this.chunkState[index].busy = false

      if (ev.target.status < 200 || ev.target.status >= 300) {
        this._onError(new Error('Non 2xx'))
        return
      }

      this._onPartProgress(index, body.size)

      // NOTE This must be allowed by CORS.
      const etag = ev.target.getResponseHeader('ETag')
      if (etag === null) {
        this._onError(new Error('AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. Seee https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions.'))
        return
      }

      this._onPartComplete(index, etag)
    })

    xhr.addEventListener('error', (ev) => {
      remove(this.uploading, ev.target)
      this.chunkState[index].busy = false
      const error = new Error('Unknown error')
      // error.source = ev.target
      this._onError(error)
    })
    xhr.send(body)
  }

  _completeUpload () {
    // Parts may not have completed uploading in sorted order, if limit > 1.
    this.parts.sort((a, b) => a.PartNumber - b.PartNumber)

    return Promise.resolve().then(() =>
      this.options.completeMultipartUpload({
        key: this.key,
        uploadId: this.uploadId,
        parts: this.parts
      })
    ).then((result) => {
      this.options.onSuccess(result)
    }, (err) => {
      this._onError(err)
    })
  }

  _abortUpload () {
    this.uploading.slice().forEach(xhr => {
      xhr.abort()
    })
    this.createdPromise.then(() => {
      this.options.abortMultipartUpload({
        uploadId: this.uploadId
      })
    }, () => {
      // if the creation failed we do not need to abort
    })
    this.uploading = []
  }

  _onError (err:any) {
    this.options.onError(err)
  }

  start () {
    this.isPaused = false
    if (this.uploadId) {
      this._resumeUpload()
    } else {
      this._createUpload()
    }
  }

  pause () {
    const inProgress = this.uploading.slice()
    inProgress.forEach((xhr) => {
      xhr.abort()
    })
    this.isPaused = true
  }

  abort (opts:any = {}) {
    const really = opts.really || false

    if (!really) return this.pause()

    this._abortUpload()
  }
}

export default S3Uploader