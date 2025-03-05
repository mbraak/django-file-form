from typing import Dict, Union
from django.http import QueryDict
from django.utils.datastructures import MultiValueDict

from .base_upload_widget import BaseUploadWidget
from .form_data import FormData


class UploadMultipleWidget(BaseUploadWidget):
    def value_from_datadict(
        self,
        data: QueryDict,
        files: Union[Dict, MultiValueDict],
        prefixed_field_name: str,
    ):
        form_data = FormData(data, prefixed_field_name)

        if hasattr(files, "getlist"):
            uploads_from_files = files.getlist(prefixed_field_name)
        else:
            # NB: django-formtools wizard uses dict instead of MultiValueDict
            uploads_from_files = (
                super(UploadMultipleWidget, self).value_from_datadict(
                    data, files, prefixed_field_name
                )
                or []
            )
        
        return uploads_from_files + form_data.s3_and_placeholder_uploads
