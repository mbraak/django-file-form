import json
import uuid

from django.urls import reverse
from django.forms import CharField, HiddenInput

# UploadedFileField and MultipleUploadedFileField must be in this module because they are in the api
from .fields import UploadedFileField, MultipleUploadedFileField
from .util import get_list


class FileFormMixin(object):
    def __init__(self, *args, **kwargs):
        super(FileFormMixin, self).__init__(*args, **kwargs)

        self.add_hidden_field('form_id', uuid.uuid4())
        self.add_hidden_field('upload_url', self.get_upload_url())

        self.add_placeholder_inputs()

    def add_hidden_field(self, name, initial):
        self.fields[name] = CharField(widget=HiddenInput, initial=initial, required=False)

    def get_upload_url(self):
        return reverse('tus_upload')

    def full_clean(self):
        if not self.is_bound:
            # Form is unbound; just call super
            super(FileFormMixin, self).full_clean()
        else:
            # Update file data of the form
            self.update_files_data()

            # Call super
            super(FileFormMixin, self).full_clean()

    def file_form_field_names(self):
        return [
            field_name for field_name, field in self.fields.items()
            if hasattr(field, 'get_file_data')
        ]

    def update_files_data(self):
        form_id = self.data.get(self.add_prefix('form_id'))

        if form_id:
            for field_name in self.file_form_field_names():
                field = self.fields[field_name]
                prefixed_field_name = self.add_prefix(field_name)
                file_data = field.get_file_data(prefixed_field_name, form_id)

                if file_data:
                    # NB: django-formtools wizard uses dict instead of MultiValueDict
                    if isinstance(file_data, list) and hasattr(self.files, 'setlist'):
                        self.files.setlist(prefixed_field_name, file_data)
                    else:
                        self.files[prefixed_field_name] = file_data

    def delete_temporary_files(self):
        form_id = self.data.get(self.add_prefix('form_id'))

        if form_id:
            for field_name, field in self.fields.items():
                if hasattr(field, 'delete_file_data'):
                    prefixed_field_name = self.add_prefix(field_name)
                    field.delete_file_data(prefixed_field_name, form_id)

    def add_placeholder_inputs(self):
        for field_name in self.file_form_field_names():
            placeholder_field_name = f'placeholder-{field_name}'
            self.add_hidden_field(
                placeholder_field_name,
                json.dumps(self.get_placesholders_for_field(field_name))
            )

    def get_placesholders_for_field(self, field_name):
        initial_values = get_list(self.initial.get(field_name, []))

        return [value.get_values() for value in initial_values if getattr(value, 'is_placeholder')]
