import os
import uuid

from django.core.exceptions import ImproperlyConfigured
from django.core.files import uploadedfile
from django.db.models.fields.files import FieldFile


class PlaceholderUploadedFile:
    def __init__(self, name, file_id=None, size=None, metadata=None):
        self.name = name
        self.file_id = file_id or uuid.uuid4().hex
        if size is None:
            self.size = os.path.getsize(self.name)
        else:
            self.size = size

        self.is_placeholder = True
        self.is_s3direct = False
        self.metadata = metadata

    def get_initial_data(self):
        return {
            "id": self.file_id,
            "name": self.name,
            "size": self.size,
            "type": "placeholder",
        }


class UploadedTusFile(uploadedfile.UploadedFile):
    def __init__(self, file_id, metadata=None, **kwargs):
        super().__init__(**kwargs)

        self.file_id = file_id
        self.size = self.file.size

        self.is_placeholder = False
        self.is_s3direct = False
        self.metadata = metadata

    def get_initial_data(self):
        return {"id": self.file_id, "name": self.name, "size": self.size, "type": "tus"}


try:
    from storages.backends.s3boto3 import S3Boto3StorageFile

    from django_file_form.s3_multipart.utils import get_storage

    class S3UploadedFileWithId(S3Boto3StorageFile):
        def __init__(self, file_id, name, original_name, size, metadata=None, **kwargs):
            super().__init__(name=name, mode="rb", storage=get_storage(), **kwargs)

            self.file_id = file_id
            self.original_name = original_name
            # self.size is derived from S3boto3StorageFile
            # but size is passed for consistency, and potentially
            # for validation
            self.is_placeholder = False
            self.is_s3direct = True
            self.metadata = metadata

        def get_initial_data(self):
            return {
                "id": self.file_id,
                "name": self.name,
                "size": self.size,
                "type": "s3",
            }

except (ImportError, ImproperlyConfigured):  # pragma: no cover
    # S3 is an optional feature but we keep the symbol
    class S3UploadedFileWithId:
        pass


UploadedFileTypes = FieldFile | PlaceholderUploadedFile | UploadedTusFile

UploadedFileTypesOrList = UploadedFileTypes | list[UploadedFileTypes]


def get_initial_data_from_field_file(field_file: FieldFile) -> dict:
    try:
        return {"name": field_file.name, "size": field_file.size, "type": "existing"}
    except Exception:
        return {}


def get_initial_data_from_uploaded_file(uploaded_file: UploadedFileTypes) -> dict:
    if isinstance(uploaded_file, FieldFile):
        return get_initial_data_from_field_file(uploaded_file)
    else:
        return uploaded_file.get_initial_data()
