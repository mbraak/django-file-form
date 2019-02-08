import json

from django.forms import ClearableFileInput
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class UploadWidgetMixin(ClearableFileInput):
    def render(self, name, value, attrs=None, renderer=None):
        input = super(UploadWidgetMixin, self).render(name, value, attrs, renderer)

        uploaded_files = []
        existing_files = []

        if value:
            if isinstance(value, list):
                values = value
            else:
                values = [value]

            for file_info in values:
                if getattr(file_info, 'existing', False):
                    existing_files.append(file_info.get_values())
                elif hasattr(file_info, 'file_id'):
                    uploaded_files.append(file_info.get_values())
                else:
                    uploaded_files.append(dict(name=file_info.name))

        return mark_safe(
            render_to_string(
                'django_file_form/upload_widget.html',
                dict(
                    input=input,
                    uploaded_files=json.dumps(uploaded_files),
                    existing_files=existing_files
                )
            )
        )


class UploadWidget(UploadWidgetMixin, ClearableFileInput):
    pass


class UploadMultipleWidget(UploadWidget):
    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            return files.getlist(name)
        else:
            # Django <= 1.11
            return super(UploadMultipleWidget, self).value_from_datadict(data, files, name)
