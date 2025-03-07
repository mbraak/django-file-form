import json
from typing import Dict
from functools import cached_property
from django.http import QueryDict

from django_file_form.util import compact
from django_file_form.uploaded_file import PlaceholderUploadedFile, S3UploadedFileWithId


def parse_placeholder_and_s3_upload(upload_data: Dict):
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


class FormData:
  def __init__(self, form_data: QueryDict, prefixed_field_name: str):
    self.form_data = form_data
    self.prefixed_field_name = prefixed_field_name

  @cached_property
  def s3_and_placeholder_uploads(self):
    uploads = compact(
      [parse_placeholder_and_s3_upload(upload_data) for upload_data in self._uploads_field]
    )

    for upload in uploads:
      if upload.name in self._metadata:
        upload.metadata = self._metadata[upload.name]

    return uploads

  @cached_property
  def has_existing_uploads(self):
    return any(
      upload_data["type"] == 'existing' for upload_data in self._uploads_field
    )

  @cached_property
  def _uploads_field(self):
    raw_data = self.form_data.get(self.prefixed_field_name + "-uploads")

    if not raw_data:
      return []

    return json.loads(raw_data)

  @cached_property
  def _metadata(self):
    raw_data = self.form_data.get(self.prefixed_field_name + "-metadata")

    if not raw_data:
      return {}

    try:
      parsed_data = json.loads(raw_data)

      if not isinstance(parsed_data, dict):
        return {}
      else:
        return parsed_data
    except Exception:
        return {}
