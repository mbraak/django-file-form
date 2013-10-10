[![Build Status](https://travis-ci.org/mbraak/django-file-form.png?branch=master)](https://travis-ci.org/mbraak/django-file-form)

[![Coverage Status](https://coveralls.io/repos/mbraak/django-file-form/badge.png?branch=master)](https://coveralls.io/r/mbraak/django-file-form?branch=master)

[![Downloads](https://pypip.in/d/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/)

[![Downloads](https://pypip.in/v/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/)

#Django file form

**Django-file-form** helps you to write forms with a pretty ajax upload.

Features:

* You can easily add an ajax file-upload to a form.
* The ajax upload works the same as an html upload.
    * This means that you don't have to change your code to support ajax upload.
* Supports single and multiple file upload.

The project is hosted on [github](https://github.com/mbraak/django-file-form).

Works with Django 1.4 - 1.6beta.

## Usage

**1 Install django-file-form**

```
pip install django-file-form
```

This also installs the ajaxuploader app.

**2 Include the app ajaxuploader and django_file_form in your settings**

```python
INSTALLED_APPS = [
    'ajaxuploader',
    'django_file_form'
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
