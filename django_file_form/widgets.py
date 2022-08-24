import json
from typing import Dict, Union
from django.forms import ClearableFileInput
from django.http import QueryDict
from django.utils.datastructures import MultiValueDict
from django.utils.translation import gettext as _
from django_file_form.util import compact

from .uploaded_file import PlaceholderUploadedFile, S3UploadedFileWithId


TRANSLATIONS = {
    "Cancel": _("Cancel"),
    "Delete": _("Delete"),
    "Delete failed": _("Delete failed"),
    "Upload failed": _("Upload failed"),
    "Drop your files here": _("Drop your files here"),
    "Invalid file type": _("Invalid file type. Try again"),
}


def get_upload(upload_data: Dict):
    upload_type = upload_data["type"]

    if upload_type == "placeholder":
        return PlaceholderUploadedFile(
            file_id=upload_data["id"],
            name=upload_data["name"],
            size=upload_data["size"],
        )
    elif upload_type == "s3":
        return S3UploadedFileWithId(
            file_id=upload_data["id"],
            name=upload_data["name"],
            original_name=upload_data["original_name"],
            size=upload_data["size"],
        )
    else:
        return None


def get_uploads(data: QueryDict, prefixed_field_name: str):
    placeholder_field_name = prefixed_field_name + "-uploads"
    value = data.get(placeholder_field_name)

    if not value:
        return []
    else:
        return compact([get_upload(upload_data) for upload_data in json.loads(value)])


def get_file_meta(data: QueryDict, prefixed_field_name: str):
    meta_field_name = prefixed_field_name + "-metadata"
    value = data.get(meta_field_name)
    if not value:
        return {}
    try:
        res = json.loads(value)
        if not isinstance(res, dict):
            return {}
        return res
    except Exception:
        return {}


class BaseUploadWidget(ClearableFileInput):
    template_name = "django_file_form/upload_widget.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)

        context["translations"] = json.dumps(TRANSLATIONS)

        return context


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
