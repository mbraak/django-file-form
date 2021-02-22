## Customization

### Customize upload widget

The `UploadWidget` and `UploadMultipleWidget` is rendered by a template `django_file_form/upload_widget.html`, which contains the `<input type="file">` widget and a few hidden fields
for additional information.

You can customize the look and feel of the widget by overriding this template. Because
Django by default does not use customized templates for form-rendering, you will need to

1. Include `django.form` in `DJANGO_APPS`
2. Add `FORM_RENDERER = 'django.forms.renderers.TemplatesSetting'` to `settings.py`
3. Add `django_file_form/upload_widget.html` to your projects `templates` directory
  (or `jinja2` if you use jinja2 to render the templates). The upload widget will
  be available as variable `widget` and you can use its attributes such as `widget.attrs.id`
  to customize it.
