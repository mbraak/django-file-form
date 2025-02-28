from django.http import QueryDict
from django.utils.datastructures import MultiValueDict

from .base_upload_widget import BaseUploadWidget


class UploadWidget(BaseUploadWidget):
    def value_from_datadict(
        self, data: QueryDict, files: MultiValueDict, prefixed_field_name: str
    ):
        upload = super().value_from_datadict(data, files, prefixed_field_name)

        if upload:
            return upload
        else:
            uploads = get_uploads(data, prefixed_field_name)

            upload = uploads[0] if uploads else None
            metadata = get_file_meta(data, prefixed_field_name)

            if upload and upload.name in metadata:
                upload.metadata = metadata[upload.name]
            return upload
