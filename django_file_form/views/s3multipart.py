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
    @classmethod
    def get_bucket_name(cls):
        return setting('AWS_STORAGE_BUCKET_NAME') or lookup_env(['DJANGO_AWS_STORAGE_BUCKET_NAME'])

    @classmethod
    def get_access_key_id(cls):
        return setting('AWS_S3_ACCESS_KEY_ID', setting('AWS_ACCESS_KEY_ID')) or lookup_env(['AWS_S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID'])

    @classmethod
    def get_secret_access_key(cls):
        return setting('AWS_S3_SECRET_ACCESS_KEY', setting('AWS_SECRET_ACCESS_KEY')) or lookup_env(['AWS_S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY'])

    @classmethod
    def get_endpoint_url(cls):
        return setting('AWS_S3_ENDPOINT_URL') or lookup_env(['AWS_S3_ENDPOINT_URL', 'AWS_ENDPOINT_URL'])

    @classmethod
    def file_form_upload_dir(cls):
        return setting('FILE_FORM_UPLOAD_DIR', 'temp_uploads')

    @classmethod
    def get_client(cls):
        while True:
            try:
                # https://github.com/boto/boto3/issues/801
                return boto3.client(
                    's3',
                    endpoint_url=cls.get_endpoint_url(),
                    aws_access_key_id=cls.get_access_key_id(),
                    aws_secret_access_key=cls.get_secret_access_key()
                )
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
    def create_multipart_upload(cls, request):
        if request.method != 'POST':
            return
        client = cls.get_client()
        json_body = json.loads(request.body)
        filename = json_body["filename"]
        s3_upload_dir = json_body["s3UploadDir"]
        bucket_name = cls.get_bucket_name()
        key = cls.get_available_name(
            client, bucket_name, cls.file_form_upload_dir() +
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

    @classmethod
    def get_parts_or_abort_upload(cls, request, upload_id):
        client = cls.get_client()
        key = request.GET['key']
        bucket_name = cls.get_bucket_name()
        if request.method == 'GET':
            response = client.list_parts(
                Bucket=bucket_name, Key=key, UploadId=upload_id)
            if ("Parts" in response):
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

    @classmethod
    def sign_part_upload(cls, request, upload_id, part_number):
        if request.method != 'GET':
            return
        client = cls.get_client()
        key = request.GET['key']
        bucket_name = cls.get_bucket_name()
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

    @classmethod
    def complete_multipart_upload(cls, request, upload_id):
        if request.method != 'POST':
            return
        client = cls.get_client()
        json_body = json.loads(request.body)
        key = request.GET['key']
        parts = json_body["parts"]
        bucket_name = cls.get_bucket_name()
        response = client.complete_multipart_upload(
            Bucket=bucket_name,
            Key=key,
            UploadId=upload_id,
            MultipartUpload={'Parts': parts})
        return JsonResponse({"location": response["Location"]})
