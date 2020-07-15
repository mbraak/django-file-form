
import json

from django.http import JsonResponse

import boto3
import os


class s3multipart:
    def get_presigned_url(request):
        if request.method == 'POST':
            # check if the post request has the file part
            s3 = boto3.client(
                's3',
                # endpoint_url=credentials.get('endpoint_url'),
                # aws_access_key_id=credentials.get('access_key'),
                # aws_secret_access_key=credentials.get('secret_key'),
                endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
            )

            directory = 'uppy-test'
            json_body = json.loads(request.body)
            fileName = json_body["filename"]
            contentType = json_body["contentType"]
            key = directory + "/" + fileName

            response = s3.generate_presigned_url(
                ClientMethod='put_object',
                Params={
                    'Bucket': os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                    'Key': key,
                    'ContentType': contentType,
                    "Body": ''
                },
                ExpiresIn=3600,
            )
            # print("GetPresigned ",response)
            return JsonResponse({
                'method': 'PUT',
                'url': response,
                'fields': [],
                'header': contentType
            })

    def createMultipartUpload(request):
        if request.method == 'POST':
            client = boto3.client(
                's3',
                endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
            )
            directory = 'uppy-test'

            json_body = json.loads(request.body)
            fileName = json_body["filename"]
            key = directory + "/" + fileName
            contentType = json_body["contentType"]

            response = client.create_multipart_upload(
                Bucket=os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                Key=key,
                ContentType=contentType,
            )
            print("Create Multipart ",response)
            return JsonResponse({
                'key': response["Key"],
                'uploadId': response["UploadId"]
                })

    def getUploadedParts(request, uploadId):
        if request.method == 'GET':
            client = boto3.client(
                    's3',
                    endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                    aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
                )
            key = request.GET['key']

            response = client.list_parts(
                Bucket=os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                Key=key,
                UploadId=uploadId
            )
            if ("Parts" in response):
                print("GetUploadedParts ",response["Parts"])
                return JsonResponse({
                    'parts': response["Parts"]
                })
            else:
                return JsonResponse({
                    'parts': []
                })

    def signPartUpload(request, uploadId, partNumber):
        if request.method == 'GET':
            s3 = boto3.client(
                's3',
                endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
            )
            directory = 'uppy-test'
            key = request.GET['key']
            response = s3.generate_presigned_url(
                ClientMethod='upload_part',
                Params={
                    'Bucket': os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                    'Key': key,
                    'UploadId': uploadId,
                    'Body': '',
                    'PartNumber': partNumber
                },
                ExpiresIn=3600,
            )
            print('singPartUpload ', response)
            return JsonResponse({
                'url': response
            })

    def abortMultipartUpload(request, uploadId):
        if request.method == 'DELETE':
            client = boto3.client(
                    's3',
                    endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                    aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
                )
            key = request.GET['key']
            client.abort_multipart_upload(

                Bucket=os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                Key=key,
                UploadId=uploadId,
            )
            # print("Abort ",reponse)
            return JsonResponse({})

    def completeMultipartUpload(request, uploadId):
        if request.method == 'POST':
            client = boto3.client(
                    's3',
                    endpoint_url=os.getenv("DJANGO_AWS_S3_ENDPOINT_URL"),
                    aws_access_key_id=os.getenv("DJANGO_AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("DJANGO_AWS_SECRET_ACCESS_KEY"),
                )
            json_body = json.loads(request.body)
            key = request.GET['key']
            parts = json_body["parts"]
            response = client.complete_multipart_upload(
                Bucket=os.getenv("DJANGO_AWS_STORAGE_BUCKET_NAME"),
                Key=key,
                UploadId=uploadId,
                MultipartUpload={'Parts': parts}
            )
            return JsonResponse({
                "location": response["Location"]
            })
