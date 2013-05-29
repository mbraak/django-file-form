import json

import six

from django.conf import settings
from django.test import TestCase
from django.core.management import call_command
from django.core.files.base import ContentFile

from django_webtest import WebTest

from django_file_form.models import UploadedFile

from .models import Example, Example2
from .test_utils import get_random_id, get_random_ids, encode_datetime


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
            self.assertEqual(form['delete_url'].value, '/upload/handle_delete')

            # upload file
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            temp_filepath = settings.MEDIA_ROOT.joinpath(uploaded_file.uploaded_file.name)

            self.assertTrue(temp_filepath.exists())
            UploadedFile.objects.get(file_id=file_id)

            # delete file
            self.delete_ajax_file(form, file_id)

            self.assertFalse(temp_filepath.exists())
            self.assertFalse(UploadedFile.objects.filter(file_id=file_id).exists())
        finally:
            if temp_filepath:
                temp_filepath.remove_p()

    def test_submit_form_with_ajax_upload(self):
        """
        Submit a form with a file that is uploaded using ajax
        """
        # setup
        filename = get_random_id()
        temp_filepath = None
        example_filepath = settings.MEDIA_ROOT.joinpath('example', filename)
        try:
            form = self.app.get('/').form

            # upload file
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            self.assertEqual(uploaded_file.original_filename, filename)
            self.assertNotEqual(uploaded_file.uploaded_file.name, 'temp_uploads/%s' % filename)

            temp_filepath = settings.MEDIA_ROOT.joinpath(uploaded_file.uploaded_file.name)
            self.assertTrue(temp_filepath.exists())

            # submit the form with an error
            page = form.submit()
            form = page.form

            self.assertTrue(temp_filepath.exists())

            upload_container = page.pyquery('#row-input_file .upload-container')

            self.assertEqual(
                json.loads(upload_container.attr('data-files')),
                [
                    dict(id=file_id, name=filename)
                ]
            )

            # submit valid form
            form['title'] = 'abc'
            form.submit().follow()

            example = Example.objects.get(title='abc')
            self.assertEqual(example.input_file.name, 'example/%s' % filename)

            self.assertFalse(temp_filepath.exists())
            self.assertFalse(UploadedFile.objects.filter(file_id=file_id).exists())
            self.assertTrue(example_filepath.exists())
        finally:
            if temp_filepath:
                temp_filepath.remove_p()
            example_filepath.remove_p()

    def test_submit_without_ajax(self):
        # setup
        filename = get_random_id()
        uploaded_file = settings.MEDIA_ROOT.joinpath('example', filename)
        try:
            # submit form with error
            form = self.app.get('/').form
            form['input_file'] = (filename, six.b('xyz'))
            form = form.submit().form

            # submit form correctly
            form['title'] = 'abc'
            form['input_file'] = (filename, six.b('xyz'))
            form.submit().follow()

            example = Example.objects.get(title='abc')
            self.assertEqual(example.input_file.name, 'example/%s' % filename)

            self.assertTrue(uploaded_file.exists())
        finally:
            uploaded_file.remove_p()

    def test_submit_multiple(self):
        # setup
        filename1, filename2 = get_random_ids(2)
        uploaded_file1 = settings.MEDIA_ROOT.joinpath('example', filename1)
        uploaded_file2 = settings.MEDIA_ROOT.joinpath('example', filename2)
        try:
            form = self.app.get('/multiple').form

            # upload file2
            file_id1 = self.upload_ajax_file(form, 'input_file', filename1)
            file_id2 = self.upload_ajax_file(form, 'input_file', filename2)

            # submit the form with an error
            page = form.submit()

            upload_container = page.pyquery('#row-input_file .upload-container')

            self.assertEqual(
                json.loads(upload_container.attr('data-files')),
                [
                    dict(id=file_id1, name=filename1),
                    dict(id=file_id2, name=filename2)
                ]
            )

            # submit valid form
            form = page.form
            form['title'] = 'abc'
            form.submit().follow()

            example2 = Example2.objects.get(title='abc')
            files = example2.files.all()
            self.assertEqual(files.count(), 2)
            self.assertEqual(six.text_type(files[0]), 'example/%s' % filename1)
            self.assertEqual(six.text_type(files[1]), 'example/%s' % filename2)

            self.assertTrue(uploaded_file1.exists())
            self.assertTrue(uploaded_file2.exists())
        finally:
            uploaded_file1.remove_p()
            uploaded_file2.remove_p()

    def test_submit_multiple_without_ajax(self):
        # setup
        filename = get_random_id()
        uploaded_file = settings.MEDIA_ROOT.joinpath('example', filename)
        try:
            # submit form with error
            form = self.app.get('/multiple').form
            form['input_file'] = (filename, six.b('xyz'))
            form = form.submit().form

            # submit form correctly
            form['title'] = 'abc'
            form['input_file'] = (filename, six.b('xyz'))
            form.submit().follow()

            example2 = Example2.objects.get(title='abc')
            files = example2.files.all()
            self.assertEqual(files.count(), 1)
            self.assertEqual(files[0].input_file.name, 'example/%s' % filename)

            self.assertTrue(uploaded_file.exists())
        finally:
            uploaded_file.remove_p()

    def test_submit_multiple_for_single_filefield(self):
        # setup
        filename1, filename2 = get_random_ids(2)
        uploaded_file1 = settings.MEDIA_ROOT.joinpath('example', filename1)
        uploaded_file2 = settings.MEDIA_ROOT.joinpath('example', filename2)
        try:
            form = self.app.get('/').form

            # upload files
            self.upload_ajax_file(form, 'input_file', filename1)
            self.upload_ajax_file(form, 'input_file', filename2)

            # submit form
            form['title'] = 'aaa'
            form.submit().follow()

            example = Example.objects.get(title='aaa')
            self.assertEqual(example.input_file.name, 'example/%s' % filename2)
        finally:
            uploaded_file1.remove_p()
            uploaded_file2.remove_p()

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
        example_file_path = settings.MEDIA_ROOT.joinpath('example', example_filename)
        temp_filename = get_random_id()
        temp_file_path = None
        try:
            example = Example.objects.create(title='abc', input_file=ContentFile('xyz', example_filename))

            # - get form
            page = self.app.get('/existing/%d' % example.id)
            form = page.form

            self.assertTrue(example_file_path.exists())

            # expect file in 'data-files'
            upload_container = page.pyquery('#row-input_file .upload-container')
            files_data = upload_container.attr('data-files')
            self.assertEqual(
                json.loads(files_data),
                [
                    dict(name=example_filename, id=example.id)
                ]
            )

            # expect different delete url
            self.assertEquals(form['delete_url'].value, '/handle_delete')

            # expect different upload url
            self.assertEqual(form['upload_url'].value, '/handle_upload')

            # - delete existing file
            self.delete_ajax_file(form, str(example.id))

            example = Example.objects.get(id=example.id)
            self.assertEqual(example.input_file.name, '')

            self.assertFalse(example_file_path.exists())

            # - upload file
            file_id = self.upload_ajax_file(form, 'input_file', temp_filename)

            uploaded_file = UploadedFile.objects.get(file_id=file_id)
            temp_file_path = settings.MEDIA_ROOT.joinpath(uploaded_file.uploaded_file.name)

            self.assertTrue(temp_file_path.exists())

            # - delete file
            self.delete_ajax_file(form, file_id)

            self.assertFalse(temp_file_path.exists())
        finally:
            example_file_path.remove_p()

            if temp_file_path:
                temp_file_path.remove_p()

    def upload_ajax_file(self, form, field_name, filename, content=six.b('xyz')):
        csrf_token = form['csrfmiddlewaretoken'].value
        form_id = form['form_id'].value
        upload_url = form['upload_url'].value
        file_id = get_random_id()

        params = dict(
            csrfmiddlewaretoken=csrf_token,
            qquuid=file_id,
            form_id=form_id,
            field_name=field_name,
        )

        response = self.app.post(
            upload_url,
            params=params,
            headers=dict(X_REQUESTED_WITH=six.b('XMLHttpRequest')),
            status=200,
            upload_files=[
                (six.b('qqfile'), filename, content)
            ]
        )

        # - check response data; nb. cannot use response.json because content type is text/html
        result = json.loads(response.content.decode())
        assert result['success']

        return file_id

    def delete_ajax_file(self, form, file_id):
        csrf_token = str(form['csrfmiddlewaretoken'].value)
        delete_url = '%s/%s' % (form['delete_url'].value, file_id)

        response = self.app.delete(
            delete_url,
            headers=dict(
                X_REQUESTED_WITH='XMLHttpRequest',
                X_CSRFTOKEN=csrf_token
            ),
        )
        self.assertEqual(response.content, six.b('ok'))


class FileFormTests(TestCase):
    def setUp(self):
        self.temp_uploads_path = settings.MEDIA_ROOT.joinpath('temp_uploads')

    def test_delete_unused_files_command(self):
        call_command('delete_unused_files', verbosity=0)

    def test_delete_unused_files(self):
        # setup
        filename = get_random_id()
        uploaded_file_path = self.temp_uploads_path.joinpath(filename)
        try:
            uploaded_file_path.write_text('abc')
            UploadedFile.objects.create(created=encode_datetime(2010, 1, 1))

            # - delete unused files
            UploadedFile.objects.delete_unused_files()

            # UploadedFile must be deleted
            self.assertEquals(UploadedFile.objects.count(), 0)

            # file must be deleted
            self.assertFalse(uploaded_file_path.exists())
        finally:
            uploaded_file_path.remove_p()

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
            uploaded_file_path.remove_p()