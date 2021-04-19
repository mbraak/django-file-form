import json
import uuid

from django.urls import reverse
from django.forms import CharField, Form, HiddenInput

from .util import get_list, with_typehint
from .uploaded_file import get_initial_data_from_uploaded_file

# UploadedFileField and MultipleUploadedFileField must be in this module because they are in the api
from .fields import UploadedFileField, MultipleUploadedFileField


class FileFormMixin(with_typehint(Form)):
    s3_upload_dir = None

    def __init__(self, *args, **kwargs):
        s3_upload_dir = kwargs.pop("s3_upload_dir", self.s3_upload_dir)

        super().__init__(*args, **kwargs)

        self._update_files_data()

        if s3_upload_dir is not None:
            self._add_hidden_field("s3_upload_dir", s3_upload_dir)
            self._add_hidden_field("upload_url", reverse("s3_upload"))
        else:
            self._add_hidden_field("upload_url", reverse("tus_upload"))

        self._add_hidden_field("form_id", uuid.uuid4())
        self._add_upload_inputs()
        self._add_metadata_inputs()

    # override

    def get_initial_for_field(self, field, field_name: str):
        initial = super().get_initial_for_field(field, field_name)

        if not hasattr(field, "get_file_data"):
            return initial

        placeholder_field_name = self.add_prefix(field_name) + "-uploads"
        file_uploads_value = self.data.get(placeholder_field_name)

        if not file_uploads_value:
            return initial

        file_info_list = json.loads(file_uploads_value)
        existing_filenames_in_uploads = {
            file_info["name"]
            for file_info in file_info_list
            if file_info["type"] == "existing"
        }

        if isinstance(initial, list):
            return [
                initial_file
                for initial_file in initial
                if initial_file.name in existing_filenames_in_uploads
            ]
        else:
            if existing_filenames_in_uploads:
                return initial
            else:
                return None

    # new methods

    def delete_temporary_files(self):
        form_id = self.data.get(self.add_prefix("form_id"))

        if not form_id:
            return

        for field_name, field in self.fields.items():
            if hasattr(field, "delete_file_data"):
                prefixed_field_name = self.add_prefix(field_name)
                field.delete_file_data(prefixed_field_name, form_id)

    # private

    def _add_hidden_field(self, name: str, initial):
        self.fields[name] = CharField(
            widget=HiddenInput, initial=initial, required=False
        )

    def _add_metadata_inputs(self):
        for field_name in self._file_form_field_names():
            self._add_hidden_field(
                f"{field_name}-metadata",
                json.dumps(self._get_metadata_for_field(field_name)),
            )

    def _add_upload_inputs(self):
        for field_name in self._file_form_field_names():
            self._add_hidden_field(
                f"{field_name}-uploads",
                json.dumps(self._get_upload_data_for_field(field_name)),
            )

    def _file_form_field_names(self):
        return [
            field_name
            for field_name, field in self.fields.items()
            if hasattr(field, "get_file_data")
        ]

    def _get_metadata_for_field(self, field_name: str):
        initial_values = get_list(self.initial.get(field_name, []))

        return {
            value.name: value.metadata
            for value in initial_values
            if hasattr(value, "metadata")
        }

    def _get_upload_data_for_field(self, field_name: str):
        uploaded_files = get_list(self.initial.get(field_name, []))

        return [
            get_initial_data_from_uploaded_file(uploaded_file)
            for uploaded_file in uploaded_files
        ]

    def _update_files_data(self):
        form_id = self.data.get(self.add_prefix("form_id"))

        if not form_id:
            return

        for field_name in self._file_form_field_names():
            field = self.fields[field_name]
            prefixed_field_name = self.add_prefix(field_name)

            file_data = field.get_file_data(prefixed_field_name, form_id)

            if file_data:
                # NB: django-formtools wizard uses dict instead of MultiValueDict
                if isinstance(file_data, list) and hasattr(self.files, "setlist"):
                    self.files.setlist(prefixed_field_name, file_data)
                else:
                    self.files[prefixed_field_name] = file_data
