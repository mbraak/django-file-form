import base64
import logging
import uuid

from django.views.decorators.http import require_POST, require_http_methods

from django_file_form import conf
from django_file_form.models import TemporaryUploadedFile
from django_file_form.util import get_upload_path, check_permission, safe_join
from .utils import (
    cache,
    create_uploaded_file_in_db,
    get_tus_response,
    remove_resource_from_cache,
)


logger = logging.getLogger(__name__)


@require_POST
def start_upload(request):
    check_permission(request)

    response = get_tus_response()

    if request.META.get("HTTP_TUS_RESUMABLE", None) is None:
        logger.warning("Received File upload for unsupported file transfer protocol")
        response.status_code = 500
        response.reason_phrase = (
            "Received File upload for unsupported file transfer protocol"
        )
        return response

    metadata = {}
    upload_metadata = request.META.get("HTTP_UPLOAD_METADATA", None)

    if upload_metadata:
        for kv in upload_metadata.split(","):
            (key, value) = kv.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

    logger.info(f"TUS post metadata={metadata}")

    file_size = int(request.META.get("HTTP_UPLOAD_LENGTH", "0"))
    resource_id = str(uuid.uuid4())

    cache.add(
        "tus-uploads/{}/filename".format(resource_id),
        metadata.get("filename"),
        conf.CACHE_TIMEOUT,
    )
    cache.add(
        "tus-uploads/{}/file_size".format(resource_id), file_size, conf.CACHE_TIMEOUT
    )
    cache.add("tus-uploads/{}/offset".format(resource_id), 0, conf.CACHE_TIMEOUT)
    cache.add(
        "tus-uploads/{}/metadata".format(resource_id), metadata, conf.CACHE_TIMEOUT
    )

    try:
        with safe_join(get_upload_path(), resource_id).open("wb") as f:
            pass
    except IOError as e:
        logger.error(
            "Unable to create file: {}".format(e),
            exc_info=True,
            extra={
                "request": request,
            },
        )
        response.status_code = 500
        return response

    response.status_code = 201
    response["Location"] = "{}{}".format(request.build_absolute_uri(), resource_id)
    response["ResourceId"] = resource_id
    return response


@require_http_methods(["DELETE", "HEAD", "PATCH"])
def handle_upload(request, resource_id):
    check_permission(request)

    if request.method == "DELETE":
        return cancel_upload(resource_id)
    if request.method == "HEAD":
        return upload_info(resource_id)
    elif request.method == "PATCH":
        return upload_part(request, resource_id)


def upload_info(resource_id):
    logger.info(f"TUS head resource_id={resource_id}")

    response = get_tus_response()

    offset = cache.get("tus-uploads/{}/offset".format(resource_id))
    file_size = cache.get("tus-uploads/{}/file_size".format(resource_id))
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
    response = get_tus_response()

    filename = cache.get("tus-uploads/{}/filename".format(resource_id))
    metadata = cache.get("tus-uploads/{}/metadata".format(resource_id))
    offset = cache.get("tus-uploads/{}/offset".format(resource_id))

    file_offset = int(request.META.get("HTTP_UPLOAD_OFFSET", 0))
    chunk_size = int(request.META.get("CONTENT_LENGTH", 102400))

    upload_file_path = safe_join(get_upload_path(), resource_id)
    if filename is None or not upload_file_path.exists():
        response.status_code = 410
        return response

    if file_offset != offset:  # check to make sure we're in sync
        response.status_code = 409  # HTTP 409 Conflict
        return response

    logger.info(
        f"TUS patch resource_id={resource_id} filename={filename} metadata={metadata} offset={offset} upload_file_path={upload_file_path}"
    )

    try:
        file = upload_file_path.open("r+b")
    except IOError:
        file = upload_file_path.open("wb")

    if file:
        try:
            file.seek(file_offset)
            file.write(request.body)
        except IOError:
            response.status_code = 500
            return response
        finally:
            file.close()

    try:
        new_offset = cache.incr("tus-uploads/{}/offset".format(resource_id), chunk_size)
    except ValueError:
        response.status_code = 404
        return response

    file_size_string = cache.get("tus-uploads/{}/file_size".format(resource_id))

    if file_size_string is None:
        response.status_code = 404
        return response

    response["Upload-Offset"] = new_offset
    response.status_code = 204

    file_size = int(file_size_string)

    if file_size == new_offset:
        remove_resource_from_cache(resource_id)

        create_uploaded_file_in_db(
            field_name=metadata.get("fieldName"),
            file_id=resource_id,
            form_id=metadata.get("formId"),
            original_filename=metadata.get("filename"),
            uploaded_file=upload_file_path,
        )

    return response


def cancel_upload(resource_id):
    logger.info(f"TUS delete resource_id={resource_id}")

    remove_resource_from_cache(resource_id)

    upload_file_path = safe_join(get_upload_path(), resource_id)

    if upload_file_path.exists():
        upload_file_path.unlink()

    uploaded_file = TemporaryUploadedFile.objects.try_get(file_id=resource_id)

    if uploaded_file:
        uploaded_file.delete()

    response = get_tus_response()
    response.status_code = 204
    return response
