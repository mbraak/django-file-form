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

Works with Django 2.0 - 3.0. Also with Python 3.6 - 3.7

Note that version 0.5.0 also supports Django 1.11.

## Usage

**1 Install django-file-form**

```
pip install django-file-form
```

**2 Add the apps to your INSTALLED_APPS**

You must include 'django_file_form' and 'django_file_form.ajaxuploader'

```python
INSTALLED_APPS = [
    'django_file_form',
    'django_file_form.ajaxuploader',
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

**6 Include javascript and css in your template**

```html
<script src="{% static "ajaxuploader/js/fileuploader.js" %}"></script>
<script src="{% static "file_form/file_form.js" %}"></script>
<link rel="stylesheet" href="{% static "ajaxuploader/css/fileuploader.css" %}">
```

You must also include jquery

**7 Call the initUploadFields javascript function**

```html
<form id="example-form" method="POST" enctype="multipart/form-data">
    {% csrf_token %}
    {{ form }}
</form>

<script>
   $(function() {
       initUploadFields($('#example-form'));
   });
</script>
```

If your form has a prefix, then call `initUploadFields` as follows:

```js
  // for example, with prefix 'abc'
  initUploadFields($('#example-form'), { prefix: 'abc' });
```

See the [Django documentation](https://docs.djangoproject.com/en/2.1/ref/forms/api/#prefixes-for-forms) for more information about form prefixes.

**8 Include the upload_template.html in your template**

```html
{% include 'django_file_form/upload_template.html' %}
```

**9 Handle uploaded files**

```python
class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def form_valid(self, form):
        input_file = form.cleaned_data['input_file']

        return super(ExampleFormView, self).form_valid(form)
```

**10 Delete temporary files**

```python
class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def form_valid(self, form):
        input_file = form.cleaned_data['input_file']

        form.delete_temporary_files()

        return super(ExampleFormView, self).form_valid(form)
```

Also see the testproject in the repository.

## Settings

Settings in `settings.py`:

* **FILE_FORM_MUST_LOGIN** (True / False):
  * Must the user be logged in to upload a file.
  * The default is `False`.

* **FILE_FORM_UPLOAD_DIR** (string):
  * The directory for the temporary uploads.
  * The setting is not full path, but must be a subdirectory of `MEDIA_ROOT`.
  * The default is `temp_uploads`.

* **FILE_FORM_FILE_STORAGE** (string):
  * The class that is used to store the temporary uploads.
  * The default is `django.core.files.storage.FileSystemStorage`.

* **FILE_FORM_UPLOAD_BACKEND** (string)
  * The class that is used for the upload backend.
  * This makes it possible to write your upload backend.
  * The default is `django_file_form.uploader.FileFormUploadBackend`.


## Changelog

* **1.0 (5 december 2019)**
  * Issue #217: update fine uploader
  * Issue #219: use Selenium for all tests
  * Issue #222: use pathlib2 (instead of pathlib)
  * Issue #235: support Django 3.0

* **0.5.0 (3 April 2019)**
  * Issue #208: skip install of pathlib for python >= 3.4 (thanks to Simon Maillard)
  * Issue #212: support Django 2.2

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
