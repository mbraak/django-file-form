import os
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

from django.conf import settings
from django.core.cache import caches
from django.core.files import File
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse

from django_file_form.models import TemporaryUploadedFile, get_temp_storage_class

cache = caches[getattr(settings, "FILE_FORM_CACHE", "default")]

# Seconds after which a lock expires, e.g. when a worker dies while holding it
LOCK_TIMEOUT = 60


LOCK_POLL_INTERVAL = 0.1


def acquire_lock(lock_key, token, wait):
    deadline = time.monotonic() + wait

    while not cache.add(lock_key, token, LOCK_TIMEOUT):
        if time.monotonic() >= deadline:
            return False

        time.sleep(LOCK_POLL_INTERVAL)

    return True


@contextmanager
def lock_resource(resource_id, wait=0):
    """
    Lock an upload resource, so concurrent requests can't change it at the same time.

    Waits at most `wait` seconds for the lock. Yields True if the lock was acquired
    and False if the resource is still locked. Uses cache.add, which is atomic for
    the memcached, redis, database and local memory cache backends.
    """
    lock_key = f"tus-uploads/{resource_id}/lock"
    token = str(uuid.uuid4())

    if not acquire_lock(lock_key, token, wait):
        yield False
        return

    try:
        yield True
    finally:
        # Don't release a lock that expired and was acquired by another request
        if cache.get(lock_key) == token:
            cache.delete(lock_key)


def remove_resource_from_cache(resource_id):
    cache.delete_many(
        [
            f"tus-uploads/{resource_id}/file_size",
            f"tus-uploads/{resource_id}/filename",
            f"tus-uploads/{resource_id}/offset",
            f"tus-uploads/{resource_id}/metadata",
            f"tus-uploads/{resource_id}/expires",
        ]
    )


def create_uploaded_file_in_db(
    field_name, file_id, form_id, original_filename, uploaded_file
):
    values = {
        "file_id": file_id,
        "form_id": form_id,
        "original_filename": original_filename,
    }

    if field_name:
        values["field_name"] = field_name

    if get_temp_storage_class() == FileSystemStorage and not getattr(
        settings, "FILE_FORM_ALWAYS_COPY_UPLOADED_FILE", False
    ):
        create_uploaded_file_in_db_with_move(values, uploaded_file)
    else:
        create_uploaded_file_in_db_with_copy(values, uploaded_file)


def create_uploaded_file_in_db_with_copy(values, uploaded_file):
    with open(uploaded_file, "rb") as fh:
        values["uploaded_file"] = File(file=fh, name=uploaded_file.name)
        TemporaryUploadedFile.objects.create(**values)

    os.remove(uploaded_file)


def create_uploaded_file_in_db_with_move(values, uploaded_file):
    values["uploaded_file"] = str(uploaded_file.relative_to(Path(settings.MEDIA_ROOT)))

    TemporaryUploadedFile.objects.create(**values)


tus_api_version = "1.0.0"
tus_api_version_supported = [
    "1.0.0",
]
tus_api_extensions = ["creation", "expiration", "termination", "file-check"]


def get_tus_response():
    response = HttpResponse()
    response["Tus-Resumable"] = tus_api_version
    response["Tus-Version"] = ",".join(tus_api_version_supported)
    response["Tus-Extension"] = ",".join(tus_api_extensions)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "PATCH,HEAD,GET,POST,OPTIONS"
    response["Access-Control-Expose-Headers"] = (
        "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset,Upload-Expires"
    )
    response["Access-Control-Allow-Headers"] = (
        "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset,content-type"
    )
    response["Cache-Control"] = "no-store"

    return response
