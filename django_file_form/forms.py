import json
import uuid

import six

from django.core.urlresolvers import reverse
from django.forms import FileField, ClearableFileInput, CharField, HiddenInput
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.core import validators

from .models import UploadedFile


class FileFormMixin(object):
    def __init__(self, *args, **kwargs):
        super(FileFormMixin, self).__init__(*args, **kwargs)

        self.add_hidden_field('form_id', uuid.uuid4)
        self.add_hidden_field('upload_url', self.get_upload_url())
        self.add_hidden_field('delete_url', reverse('file_form_handle_delete_no_args'))

    def add_hidden_field(self, name, initial):
        self.fields[name] = CharField(widget=HiddenInput, initial=initial, required=False)

    def get_upload_url(self):
        return reverse('file_form_handle_upload')

    def full_clean(self):
        if not self.is_bound:
            # Form is unbound; just call super
            super(FileFormMixin, self).full_clean()
        else:
            # Update file data of the form
            self.update_files_data()

            # Call super
            super(FileFormMixin, self).full_clean()

    def update_files_data(self):
        form_id = self.data.get('form_id')

        if form_id:
            for field_name, field in six.iteritems(self.fields):
                if hasattr(field, 'get_file_data'):
                    file_data = field.get_file_data(field_name, form_id)

                    if file_data:
                        self.files[field_name] = file_data

    def delete_temporary_files(self):
        form_id = self.data.get('form_id')

        if form_id:
            for field_name, field in six.iteritems(self.fields):
                if hasattr(field, 'delete_file_data'):
                    field.delete_file_data(field_name, form_id)

    def add_existing_file(self, field_name, filename, delete_url=None, view_url=None):
        self.initial.setdefault(field_name, [])

        existing_file = ExistingFile(name=filename, delete_url=delete_url, view_url=view_url)

        self.initial[field_name].append(existing_file)


class UploadWidget(ClearableFileInput):
    def render(self, name, value, attrs=None):
        def get_file_value(f):
            if getattr(f, 'is_existing', False) or hasattr(f, 'file_id'):
                return f.get_values()
            else:
                return dict(name=f.name)

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
                    input=super(UploadWidget, self).render(name, value, attrs),
                    uploaded_files=json.dumps(uploaded_files),
                    existing_files=existing_files
                )
            )
        )


class UploadedFileField(FileField):
    widget = UploadWidget

    def get_file_data(self, field_name, form_id):
        qs = self._get_file_qs(field_name, form_id)

        if qs.exists():
            return qs.latest('created').get_uploaded_file()
        else:
            return None

    def delete_file_data(self, field_name, form_id):
        qs = self._get_file_qs(field_name, form_id)

        for f in qs:
            f.delete()

    def _get_file_qs(self, field_name, form_id):
        return UploadedFile.objects.filter(
            form_id=form_id,
            field_name=field_name
        )


class MultipleUploadedFileField(UploadedFileField):
    def widget_attrs(self, widget):
        attrs = super(MultipleUploadedFileField, self).widget_attrs(widget)

        attrs['multiple'] = 'multiple'
        return attrs

    def get_file_data(self, field_name, form_id):
        qs = self._get_file_qs(field_name, form_id)

        return [
            f.get_uploaded_file() for f in qs
        ]

    def to_python(self, data):
        if data in validators.EMPTY_VALUES:
            return None
        elif isinstance(data, list):
            return [
                super(MultipleUploadedFileField, self).to_python(f)
                for f in data
            ]
        else:
            return [data]

    def bound_data(self, data, initial):
        result = []

        if initial:
            result += get_list(initial)

        if data:
            result += get_list(data)

        return result


class ExistingFile(object):
    def __init__(self, name, delete_url=None, view_url=None):
        self.name = name
        self.delete_url = delete_url
        self.view_url = view_url
        self.existing = True

    def get_values(self):
        result = dict(
            name=self.name,
            existing=True
        )

        if self.delete_url:
            result['delete_url'] = self.delete_url

        if self.view_url:
            result['view_url'] = self.view_url

        return result


def get_list(v):
    if isinstance(v, list):
        return v
    else:
        return [v]
