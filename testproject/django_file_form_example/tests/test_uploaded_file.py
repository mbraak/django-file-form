import tempfile

from django.core.files.base import ContentFile
from django.test import TestCase

from django_file_form.uploaded_file import (
    PlaceholderUploadedFile,
    S3UploadedFileWithId,
    UploadedTusFile,
    get_initial_data_from_uploaded_file,
)
from django_file_form_example.models import Example
from django_file_form_example.tests.utils.mock_s3 import BUCKET_NAME, MockS3Mixin
from django_file_form_example.tests.utils.test_utils import remove_test_files


class UploadedFileTests(TestCase):
    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_placeholder(self):
        placeholder = PlaceholderUploadedFile(
            name="placeholder1.txt", file_id="id1", size=1024, metadata={"a": 1}
        )

        self.assertTrue(placeholder.is_placeholder)
        self.assertFalse(placeholder.is_s3direct)
        self.assertEqual(placeholder.metadata, {"a": 1})
        self.assertEqual(
            get_initial_data_from_uploaded_file(placeholder),
            {
                "id": "id1",
                "name": "placeholder1.txt",
                "size": 1024,
                "type": "placeholder",
            },
        )

    def test_placeholder_generates_file_id(self):
        placeholder1 = PlaceholderUploadedFile(name="placeholder1.txt", size=1)
        placeholder2 = PlaceholderUploadedFile(name="placeholder1.txt", size=1)

        self.assertRegex(placeholder1.file_id, r"^[0-9a-f]{32}$")
        self.assertNotEqual(placeholder1.file_id, placeholder2.file_id)

    def test_placeholder_without_size(self):
        with tempfile.NamedTemporaryFile() as f:
            f.write(b"abcdef")
            f.flush()

            placeholder = PlaceholderUploadedFile(name=f.name)

        self.assertEqual(placeholder.size, 6)

    def test_tus_file(self):
        tus_file = UploadedTusFile(
            file=ContentFile(b"abc", "test.txt"),
            file_id="id1",
            name="test.txt",
            metadata={"a": 1},
        )

        self.assertEqual(tus_file.size, 3)
        self.assertFalse(tus_file.is_placeholder)
        self.assertFalse(tus_file.is_s3direct)
        self.assertEqual(tus_file.metadata, {"a": 1})
        self.assertEqual(
            get_initial_data_from_uploaded_file(tus_file),
            {"id": "id1", "name": "test.txt", "size": 3, "type": "tus"},
        )

    def test_field_file(self):
        example = Example.objects.create(title="abc")
        example.input_file.save("test.txt", ContentFile(b"abc"))

        self.assertEqual(
            get_initial_data_from_uploaded_file(example.input_file),
            {"name": example.input_file.name, "size": 3, "type": "existing"},
        )

    def test_field_file_that_does_not_exist(self):
        example = Example.objects.create(title="abc", input_file="example/missing.txt")

        self.assertEqual(get_initial_data_from_uploaded_file(example.input_file), {})


class S3UploadedFileTests(MockS3Mixin, TestCase):
    def test_s3_file(self):
        self.s3.put_object(
            Bucket=BUCKET_NAME, Key="temp_uploads/dir1/test.txt", Body=b"abc"
        )

        s3_file = S3UploadedFileWithId(
            file_id="id1",
            name="temp_uploads/dir1/test.txt",
            original_name="test.txt",
            size=3,
            metadata={"a": 1},
        )

        self.assertEqual(s3_file.read(), b"abc")
        self.assertFalse(s3_file.is_placeholder)
        self.assertTrue(s3_file.is_s3direct)
        self.assertEqual(s3_file.metadata, {"a": 1})
        self.assertEqual(s3_file.original_name, "test.txt")
        self.assertEqual(
            get_initial_data_from_uploaded_file(s3_file),
            {
                "id": "id1",
                "name": "temp_uploads/dir1/test.txt",
                "size": 3,
                "type": "s3",
            },
        )
