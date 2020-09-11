[![Build Status](https://travis-ci.org/mbraak/django-file-form.svg?branch=master)](https://travis-ci.org/mbraak/django-file-form) [![Version](https://badge.fury.io/py/django-file-form.svg)](https://pypi.python.org/pypi/django-file-form/)

[![Coverage Status](https://img.shields.io/coveralls/mbraak/django-file-form.svg)](https://coveralls.io/r/mbraak/django-file-form?branch=master)
[![Requirements Status](https://requires.io/github/mbraak/django-file-form/requirements.svg?branch=master)](https://requires.io/github/mbraak/django-file-form/requirements/?branch=master)

[![License](https://img.shields.io/pypi/l/django-file-form.svg)](https://pypi.python.org/pypi/django-file-form/)

# Django file form

**Django-file-form** helps you to write forms with a pretty ajax upload.

Features:

* You can easily add an ajax file-upload to a form.
* The ajax upload works the same as an html upload.
    * This means that you don't have to change your code to support ajax upload.
* Supports single and multiple file upload.
* Supports edition of uploaded files.
* Supports upload directly to AWS S3 compatible storages.
* Supports frontend events for the addition and removal of files.
* Supports addition of arbitrary file meta data and related widgets.

The project is hosted on [github](https://github.com/mbraak/django-file-form).

Works with Django 2.2 - 3.1. Also with Python 3.6 - 3.8

Older versions:
* 2.2 supports Django 2.0 and 2.2
* 1.0.1 uses fine uploader for the javascript part
* 0.5.0 supports Django 1.11 and Python 2.

Version 2.0 has changed: see 'Upgrade from version 1.0' below, if you're upgrading from version 1.0 (or lower).

## Usage

**1 Install django-file-form**

```
pip install django-file-form
```

**2 Add the apps to your INSTALLED_APPS**

You must include 'django_file_form'

```python
INSTALLED_APPS = [
    'django_file_form',
]
```

**3 Add the app to your urls**

In this example we use the url **upload/**. You can use a different url if you like.

```python
urlpatterns = patterns(
    '',
    url(r'^upload/', include('django_file_form.urls')),
)
```

**4 Add FileFormMixin to your form**

```python
from django_file_form.forms import FileFormMixin

class ExampleForm(FileFormMixin, forms.Form):
    pass
```

**5 Add a UploadedFileField**

```python
from django_file_form.forms import FileFormMixin, UploadedFileField

class ExampleForm(FileFormMixin, forms.Form):
    input_file = UploadedFileField()
```

Import and use `MultipleUploadedFileField` if you intent to add multiple files.

**6 Include javascript and css in your template**

```js
<script src="{% static "file_form/file_form.js" %}"></script>
<link rel="stylesheet" href="{% static "file_form/file_form.css" %}">
```

There is also an uncompressed javascript version: `file_form/file_form.debug.js`.

**7 Call the initUploadFields javascript function**

```html
<form id="example-form" method="POST" enctype="multipart/form-data">
    {% csrf_token %}
    {{ form }}
</form>

<script>
   initUploadFields(
      document.getElementById("example-form")
   );
</script>
```

If your form has a prefix, then call `initUploadFields` as follows:

```js
  // for example, with prefix 'abc'
  initUploadFields(
    document.getElementById("example-form"),
    { prefix: 'abc' }
  );
```

See the [Django documentation](https://docs.djangoproject.com/en/2.1/ref/forms/api/#prefixes-for-forms) for more information about form prefixes.

**8 Handle uploaded files**

```python
class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def form_valid(self, form):
        input_file = form.cleaned_data['input_file']

        return super(ExampleFormView, self).form_valid(form)
```

**9 Delete temporary files**

```python
class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def form_valid(self, form):
        input_file = form.cleaned_data['input_file']

        form.delete_temporary_files()

        return super(ExampleFormView, self).form_valid(form)
```

## Details

**1 Include hidden fields**

Make sure that hidden form fields are included:

```python
{% for hidden in form.hidden_fields %}
    {{ hidden }}
{% endfor %}
```

NB: it's possible that the hidden fields are already included; for example if you use ``form.as_p``. Do not include the hidden fields twice.

Also see the testproject in the repository.

**2 Temp upload dir must exist**

Make sure the `FILE_FORM_UPLOAD_DIR` directory exists.

```python
temp_upload_dir = os.path.join(settings.MEDIA_ROOT,  settings.FILE_FORM_UPLOAD_DIR)

if not os.path.exists(temp_upload_dir):
  os.mkdir(temp_upload_dir)
```

**3 Adding placeholder files**

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

**4 Upload directly to AWS S3**

`django-file-form` supports upload directly to AWS S3 compatible storages. The files will be uploaded
by clients directly to S3 through AJAX operations and return to the backend as `File` objects
with [`S3Boto3Storage`](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html).

To use this method, you will first need to make sure your S3 bucket is configured
to [allow upload to bucket directly](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html),
[allow `PUT` method, and expose `ETag` header](https://uppy.io/docs/aws-s3-multipart/#S3-Bucket-Configuration).
You then need to define the following variables in `settings`

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_STORAGE_BUCKET_NAME
AWS_S3_REGION_NAME
AWS_S3_ENDPOINT_URL
```

or through environment variables with the same names as described
in [`django-storage` documentation](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html).

The following CORS settings are also needed in `settings`
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
````

in the specified S3 bucket, where `s3_upload_dir` can be empty or a directory
specific to user or form to avoid conflicts on the AWS side. If the object
already exists in the S3 bucket, a random string will be added to filename.

After form submission, the files will be returned as customized `S3Boto3StorageFile`
objects  with `S3Boto3Storage` as its underlying storage. The objects will have attributes
`is_s3direct=True`,  `is_placeholder=False`, and `original_name` which is the
name of the file that was uploaded that can be different from the basename
of the object on S3 (`f.name`). Reading from these objects will download the files
from S3.

**5 Accept attribute**

You can add an accept attribute to the file input using the `accept` parameter on `UploadedFileField`:

```
file = UploadedFileField(accept='image/*,.pdf')
```

**6 Additional file metadata**

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


## Upgrade from version 1.0 (to 2.0)

* Add reference to file_form/file_form.css:
  * `<link rel="stylesheet" href="{% static "file_form/file_form.css" %}">`
* Remove `django_file_form.ajaxuploader` from `INSTALLED_APPS` in your settings
* Remove reference to `ajaxuploader/js/fileuploader.js` in your template
* Remove reference to `ajaxuploader/css/fileuploader.css` in your template
* You don't have to include jquery; the fileuploader doesn't use it
* The setting `FILE_FORM_UPLOAD_BACKEND` is removed
* If you use custom css, you might have to change it.
  * The html uses the prefix `dff` now.

## Settings

Settings in `settings.py`:

* **FILE_FORM_MUST_LOGIN** (True / False):
  * Must the user be logged in to upload a file.
  * The default is `False`.

* **FILE_FORM_UPLOAD_DIR** (string):
  * The directory for the temporary uploads.
  * The setting is relative to `MEDIA_ROOT`.
  * The default is `temp_uploads`.

* **FILE_FORM_MAX_FILE_SIZE** (int)
  * Maximum upload size in bytes
  * Default is 4GB

* **FILE_FORM_FILE_STORAGE** (string):
  * Dotted path to the class that is used to store temporary uploads.
  * The default is `django.core.files.storage.FileSystemStorage`.
  * Note that files will be uploaded to the local file system first regardless. This storage backend will be used only for fully uploaded files that are then passed back to the form when it's submitted.

* **FILE_FORM_CACHE** (string):
  * Name of a cache backend defined in `settings.CACHES`.
  * The default is Django's `default` cache.
  * The cache is used to store data about files while they are being uploaded. If the default might be cleared while a file upload is in progress then using a different backend like django's database cache might be more appropriate. Note that `cache.clear()` will clear the whole cache at a specified `LOCATION` regardless what the `KEY_PREFIX` is.

## initUploadFields

Signature of `initUploadFields` is:

```
initUploadFields(formDomElement, options);
```

* `formDomElement` (required); e.g. `document.getElementById("example-form")`
* options (optional)
  * `callbacks`: callbacks for things like upload progress and errors.
  * `chunkSize`: the maximum size of an upload. Default is 2.5 MB.
    * Note that Django limits the size of a request. See https://docs.djangoproject.com/en/3.1/ref/settings/#data-upload-max-memory-size.
  * `prefix` : set this if the Django form has a prefix; default is empty
  * `retryDelays`: set retry delays
    * Also see `https://github.com/tus/tus-js-client#tusdefaultoptions`
    * Default is `[0, 1000, 3000, 5000]`
  * `skipRequired` : don't set the `required` field of the file input; default is `false`
  * `supportDropArea` : add a drop area; default is `true`

The callbacks are:
  * `onDelete`
    * called when file is deleted
    * Signature of callback is `function(upload)`
  * `onError`:
    * called when an upload error occurs
    * Signature of callback is `function(error, upload)`
      * `error`: javascript Error
  * `onProgress`:
    * Called each time when progress information is available.
    * Signature of callback is `function(bytesUploaded, bytesTotal, upload)`
  * `onSuccess`:
    * Called when file upload is done.
    * Signature of callback is `function(upload)`

The callbacks receive an `upload` parameter which is [this class](https://github.com/tus/tus-js-client#new-tusuploadfile-options).

Examples:

```js
initUploadFields(
  document.getElementById("example-form")
);
```

```js
initUploadFields(
  document.getElementById("example-form"),
  {
    prefix: "example",
    skipRequired: true,
    supportDropArea: true
  }
);
```

## Form sets

You can also use a form set instead of a form. In that case `initFormSet` (instead of `initUploadFields`)
in your javascript code.

```
initFormSet(form_element, options)
```

```js
initFormSet(
  document.getElementById("example-form"),
  { prefix: "form" }
);
```

* Note that the default form set prefix is `form`.
* Also see the `testproject` directory in the repository for an example.

## Translate

To update a translation or add new language

Fork this repo as usual

```shell
# enter in project folder
cd django-file-form

# create virtualenv (example using pipenv)
pipenv install --python=3 -r testproject/requirements.txt

# enter in venv shell
pipenv shell

# update po file for your language
django-admin makemessages -l fr
```

You can now edit generated po file and commit your changes as usual

## Javascript events

There are javascript events for adding and removing an upload. The events are `addUpload`, `removeUpload`,
and `uploadComplete`.

```js
import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

eventEmitter.on('addUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});

eventEmitter.on('removeUpload', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});

eventEmitter.on('uploadComplete', ({ element, fieldName, fileName, metaDataField, upload }) => {
  //
});


initUploadFields(
    document.getElementById("example-form"),
    {
      eventEmitter,
    }
);
```

* You need the `eventemitter3` package to use this.
* The `metaDataField` is the metadata input. See 'Additional file metadata' in this document.
* This api is experimental.

## Changelog
* **development version**
  * Issue #324: get placeholder file for UploadWidget (thanks to Shrikrishna Singh)
  * Issue #330: allow upload directly to S3 compatible storages (thanks to Bo Peng)
  * Issue #331: fix error in deleting files (thanks to Bo Peng)
  * Issue #333: replace existing uploaded file with the same name (thanks to Bo Peng)
  * Issue #341: add javascript events
  * Issue #346: allow define s3_upload_dir in form class (thanks to Bo Peng)

* **3.0.1 (4 september 2020)**
  * Issue #347: add chunkSize parameter to avoid request error in Django

* **3.0.0 (6 august 2020)**
  * Issue #320: fix UploadMultipleWidget to return correct placeholder files (thanks to Shrikrishna Singh)
  * Issue #325: support Django 3.1

* **2.2.0 (22 july 2020)**
  * Issue #315: file is not removed after form error
  * Issue #313: allow using custom storage and custom cache (thanks to Balazs Endresz)

* **2.1.3 (20 june 2020)**
  * Issue #304: rewrite frontend in typescript
  * Issue #305: don't change migration when setting changes (thanks to Lionqueen94)
  * Issue #307: add French translations; also make translations discoverable by makemessages (thanks to Simon Maillard)

* **2.1.2 (20 april 2020)**
  * Issue #298: directory support for drop area
  * Issue #300: add migration so makemigrations will not create one (thanks to Lionqueen94)

* **2.1.1 (7 april 2020)**
  * Issue #290: add javascript callbacks (thanks to Peter Dekkers)
  * Issue #296: fix progress bar
  * Issue #297: add retry delays

* **2.1.0 (28 march 2020)**
  * Issue #266: allow relative `FILE_FORM_UPLOAD_DIR` setting (thanks to Bo Peng)
  * Issue #267: add drop area (thanks to Bo Peng)
  * Issue #275: show size of uploaded files (thanks to Bo Peng)
  * Issue #278: allow the addition of placeholder files (thanks to Bo Peng)
  * Issue #280: remove option `FILE_FORM_FILE_STORAGE`

* **2.0.3 (15 february 2020)**
  * Issue #237: using with form set (thanks to Juan Carlos Carvajal)
  * Issue #259: include uncompressed js
  * Issue #260: correctly use formset prefix (thanks to Gzuba)
  * Issue #261: fix default for `FILE_FORM_UPLOAD_DIR` (thanks to Gzuba)

* **2.0.2 (14 january 2020)**
  * Issue #247: support form wizard (thanks to Lionqueen94)
  * Issue #251: delete after submit

* **2.0.1 (6 january 2020)**
  * Issue #240: add empty dff files div (thanks to Lionqueen94)
  * Issue #241: Csp compliance (thanks to Lionqueen94)

* **2.0 (30 december 2019)**
  * Use tus instead of fine uploader

* **1.0 (5 december 2019)**
  * Drop support for Python 2 and Django < 2
  * Issue #217: update fine uploader
  * Issue #219: use `Selenium` for all tests
  * Issue #222: use `pathlib2` (instead of pathlib)
  * Issue #235: support Django 3.0

* **0.4.2 (3 March 2019)**
  * Issue #207: support form prefixes (thanks to Iw108)
  * Issue #201: fix multiple file upload without ajax (thanks to Lionqueen94)

* **0.4.1 (5 January 2019)**
  * Issue #194: correctly call `is_authenticated` (thanks to Dureba)

* **0.4.0 (3 August 2018)**
  * Support Django 2.1 and Python 3.7
  * Issue #173: add i18n to upload widget (thanks to Arman Roomana)

* **0.3.0 (6 December 2017)**
  * Support Django 2.0
