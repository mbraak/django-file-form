from typing import Dict, Union
from django.http import QueryDict
from django.utils.datastructures import MultiValueDict

from .base_upload_widget import BaseUploadWidget


class UploadMultipleWidget(BaseUploadWidget):
    def value_from_datadict(
        self,
        data: QueryDict,
        files: Union[Dict, MultiValueDict],
        prefixed_field_name: str,
    ):
        def get_uploads_from_files():
            if hasattr(files, "getlist"):
                return files.getlist(prefixed_field_name)
            else:
                # NB: django-formtools wizard uses dict instead of MultiValueDict
                return (
                    super(UploadMultipleWidget, self).value_from_datadict(
                        data, files, prefixed_field_name
                    )
                    or []
                )

        uploads = get_uploads_from_files() + get_uploads(data, prefixed_field_name)
        metadata = get_file_meta(data, prefixed_field_name)

        for upload in uploads:
            if upload.name in metadata:
                upload.metadata = metadata[upload.name]
        return uploads
