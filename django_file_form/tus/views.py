import base64
import logging
import time
import uuid

from django.utils._os import safe_join, to_path
from django.utils.http import http_date
from django.views.decorators.http import require_http_methods, require_POST

from django_file_form import conf
from django_file_form.django_util import get_upload_path, permission_required
from django_file_form.models import TemporaryUploadedFile

from .utils import (
    InvalidChecksumHeader,
    cache,
    checksum_matches,
    create_uploaded_file_in_db,
    get_tus_response,
    lock_resource,
    remove_resource_from_cache,
)

logger = logging.getLogger(__name__)

# Seconds a delete request waits for a lock held by a patch request
DELETE_LOCK_WAIT = 5


@require_POST
@permission_required
def start_upload(request):
    response = get_tus_response()

    if request.META.get("HTTP_TUS_RESUMABLE", None) is None:
        error_message = "Received file upload for unsupported file transfer protocol"
        logger.warning(error_message)
        response.status_code = 400
        response.reason_phrase = error_message
        return response

    metadata = {}
    upload_metadata = request.META.get("HTTP_UPLOAD_METADATA", None)

    if upload_metadata:
        for kv in upload_metadata.split(","):
            # The value is optional, e.g. "is_confidential"
            key, _, value = kv.partition(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

    logger.info(f"TUS post metadata={metadata}")

    upload_length = request.META.get("HTTP_UPLOAD_LENGTH")

    # The length must be a non-negative integer; deferring the length is not supported
    if (
        upload_length is None
        or not upload_length.isascii()
        or not upload_length.isdigit()
    ):
        logger.info(f"TUS post invalid Upload-Length={upload_length}")
        response.status_code = 400
        response.reason_phrase = "Missing or invalid Upload-Length"
        return response

    file_size = int(upload_length)
    resource_id = str(uuid.uuid4())

    # The upload expires when its data is removed from the cache
    expires = time.time() + conf.CACHE_TIMEOUT

    cache.add(
        f"tus-uploads/{resource_id}/filename",
        metadata.get("filename"),
        conf.CACHE_TIMEOUT,
    )
    cache.add(f"tus-uploads/{resource_id}/file_size", file_size, conf.CACHE_TIMEOUT)
    cache.add(f"tus-uploads/{resource_id}/offset", 0, conf.CACHE_TIMEOUT)
    cache.add(f"tus-uploads/{resource_id}/metadata", metadata, conf.CACHE_TIMEOUT)
    cache.add(f"tus-uploads/{resource_id}/expires", expires, conf.CACHE_TIMEOUT)

    try:
        with to_path(safe_join(get_upload_path(), resource_id)).open("wb"):
            pass
    except OSError as e:
        logger.error(
            f"Unable to create file: {e}",
            exc_info=True,
            extra={
                "request": request,
            },
        )
        response.status_code = 500
        return response

    response.status_code = 201
    response["Location"] = f"{request.get_full_path()}{resource_id}"
    response["ResourceId"] = resource_id
    response["Upload-Expires"] = http_date(expires)
    return response


@require_http_methods(["DELETE", "HEAD", "PATCH"])
@permission_required
def handle_upload(request, resource_id):
    if request.method == "DELETE":
        return cancel_upload(resource_id)
    if request.method == "HEAD":
        return upload_info(resource_id)
    else:  # PATCH; require_http_methods rejects other methods
        return upload_part(request, resource_id)


def upload_info(resource_id):
    logger.info(f"TUS head resource_id={resource_id}")

    response = get_tus_response()

    offset = cache.get(f"tus-uploads/{resource_id}/offset")
    file_size = cache.get(f"tus-uploads/{resource_id}/file_size")
    if offset is None:
        logger.info("TUS head resource not found")
        response.status_code = 404
        return response

    else:
        response.status_code = 200
        response["Upload-Offset"] = offset
        response["Upload-Length"] = file_size

    return response


def upload_part(request, resource_id):
    # Read the body before locking, so the lock isn't held while receiving the data
    chunk = request.body

    upload_checksum = request.META.get("HTTP_UPLOAD_CHECKSUM")
    if upload_checksum is not None:
        response = check_chunk(resource_id, upload_checksum, chunk)
        if response:
            return response

    with lock_resource(resource_id) as locked:
        if not locked:
            logger.info(f"TUS patch resource_id={resource_id} is locked")
            response = get_tus_response()
            response.status_code = 423  # HTTP 423 Locked
            return response

        return write_chunk(request, resource_id, chunk)


def check_chunk(resource_id, upload_checksum, chunk):
    """
    Return an error response if the chunk doesn't match the Upload-Checksum header
    """
    try:
        if checksum_matches(upload_checksum, chunk):
            return None
    except InvalidChecksumHeader as e:
        logger.info(f"TUS patch resource_id={resource_id} {e}")
        response = get_tus_response()
        response.status_code = 400
        response.reason_phrase = str(e)
        return response

    logger.info(f"TUS patch resource_id={resource_id} checksum mismatch")
    response = get_tus_response()
    response.status_code = 460
    response.reason_phrase = "Checksum Mismatch"
    return response


def write_chunk(request, resource_id, chunk):
    response = get_tus_response()

    filename = cache.get(f"tus-uploads/{resource_id}/filename")
    metadata = cache.get(f"tus-uploads/{resource_id}/metadata")
    offset = cache.get(f"tus-uploads/{resource_id}/offset")

    file_offset = int(request.META.get("HTTP_UPLOAD_OFFSET", 0))

    upload_file_path = to_path(safe_join(get_upload_path(), resource_id))
    if filename is None or not upload_file_path.exists():
        response.status_code = 410
        return response

    expires = cache.get(f"tus-uploads/{resource_id}/expires")
    if expires is not None:
        response["Upload-Expires"] = http_date(expires)

    if file_offset != offset:  # check to make sure we're in sync
        response.status_code = 409  # HTTP 409 Conflict
        return response

    file_size = cache.get(f"tus-uploads/{resource_id}/file_size")

    if file_size is None:
        response.status_code = 404
        return response

    if file_offset + len(chunk) > file_size:
        logger.info(
            f"TUS patch resource_id={resource_id} exceeds Upload-Length={file_size}"
        )
        response.status_code = 413  # HTTP 413 Content Too Large
        return response

    logger.info(
        f"TUS patch resource_id={resource_id} filename={filename} metadata={metadata} offset={offset} upload_file_path={upload_file_path}"
    )

    try:
        with upload_file_path.open("r+b") as file:
            file.seek(file_offset)
            file.write(chunk)
    except OSError:
        response.status_code = 500
        return response

    try:
        new_offset = cache.incr(f"tus-uploads/{resource_id}/offset", len(chunk))
    except ValueError:
        response.status_code = 404
        return response

    response["Upload-Offset"] = new_offset
    response.status_code = 204

    if file_size == new_offset:
        # Create the record before removing the upload from the cache, so the file is
        # never without both (see delete_unused_files)
        create_uploaded_file_in_db(
            field_name=metadata.get("fieldName"),
            file_id=resource_id,
            form_id=metadata.get("formId"),
            original_filename=metadata.get("filename"),
            uploaded_file=upload_file_path,
        )

        remove_resource_from_cache(resource_id)
        del response["Upload-Expires"]

    return response


def cancel_upload(resource_id):
    logger.info(f"TUS delete resource_id={resource_id}")

    # The client sends the delete right after aborting a patch, which may still be
    # writing its chunk. So wait for the lock instead of failing immediately.
    with lock_resource(resource_id, wait=DELETE_LOCK_WAIT) as locked:
        if not locked:
            logger.info(f"TUS delete resource_id={resource_id} is locked")
            response = get_tus_response()
            response.status_code = 423  # HTTP 423 Locked
            return response

        return delete_upload(resource_id)


def delete_upload(resource_id):
    remove_resource_from_cache(resource_id)

    upload_file_path = to_path(safe_join(get_upload_path(), resource_id))

    if upload_file_path.exists():
        upload_file_path.unlink()

    uploaded_file = TemporaryUploadedFile.objects.try_get(file_id=resource_id)

    if uploaded_file:
        uploaded_file.delete()

    response = get_tus_response()
    response.status_code = 204
    return response
