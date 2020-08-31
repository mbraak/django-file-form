import json

from django.forms import ClearableFileInput
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.utils.translation import gettext as _
from django_file_form.util import get_list

from django_file_form.models import PlaceholderUploadedFile, S3UploadedFileWithId


TRANSLATIONS = {'Cancel': _('Cancel'),
                'Delete': _('Delete'),
                'Delete failed': _('Delete failed'),
                'Upload failed': _('Upload failed'),
                'Drop your files here': _('Drop your files here')}


def get_uploaded_files(value):
    if not value:
        return []

    return [
        file_info.get_values() if hasattr(file_info, 'file_id') else dict(name=file_info.name)
        for file_info in
        get_list(value)
        if not getattr(file_info, 'is_placeholder', False) and
            not getattr(file_info, 'is_s3direct', False)
    ]


def get_placeholder_files(data, field_name):
    placeholder_field_name = field_name + '-placeholder'
    value = data.get(placeholder_field_name)

    if not value:
        return []
    else:
        return [
            PlaceholderUploadedFile(name=placeholder['name'], size=placeholder['size'], file_id=placeholder['id'])
            for placeholder in json.loads(value)
        ]


def get_s3_uploaded_files(data, field_name):
    s3uploaded_field_name = field_name + '-s3direct'
    value = data.get(s3uploaded_field_name)

    if not value:
        return []
    else:
        return [
            S3UploadedFileWithId(name=s3uploaded['name'], original_name=s3uploaded['original_name'],
                size=s3uploaded['size'], file_id=s3uploaded['id'])
            for s3uploaded in json.loads(value)
        ]


def get_file_meta(data, field_name):
    meta_field_name = field_name + '-metadata'
    value = data.get(meta_field_name)
    if not value:
        return {}
    try:
        res = json.loads(value)
        if not isinstance(res, dict):
            return {}
        return res
    except Exception:
        return {}


class UploadWidgetMixin(ClearableFileInput):
    def render(self, name, value, attrs=None, renderer=None):
        upload_input = super(UploadWidgetMixin, self).render(name, value, attrs, renderer)
        return mark_safe(
            render_to_string(
                'django_file_form/upload_widget.html',
                dict(
                    input=upload_input,
                    translations=json.dumps(TRANSLATIONS),
                    uploaded_files=json.dumps(get_uploaded_files(value)),
                )
            )
        )


class UploadWidget(UploadWidgetMixin, ClearableFileInput):
    def value_from_datadict(self, data, files, name):
        upload = super().value_from_datadict(data, files, name)

        if upload:
            return upload
        else:
            placeholders = get_placeholder_files(data, name)
            s3uploaded = get_s3_uploaded_files(data, name)
            metadata = get_file_meta(data, name)
            obj = placeholders[0] if placeholders else (s3uploaded[0] if s3uploaded else None)
            if obj is not None and obj.name in metadata:
                obj.metadata = metadata[obj.name]
            return obj


class UploadMultipleWidget(UploadWidget):
    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            metadata = get_file_meta(data, name)
            objs = files.getlist(name) + get_placeholder_files(data, name) + get_s3_uploaded_files(data, name)
            for obj in objs:
                if obj.name in metadata:
                    obj.metadata = metadata[obj.name]
            return objs
        else:
            # NB: django-formtools wizard uses dict instead of MultiValueDict
            return super(UploadMultipleWidget, self).value_from_datadict(data, files, name)
