import json
import uuid

from django.conf import settings

from django_webtest import WebTest

from django_file_form.models import UploadedFile

from .models import Example, Example2


class FileFormWebTests(WebTest):
    def test_ajax_delete(self):
        """
        Upload and delete a file using ajax.
        """
        # setup
        filename = get_random_id()
        uploaded_file = settings.MEDIA_ROOT.joinpath('temp_uploads', filename)
        try:
            form = self.app.get('/').form
            self.assertEqual(form['delete_url'].value, '/upload/handle_delete')

            # upload file
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            self.assertTrue(uploaded_file.exists())
            UploadedFile.objects.get(file_id=file_id)

            # delete file
            self.delete_ajax_file(form, file_id)

            self.assertFalse(uploaded_file.exists())
            self.assertFalse(UploadedFile.objects.filter(file_id=file_id).exists())
        finally:
            uploaded_file.remove_p()

    def test_submit_form_with_ajax_upload(self):
        """
        Submit a form with a file that is uploaded using ajax
        """
        # setup
        filename = get_random_id()
        temp_uploaded_file = settings.MEDIA_ROOT.joinpath('temp_uploads', filename)
        uploaded_file = settings.MEDIA_ROOT.joinpath('example', filename)
        try:
            form = self.app.get('/').form

            # upload file
            file_id = self.upload_ajax_file(form, 'input_file', filename)

            self.assertTrue(temp_uploaded_file.exists())
            UploadedFile.objects.get(file_id=file_id)

            # submit the form with an error
            page = form.submit()
            form = page.form

            self.assertTrue(temp_uploaded_file.exists())

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

            self.assertFalse(temp_uploaded_file.exists())
            self.assertFalse(UploadedFile.objects.filter(file_id=file_id).exists())
            self.assertTrue(uploaded_file.exists())
        finally:
            temp_uploaded_file.remove_p()
            uploaded_file.remove_p()

    def test_submit_without_ajax(self):
        # setup
        filename = get_random_id()
        uploaded_file = settings.MEDIA_ROOT.joinpath('example', filename)
        try:
            # submit form with error
            form = self.app.get('/').form
            form['input_file'] = (filename, 'xyz')
            form = form.submit().form

            # submit form correctly
            form['title'] = 'abc'
            form['input_file'] = (filename, 'xyz')
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
            self.assertEqual(unicode(files[0]), 'example/%s' % filename1)
            self.assertEqual(unicode(files[1]), 'example/%s' % filename2)

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
            form['input_file'] = (filename, 'xyz')
            form = form.submit().form

            # submit form correctly
            form['title'] = 'abc'
            form['input_file'] = (filename, 'xyz')
            form.submit().follow()

            example2 = Example2.objects.get(title='abc')
            files = example2.files.all()
            self.assertEqual(files.count(), 1)
            self.assertEqual(files[0].input_file.name, 'example/%s' % filename)

            self.assertTrue(uploaded_file.exists())
        finally:
            uploaded_file.remove_p()

    def upload_ajax_file(self, form, field_name, filename, content='xyz'):
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
            headers=dict(X_REQUESTED_WITH='XMLHttpRequest'),
            status=200,
            upload_files=[
                ('qqfile', filename, content)
            ]
        )

        # - check response data; nb. cannot use response.json because content type is text/html
        assert json.loads(response.content) == dict(success=True, filename=filename, path='temp_uploads/%s' % filename)

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
        self.assertEqual(response.content, 'ok')


def get_random_id():
    return uuid.uuid4().hex


def get_random_ids(count):
    for _ in xrange(count):
        yield get_random_id()