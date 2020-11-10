import os
from django.conf import settings
from django.core.cache import caches
from django.core.files import File
from django.http import HttpResponse

from django_file_form.models import TemporaryUploadedFile
from django_file_form import conf


cache = caches[getattr(settings, "FILE_FORM_CACHE", "default")]


def remove_resource_from_cache(resource_id):
    cache.delete_many(
        [
            "tus-uploads/{}/file_size".format(resource_id),
            "tus-uploads/{}/filename".format(resource_id),
            "tus-uploads/{}/offset".format(resource_id),
            "tus-uploads/{}/metadata".format(resource_id),
        ]
    )


def create_uploaded_file_in_db(
    field_name, file_id, form_id, original_filename, uploaded_file
):
    with open(uploaded_file, "rb") as fh:
        values = dict(
            file_id=file_id,
            form_id=form_id,
            uploaded_file=File(file=fh, name=uploaded_file.name),
            original_filename=original_filename,
        )

        if field_name:
            values["field_name"] = field_name

        TemporaryUploadedFile.objects.create(**values)

    os.remove(uploaded_file)


tus_api_version = "1.0.0"
tus_api_version_supported = [
    "1.0.0",
]
tus_api_extensions = ["creation", "termination", "file-check"]


def get_tus_response():
    response = HttpResponse()
    response["Tus-Resumable"] = tus_api_version
    response["Tus-Version"] = ",".join(tus_api_version_supported)
    response["Tus-Extension"] = ",".join(tus_api_extensions)
    response["Tus-Max-Size"] = conf.MAX_FILE_SIZE
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "PATCH,HEAD,GET,POST,OPTIONS"
    response[
        "Access-Control-Expose-Headers"
    ] = "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset"
    response[
        "Access-Control-Allow-Headers"
    ] = "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset,content-type"
    response["Cache-Control"] = "no-store"

    return response
