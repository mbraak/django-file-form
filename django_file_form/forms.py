import uuid

import six

from django.forms import CharField, HiddenInput

from .util import url_reverse as reverse

# UploadedFileField and MultipleUploadedFileField must be in this module because they are in the api
from .fields import UploadedFileField, MultipleUploadedFileField


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
