import os
import time

import boto3
from botocore.exceptions import ClientError
from django.core.exceptions import SuspiciousFileOperation
from django.utils.crypto import get_random_string
from storages.utils import setting, lookup_env


def get_bucket_name():
    return setting("AWS_STORAGE_BUCKET_NAME") or lookup_env(
        ["DJANGO_AWS_STORAGE_BUCKET_NAME"]
    )


def get_access_key_id():
    return setting("AWS_S3_ACCESS_KEY_ID", setting("AWS_ACCESS_KEY_ID")) or lookup_env(
        ["AWS_S3_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID"]
    )


def get_secret_access_key():
    return setting(
        "AWS_S3_SECRET_ACCESS_KEY", setting("AWS_SECRET_ACCESS_KEY")
    ) or lookup_env(["AWS_S3_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY"])


def get_endpoint_url():
    return setting("AWS_S3_ENDPOINT_URL") or lookup_env(
        ["AWS_S3_ENDPOINT_URL", "AWS_ENDPOINT_URL"]
    )


def file_form_upload_dir():
    return setting("FILE_FORM_UPLOAD_DIR", "temp_uploads")


def get_client():
    while True:
        try:
            # https://github.com/boto/boto3/issues/801
            return boto3.client(
                "s3",
                endpoint_url=get_endpoint_url(),
                aws_access_key_id=get_access_key_id(),
                aws_secret_access_key=get_secret_access_key(),
            )
        except:
            time.sleep(0.01)


def exists(client, bucket_name, name):
    """
    Check if key already exists bucket,

    Code adapted from storage.backends.s3boto3
    """
    try:
        client.head_object(Bucket=bucket_name, Key=name)
        return True
    except ClientError:
        return False


def get_alternative_name(file_root, file_ext):
    """
    Return an alternative filename, by adding an underscore and a random 7
    character alphanumeric string (before the file extension, if one
    exists) to the filename.

    Code adapted from django.storage.get_alternative_name
    """
    return f"{file_root}_{get_random_string(7)}{file_ext}"


def get_available_name(client, bucket_name, name, max_length=None):
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
    while exists(client, bucket_name, name) or (max_length and len(name) > max_length):
        # file_ext includes the dot.
        name = os.path.join(dir_name, get_alternative_name(file_root, file_ext))
        if max_length is None:
            continue
        # Truncate file_root if max_length exceeded.
        truncation = len(name) - max_length
        if truncation > 0:
            file_root = file_root[:-truncation]
            # Entire file_root was truncated in attempt to find an available filename.
            if not file_root:
                raise SuspiciousFileOperation(
                    f'Storage can not find an available filename for "{name}". '
                    "Please make sure that the corresponding file field "
                    'allows sufficient "max_length".'
                )
            name = os.path.join(dir_name, get_alternative_name(file_root, file_ext))
    return name
