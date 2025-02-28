from django.http import QueryDict
from django.utils.datastructures import MultiValueDict

from .base_upload_widget import BaseUploadWidget
from .form_data import FormData


class UploadWidget(BaseUploadWidget):
    def value_from_datadict(
        self, data: QueryDict, files: MultiValueDict, prefixed_field_name: str
    ):
        upload = super().value_from_datadict(data, files, prefixed_field_name)

        if upload:
            # Uploaded Tus file
            return upload
        else:
            form_data = FormData(data, prefixed_field_name)

            if form_data.s3_and_placeholder_uploads:
                return form_data.s3_and_placeholder_uploads[0]
            elif form_data.has_existing_uploads:
                # No changes
                return None
            else:
                # Remove file
                return False
