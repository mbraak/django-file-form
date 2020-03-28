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

The project is hosted on [github](https://github.com/mbraak/django-file-form).

Works with Django 2.0 - 3.0. Also with Python 3.6 - 3.8

Older versions:
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
  PlaceholderUploadedFile('manage.py')
]
```

You can also add options `size` and `file_id` to specify file size if the file does not exist locally, and an unique ID of the file, respectively.

```python
initial['my_field'] = [
  PlaceholderUploadedFile('manage.py', size=12394, file_id=my_file.pk)
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

## initUploadFields

Signature of `initUploadFields` is:

```
initUploadFields(formDomElement, options);
```

* `formDomElement` (required); e.g. `document.getElementById("example-form")`
* options (optional)
  * `prefix` : set this if the Django form has a prefix; default is empty
  * `skipRequired` : don't set the `required` field of the file input; default is `false`
  * `supportDropArea` : add a drop area; default is `true`

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

## Changelog

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
