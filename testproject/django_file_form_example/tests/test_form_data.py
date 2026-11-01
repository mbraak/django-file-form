import json

from django.http import QueryDict
from django.test import SimpleTestCase, TestCase

from django_file_form.uploaded_file import PlaceholderUploadedFile, S3UploadedFileWithId
from django_file_form.widgets.form_data import FormData
from django_file_form_example.tests.utils.mock_s3 import BUCKET_NAME, MockS3Mixin


def create_form_data(uploads=None, metadata=None, field_name="input_file"):
    data = QueryDict(mutable=True)

    if uploads is not None:
        data[f"{field_name}-uploads"] = json.dumps(uploads)

    if metadata is not None:
        data[f"{field_name}-metadata"] = (
            metadata if isinstance(metadata, str) else json.dumps(metadata)
        )

    return FormData(data, field_name)


PLACEHOLDER_UPLOAD = {
    "type": "placeholder",
    "id": "id1",
    "name": "placeholder1.txt",
    "size": 1024,
}


class FormDataTests(SimpleTestCase):
    def test_without_uploads(self):
        form_data = create_form_data()

        self.assertEqual(form_data.s3_and_placeholder_uploads, [])
        self.assertFalse(form_data.has_existing_uploads)

    def test_with_empty_uploads(self):
        form_data = create_form_data(uploads=[])

        self.assertEqual(form_data.s3_and_placeholder_uploads, [])
        self.assertFalse(form_data.has_existing_uploads)

    def test_placeholder_upload(self):
        form_data = create_form_data(uploads=[PLACEHOLDER_UPLOAD])

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertIsInstance(upload, PlaceholderUploadedFile)
        self.assertEqual(upload.file_id, "id1")
        self.assertEqual(upload.name, "placeholder1.txt")
        self.assertEqual(upload.size, 1024)
        self.assertIsNone(upload.metadata)

    def test_ignores_other_upload_types(self):
        form_data = create_form_data(
            uploads=[
                {"type": "existing", "name": "example/existing.txt", "size": 3},
                {"type": "tus", "id": "id2", "name": "tus.txt", "size": 3},
                PLACEHOLDER_UPLOAD,
            ]
        )

        self.assertEqual(
            [upload.name for upload in form_data.s3_and_placeholder_uploads],
            ["placeholder1.txt"],
        )

    def test_has_existing_uploads(self):
        form_data = create_form_data(
            uploads=[{"type": "existing", "name": "example/existing.txt", "size": 3}]
        )

        self.assertTrue(form_data.has_existing_uploads)

    def test_metadata(self):
        form_data = create_form_data(
            uploads=[PLACEHOLDER_UPLOAD],
            metadata={
                "placeholder1.txt": {"description": "abc"},
                "other.txt": {"description": "def"},
            },
        )

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertEqual(upload.metadata, {"description": "abc"})

    def test_metadata_with_invalid_json(self):
        form_data = create_form_data(uploads=[PLACEHOLDER_UPLOAD], metadata="{invalid")

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertIsNone(upload.metadata)

    def test_metadata_that_is_not_a_dict(self):
        form_data = create_form_data(
            uploads=[PLACEHOLDER_UPLOAD], metadata=["placeholder1.txt"]
        )

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertIsNone(upload.metadata)

    def test_empty_metadata(self):
        form_data = create_form_data(uploads=[PLACEHOLDER_UPLOAD], metadata="")

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertIsNone(upload.metadata)

    def test_prefixed_field_name(self):
        form_data = create_form_data(
            uploads=[PLACEHOLDER_UPLOAD], field_name="form-0-input_file"
        )

        self.assertEqual(len(form_data.s3_and_placeholder_uploads), 1)
        self.assertEqual(len(create_form_data().s3_and_placeholder_uploads), 0)


class S3FormDataTests(MockS3Mixin, TestCase):
    def test_s3_upload(self):
        self.s3.put_object(
            Bucket=BUCKET_NAME, Key="temp_uploads/dir1/test.txt", Body=b"abc"
        )

        form_data = create_form_data(
            uploads=[
                {
                    "type": "s3",
                    "id": "id1",
                    "name": "temp_uploads/dir1/test.txt",
                    "original_name": "test.txt",
                    "size": 3,
                }
            ],
            metadata={"temp_uploads/dir1/test.txt": {"description": "abc"}},
        )

        [upload] = form_data.s3_and_placeholder_uploads
        self.assertIsInstance(upload, S3UploadedFileWithId)
        self.assertEqual(upload.file_id, "id1")
        self.assertEqual(upload.name, "temp_uploads/dir1/test.txt")
        self.assertEqual(upload.original_name, "test.txt")
        self.assertEqual(upload.metadata, {"description": "abc"})
        self.assertEqual(upload.read(), b"abc")
        self.assertEqual(
            upload.get_initial_data(),
            {
                "id": "id1",
                "name": "temp_uploads/dir1/test.txt",
                "size": 3,
                "type": "s3",
            },
        )
