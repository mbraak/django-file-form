import json

from django.forms import ClearableFileInput
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.utils import translation

from django_file_form.util import get_list
from django_file_form.models import PlaceholderUploadedFile

def get_translations():
    keys = ['Cancel', 'Delete', 'Delete failed', 'Upload failed', 'Drop your files here']

    return {
        key: translation.gettext(key) for key in keys
    }


def get_uploaded_files(value):
    if not value:
        return []

    return [
        file_info.get_values() if hasattr(file_info, 'file_id') else dict(name=file_info.name)
        for file_info in
        get_list(value)
        if not getattr(file_info, 'is_placeholder', False)
    ]


class UploadWidgetMixin(ClearableFileInput):
    def render(self, name, value, attrs=None, renderer=None):
        upload_input = super(UploadWidgetMixin, self).render(name, value, attrs, renderer)

        return mark_safe(
            render_to_string(
                'django_file_form/upload_widget.html',
                dict(
                    input=upload_input,
                    translations=json.dumps(get_translations()),
                    uploaded_files=json.dumps(get_uploaded_files(value)),
                )
            )
        )


class UploadWidget(UploadWidgetMixin, ClearableFileInput):
    pass


class UploadMultipleWidget(UploadWidget):
    def get_place_holder_files_from(self, data):
        for field, value in data.items():
            # if we have two fields A, placeholder-A, or prefix-A, prefix-placeholder-A
            # then placeholder-A is a placeholder hidden field
            if 'placeholder-' in field and field.replace('placeholder-', '') in data.keys():
                return [
                    PlaceholderUploadedFile(name=x['name'], size=x['size'], file_id=x['id'])
                    for x in json.loads(value)]
        return []

    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            return files.getlist(name) + self.get_place_holder_files_from(data)
        else:
            # NB: django-formtools wizard uses dict instead of MultiValueDict
            return super(UploadMultipleWidget, self).value_from_datadict(data, files, name)
