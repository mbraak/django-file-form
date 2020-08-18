import json

from django.http import JsonResponse
from storages.utils import setting, lookup_env

import boto3
import os
import time


class s3multipart:
    endpoint_url = setting('AWS_S3_ENDPOINT_URL')
    aws_access_key_id = setting('AWS_S3_ACCESS_KEY_ID',
                                setting('AWS_ACCESS_KEY_ID'))
    aws_secret_access_key = setting('AWS_S3_SECRET_ACCESS_KEY',
                                    setting('AWS_SECRET_ACCESS_KEY'))
    aws_storage_bucket_name = setting('AWS_STORAGE_BUCKET_NAME')
    file_form_upload_dir = setting('FILE_FORM_UPLOAD_DIR', 'temp_uploads')

    @classmethod
    def get_client(cls):
        while True:
            try:
                # https://github.com/boto/boto3/issues/801
                return boto3.client(
                    's3',
                    endpoint_url=cls.endpoint_url or
                    lookup_env(['AWS_S3_ENDPOINT_URL', 'AWS_ENDPOINT_URL']),
                    aws_access_key_id=cls.aws_access_key_id or
                    lookup_env(['AWS_S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID']),
                    aws_secret_access_key=cls.aws_secret_access_key or
                    lookup_env(
                        ['AWS_S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY']))
            except:
                time.sleep(0.01)

    @classmethod
    def get_presigned_url(cls, request):
        if request.method != 'POST':
            return
        # check if the post request has the file part
        client = cls.get_client()
        json_body = json.loads(request.body)
        fileName = json_body["filename"]
        contentType = json_body["contentType"]
        s3UploadDir = json_body["s3UploadDir"]
        key = cls.file_form_upload_dir +  "/" + s3UploadDir + "/" + fileName
        response = client.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket':
                    cls.aws_storage_bucket_name
                    or lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
                'Key':
                    key,
                'ContentType':
                    contentType,
                "Body":
                    ''
            },
            ExpiresIn=3600,
        )
        return JsonResponse({
            'method': 'PUT',
            'url': response,
            'fields': [],
            'header': contentType
        })

    @classmethod
    def createMultipartUpload(cls, request):
        if request.method != 'POST':
            return
        client = cls.get_client()
        json_body = json.loads(request.body)
        fileName = json_body["filename"]
        s3UploadDir = json_body["s3UploadDir"]
        key = cls.file_form_upload_dir +  "/" + s3UploadDir + "/" + fileName
        contentType = json_body["contentType"]
        response = client.create_multipart_upload(
            Bucket=cls.aws_storage_bucket_name or
            lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
            Key=key,
            ContentType=contentType,
        )
        return JsonResponse({
            'key': response["Key"],
            'uploadId': response["UploadId"]
        })

    @classmethod
    def getPartsOrAbortUpload(cls, request, uploadId):
        client = cls.get_client()
        key = request.GET['key']
        if request.method == 'GET':
            response = client.list_parts(
                Bucket=cls.aws_storage_bucket_name or
                lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
                Key=key,
                UploadId=uploadId)
            if ("Parts" in response):
                print("GetUploadedParts ", response["Parts"])
                return JsonResponse({'parts': response["Parts"]})
            else:
                return JsonResponse({'parts': []})
        elif request.method == 'DELETE':
            client.abort_multipart_upload(
                Bucket=cls.aws_storage_bucket_name or
                lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
                Key=key,
                UploadId=uploadId,
            )
            return JsonResponse({})

    @classmethod
    def signPartUpload(cls, request, uploadId, partNumber):
        if request.method != 'GET':
            return
        client = cls.get_client()
        key = request.GET['key']
        response = client.generate_presigned_url(
            ClientMethod='upload_part',
            Params={
                'Bucket':
                    cls.aws_storage_bucket_name
                    or lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
                'Key':
                    key,
                'UploadId':
                    uploadId,
                'Body':
                    '',
                'PartNumber':
                    partNumber
            },
            ExpiresIn=3600,
        )
        print('singPartUpload ', response)
        return JsonResponse({'url': response})

    @classmethod
    def completeMultipartUpload(cls, request, uploadId):
        if request.method != 'POST':
            return
        client = cls.get_client()
        json_body = json.loads(request.body)
        key = request.GET['key']
        parts = json_body["parts"]
        response = client.complete_multipart_upload(
            Bucket=cls.aws_storage_bucket_name or
            lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME']),
            Key=key,
            UploadId=uploadId,
            MultipartUpload={'Parts': parts})
        return JsonResponse({"location": response["Location"]})
