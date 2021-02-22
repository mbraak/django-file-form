import json
from typing import Dict, Union, List

from django.forms import ClearableFileInput
from django.http import QueryDict
from django.template.loader import render_to_string
from django.utils.datastructures import MultiValueDict
from django.utils.safestring import mark_safe
from django.utils.translation import gettext as _
from django_file_form.util import compact, get_list

from django_file_form.models import (
    PlaceholderUploadedFile,
    S3UploadedFileWithId,
    UploadedFileWithId,
)

TRANSLATIONS = {
    "Cancel": _("Cancel"),
    "Delete": _("Delete"),
    "Delete failed": _("Delete failed"),
    "Upload failed": _("Upload failed"),
    "Drop your files here": _("Drop your files here"),
}

UploadedFileTypes = Union[
    PlaceholderUploadedFile,
    UploadedFileWithId,
    List[Union[PlaceholderUploadedFile, UploadedFileWithId]],
]


def get_uploaded_files(value: UploadedFileTypes):
    if not value:
        return []

    return [
        file_info.get_values()
        if hasattr(file_info, "file_id")
        else dict(name=file_info.name)
        for file_info in get_list(value)
        if not getattr(file_info, "is_placeholder", False)
        and not getattr(file_info, "is_s3direct", False)
    ]


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


def get_uploads(data: QueryDict, field_name: str):
    placeholder_field_name = field_name + "-uploads"
    value = data.get(placeholder_field_name)

    if not value:
        return []
    else:
        return compact([get_upload(upload_data) for upload_data in json.loads(value)])


def get_file_meta(data: QueryDict, field_name: str):
    meta_field_name = field_name + "-metadata"
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
        context['translations'] = json.dumps(TRANSLATIONS)
        context['uploaded_files'] = json.dumps(get_uploaded_files(value))
        return context


class UploadWidget(BaseUploadWidget):
    def value_from_datadict(self, data: QueryDict, files: MultiValueDict, name: str):
        upload = super().value_from_datadict(data, files, name)

        if upload:
            return upload
        else:
            uploads = get_uploads(data, name)

            upload = uploads[0] if uploads else None
            metadata = get_file_meta(data, name)

            if upload and upload.name in metadata:
                upload.metadata = metadata[upload.name]
            return upload


class UploadMultipleWidget(BaseUploadWidget):
    def value_from_datadict(
        self, data: QueryDict, files: Union[Dict, MultiValueDict], name: str
    ):
        if hasattr(files, "getlist"):
            uploads = files.getlist(name) + get_uploads(data, name)
            metadata = get_file_meta(data, name)

            for upload in uploads:
                if upload.name in metadata:
                    upload.metadata = metadata[upload.name]
            return uploads
        else:
            # NB: django-formtools wizard uses dict instead of MultiValueDict
            return super().value_from_datadict(data, files, name)
