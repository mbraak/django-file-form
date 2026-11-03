import json
import logging

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from django_file_form.django_util import permission_required

from .utils import file_form_upload_dir, get_available_name, get_storage

logger = logging.getLogger(__name__)


@require_POST
@permission_required
def create_upload(request):
    logger.info("Create upload")

    storage = get_storage()
    client = storage.connection.meta.client
    bucket_name = storage.bucket_name
    json_body = json.loads(request.body)
    filename = json_body["filename"]
    s3_upload_dir = json_body["s3UploadDir"]
    key = get_available_name(
        client,
        bucket_name,
        file_form_upload_dir()
        + ("/" + s3_upload_dir if s3_upload_dir else "")
        + "/"
        + filename,
    )
    content_type = json_body["contentType"]
    response = client.create_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        ContentType=content_type,
    )
    return JsonResponse({"key": response["Key"], "uploadId": response["UploadId"]})


@require_http_methods(["DELETE"])
@permission_required
def abort_upload(request, upload_id):
    logger.info("Abort upload")
    storage = get_storage()
    client = storage.connection.meta.client
    bucket_name = storage.bucket_name
    key = request.GET["key"]

    client.abort_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        UploadId=upload_id,
    )
    return JsonResponse({})


@require_GET
@permission_required
def sign_upload_part(request, upload_id, part_number):
    logger.info("Generate presigned url")

    storage = get_storage()
    client = storage.connection.meta.client
    bucket_name = storage.bucket_name
    key = request.GET["key"]
    response = client.generate_presigned_url(
        ClientMethod="upload_part",
        Params={
            "Bucket": bucket_name,
            "Key": key,
            "UploadId": upload_id,
            "Body": "",
            "PartNumber": part_number,
        },
        ExpiresIn=3600,
    )
    return JsonResponse({"url": response})


@require_POST
@permission_required
def complete_upload(request, upload_id):
    logger.info("Complete upload")

    storage = get_storage()
    client = storage.connection.meta.client
    bucket_name = storage.bucket_name
    json_body = json.loads(request.body)
    key = request.GET["key"]
    parts = json_body["parts"]
    response = client.complete_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        UploadId=upload_id,
        MultipartUpload={"Parts": parts},
    )
    return JsonResponse({"location": response["Location"]})
