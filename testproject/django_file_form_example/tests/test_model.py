import os
import time
from datetime import timedelta
from io import StringIO
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage
from django.core.management import call_command
from django.test import TestCase
from django.test.utils import override_settings
from django.utils import timezone

from django_file_form import conf
from django_file_form.django_util import get_upload_path
from django_file_form.models import TemporaryUploadedFile, get_temp_storage_class
from django_file_form.util import get_list
from django_file_form_example.tests.utils.test_utils import (
    encode_datetime,
    get_random_id,
    remove_p,
    remove_test_files,
)

media_root = Path(settings.MEDIA_ROOT)


def make_expired(path):
    # Set the modification time to just before the upload expired
    modified = time.time() - conf.CACHE_TIMEOUT - 1
    os.utime(path, (modified, modified))


class CustomStorage(FileSystemStorage):
    pass


class ModelTests(TestCase):
    def setUp(self):
        self.temp_uploads_path = media_root.joinpath("temp_uploads")

    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_delete_unused_files_command(self):
        def call_delete_unused_files_command():
            stdout = StringIO()
            call_command("delete_unused_files", stdout=stdout)
            return stdout.getvalue()

        def test_with_no_files():
            self.assertEqual(
                call_delete_unused_files_command().strip(), "No files deleted"
            )

        def test_with_files():
            filename = get_random_id()
            uploaded_file_path = self.temp_uploads_path.joinpath(filename)
            try:
                uploaded_file = TemporaryUploadedFile.objects.create(
                    created=encode_datetime(2010, 1, 1),
                    uploaded_file=ContentFile("", filename),
                )

                output = call_delete_unused_files_command()
                self.assertEqual(
                    output.strip(),
                    f"Deleted files: {Path(uploaded_file.uploaded_file.name).name}",
                )
                self.assertEqual(TemporaryUploadedFile.objects.count(), 0)
            finally:
                remove_p(uploaded_file_path)

        test_with_no_files()
        test_with_files()

    def test_uploaded_file_unicode(self):
        filename = get_random_id()

        uploaded_file = TemporaryUploadedFile.objects.create(
            uploaded_file=ContentFile("xyz", filename), original_filename="ooo.txt"
        )
        try:
            self.assertEqual(str(uploaded_file), "ooo.txt")
            self.assertEqual(str(TemporaryUploadedFile()), "")
        finally:
            uploaded_file.uploaded_file.delete()


class UtilTests(TestCase):
    def test_get_list(self):
        self.assertEqual(get_list(["abc"]), ["abc"])
        self.assertEqual(get_list("abc"), ["abc"])


class ConfTest(TestCase):
    @override_settings(FILE_FORM_UPLOAD_DIR="/absolute/path/")
    def test_get_upload_path_absolute(self):
        self.assertEqual(str(get_upload_path()), "/absolute/path")

    @override_settings(FILE_FORM_UPLOAD_DIR="relative/path/")
    def test_get_upload_path_relative(self):
        self.assertEqual(
            str(get_upload_path()),
            str(Path(settings.MEDIA_ROOT).joinpath("relative/path")),
        )

    @override_settings(
        FILE_FORM_TEMP_STORAGE="django_file_form_example.tests.test_model.CustomStorage"
    )
    def test_get_temp_storage_class_with_custom_storage(self):
        self.assertEqual(get_temp_storage_class(), CustomStorage)


class DeleteUnusedFileTest(TestCase):
    def setUp(self):
        self.temp_uploads_path = media_root.joinpath("temp_uploads")
        self.filename = get_random_id()

    def tearDown(self):
        remove_p(self.get_uploaded_file_path())

    def get_uploaded_file_path(self):
        return self.temp_uploads_path.joinpath(self.filename)

    def test_record_from_yesterday(self):
        TemporaryUploadedFile.objects.create(
            created=timezone.now() - timedelta(days=1),
            uploaded_file=ContentFile("abc", self.filename),
        )

        TemporaryUploadedFile.objects.delete_unused_files()

        self.assertEqual(TemporaryUploadedFile.objects.count(), 0)
        self.assertFalse(self.get_uploaded_file_path().exists())

    def test_record_from_today(self):
        TemporaryUploadedFile.objects.create(
            created=timezone.now() - timedelta(hours=1),
            uploaded_file=ContentFile("abc", self.filename),
        )

        TemporaryUploadedFile.objects.delete_unused_files()

        self.assertEqual(TemporaryUploadedFile.objects.count(), 1)
        self.assertTrue(self.get_uploaded_file_path().exists())

    def test_file_without_record(self):
        uploaded_file_path = self.get_uploaded_file_path()

        with uploaded_file_path.open("w") as f:
            f.write("abc")
        make_expired(uploaded_file_path)

        deleted_files = TemporaryUploadedFile.objects.delete_unused_files()

        self.assertEqual(deleted_files, [self.filename])
        self.assertFalse(uploaded_file_path.exists())

    def test_file_without_record_of_upload_in_progress(self):
        # An upload that is in progress has a file but no record yet
        uploaded_file_path = self.get_uploaded_file_path()
        uploaded_file_path.write_text("abc")

        deleted_files = TemporaryUploadedFile.objects.delete_unused_files()

        self.assertEqual(deleted_files, [])
        self.assertTrue(uploaded_file_path.exists())

    def test_file_without_record_before_and_after_expiry(self):
        uploaded_file_path = self.get_uploaded_file_path()
        uploaded_file_path.write_text("abc")

        deleted_files = TemporaryUploadedFile.objects.delete_unused_files(
            now=timezone.now() + timedelta(seconds=conf.CACHE_TIMEOUT - 60)
        )
        self.assertEqual(deleted_files, [])
        self.assertTrue(uploaded_file_path.exists())

        deleted_files = TemporaryUploadedFile.objects.delete_unused_files(
            now=timezone.now() + timedelta(seconds=conf.CACHE_TIMEOUT + 1)
        )
        self.assertEqual(deleted_files, [self.filename])
        self.assertFalse(uploaded_file_path.exists())

    def test_dry_run_command(self):
        TemporaryUploadedFile.objects.create(
            created=timezone.now() - timedelta(days=1),
            uploaded_file=ContentFile("abc", self.filename),
        )
        file_without_record_path = self.temp_uploads_path.joinpath(get_random_id())
        file_without_record_path.write_text("abc")
        make_expired(file_without_record_path)

        try:
            stdout = StringIO()
            call_command("delete_unused_files", "--dry-run", stdout=stdout)

            # Both files are reported, but nothing is deleted
            self.assertTrue(
                stdout.getvalue().startswith("Files that would be deleted: ")
            )
            self.assertCountEqual(
                stdout.getvalue().strip().split(": ", 1)[1].split(", "),
                [self.filename, file_without_record_path.name],
            )
            self.assertEqual(TemporaryUploadedFile.objects.count(), 1)
            self.assertTrue(self.get_uploaded_file_path().exists())
            self.assertTrue(file_without_record_path.exists())
        finally:
            remove_p(file_without_record_path)

    def test_dry_run_command_without_files(self):
        stdout = StringIO()
        call_command("delete_unused_files", "--dry-run", stdout=stdout)

        self.assertEqual(stdout.getvalue().strip(), "No files deleted")

    def test_command_without_output(self):
        TemporaryUploadedFile.objects.create(
            created=timezone.now() - timedelta(days=1),
            uploaded_file=ContentFile("abc", self.filename),
        )

        stdout = StringIO()
        call_command("delete_unused_files", verbosity=0, stdout=stdout)

        self.assertEqual(stdout.getvalue(), "")
        self.assertEqual(TemporaryUploadedFile.objects.count(), 0)
        self.assertFalse(self.get_uploaded_file_path().exists())
