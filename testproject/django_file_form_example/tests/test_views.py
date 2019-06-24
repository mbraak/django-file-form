# coding=utf-8
import json

import six
from django.conf import settings
from django.contrib.auth.models import User
from django.test import override_settings

from django_webtest import WebTest

from django_file_form.models import UploadedFile

from django_file_form_example.test_utils import get_random_id, remove_p

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


media_root = Path(settings.MEDIA_ROOT)


class FileFormWebTests(WebTest):
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
