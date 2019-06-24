# coding=utf-8
import six
from django.test import TestCase
from django.core.management import call_command
from django.conf import settings
from django.core.files.base import ContentFile

from django_file_form_example.test_utils import get_random_id, encode_datetime, remove_p
from django_file_form.models import UploadedFile

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


media_root = Path(settings.MEDIA_ROOT)


class FileFormTests(TestCase):
    def setUp(self):
        self.temp_uploads_path = media_root.joinpath('temp_uploads')

    def test_delete_unused_files_command(self):
        call_command('delete_unused_files', verbosity=0)

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
        uploaded_file_path = self.temp_uploads_path.joinpath(filename)

        uploaded_file = UploadedFile.objects.create(
            uploaded_file=ContentFile('xyz', filename),
            original_filename='ooo.txt'
        )
        try:
            self.assertEqual(six.text_type(uploaded_file), 'ooo.txt')
            self.assertEqual(six.text_type(UploadedFile()), '')
        finally:
            remove_p(uploaded_file_path)
