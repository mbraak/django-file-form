import base64
import hashlib
import re
import time
from pathlib import Path
from unittest import mock

from django.contrib.auth.models import User
from django.core.cache import caches
from django.test import Client, RequestFactory, TestCase, override_settings
from django.utils.http import parse_http_date

from django_file_form import conf
from django_file_form.django_util import get_upload_path
from django_file_form.models import TemporaryUploadedFile
from django_file_form.tus.utils import cache, lock_resource
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

    def test_post_without_tus_resumable(self):
        with self.assertLogs("django_file_form.tus.views", level="WARNING"):
            response = Client().post("/upload/", HTTP_UPLOAD_LENGTH="6")

        self.assertEqual(response.status_code, 412)
        self.assertEqual(response.reason_phrase, "Unsupported tus version")
        self.assertEqual(response["Tus-Version"], "1.0.0")
        self.assertFalse(response.has_header("Location"))

    def test_post_with_unsupported_tus_version(self):
        with self.assertLogs("django_file_form.tus.views", level="WARNING"):
            response = Client().post(
                "/upload/",
                HTTP_TUS_RESUMABLE="2.0.0",
                HTTP_UPLOAD_LENGTH="6",
                HTTP_UPLOAD_METADATA=encode_metadata(formId="form1"),
            )

        self.assertEqual(response.status_code, 412)
        self.assertFalse(response.has_header("Location"))

    def test_handle_upload_without_tus_resumable(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        with self.assertLogs("django_file_form.tus.views", level="WARNING"):
            responses = {
                "HEAD": client.head(f"/upload/{resource_id}"),
                "PATCH": client.patch(
                    f"/upload/{resource_id}",
                    data=b"abc",
                    content_type="application/offset+octet-stream",
                    HTTP_UPLOAD_OFFSET="0",
                ),
                "DELETE": client.delete(f"/upload/{resource_id}"),
            }

        for method, response in responses.items():
            with self.subTest(method=method):
                self.assertEqual(response.status_code, 412)
                self.assertEqual(response["Tus-Version"], "1.0.0")

        # Nothing is changed
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertTrue(get_upload_path().joinpath(resource_id).exists())

    def test_patch_with_wrong_content_type(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        for content_type in ["application/octet-stream", "text/plain"]:
            with self.subTest(content_type=content_type):
                response = client.patch(
                    f"/upload/{resource_id}",
                    data=b"abc",
                    content_type=content_type,
                    HTTP_TUS_RESUMABLE="1.0.0",
                    HTTP_UPLOAD_OFFSET="0",
                )

                self.assertEqual(response.status_code, 415)
                self.assertEqual(response["Tus-Resumable"], "1.0.0")
                self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
                self.assertEqual(
                    get_upload_path().joinpath(resource_id).read_bytes(), b""
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
            HTTP_UPLOAD_LENGTH="6",
            HTTP_UPLOAD_METADATA=f"{encode_metadata(filename='test.txt', formId='form1')},is_confidential,empty ",
        )
        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            cache.get(f"tus-uploads/{response['ResourceId']}/metadata"),
            {
                "filename": "test.txt",
                "formId": "form1",
                "is_confidential": "",
                "empty": "",
            },
        )

    def test_post_has_tus_headers(self):
        response = Client().post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="6",
            HTTP_UPLOAD_METADATA=encode_metadata(formId="form1"),
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
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="6",
            HTTP_UPLOAD_METADATA=encode_metadata(formId="form1"),
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

        response = client.head(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")
        self.assertEqual(response.status_code, 404)

    def test_post_when_file_cannot_be_created(self):
        with (
            mock.patch.object(Path, "open", side_effect=OSError("disk full")),
            self.assertLogs("django_file_form.tus.views", level="ERROR"),
        ):
            response = Client().post(
                "/upload/",
                HTTP_TUS_RESUMABLE="1.0.0",
                HTTP_UPLOAD_LENGTH="6",
                HTTP_UPLOAD_METADATA=encode_metadata(formId="form1"),
            )

        self.assertEqual(response.status_code, 500)

    def test_head(self):
        client = Client()

        resource_id = self.do_post(client)

        response = client.head(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Upload-Offset"], "0")
        self.assertEqual(response["Upload-Length"], "6")

        # Required by the tus protocol, so the offset is never cached
        self.assertEqual(response["Cache-Control"], "no-store")

    def test_head_after_patch(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        self.do_patch(client, resource_id, b"abc", offset=0)

        response = client.head(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Upload-Offset"], "3")
        self.assertEqual(response["Upload-Length"], "6")

    def test_head_with_unknown_resource_id(self):
        response = Client().head("/upload/unknown", HTTP_TUS_RESUMABLE="1.0.0")
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
        self.assert_resource_not_in_cache(resource_id)

    def test_upload_uses_file_form_cache(self):
        # The testproject sets FILE_FORM_CACHE to a separate cache
        resource_id = self.do_post(
            Client(), upload_length=6, metadata={"filename": "test.txt"}
        )

        offset_key = f"tus-uploads/{resource_id}/offset"
        self.assertEqual(caches["file_form"].get(offset_key), 0)
        self.assertIsNone(caches["default"].get(offset_key))

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

        for upload_checksum in [
            "sha1 not-base64!",
            # A valid checksum followed by a character that is not base64
            encode_checksum("sha1", b"abc") + "!",
            "sha1",
            "",
        ]:
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

        with mock.patch("django_file_form.tus.utils.time.sleep") as sleep:
            response = self.do_patch(client, resource_id, b"abc", offset=0)

        # A patch doesn't wait for the lock; the client retries it
        sleep.assert_not_called()
        self.assertEqual(response.status_code, 423)
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertEqual(get_upload_path().joinpath(resource_id).read_bytes(), b"")

        # The lock of the other request is kept
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/lock"), "other-request")

    def test_patch_without_upload_offset(self):
        # Without an Upload-Offset header the offset is 0
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = self.do_patch(client, resource_id, b"abc", offset=None)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Upload-Offset"], "3")

        # So a second chunk without the header doesn't match the offset
        response = self.do_patch(client, resource_id, b"def", offset=None)
        self.assertEqual(response.status_code, 409)

    def test_lock_expires(self):
        # A lock expires after 60 seconds, so a worker that dies while holding it
        # doesn't block the upload forever
        resource_id = "lock-expires"

        def lock_after(seconds):
            # Try to get the lock in another request, `seconds` later
            with (
                mock.patch(
                    "django.core.cache.backends.locmem.time.time",
                    return_value=now + seconds,
                ),
                lock_resource(resource_id) as locked_by_other_request,
            ):
                return locked_by_other_request

        with lock_resource(resource_id) as locked:
            self.assertTrue(locked)
            now = time.time()

            self.assertFalse(lock_after(59))
            self.assertTrue(lock_after(60.5))

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

    def test_post_without_form_id(self):
        for metadata in [{}, {"filename": "test.txt"}, {"formId": ""}]:
            with self.subTest(metadata=metadata):
                headers = {"HTTP_TUS_RESUMABLE": "1.0.0", "HTTP_UPLOAD_LENGTH": "6"}
                if metadata:
                    headers["HTTP_UPLOAD_METADATA"] = encode_metadata(**metadata)

                response = Client().post("/upload/", **headers)

                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.reason_phrase, "Missing formId in Upload-Metadata"
                )
                self.assertEqual(response["Tus-Resumable"], "1.0.0")
                self.assertFalse(response.has_header("Location"))

    def test_post_empty_file_without_form_id(self):
        # Previously this failed with a database error when creating the record
        response = Client().post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="0",
            HTTP_UPLOAD_METADATA=encode_metadata(filename="empty.txt"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(TemporaryUploadedFile.objects.count(), 0)

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

    def test_upload_empty_file(self):
        # A tus client only sends a post request for an empty file
        client = Client()
        response = client.post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="0",
            HTTP_UPLOAD_METADATA=encode_metadata(
                filename="empty.txt", formId="form1", fieldName="input_file"
            ),
        )

        self.assertEqual(response.status_code, 201)
        resource_id = response["ResourceId"]

        # The upload is finished, so it doesn't expire and isn't in the cache
        self.assertNotIn("Upload-Expires", response)
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/offset"))
        self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/expires"))

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(uploaded_file.original_filename, "empty.txt")
        self.assertEqual(uploaded_file.form_id, "form1")
        self.assertEqual(uploaded_file.field_name, "input_file")
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"")

        # A patch for the finished upload is rejected
        response = self.do_patch(client, resource_id, b"a", offset=0)
        self.assertEqual(response.status_code, 410)

    @override_settings(FILE_FORM_ALWAYS_COPY_UPLOADED_FILE=True)
    def test_upload_empty_file_with_copy(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=0,
            metadata={"filename": "empty.txt", "formId": "form1"},
        )

        uploaded_file = TemporaryUploadedFile.objects.get(file_id=resource_id)
        self.assertEqual(self.read_uploaded_file(uploaded_file), b"")
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())

    def test_delete_empty_file(self):
        client = Client()
        resource_id = self.do_post(
            client,
            upload_length=0,
            metadata={"filename": "empty.txt", "formId": "form1"},
        )

        response = client.delete(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())

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

        response = client.delete(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())
        self.assert_resource_not_in_cache(resource_id)

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

        response = client.delete(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            TemporaryUploadedFile.objects.filter(file_id=resource_id).exists()
        )
        self.assertFalse(get_upload_path().joinpath(resource_id).exists())

    def test_delete_with_unknown_resource_id(self):
        response = Client().delete("/upload/unknown", HTTP_TUS_RESUMABLE="1.0.0")
        self.assertEqual(response.status_code, 204)

    def test_delete_releases_lock(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = client.delete(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")

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
            response = client.delete(
                f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0"
            )

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

        response = client.delete(f"/upload/{resource_id}", HTTP_TUS_RESUMABLE="1.0.0")

        self.assertEqual(response.status_code, 423)
        self.assertEqual(response["Tus-Resumable"], "1.0.0")
        self.assertTrue(get_upload_path().joinpath(resource_id).exists())
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertEqual(cache.get(lock_key), "patch-request")

    def test_unsupported_method(self):
        response = Client().get("/upload/unknown")
        self.assertEqual(response.status_code, 405)

    def test_options(self):
        # An OPTIONS request doesn't need a Tus-Resumable header
        for url in ["/upload/", "/upload/unknown"]:
            with self.subTest(url=url):
                response = Client().options(url)

                self.assertEqual(response.status_code, 204)
                self.assertEqual(response["Tus-Version"], "1.0.0")
                self.assertEqual(
                    response["Tus-Extension"],
                    "checksum,creation,expiration,termination,file-check",
                )
                self.assertEqual(
                    response["Tus-Checksum-Algorithm"], "md5,sha1,sha256,sha512"
                )
                self.assertFalse(response.has_header("Tus-Max-Size"))

    @override_settings(FILE_FORM_MAX_UPLOAD_SIZE=1000)
    def test_options_with_max_upload_size(self):
        response = Client().options("/upload/")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Tus-Max-Size"], "1000")

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_options_does_not_need_login(self):
        response = Client().options("/upload/")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Tus-Version"], "1.0.0")

    def test_options_does_not_change_upload(self):
        client = Client()
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )

        response = client.options(f"/upload/{resource_id}")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(cache.get(f"tus-uploads/{resource_id}/offset"), 0)
        self.assertTrue(get_upload_path().joinpath(resource_id).exists())

    @override_settings(FILE_FORM_MAX_UPLOAD_SIZE=6)
    def test_post_with_max_upload_size(self):
        client = Client()

        # The maximum size is allowed
        resource_id = self.do_post(
            client, upload_length=6, metadata={"filename": "test.txt"}
        )
        response = self.do_patch(client, resource_id, b"abcdef", offset=0)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response["Tus-Max-Size"], "6")

        response = client.post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="7",
            HTTP_UPLOAD_METADATA=encode_metadata(filename="test.txt", formId="form1"),
        )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(
            response.reason_phrase, "Upload-Length exceeds the maximum upload size"
        )
        self.assertEqual(response["Tus-Max-Size"], "6")
        self.assertFalse(response.has_header("Location"))
        self.assertEqual(TemporaryUploadedFile.objects.count(), 1)

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_post_must_login(self):
        response = Client().post(
            "/upload/",
            HTTP_TUS_RESUMABLE="1.0.0",
            HTTP_UPLOAD_LENGTH="6",
            HTTP_UPLOAD_METADATA=encode_metadata(formId="form1"),
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"status": "permission denied"})

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_handle_upload_must_login(self):
        client = Client()

        # A HEAD response has no body
        self.assertEqual(
            client.head("/upload/unknown", HTTP_TUS_RESUMABLE="1.0.0").status_code, 403
        )

        for response in [
            client.delete("/upload/unknown", HTTP_TUS_RESUMABLE="1.0.0"),
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

    def assert_resource_not_in_cache(self, resource_id):
        for name in ["file_size", "filename", "offset", "metadata", "expires"]:
            with self.subTest(name=name):
                self.assertIsNone(cache.get(f"tus-uploads/{resource_id}/{name}"))

    def do_post(self, client, upload_length=6, metadata=None):
        headers = {
            "HTTP_TUS_RESUMABLE": "1.0.0",
            "HTTP_UPLOAD_LENGTH": str(upload_length),
        }

        # A form id is required
        metadata = {"formId": "form1", **(metadata or {})}
        headers["HTTP_UPLOAD_METADATA"] = encode_metadata(**metadata)

        response = client.post("/upload/", **headers)
        self.assertEqual(response.status_code, 201)

        re_url_upload_resource = re.compile(r"/upload/(.*)")

        self.assertRegex(response["Location"], re_url_upload_resource)

        return re_url_upload_resource.match(response["Location"]).group(1)

    def do_patch(self, client, resource_id, data, offset, **extra):
        # Pass offset=None to send the patch without an Upload-Offset header
        if offset is not None:
            extra["HTTP_UPLOAD_OFFSET"] = str(offset)

        return client.patch(
            f"/upload/{resource_id}",
            data=data,
            content_type="application/offset+octet-stream",
            HTTP_TUS_RESUMABLE="1.0.0",
            **extra,
        )

    def read_uploaded_file(self, uploaded_file):
        with uploaded_file.uploaded_file.open("rb") as f:
            return f.read()
