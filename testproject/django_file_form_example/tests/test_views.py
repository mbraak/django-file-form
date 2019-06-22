# coding=utf-8
import json

import six

from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.core.management import call_command
from django.core.files.base import ContentFile

from django_webtest import WebTest

from django_file_form.models import UploadedFile

from django_file_form_example.models import Example
from django_file_form_example.test_utils import get_random_id, get_random_ids, encode_datetime, remove_p

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


media_root = Path(settings.MEDIA_ROOT)


class FileFormWebTests(WebTest):
    def test_ajax_delete(self):
        """
        Upload and delete a file using ajax.
        """
        # setup
        filename = get_random_id()
        temp_filepath = None
        try:
            form = self.app.get('/').form
            self.assertEqual(form['example-delete_url'].value, '/upload/handle_delete')

            # upload file
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            temp_filepath = media_root.joinpath(uploaded_file.uploaded_file.name)

            self.assertTrue(temp_filepath.exists())
            UploadedFile.objects.get(file_id=file_id)

            # delete file
            self.delete_ajax_file(form, file_id)

            self.assertFalse(temp_filepath.exists())
            self.assertFalse(UploadedFile.objects.filter(file_id=file_id).exists())
        finally:
            if temp_filepath:
                remove_p(temp_filepath)

    def test_submit_multiple_for_single_filefield(self):
        # setup
        filename1, filename2 = get_random_ids(2)
        uploaded_file1 = media_root.joinpath('example', filename1)
        uploaded_file2 = media_root.joinpath('example', filename2)
        try:
            form = self.app.get('/').form

            # upload files
            self.upload_ajax_file(form, 'input_file', filename1)
            self.upload_ajax_file(form, 'input_file', filename2)

            # submit form
            form['example-title'] = 'aaa'
            form.submit().follow()

            example = Example.objects.get(title='aaa')
            self.assertEqual(example.input_file.name, 'example/{0!s}'.format(filename2))
        finally:
            remove_p(uploaded_file1)
            remove_p(uploaded_file2)

    def test_submit_multiple_empty(self):
        """
        - Form with multiple file field
        - Submit with empty values
        """
        # submit form
        form = self.app.get('/multiple').form
        page = form.submit()

        # expect error class on input-file row
        page.pyquery('#row-input_file').hasClass('error')

    def test_existing_file(self):
        """
        Test a form with an existing file.
        """
        # setup
        example_filename = get_random_id()
        example_file_path = media_root.joinpath('example', example_filename)
        temp_filename = get_random_id()
        temp_file_path = None
        try:
            example = Example.objects.create(title='abc', input_file=ContentFile('xyz', example_filename))

            # - get form
            page = self.app.get('/existing/{0:d}'.format(example.id))
            form = page.form

            self.assertTrue(example_file_path.exists())

            # expect no uploaded files
            upload_container = page.pyquery('#row-example-input_file .file-uploader-container')
            files_data = upload_container.attr('data-files')
            self.assertEqual(json.loads(files_data), [])

            # expect same delete url
            self.assertEqual(form['example-delete_url'].value, '/upload/handle_delete')

            # expect different upload url
            self.assertEqual(form['example-upload_url'].value, '/handle_upload')

            # - upload file
            file_id = self.upload_ajax_file(form, 'example-input_file', temp_filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            temp_file_path = media_root.joinpath(uploaded_file.uploaded_file.name)

            self.assertTrue(temp_file_path.exists())

            # - delete file
            self.delete_ajax_file(form, file_id)

            self.assertFalse(temp_file_path.exists())
        finally:
            remove_p(example_file_path)

            if temp_file_path:
                remove_p(temp_file_path)

    def test_unicode_filename(self):
        filename = u'àęö{0!s}'.format(get_random_id())
        temp_filepath = None

        form = self.app.get('/').form

        try:
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            self.assertEqual(uploaded_file.original_filename, filename)

            self.assertEqual(six.text_type(uploaded_file), filename)

            temp_filepath = media_root.joinpath(uploaded_file.uploaded_file.name)
            self.assertTrue(temp_filepath.exists())
        finally:
            if temp_filepath:
                remove_p(temp_filepath)

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_for_upload(self):
        # submit without permission
        filename = get_random_id()
        form = self.app.get('/').form

        self.upload_ajax_file(form, 'input_file', filename, expected_status=403)

        # submit with permission
        User.objects.create(username='test1', email='test@test.nl')

        form = self.app.get('/', user='test1').form
        self.upload_ajax_file(form, 'input_file', filename, user='test1')

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_for_delete(self):
        file_id = get_random_id()
        UploadedFile.objects.create(file_id=file_id)

        # delete without permission

        form = self.app.get('/').form
        self.delete_ajax_file(form, file_id, expected_status=403)

        # delete with permission
        User.objects.create(username='test1', email='test@test.nl')

        form = self.app.get('/', user='test1').form
        self.delete_ajax_file(form, file_id, user='test1')

    def upload_ajax_file(self, form, field_name, filename, content=six.b('xyz'), expected_status=200, user=None):
        csrf_token = form['csrfmiddlewaretoken'].value
        form_id = form['example-form_id'].value
        upload_url = form['example-upload_url'].value
        file_id = get_random_id()

        params = dict(
            csrfmiddlewaretoken=csrf_token,
            qquuid=file_id,
            form_id=form_id,
            field_name='example-%s' % field_name,
        )

        response = self.app.post(
            upload_url,
            params=params,
            headers=dict(X_REQUESTED_WITH=six.b('XMLHttpRequest')),
            status=expected_status,
            upload_files=[
                (six.b('qqfile'), filename, content)
            ],
            user=user,
        )

        if response.status_code == 200:
            # - check response data; nb. cannot use response.json because content type is text/html
            result = json.loads(response.content.decode())
            assert result['success']

            return file_id

    def delete_ajax_file(self, form, file_id, expected_status=200, user=None):
        csrf_token = str(form['csrfmiddlewaretoken'].value)
        delete_url = '{0!s}/{1!s}'.format(form['example-delete_url'].value, file_id)

        response = self.app.post(
            delete_url,
            headers=dict(
                X_REQUESTED_WITH='XMLHttpRequest',
                X_CSRFTOKEN=csrf_token
            ),
            status=expected_status,
            user=user,
        )

        if response.status_code == 200:
            self.assertEqual(response.content, six.b('ok'))


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
