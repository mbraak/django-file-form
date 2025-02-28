import json
from typing import Dict
from django.http import QueryDict

from django_file_form.util import compact
from .uploaded_file import PlaceholderUploadedFile, S3UploadedFileWithId


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
