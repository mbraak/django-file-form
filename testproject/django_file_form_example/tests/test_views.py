import base64
import hashlib
import re
import time
from pathlib import Path
from unittest import mock

from django.contrib.auth.models import User
from django.test import Client, RequestFactory, TestCase, override_settings
from django.utils.http import parse_http_date

from django_file_form import conf
from django_file_form.django_util import get_upload_path
from django_file_form.models import TemporaryUploadedFile
from django_file_form.tus.utils import cache
from django_file_form.tus.views import handle_upload, write_chunk
from django_file_form_example.tests.utils.test_utils import remove_test_files


def encode_metadata(**metadata):
    return ",".join(
        f"{key} {base64.b64encode(value.encode('utf-8')).decode('ascii')}"
        for key, value in metadata.items()
    )


def encode_checksum(algorithm, data):
    digest = hashlib.new(algorithm, data).digest()
    return f"{algorithm} {base64.b64encode(digest).decode('ascii')}"


class ViewTests(TestCase):
    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_post(self):
        self.do_post(Client())

    def test_post_without_metadata(self):
        with self.assertLogs("django_file_form.tus.views", level="WARNING"):
            response = Client().post("/upload/")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.reason_phrase,
            "Received file upload for unsupported file transfer protocol",
        )

    def test_post_creates_empty_file(self):
        resource_id = self.do_post(Client())

        upload_file_path = get_upload_path().joinpath(resource_id)
        self.assertTrue(upload_file_path.exists())
        self.assertEqual(upload_file_path.read_bytes(), b"")

    def test_post_with_metadata(self):
        resource_id = self.do_post(
            Client(),
            upload_length=10,
            metadata={"filename": "test.txt", "formId": "form1", "fieldName": "f"},
        )

        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/filename"), "test.txt")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/file_size"), 10)
        self.assertEqual(
            cache.get(f"tus-uploads/{resource_id}/metadata"),
            {"filename": "test.txt", "formId": "form1", "fieldName": "f"},
        )

    def test_post_with_metadata_without_value(self):
        # The tus protocol allows a key without a value
        response = Client().post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="0",
            HTTP_UPLOAD_METADATA=f"{encode_metadata(filename='test.txt')},is_confidential,empty ",
        )
        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            cache.get(f"tus-uploads/{response['ResourceId']}/metadata"),
            {"filename": "test.txt", "is_confidential": "", "empty": ""},
        )

    def test_post_has_tus_headers(self):
        response = Client().post(
            "/upload/", HTTP_TUS_RESUMABLE="1.0.0", HTTP_UPLOAD_LENGTH="0"
        )

        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertEqual(response["Tus-Version"], "1.0.0")
        self.assertEqual(
            response["Tus-Extension"],
            "checksum,creation,expiration,termination,file-check",
        )
        self.assertEqual(response["Tus-Checksum-Algorithm"], "md5,sha1,sha256,sha512")

        # The uploads are same origin, so there are no CORS headers
        self.assertFalse(
            [
                header
                for header in response.headers
                if header.startswith("Access-Control")
            ]
        )
        self.assertEqual(
            response["ResourceId"], response["Location"][len("/upload/") :]
        )

    def test_post_has_upload_expires(self):
        before = time.time()
        response = Client().post(
            "/upload/", HTTP_TUS_RESUMABLE="1.0.0", HTTP_UPLOAD_LENGTH="0"
        )
        after = time.time()

        # The upload expires when its data is removed from the cache
        expires = parse_http_date(response["Upload-Expires"])
        self.assertGreaterEqual(expires, int(before) + conf.CACHE_TIMEOUT)
        self.assertLessEqual(expires, after + conf.CACHE_TIMEOUT)

    def test_patch_has_upload_expires(self):
        client = Client()
        response = client.post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="6",
            HTTP_UPLOAD_METADATA=encode_metadata(filename="test.txt", formId="form1"),
        )
        resource_id = response["ResourceId"]
        upload_expires = response["Upload-Expires"]

        # The expiration doesn't change while uploading
        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Expires"], upload_expires)

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response["Upload-Expires"], upload_expires)

        # A finished upload doesn't expire
        response = self.do_patch(client, resource_id, b"def", offset=3)
        self.assertEqual(response.status_code, 204)
        self.assertNotIn("Upload-Expires", response)
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/expires"))

    def test_patch_after_upload_expired(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        # Simulate that the cache timeout passed
        cache.delete_many(
            [
                f"tus-uploads/{resource_id}/{key}"
                for key in ["filename", "file_size", "offset", "metadata", "expires"]
            ]
        )

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 410)

        response = client.head(f"/upload/{resource_id}")
        self.assertEqual(response.status_code, 404)

    def test_post_when_file_cannot_be_created(self):
        with (
            mock.patch.object(Path, "open", side_effect=OSError("disk full")),
            self.assertLogs("django_file_form.tus.views", level="ERROR"),
        ):
            response = Client().post(
                "/upload/", HTTP_TUS_RESUMABLE="1.0.0", HTTP_UPLOAD_LENGTH="0"
            )

        self.assertEqual(response.status_code, 500)

    def test_head(self):
        client = Client()

        resource_id = self.do_post(client)

        response = client.head(f"/upload/{resource_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Upload-Offset"], "0")
        self.assertEqual(response["Upload-Length"], "0")

    def test_head_after_patch(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        self.do_patch(client, resource_id, b"abc", offset=0)

        response = client.head(f"/upload/{resource_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Upload-Offset"], "3")
        self.assertEqual(response["Upload-Length"], "6")

    def test_head_with_unknown_resource_id(self):
        response = Client().head("/upload/unknown")
        self.assertEqual(response.status_code, 404)

    def test_upload_in_one_patch(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=6,
            metadata={
                "filename": "test.txt",
                "formId": "form1",
                "fieldName": "input_file",
            },
        )

        response = self.do_patch(client, resource_id, b"abcdef", offset=0)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "6")

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(uploaded_file.original_filename, "test.txt")
        self.assertEqual(uploaded_file.form_id, "form1")
        self.assertEqual(uploaded_file.field_name, "input_file")
        self.assertEqual(
            uploaded_file.uploaded_file.name, f"temp_uploads/{resource_id}"
        )
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"abcdef")

        # The upload is finished, so it is removed from the cache
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/offset"))
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/filename"))

    def test_upload_in_chunks(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=6,
            metadata={
                "filename": "test.txt",
                "formId": "form1",
                "fieldName": "input_file",
            },
        )

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "3")
        self.assertFalse(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )

        response = self.do_patch(client, resource_id, b"def", offset=3)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "6")

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"abcdef")

    def test_patch_without_content_length_uses_body_length(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=6,
            metadata={"filename": "test.txt", "formId": "form1"},
        )

        request = RequestFactory().patch(
            f"/upload/{resource_id}",
            data=b"abc",
            content_type="application/offset+octet-stream",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_OFFSET="0",
        )
        # The offset is based on the bytes received, not on the Content-Length header
        del request.META["CONTENT_LENGTH"]

        response = handle_upload(request, resource_id)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "3")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 3)

        response = self.do_patch(client, resource_id, b"def", offset=3)
        self.assertEqual(response.status_code, 204)

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"abcdef")

    def test_upload_without_field_name(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=3,
            metadata={"filename": "test.txt", "formId": "form1"},
        )

        self.do_patch(client, resource_id, b"abc", offset=0)

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertIsNone(uploaded_file.field_name)

    @override_settings(FILE_FORM_ALWAYS_COPY_UPLOADED_FILE=True)
    def test_upload_with_copy(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=3,
            metadata={
                "filename": "test.txt",
                "formId": "form1",
                "fieldName": "input_file",
            },
        )

        self.do_patch(client, resource_id, b"abc", offset=0)

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"abc")

        # The file is copied to a new name and the original file is removed
        self.assertNotEqual(
            uploaded_file.uploaded_file.name, f"temp_uploads/{resource_id}"
        )
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())

    def test_patch_with_checksum(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=6,
            metadata={"filename": "test.txt", "formId": "form1"},
        )

        response = self.do_patch(
            client,
            resource_id,
            b"abc",
            offset=0,
            HTTP_UPLOAD_CHECKSUM=encode_checksum("sha1", b"abc"),
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "3")

        response = self.do_patch(
            client,
            resource_id,
            b"def",
            offset=3,
            HTTP_UPLOAD_CHECKSUM=encode_checksum("sha256", b"def"),
        )
        self.assertEqual(response.status_code, 204)

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"abcdef")

    def test_patch_with_checksum_mismatch(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(
            client,
            resource_id,
            b"abc",
            offset=0,
            HTTP_UPLOAD_CHECKSUM=encode_checksum("sha1", b"xyz"),
        )

        # The chunk is discarded
        self.assertEqual(response.status_code, 460)
        self.assertEqual(response.reason_phrase, "Checksum Mismatch")
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"")

    def test_patch_with_unsupported_checksum_algorithm(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(
            client,
            resource_id,
            b"abc",
            offset=0,
            HTTP_UPLOAD_CHECKSUM=encode_checksum("sha3_256", b"abc"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.reason_phrase, "Unsupported checksum algorithm: sha3_256"
        )
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)

    def test_patch_with_invalid_checksum(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        for upload_checksum in ["sha1 not-base64!", "sha1", ""]:
            with self.subTest(upload_checksum=upload_checksum):
                response = self.do_patch(
                    client,
                    resource_id,
                    b"abc",
                    offset=0,
                    HTTP_UPLOAD_CHECKSUM=upload_checksum,
                )

                self.assertEqual(response.status_code, 400)
                self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)

    def test_patch_when_locked(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        # Simulate a concurrent request that holds the lock
        cache.add(f"tus-uploads/{resource_id}/lock", "other-request")

        response = self.do_patch(client, resource_id, b"abc", offset=0)

        self.assertEqual(response.status_code, 423)
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"")

        # The lock of the other request is kept
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/lock"), "other-request")

    def test_patch_releases_lock(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=6,
            metadata={"filename": "test.txt", "formId": "form1"},
        )

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 204)
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/lock"))

        # Also when the patch is rejected
        response = self.do_patch(client, resource_id, b"def", offset=0)
        self.assertEqual(response.status_code, 409)
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/lock"))

        response = self.do_patch(client, resource_id, b"def", offset=3)
        self.assertEqual(response.status_code, 204)

    def test_patch_does_not_release_lock_of_other_request(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        lock_key = f"tus-uploads/{resource_id}/lock"

        # Simulate that the lock expires during the request and another request takes it
        def write_chunk_and_lose_lock(*args, **kwargs):
            cache.set(lock_key, "other-request")
            return write_chunk(*args, **kwargs)

        with mock.patch(
            "django_file_form.tus.views.write_chunk",
            side_effect=write_chunk_and_lose_lock,
        ):
            response = self.do_patch(client, resource_id, b"abc", offset=0)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(cache.get(lock_key), "other-request")

    def test_post_without_upload_length(self):
        response = Client().post("/upload/", HTTP_TUS_RESUMABLE="1.0.0")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.reason_phrase, "Missing or invalid Upload-Length")
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertFalse(response.has_header("Location"))

    def test_post_with_invalid_upload_length(self):
        for upload_length in ["", "abc", "-1", "1.5", " 3", "+3", "\u00b2"]:
            with self.subTest(upload_length=upload_length):
                response = Client().post(
                    "/upload/",
                    HTTP_TUS_RESUMABLE="1.0.0",
                    HTTP_UPLOAD_LENGTH=upload_length,
                )

                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.has_header("Location"))

    def test_patch_exceeding_upload_length(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=4, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 204)

        # The chunk is rejected and nothing is written
        response = self.do_patch(client, resource_id, b"def", offset=3)

        self.assertEqual(response.status_code, 413)
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 3)
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"abc")
        self.assertFalse(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/lock"))

    def test_patch_with_zero_upload_length(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=0, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(client, resource_id, b"a", offset=0)

        self.assertEqual(response.status_code, 413)
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"")

    def test_patch_with_wrong_offset(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(client, resource_id, b"def", offset=3)

        self.assertEqual(response.status_code, 409)
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)

    def test_patch_with_unknown_resource_id(self):
        response = self.do_patch(Client(), "unknown", b"abc", offset=0)
        self.assertEqual(response.status_code, 410)

    def test_patch_without_filename(self):
        client = Client()
        resource_id = self.do_post(client, upload_length=3)

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 410)

    def test_patch_when_file_is_removed(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=3, metadata={"filename": "test.txt"}
        )
        get_upload_path().joinpath(resource_id).unlink()

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 410)

    def test_patch_when_write_fails(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=3, metadata={"filename": "test.txt"}
        )

        file = mock.MagicMock()
        file.__enter__.return_value = file
        file.write.side_effect = OSError("disk full")

        with mock.patch.object(Path, "open", return_value=file):
            response = self.do_patch(client, resource_id, b"abc", offset=0)

        self.assertEqual(response.status_code, 500)
        file.__exit__.assert_called_once()

    def test_patch_when_file_cannot_be_opened(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        self.do_patch(client, resource_id, b"abc", offset=0)

        with mock.patch.object(Path, "open", side_effect=OSError("permission denied")):
            response = self.do_patch(client, resource_id, b"def", offset=3)

        self.assertEqual(response.status_code, 500)

        # The part that was already uploaded is kept, and the offset is unchanged
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"abc")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 3)

    def test_patch_when_offset_expires(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=3, metadata={"filename": "test.txt"}
        )

        with mock.patch(
            "django_file_form.tus.views.cache.incr", side_effect=ValueError
        ):
            response = self.do_patch(client, resource_id, b"abc", offset=0)

        self.assertEqual(response.status_code, 404)

    def test_patch_when_file_size_expires(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=3, metadata={"filename": "test.txt"}
        )
        cache.delete(f"tus-uploads/{resource_id}/file_size")

        response = self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertEqual(response.status_code, 404)

    def test_delete_during_upload(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        self.do_patch(client, resource_id, b"abc", offset=0)

        response = client.delete(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/offset"))
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/expires"))

    def test_delete_after_upload(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=3,
            metadata={
                "filename": "test.txt",
                "formId": "form1",
                "fieldName": "input_file",
            },
        )
        self.do_patch(client, resource_id, b"abc", offset=0)
        self.assertTrue(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )

        response = client.delete(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())

    def test_delete_with_unknown_resource_id(self):
        response = Client().delete("/upload/unknown")
        self.assertEqual(response.status_code, 204)

    def test_delete_releases_lock(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = client.delete(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 204)
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/lock"))

    def test_delete_waits_for_lock(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        lock_key = f"tus-uploads/{resource_id}/lock"

        # Simulate a patch request that holds the lock and finishes while the delete waits
        cache.add(lock_key, "patch-request")

        def release_lock(seconds):
            cache.delete(lock_key)

        with mock.patch(
            "django_file_form.tus.utils.time.sleep", side_effect=release_lock
        ) as sleep:
            response = client.delete(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 204)
        sleep.assert_called_once()
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/offset"))
        self.assertIsNone(cache.get(lock_key))

    @mock.patch("django_file_form.tus.views.DELETE_LOCK_WAIT", 0)
    def test_delete_when_locked(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        lock_key = f"tus-uploads/{resource_id}/lock"

        # Simulate a patch request that holds the lock
        cache.add(lock_key, "patch-request")

        response = client.delete(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 423)
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertTrue(get_upload_path().joinpath(resource_id).exists())
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertEqual(cache.get(lock_key), "patch-request")

    def test_unsupported_method(self):
        response = Client().get("/upload/unknown")
        self.assertEqual(response.status_code, 405)

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_post_must_login(self):
        response = Client().post(
            "/upload/", HTTP_TUS_RESUMABLE="1.0.0", HTTP_UPLOAD_LENGTH="0"
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"status": "permission denied"})

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_handle_upload_must_login(self):
        client = Client()

        # A HEAD response has no body
        self.assertEqual(client.head("/upload/unknown").status_code, 403)

        for response in [
            client.delete("/upload/unknown"),
            self.do_patch(client, "unknown", b"abc", offset=0),
        ]:
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response.json(), {"status": "permission denied"})

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_must_login_does_not_change_unsupported_method(self):
        self.assertEqual(Client().get("/upload/").status_code, 405)
        self.assertEqual(Client().get("/upload/unknown").status_code, 405)

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_upload_when_logged_in(self):
        client = Client()
        client.force_login(User.objects.create_user("user1"))

        resource_id = self.do_post(
            client,
            upload_length=3,
            metadata={
                "filename": "test.txt",
                "formId": "form1",
                "fieldName": "input_file",
            },
        )
        response = self.do_patch(client, resource_id, b"abc", offset=0)

        self.assertEqual(response.status_code, 204)
        self.assertTrue(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )

    def do_post(self, client, upload_length=0, metadata=None):
        headers = {
            "HTTP_TUS_RESUMABLE": "1.0.0",
            "HTTP_UPLOAD_LENGTH": str(upload_length),
        }

        if metadata:
            headers["HTTP_UPLOAD_METADATA"] = encode_metadata(**metadata)

        response = client.post("/upload/", **headers)
        self.assertEqual(response.status_code, 201)

        re_url_upload_resource = re.compile(r"/upload/(.*)")

        self.assertRegex(response["Location"], re_url_upload_resource)

        return re_url_upload_resource.match(response["Location"]).group(1)

    def do_patch(self, client, resource_id, data, offset, **extra):
        return client.patch(
            f"/upload/{resource_id}",
            data=data,
            content_type="application/offset+octet-stream",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_OFFSET=str(offset),
            **extra,
        )

    def read_uploaded_file(self, uploaded_file):
        with uploaded_file.uploaded_file.open("rb") as f:
            return f.read()
