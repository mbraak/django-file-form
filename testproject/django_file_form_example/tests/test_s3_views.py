import json
import os
from unittest import mock

import boto3
from django.test import Client, TestCase, override_settings
from moto import mock_aws

from django_file_form.s3_multipart import utils
from django_file_form.s3_multipart.utils import get_available_name, get_client

BUCKET_NAME = "bucket1"
REGION_NAME = "eu-west-1"


@override_settings(
    AWS_STORAGE_BUCKET_NAME=BUCKET_NAME,
    AWS_S3_ENDPOINT_URL="",
    AWS_ACCESS_KEY_ID="access1",
    AWS_SECRET_ACCESS_KEY="secret1",
    AWS_S3_REGION_NAME=REGION_NAME,
)
class S3ViewTests(TestCase):
    def setUp(self):
        super().setUp()

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

    def test_create_upload(self):
        response = self.create_upload(filename="test.txt", s3_upload_dir="dir1")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["key"], "temp_uploads/dir1/test.txt")

        uploads = self.s3.list_multipart_uploads(Bucket=BUCKET_NAME)["Uploads"]
        self.assertEqual(
            [(upload["Key"], upload["UploadId"]) for upload in uploads],
            [("temp_uploads/dir1/test.txt", data["uploadId"])],
        )

    def test_create_upload_without_upload_dir(self):
        response = self.create_upload(filename="test.txt", s3_upload_dir="")

        self.assertEqual(response.json()["key"], "temp_uploads/test.txt")

    @override_settings(FILE_FORM_UPLOAD_DIR="other_uploads")
    def test_create_upload_with_custom_upload_dir(self):
        response = self.create_upload(filename="test.txt", s3_upload_dir="dir1")

        self.assertEqual(response.json()["key"], "other_uploads/dir1/test.txt")

    def test_create_upload_with_existing_key(self):
        self.s3.put_object(
            Bucket=BUCKET_NAME, Key="temp_uploads/dir1/test.txt", Body=b"abc"
        )

        response = self.create_upload(filename="test.txt", s3_upload_dir="dir1")

        self.assertRegex(
            response.json()["key"], r"^temp_uploads/dir1/test_[a-zA-Z0-9]{7}\.txt$"
        )

    def test_create_upload_sets_content_type(self):
        data = self.create_upload(
            filename="test.txt", s3_upload_dir="dir1", content_type="text/plain"
        ).json()

        self.upload_and_complete(data, b"abc")

        head = self.s3.head_object(Bucket=BUCKET_NAME, Key=data["key"])
        self.assertEqual(head["ContentType"], "text/plain")

    def test_sign_upload_part(self):
        data = self.create_upload(filename="test.txt", s3_upload_dir="dir1").json()

        response = Client().get(f"/s3upload/{data['uploadId']}/1", {"key": data["key"]})

        self.assertEqual(response.status_code, 200)
        url = response.json()["url"]
        self.assertIn(f"{BUCKET_NAME}", url)
        self.assertIn("temp_uploads/dir1/test.txt", url)
        self.assertIn(f"uploadId={data['uploadId']}", url)
        self.assertIn("partNumber=1", url)
        self.assertIn("Signature", url)

    def test_complete_upload(self):
        data = self.create_upload(filename="test.txt", s3_upload_dir="dir1").json()

        response = self.upload_and_complete(data, b"abcdef")

        self.assertEqual(response.status_code, 200)
        self.assertIn("temp_uploads/dir1/test.txt", response.json()["location"])

        body = self.s3.get_object(Bucket=BUCKET_NAME, Key=data["key"])["Body"]
        self.assertEqual(body.read(), b"abcdef")
        self.assertNotIn("Uploads", self.s3.list_multipart_uploads(Bucket=BUCKET_NAME))

    def test_abort_upload(self):
        data = self.create_upload(filename="test.txt", s3_upload_dir="dir1").json()

        response = Client().delete(f"/s3upload/{data['uploadId']}/?key={data['key']}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {})
        self.assertNotIn("Uploads", self.s3.list_multipart_uploads(Bucket=BUCKET_NAME))

    def test_unsupported_methods(self):
        client = Client()

        self.assertEqual(client.get("/s3upload/").status_code, 405)
        self.assertEqual(client.post("/s3upload/upload1/").status_code, 405)
        self.assertEqual(client.post("/s3upload/upload1/1").status_code, 405)
        self.assertEqual(client.get("/s3upload/upload1/complete").status_code, 405)

    def test_get_available_name(self):
        client = get_client()

        self.assertEqual(
            get_available_name(client, BUCKET_NAME, "dir1/test.txt"), "dir1/test.txt"
        )

        self.s3.put_object(Bucket=BUCKET_NAME, Key="dir1/test.txt", Body=b"abc")

        with mock.patch.object(
            utils, "get_random_string", side_effect=["aaaaaaa", "bbbbbbb"]
        ):
            self.s3.put_object(
                Bucket=BUCKET_NAME, Key="dir1/test_aaaaaaa.txt", Body=b"abc"
            )

            self.assertEqual(
                get_available_name(client, BUCKET_NAME, "dir1/test.txt"),
                "dir1/test_bbbbbbb.txt",
            )

    def create_upload(self, filename, s3_upload_dir, content_type="text/plain"):
        return Client().post(
            "/s3upload/",
            data=json.dumps(
                {
                    "filename": filename,
                    "s3UploadDir": s3_upload_dir,
                    "contentType": content_type,
                }
            ),
            content_type="application/json",
        )

    def upload_and_complete(self, data, body):
        part = self.s3.upload_part(
            Bucket=BUCKET_NAME,
            Key=data["key"],
            UploadId=data["uploadId"],
            PartNumber=1,
            Body=body,
        )

        return Client().post(
            f"/s3upload/{data['uploadId']}/complete?key={data['key']}",
            data=json.dumps({"parts": [{"ETag": part["ETag"], "PartNumber": 1}]}),
            content_type="application/json",
        )


class S3SettingsTests(TestCase):
    @override_settings(
        AWS_STORAGE_BUCKET_NAME="",
        AWS_ACCESS_KEY_ID="",
        AWS_SECRET_ACCESS_KEY="",
        AWS_S3_ENDPOINT_URL="",
    )
    def test_settings_from_environment(self):
        environ = {
            "DJANGO_AWS_STORAGE_BUCKET_NAME": "env-bucket",
            "AWS_ACCESS_KEY_ID": "env-access",
            "AWS_SECRET_ACCESS_KEY": "env-secret",
            "AWS_ENDPOINT_URL": "http://env-endpoint",
        }

        with mock.patch.dict(os.environ, environ):
            self.assertEqual(utils.get_bucket_name(), "env-bucket")
            self.assertEqual(utils.get_access_key_id(), "env-access")
            self.assertEqual(utils.get_secret_access_key(), "env-secret")
            self.assertEqual(utils.get_endpoint_url(), "http://env-endpoint")

    @override_settings(
        AWS_STORAGE_BUCKET_NAME="settings-bucket",
        AWS_S3_ACCESS_KEY_ID="settings-s3-access",
        AWS_ACCESS_KEY_ID="settings-access",
        AWS_S3_SECRET_ACCESS_KEY="settings-s3-secret",
        AWS_SECRET_ACCESS_KEY="settings-secret",
        AWS_S3_ENDPOINT_URL="http://settings-endpoint",
    )
    def test_settings_take_precedence(self):
        environ = {
            "DJANGO_AWS_STORAGE_BUCKET_NAME": "env-bucket",
            "AWS_ACCESS_KEY_ID": "env-access",
            "AWS_SECRET_ACCESS_KEY": "env-secret",
            "AWS_ENDPOINT_URL": "http://env-endpoint",
        }

        with mock.patch.dict(os.environ, environ):
            self.assertEqual(utils.get_bucket_name(), "settings-bucket")
            self.assertEqual(utils.get_access_key_id(), "settings-s3-access")
            self.assertEqual(utils.get_secret_access_key(), "settings-s3-secret")
            self.assertEqual(utils.get_endpoint_url(), "http://settings-endpoint")

    def test_get_client_retries(self):
        client = mock.Mock()

        with (
            mock.patch.object(
                utils.boto3,
                "client",
                side_effect=[KeyError("credential_provider"), client],
            ) as boto3_client,
            mock.patch.object(utils.time, "sleep") as sleep,
        ):
            self.assertIs(get_client(), client)

        self.assertEqual(boto3_client.call_count, 2)
        sleep.assert_called_once_with(0.01)

    def test_get_client_gives_up_after_max_attempts(self):
        with (
            mock.patch.object(
                utils.boto3, "client", side_effect=ValueError("invalid config")
            ) as boto3_client,
            mock.patch.object(utils.time, "sleep") as sleep,
            self.assertRaisesMessage(ValueError, "invalid config"),
        ):
            get_client()

        self.assertEqual(boto3_client.call_count, utils.GET_CLIENT_MAX_ATTEMPTS)
        self.assertEqual(sleep.call_count, utils.GET_CLIENT_MAX_ATTEMPTS - 1)
