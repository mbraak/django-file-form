import json
from django.http import JsonResponse

from .utils import get_bucket_name, file_form_upload_dir, get_client, get_available_name


def create_multipart_upload(request):
    if request.method != 'POST':
        return
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


def get_parts_or_abort_upload(request, upload_id):
    client = get_client()
    key = request.GET['key']
    bucket_name = get_bucket_name()
    if request.method == 'GET':
        response = client.list_parts(
            Bucket=bucket_name, Key=key, UploadId=upload_id)
        if "Parts" in response:
            return JsonResponse({'parts': response["Parts"]})
        else:
            return JsonResponse({'parts': []})
    elif request.method == 'DELETE':
        client.abort_multipart_upload(
            Bucket=bucket_name,
            Key=key,
            UploadId=upload_id,
        )
        return JsonResponse({})


def sign_part_upload(request, upload_id, part_number):
    if request.method != 'GET':
        return
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


def complete_multipart_upload(request, upload_id):
    if request.method != 'POST':
        return
    client = get_client()
    json_body = json.loads(request.body)
    key = request.GET['key']
    parts = json_body["parts"]
    bucket_name = get_bucket_name()
    response = client.complete_multipart_upload(
        Bucket=bucket_name,
        Key=key,
        UploadId=upload_id,
        MultipartUpload={'Parts': parts})
    return JsonResponse({"location": response["Location"]})
