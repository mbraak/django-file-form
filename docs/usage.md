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
<script src="{% static "file_form/file_form.min.min.js" %}"></script>
<link rel="stylesheet" href="{% static "file_form/file_form.css" %}">
```

There is also an uncompressed javascript version: `file_form/file_form.js`.

**7 Call the initUploadFields javascript function**

```html
<form id="example-form" method="POST" enctype="multipart/form-data">
  {% csrf_token %} {{ form }}
</form>

<script>
  initUploadFields(document.getElementById("example-form"));
</script>
```

If your form has a prefix, then call `initUploadFields` as follows:

```js
// for example, with prefix 'abc'
initUploadFields(document.getElementById("example-form"), { prefix: "abc" });
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

It's also possible to delete unused temporary file using a management command:

```
python manage.py delete_unused_files

The command deletes temporary files and records that are created at least one day ago.
```
