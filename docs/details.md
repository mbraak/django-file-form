# Details

## Include hidden fields

Make sure that hidden form fields are included:

```python
{% for hidden in form.hidden_fields %}
    {{ hidden }}
{% endfor %}
```

NB: it's possible that the hidden fields are already included; for example if you use `form.as_p`. Do not include the hidden fields twice.

Also see the testproject in the repository.

## Temp upload dir must exist

Make sure the `FILE_FORM_UPLOAD_DIR` directory exists.

```python
temp_upload_dir = os.path.join(settings.MEDIA_ROOT,  settings.FILE_FORM_UPLOAD_DIR)

if not os.path.exists(temp_upload_dir):
  os.mkdir(temp_upload_dir)
```

## Adding placeholder files

If you have used `django-file-form` to upload files, potentially have saved the files elsewhere, but would like to use `django-file-form` to edit (remove or replace) the original uploaded files and append new files, you can add information about the original uploaded files as placeholders to the `UploadedFileField`. More specifically, you can initialize your field with one or more `PlaceholderUploadedFile` as follows:

```python
from django_file_form.models import PlaceholderUploadedFile

initial['my_field'] = [
  PlaceholderUploadedFile('testfile1.png')
]
```

You can also add options `size` and `file_id` to specify file size if the file does not exist locally, and an unique ID of the file, respectively.

```python
initial['my_field'] = [
  PlaceholderUploadedFile('testfile1.png', size=12394, file_id=my_file.pk)
]
```

The placeholder file will be listed, and will either be kept intact, or be removed. When you save the form, you will have to handle the placeholders as follows:

```python
for f in self.cleaned_data['my_field']:
    if f.is_placeholder:
        # do nothing, or something with f.name or f.file_id
        continue
    # handle newly uploaded files as usual

# remove existing files if the placeholders are deleted
# ...
```

## Upload directly to AWS S3

`django-file-form` supports upload directly to AWS S3 compatible storages. The files will be uploaded
by clients directly to S3 through AJAX operations and return to the backend as `File` objects
with [`S3Boto3Storage`](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html).

Required packages: `boto3` and `django_storages`.

To use this method, you will first need to make sure your S3 bucket is configured
to [allow upload to bucket directly](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html),
[allow `PUT` method, and expose `ETag` header](https://uppy.io/docs/aws-s3-multipart/#S3-Bucket-Configuration).
You then need to define the following variables in `settings`

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_STORAGE_BUCKET_NAME
AWS_S3_REGION_NAME (optional)
AWS_S3_SIGNATURE_VERSION (optional)
AWS_S3_ENDPOINT_URL (optional)
```

or through environment variables with the same names as described
in [`django-storages` documentation](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html).

If you are using `django-csp` for setting the Content Security Policy, then the following CORS settings are also needed in `settings`

```
CSP_DEFAULT_SRC = ("'none'",)
CSP_STYLE_SRC = ("'self'")
CSP_SCRIPT_SRC = ("'self'",)
CSP_FONT_SRC = ("'self'")
CSP_IMG_SRC = ("'self'",)
CSP_CONNECT_SRC = ("'self'", AWS_S3_ENDPOINT_URL)
```

where `AWS_S3_ENDPOINT_URL` is the AWS endpoint defined above.

Finally, you will need to define

```
s3_upload_dir = "user_or_form_specific_id"
```

in the form class or passed parameter `s3_upload_dir` to the constructor of the
form to inform the frontend to use the AJAX uploader for S3. The files will be
uploaded to

```
${FILE_FORM_UPLOAD_DIR}/${s3_upload_dir}/
```

in the specified S3 bucket, where `s3_upload_dir` can be empty or a directory
specific to user or form to avoid conflicts on the AWS side. If the object
already exists in the S3 bucket, a random string will be added to filename.

After form submission, the files will be returned as customized `S3Boto3StorageFile`
objects with `S3Boto3Storage` as its underlying storage. The objects will have attributes
`is_s3direct=True`, `is_placeholder=False`, and `original_name` which is the
name of the file that was uploaded that can be different from the basename
of the object on S3 (`f.name`). Reading from these objects will download the files
from S3.

## Accept attribute

You can add an accept attribute to the file input using the `accept` parameter on `UploadedFileField`:

```
file = UploadedFileField(accept='image/*,.pdf')
```

## Additional file metadata

If you want to add and maintain additional metadata such as short descriptions and
categories of uploaded files, you can use the `.metadata` field of uploaded files.
More specifically, the AJAX uploader has a hidden field called `metadata` (with form
specific prefix) with its `data` being the `JSON.dump`ed meta data of all files. The
data should be in the format of

```
{
  'filename1': value1,
  'filename2': value2
}
```

To add metadata to uploaded files, you will need to listen to events triggered after the
additional and removal of file list (see "Javascript events" for details) to add your own
widgets and event handlers to update the `data` of this hidden field.

Upon form submission, `django-file-form` retrieves the data and assign them to returned file
objects with matching filename (could be of placeholder and other types) as `f.metadata`.

## Cache

Django-file-form uses the Django cache for storing data while uploading files.

- Only meta data of the file is stored (including the upload progress), not contents of the file.
- The default cache timeout is 24 hours. An upload will fail if it takes longer than that.
- The timeout is configurable using the `FILE_FORM_CACHE_TIMEOUT` setting. See the 'Python settings' section.
- The cache backed is configurable using `FILE_FORM_CACHE`.

## Disabled property

Make the input disabled by setting the `disabled` attribute.

```python
class ExampleForm(FileFormMixin, Form):
    input_file = UploadedFileField(disabled=True)
```

Also possibe: make the field disabled in the constructor.

```python
def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)

    self.fields["input_file"].disabled = True
```

## Production

### Local-memory caching

Don't use local-memory caching in your Django configuration if you use a multi process WSGI server. It will break file uploads, because file uploads use the Django cache and might hit different WSGI processes.

- The default cache option in Django is local-memory caching.
- Most WSGI servers are multi process.

### Maximum size of uploaded chunk

Files are uploaded in chunks; the default size of a chunk is 2.5 MB. Your production setup must allow for uploads of this size.

- It's possible that you use a reverse proxy server that has a maximum file upload size. E.g. Nginx has the `client_max_body_size` option.
- Django has the `DATA_UPLOAD_MAX_MEMORY_SIZE` option, which also limits the upload size.
- You can change the maximum chunk size with the `chunkSize` option in Javascript. See the 'javascript options' section in this documentation.
