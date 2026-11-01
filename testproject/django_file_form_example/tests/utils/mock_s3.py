import os
from unittest import mock

import boto3
from django.test import override_settings
from moto import mock_aws

BUCKET_NAME = "bucket1"
REGION_NAME = "eu-west-1"


class MockS3Mixin:
    """
    Run each test against an in-process moto S3 with an empty bucket.

    Sets `self.s3` to a boto3 client for the bucket.
    """

    def setUp(self):
        super().setUp()

        settings_override = override_settings(
            AWS_STORAGE_BUCKET_NAME=BUCKET_NAME,
            AWS_S3_ENDPOINT_URL=None,
            AWS_ACCESS_KEY_ID="access1",
            AWS_SECRET_ACCESS_KEY="secret1",
            AWS_S3_REGION_NAME=REGION_NAME,
        )
        settings_override.enable()
        self.addCleanup(settings_override.disable)

        # A custom endpoint from the environment would bypass moto
        environ_patch = mock.patch.dict(os.environ)
        environ_patch.start()
        self.addCleanup(environ_patch.stop)
        os.environ.pop("AWS_S3_ENDPOINT_URL", None)
        os.environ.pop("AWS_ENDPOINT_URL", None)

        aws_mock = mock_aws()
        aws_mock.start()
        self.addCleanup(aws_mock.stop)

        self.s3 = boto3.client("s3", region_name=REGION_NAME)
        self.s3.create_bucket(
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": REGION_NAME},
        )
