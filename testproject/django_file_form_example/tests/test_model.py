# coding=utf-8
from pathlib import Path
from unittest.mock import patch

from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import FileSystemStorage
from django.test import TestCase
from django.core.management import call_command
from django.conf import settings
from django.core.files.base import ContentFile
from django.test.utils import captured_stdout

from django_file_form_example.test_utils import get_random_id, encode_datetime, remove_p
from django_file_form.models import UploadedFile
from django_file_form.util import get_list, load_class


media_root = Path(settings.MEDIA_ROOT)


class ModelTests(TestCase):
    def setUp(self):
        self.temp_uploads_path = media_root.joinpath('temp_uploads')

    def test_delete_unused_files_command(self):
        def call_delete_unused_files_command():
            with captured_stdout() as stdout:
                call_command('delete_unused_files')
                return stdout.getvalue()

        def test_with_no_files():
            self.assertEqual(call_delete_unused_files_command().strip(), "No files deleted")

        def test_with_files():
            filename = get_random_id()
            uploaded_file_path = self.temp_uploads_path.joinpath(filename)
            try:
                uploaded_file = UploadedFile.objects.create(
                    created=encode_datetime(2010, 1, 1),
                    uploaded_file=ContentFile('', filename)
                )

                output = call_delete_unused_files_command()
                self.assertEqual(output.strip(), f"Deleted files: {Path(uploaded_file.uploaded_file.name).name}")
                self.assertEqual(UploadedFile.objects.count(), 0)
            finally:
                remove_p(uploaded_file_path)

        test_with_no_files()
        test_with_files()

    def test_delete_unused_files(self):
        # setup
        filename = get_random_id()
        uploaded_file_path = self.temp_uploads_path.joinpath(filename)
        try:
            with uploaded_file_path.open('w') as f:
                f.write(u'abc')

            UploadedFile.objects.create(created=encode_datetime(2010, 1, 1))

            # - delete unused files
            UploadedFile.objects.delete_unused_files()

            # UploadedFile must be deleted
            self.assertEqual(UploadedFile.objects.count(), 0)

            # file must be deleted
            self.assertFalse(uploaded_file_path.exists())
        finally:
            remove_p(uploaded_file_path)

    def test_uploaded_file_unicode(self):
        filename = get_random_id()

        uploaded_file = UploadedFile.objects.create(
            uploaded_file=ContentFile('xyz', filename),
            original_filename='ooo.txt'
        )
        try:
            self.assertEqual(str(uploaded_file), 'ooo.txt')
            self.assertEqual(str(UploadedFile()), '')
        finally:
            uploaded_file.uploaded_file.delete()


class UtilTests(TestCase):
    def test_get_list(self):
        self.assertEqual(get_list(['abc']), ['abc'])
        self.assertEqual(get_list('abc'), ['abc'])

    def test_load_class(self):
        self.assertEqual(load_class('FILE_STORAGE'), FileSystemStorage)

    def test_load_class_does_not_exist(self):
        with patch('django_file_form.conf') as mock_conf:
            mock_conf.FILE_STORAGE = 'django_file_form.DoesNotExist'

            expected_message = r"FILE_STORAGE refers to a class 'django_file_form\.DoesNotExist' that is not available"
            with self.assertRaisesRegex(ImproperlyConfigured, expected_message):
                load_class('FILE_STORAGE', mock_conf)
