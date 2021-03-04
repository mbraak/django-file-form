import json
import uuid

from django.urls import reverse
from django.forms import CharField, Form, HiddenInput

# UploadedFileField and MultipleUploadedFileField must be in this module because they are in the api
from .fields import UploadedFileField, MultipleUploadedFileField
from .util import get_list


class FileFormMixin(object):
    s3_upload_dir = None

    def __init__(self, *args, **kwargs):
        s3_upload_dir = kwargs.pop("s3_upload_dir", self.s3_upload_dir)

        super().__init__(*args, **kwargs)

        self.update_files_data()

        if s3_upload_dir is not None:
            self.add_hidden_field("s3_upload_dir", s3_upload_dir)
            self.add_hidden_field("upload_url", reverse("s3_upload"))
        else:
            self.add_hidden_field("upload_url", reverse("tus_upload"))

        self.add_hidden_field("form_id", uuid.uuid4())
        self.add_upload_inputs()
        self.add_metadata_inputs()

    def add_hidden_field(self: Form, name: str, initial):
        self.fields[name] = CharField(
            widget=HiddenInput, initial=initial, required=False
        )

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

    def add_upload_inputs(self):
        for field_name in self.file_form_field_names():
            self.add_hidden_field(
                f"{field_name}-uploads",
                json.dumps(self.get_placesholders_for_field(field_name)),
            )

    def get_placesholders_for_field(self: Form, field_name: str):
        initial_values = get_list(self.initial.get(field_name, []))

        return [
            value.get_values()
            for value in initial_values
            if getattr(value, "is_placeholder", False)
        ]

    def add_metadata_inputs(self):
        for field_name in self.file_form_field_names():
            self.add_hidden_field(
                f"{field_name}-metadata",
                json.dumps(self.get_metadata_for_field(field_name)),
            )

    def get_metadata_for_field(self: Form, field_name: str):
        initial_values = get_list(self.initial.get(field_name, []))
        return {
            value.name: value.metadata
            for value in initial_values
            if hasattr(value, "metadata")
        }
