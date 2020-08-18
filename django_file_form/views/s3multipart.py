import boto3
import json
import os
import time

from django.core.exceptions import SuspiciousFileOperation
from django.http import JsonResponse
from django.utils.crypto import get_random_string
from storages.utils import setting, lookup_env
from botocore.exceptions import ClientError


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
    def exists(cls, client, bucket_name, name):
        """
        Check if key already exists bucket,

        Code adapted from storage.backends.s3boto3
        """
        try:
            client.head_object(Bucket=bucket_name, Key=name)
            return True
        except ClientError:
            return False

    @classmethod
    def get_alternative_name(cls, file_root, file_ext):
        """
        Return an alternative filename, by adding an underscore and a random 7
        character alphanumeric string (before the file extension, if one
        exists) to the filename.

        Code adapted from django.storage.get_alternative_name
        """
        return f'{file_root}_{get_random_string(7)}{file_ext}'

    @classmethod
    def get_available_name(cls, client, bucket_name, name, max_length=None):
        """
        Return a filename that's free on the target storage system and
        available for new content to be written to.

        Code adapted from django.storage.get_available_name
        """
        dir_name, file_name = os.path.split(name)
        file_root, file_ext = os.path.splitext(file_name)
        # If the filename already exists, generate an alternative filename
        # until it doesn't exist.
        # Truncate original name if required, so the new filename does not
        # exceed the max_length.
        while cls.exists(client, bucket_name, name) or (max_length and
                                                        len(name) > max_length):
            # file_ext includes the dot.
            name = os.path.join(dir_name,
                                cls.get_alternative_name(file_root, file_ext))
            if max_length is None:
                continue
            # Truncate file_root if max_length exceeded.
            truncation = len(name) - max_length
            if truncation > 0:
                file_root = file_root[:-truncation]
                # Entire file_root was truncated in attempt to find an available filename.
                if not file_root:
                    raise SuspiciousFileOperation(
                        'Storage can not find an available filename for "%s". '
                        'Please make sure that the corresponding file field '
                        'allows sufficient "max_length".' % name)
                name = os.path.join(
                    dir_name, cls.get_alternative_name(file_root, file_ext))
        return name

    @classmethod
    def createMultipartUpload(cls, request):
        if request.method != 'POST':
            return
        client = cls.get_client()
        json_body = json.loads(request.body)
        fileName = json_body["filename"]
        s3UploadDir = json_body["s3UploadDir"]
        bucket_name = cls.aws_storage_bucket_name or lookup_env(
            ['DJANGO_AWS_STORAGE_BUCKET_NAME'])
        key = cls.get_available_name(
            client, bucket_name,
            cls.file_form_upload_dir + "/" + s3UploadDir + "/" + fileName)
        contentType = json_body["contentType"]
        response = client.create_multipart_upload(
            Bucket=bucket_name,
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
