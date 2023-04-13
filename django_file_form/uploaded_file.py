import os
import uuid
from typing import Union, List, Dict

from django.core.files import uploadedfile
from django.core.exceptions import ImproperlyConfigured
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
        return dict(id=self.file_id, name=self.name, size=self.size, type="placeholder")


class UploadedTusFile(uploadedfile.UploadedFile):
    def __init__(self, file_id, metadata=None, **kwargs):
        super().__init__(**kwargs)

        self.file_id = file_id
        self.size = self.file.size

        self.is_placeholder = False
        self.is_s3direct = False
        self.metadata = metadata

    def get_initial_data(self):
        return dict(id=self.file_id, name=self.name, size=self.size, type="tus")


try:
    from storages.backends.s3boto3 import S3Boto3Storage, S3Boto3StorageFile
    from storages.utils import setting

    class S3UploadedFileWithId(S3Boto3StorageFile):
        def __init__(self, file_id, name, original_name, size, metadata=None, **kwargs):
            boto_storage = S3Boto3Storage(
                bucket_name=setting("AWS_STORAGE_BUCKET_NAME"),
                endpoint_url=setting("AWS_S3_ENDPOINT_URL"),
                access_key=setting(
                    "AWS_S3_ACCESS_KEY_ID", setting("AWS_ACCESS_KEY_ID")
                ),
                secret_key=setting(
                    "AWS_S3_SECRET_ACCESS_KEY", setting("AWS_SECRET_ACCESS_KEY")
                ),
            )

            super().__init__(name=name, mode="rb", storage=boto_storage, **kwargs)

            self.file_id = file_id
            self.original_name = original_name
            # self.size is derived from S3boto3StorageFile
            # but size is passed for consistency, and potentially
            # for validation
            self.is_placeholder = False
            self.is_s3direct = True
            self.metadata = metadata

        def get_initial_data(self):
            return dict(id=self.file_id, name=self.name, size=self.size, type="s3")


except (ImportError, ImproperlyConfigured):
    # S3 is an optional feature but we keep the symbol
    class S3UploadedFileWithId:
        pass


UploadedFileTypes = Union[FieldFile, PlaceholderUploadedFile, UploadedTusFile]

UploadedFileTypesOrList = Union[
    UploadedFileTypes,
    List[Union[UploadedFileTypes]],
]


def get_initial_data_from_field_file(field_file: FieldFile) -> Dict:
    try:
        return dict(name=field_file.name, size=field_file.size, type="existing")
    except:
        return dict()


def get_initial_data_from_uploaded_file(uploaded_file: UploadedFileTypes) -> Dict:
    if isinstance(uploaded_file, FieldFile):
        return get_initial_data_from_field_file(uploaded_file)
    else:
        return uploaded_file.get_initial_data()
