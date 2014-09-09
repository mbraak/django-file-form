[![Build Status](https://travis-ci.org/mbraak/django-file-form.svg?branch=master)](https://travis-ci.org/mbraak/django-file-form) [![Version](https://pypip.in/version/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/) [![Development Status](https://pypip.in/status/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/)

[![Coverage Status](https://img.shields.io/coveralls/mbraak/django-file-form.svg)](https://coveralls.io/r/mbraak/django-file-form?branch=master) [![Downloads](https://pypip.in/d/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/) [![Format](https://pypip.in/format/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/) [![Requirements Status](https://requires.io/github/mbraak/django-file-form/requirements.png?branch=master)](https://requires.io/github/mbraak/django-file-form/requirements/?branch=master)

[![License](https://pypip.in/license/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/) [![Supported Python versions](https://pypip.in/py_versions/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/) [![Supported Python implementations](https://pypip.in/implementation/django-file-form/badge.svg)](https://pypi.python.org/pypi/django-file-form/)

#Django file form

**Django-file-form** helps you to write forms with a pretty ajax upload.

Features:

* You can easily add an ajax file-upload to a form.
* The ajax upload works the same as an html upload.
    * This means that you don't have to change your code to support ajax upload.
* Supports single and multiple file upload.

The project is hosted on [github](https://github.com/mbraak/django-file-form).

Works with Django 1.4 - 1.7.

## Usage

**1 Install django-file-form**

```
pip install django-file-form
```

**2 Add the app to your INSTALLED_APPS**

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

**6 Include fileuploader.js and file_form.js in your template**

```html
 <script src="{{ STATIC_URL }}ajaxuploader/js/fileuploader.js"></script>
 <script src="{{ STATIC_URL }}file_form/file_form.js"></script>
```

By the way, you must also include jquery.

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

		self.delete_temporary_files()

    	return super(ExampleFormView, self).form_valid(form)
```

Also see the testproject in the repository.
