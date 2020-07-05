import json

from django.forms import ClearableFileInput
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.utils.translation import gettext as _

from django_file_form.util import get_list
from django_file_form.models import PlaceholderUploadedFile


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
                    translations=json.dumps(TRANSLATIONS),
                    uploaded_files=json.dumps(get_uploaded_files(value)),
                )
            )
        )


class UploadWidget(UploadWidgetMixin, ClearableFileInput):
    pass


class UploadMultipleWidget(UploadWidget):
    def get_place_holder_files_from(self, data):
        #
        # The field now holds information for both placeholder and
        # none placeholder, which gives is_primary information that
        # patches into FILES returned from form.
        #
        for field, value in data.items():
            # if we have two fields A, placeholder-A, or prefix-A, prefix-placeholder-A
            # then placeholder-A is a placeholder hidden field
            if 'placeholder-' in field and field.replace('placeholder-',
                                                         '') in data.keys():
                files = json.loads(value)
                return [
                    PlaceholderUploadedFile(
                        name=x['name'],
                        size=x['size'],
                        file_id=x['id'],
                        is_primary=x['primary'])
                    for x in files
                    if x['placeholder']
                ], [
                    x['name']
                    for x in files
                    if not x['placeholder'] and x.get('primary', False)
                ]
        return [], []

    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            filelist = files.getlist(name)
            placeholder, primary_meta = self.get_place_holder_files_from(data)
            if primary_meta:
                for f in filelist:
                    if f.name == primary_meta[0]:
                        f.is_primary = True
            return filelist + placeholder
        else:
            # NB: django-formtools wizard uses dict instead of MultiValueDict
            return super(UploadMultipleWidget, self).value_from_datadict(data, files, name)
