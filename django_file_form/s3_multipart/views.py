import json
import logging

from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods, require_GET

from .utils import get_bucket_name, file_form_upload_dir, get_client, get_available_name


logger = logging.getLogger(__name__)


@require_POST
def create_upload(request):
    logger.info("Create upload")

    client = get_client()
    json_body = json.loads(request.body)
    filename = json_body["filename"]
    s3_upload_dir = json_body["s3UploadDir"]
    bucket_name = get_bucket_name()
    key = get_available_name(
        client, bucket_name, file_form_upload_dir() +
                             ("/" + s3_upload_dir if s3_upload_dir else "") + "/" + filename)
    content_type = json_body["contentType"]
    response = client.create_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        ContentType=content_type,
    )
    return JsonResponse({
        'key': response["Key"],
        'uploadId': response["UploadId"]
    })


@require_http_methods(["GET", "DELETE"])
def get_parts_or_abort_upload(request, upload_id):
    if request.method == 'GET':
        return get_parts(request, upload_id)
    elif request.method == 'DELETE':
        return abort_upload(request, upload_id)


def abort_upload(request, upload_id):
    logger.info("Abort upload")
    client = get_client()
    bucket_name = get_bucket_name()
    key = request.GET['key']

    client.abort_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        UploadId=upload_id,
    )
    return JsonResponse({})


def get_parts(request, upload_id):
    logger.info("Get part")
    client = get_client()
    bucket_name = get_bucket_name()
    key = request.GET['key']

    response = client.list_parts(Bucket=bucket_name, Key=key, UploadId=upload_id)

    if "Parts" in response:
        return JsonResponse({'parts': response["Parts"]})
    else:
        return JsonResponse({'parts': []})


@require_GET
def sign_part_upload(request, upload_id, part_number):
    logger.info("Generate presigned url")

    client = get_client()
    key = request.GET['key']
    bucket_name = get_bucket_name()
    response = client.generate_presigned_url(
        ClientMethod='upload_part',
        Params={
            'Bucket': bucket_name,
            'Key': key,
            'UploadId': upload_id,
            'Body': '',
            'PartNumber': part_number
        },
        ExpiresIn=3600,
    )
    return JsonResponse({'url': response})


@require_POST
def complete_upload(request, upload_id):
    logger.info("Complete upload")

    client = get_client()
    json_body = json.loads(request.body)
    key = request.GET['key']
    parts = json_body["parts"]
    bucket_name = get_bucket_name()
    response = client.complete_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        UploadId=upload_id,
        MultipartUpload={'Parts': parts}
    )
    return JsonResponse({"location": response["Location"]})
