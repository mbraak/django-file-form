import json
import uuid

from django.urls import reverse
from django.forms import CharField, Form, HiddenInput

# UploadedFileField and MultipleUploadedFileField must be in this module because they are in the api
from .fields import UploadedFileField, MultipleUploadedFileField
from .util import get_list


class FileFormMixin(object):
    def __init__(self, *args, **kwargs):
        s3_upload_dir = kwargs.pop(
            "s3_upload_dir",
            self.s3_upload_dir if hasattr(self, "s3_upload_dir") else None,
        )
        super().__init__(*args, **kwargs)

        if s3_upload_dir is not None:
            self.add_hidden_field("s3_upload_dir", s3_upload_dir)
            self.add_s3_uploaded_files()
            self.add_hidden_field("upload_url", reverse("s3_upload"))
        else:
            self.add_hidden_field("upload_url", reverse("tus_upload"))

        self.add_hidden_field("form_id", uuid.uuid4())
        self.add_placeholder_inputs()
        self.add_metadata_inputs()

    def add_hidden_field(self: Form, name: str, initial):
        self.fields[name] = CharField(
            widget=HiddenInput, initial=initial, required=False
        )

    def full_clean(self: Form):
        if not self.is_bound:
            # Form is unbound; just call super
            super().full_clean()
        else:
            # Update file data of the form
            self.update_files_data()

            # Call super
            super().full_clean()

    def file_form_field_names(self: Form):
        return [
            field_name
            for field_name, field in self.fields.items()
            if hasattr(field, "get_file_data")
        ]

    def update_files_data(self: Form):
        form_id = self.data.get(self.add_prefix("form_id"))

        if form_id:
            for field_name in self.file_form_field_names():
                field = self.fields[field_name]
                prefixed_field_name = self.add_prefix(field_name)
                file_data = field.get_file_data(prefixed_field_name, form_id)

                if file_data:
                    # NB: django-formtools wizard uses dict instead of MultiValueDict
                    if isinstance(file_data, list) and hasattr(self.files, "setlist"):
                        self.files.setlist(prefixed_field_name, file_data)
                    else:
                        self.files[prefixed_field_name] = file_data

    def delete_temporary_files(self: Form):
        form_id = self.data.get(self.add_prefix("form_id"))

        if form_id:
            for field_name, field in self.fields.items():
                if hasattr(field, "delete_file_data"):
                    prefixed_field_name = self.add_prefix(field_name)
                    field.delete_file_data(prefixed_field_name, form_id)

    def add_s3_uploaded_files(self):
        for field_name in self.file_form_field_names():
            s3_uploaded_field_name = f"{field_name}-s3direct"
            # the field is always empty initially
            self.add_hidden_field(s3_uploaded_field_name, "[]")

    def add_placeholder_inputs(self):
        for field_name in self.file_form_field_names():
            placeholder_field_name = f"{field_name}-placeholder"
            self.add_hidden_field(
                placeholder_field_name,
                json.dumps(self.get_placesholders_for_field(field_name)),
            )

    def get_placesholders_for_field(self: Form, field_name: str):
        initial_values = get_list(self.initial.get(field_name, []))

        return [
            value.get_values()
            for value in initial_values
            if getattr(value, "is_placeholder")
        ]

    def add_metadata_inputs(self):
        for field_name in self.file_form_field_names():
            metadata_field_name = f"{field_name}-metadata"
            self.add_hidden_field(
                metadata_field_name, json.dumps(self.get_metadata_for_field(field_name))
            )

    def get_metadata_for_field(self: Form, field_name: str):
        initial_values = get_list(self.initial.get(field_name, []))
        return {
            value.name: value.metadata
            for value in initial_values
            if value.metadata is not None
        }
