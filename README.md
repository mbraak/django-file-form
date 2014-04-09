[![Build Status](https://travis-ci.org/mbraak/django-file-form.png?branch=master)](https://travis-ci.org/mbraak/django-file-form) [![Coverage Status](https://coveralls.io/repos/mbraak/django-file-form/badge.png?branch=master)](https://coveralls.io/r/mbraak/django-file-form?branch=master) [![Downloads](https://pypip.in/d/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/) [![Requirements Status](https://requires.io/github/mbraak/django-file-form/requirements.png?branch=master)](https://requires.io/github/mbraak/django-file-form/requirements/?branch=master) [![Wheel Status](https://pypip.in/wheel/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/) [![Egg Status](https://pypip.in/egg/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/) [![License](https://pypip.in/license/django-file-form/badge.png)](https://pypi.python.org/pypi/django-file-form/)

[![Violations](https://coviolations.io/projects/mbraak/django-file-form/badge/?)](http://coviolations.io/projects/mbraak/django-file-form/)

#Django file form

**Django-file-form** helps you to write forms with a pretty ajax upload.

Features:

* You can easily add an ajax file-upload to a form.
* The ajax upload works the same as an html upload.
    * This means that you don't have to change your code to support ajax upload.
* Supports single and multiple file upload.

The project is hosted on [github](https://github.com/mbraak/django-file-form).

Works with Django 1.4 - 1.7beta.

## Usage

**1 Install django-file-form**

```
pip install django-file-form
```

**2 Add the app to your urls**

In this example we use the url **upload/**. You can use a different url if you like.

```python
urlpatterns = patterns(
    '',
    url(r'^upload/', include('django_file_form.urls')),
)
```

**3 Add FileFormMixin to your form**

```python
from django_file_form.forms import FileFormMixin

class ExampleForm(FileFormMixin, forms.Form):
    pass
```

**4 Add a UploadedFileField**

```python
from django_file_form.forms import FileFormMixin, UploadedFileField

class ExampleForm(FileFormMixin, forms.Form):
    input_file = UploadedFileField()
```

**5 Include fileuploader.js and file_form.js in your template**

```html
 <script src="{{ STATIC_URL }}ajaxuploader/js/fileuploader.js"></script>
 <script src="{{ STATIC_URL }}file_form/file_form.js"></script>
```

By the way, you must also include jquery.

**6 Call the initUploadFields javascript function**

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

**7 Handle uploaded files**

```python
class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def form_valid(self, form):
    	input_file = form.cleaned_data['input_file']

    	return super(ExampleFormView, self).form_valid(form)
```

**8 Delete temporary files**

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
