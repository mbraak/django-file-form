# coding=utf-8
from pathlib import Path

from django.core.files.base import ContentFile
from django.conf import settings
from django.test import override_settings

from django_file_form.models import UploadedFile
from django_file_form_example.base_live_testcase import BaseLiveTestCase
from django_file_form_example.models import Example, Example2
from django_file_form_example.page import Page
from django_file_form_example.test_utils import get_random_id, remove_p, read_file


media_root = Path(settings.MEDIA_ROOT)


class LiveTestCase(BaseLiveTestCase):
    page_class = Page

    def test_submit_single_without_ajax(self):
        page = self.page

        temp_file = page.create_temp_file(content='content')

        page.open('/without_js')
        page.fill_title_field('xyz')
        page.upload_without_js(temp_file)
        page.submit()

        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file.uploaded_file().read_text(), "content")

        example = Example.objects.get(title='xyz')
        self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))

    def test_submit_multiple_without_ajax(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/multiple_without_js')
        page.fill_title_field('abc')
        page.upload_without_js(temp_file1)
        page.upload_without_js(temp_file2)
        page.submit()

        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file1.uploaded_file().read_text(), "content1")
        self.assertEqual(temp_file2.uploaded_file().read_text(), "content2")

        self.assertEqual(Example2.objects.count(), 1)

        example2 = Example2.objects.first()
        self.assertEqual(example2.title, 'abc')

        self.assertSetEqual(
            {f.input_file.name for f in example2.files.all()},
            {'example/%s' % temp_file1.base_name(), 'example/%s' % temp_file2.base_name()}
        )

    def test_upload(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')

        page.selenium.find_element_by_css_selector('.dff-files')

        page.fill_title_field('abc')
        page.upload_using_js(temp_file)

        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        uploaded_file = UploadedFile.objects.first()
        self.assertEqual(read_file(uploaded_file.uploaded_file), b'content1')

        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))
        self.assertEqual(read_file(example.input_file), b'content1')

        self.assertEqual(UploadedFile.objects.count(), 0)
        self.assertFalse(Path(uploaded_file.uploaded_file.path).exists())

    def test_upload_multiple(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/multiple')

        page.fill_title_field('abc')

        page.upload_using_js(temp_file1)
        page.find_upload_success(temp_file1, upload_index=0)

        page.upload_using_js(temp_file2)
        page.find_upload_success(temp_file2, upload_index=1)

        self.assertEqual(UploadedFile.objects.count(), 2)

        uploaded_files = UploadedFile.objects.all()
        self.assertSetEqual(
            {read_file(uploaded_file.uploaded_file) for uploaded_file in uploaded_files},
            {b'content1', b'content2'}
        )

        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(Example2.objects.count(), 1)

        example2 = Example2.objects.first()
        self.assertEqual(example2.title, 'abc')

        examples_files = example2.files.all()

        self.assertSetEqual(
            {f.input_file.name for f in examples_files},
            {'example/%s' % temp_file1.base_name(), 'example/%s' % temp_file2.base_name()}
        )

        self.assertSetEqual(
            {read_file(example_file.input_file) for example_file in examples_files},
            {b'content1', b'content2'}
        )

        self.assertEqual(UploadedFile.objects.count(), 0)
        self.assertFalse(
            any(Path(uploaded_file.uploaded_file.path).exists() for uploaded_file in uploaded_files)
        )

    def test_upload_multiple_at_the_same_time(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/multiple')

        page.fill_title_field('abc')
        page.upload_multiple_using_js(temp_file1, temp_file2)

        page.find_upload_success(temp_file1, upload_index=0)
        page.find_upload_success(temp_file2, upload_index=1)

    def test_upload_multiple_for_single_filefield(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/')

        page.fill_title_field('abc')

        page.upload_using_js(temp_file1)
        page.find_upload_success(temp_file1, upload_index=0)

        page.upload_using_js(temp_file2)
        page.assert_page_contains_text(temp_file2.base_name())
        page.find_upload_success(temp_file2, upload_index=0)

        self.assertEqual(page.get_upload_count(), 1)

        page.submit()
        page.assert_page_contains_text('Upload success')

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file2.base_name()))

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_submit_multiple_empty(self):
        page = self.page

        page.open('/multiple')
        page.submit()

        page.selenium.find_element_by_css_selector('#row-example-input_file.has-error')

    def test_form_error(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

        page.submit()

        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.fill_title_field('abc')
        page.submit()

        page.assert_page_contains_text('Upload success')

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))

        self.assertEqual(Example.objects.count(), 1)
        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_delete_after_submit(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

        page.submit()
        page.assert_page_contains_text('Title field is required')

        page.find_upload_success(temp_file)
        page.delete_ajax_file()
        page.wait_until_upload_is_removed()

    def test_delete(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.delete_ajax_file()
        page.wait_until_upload_is_removed()

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_delete_multiple(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/multiple')
        page.upload_using_js(temp_file1)
        page.find_upload_success(temp_file1)

        page.upload_using_js(temp_file2)
        page.find_upload_success(temp_file2)

        self.assertEqual(UploadedFile.objects.count(), 2)

        page.delete_ajax_file(upload_index=1)
        page.wait_until_upload_is_removed(upload_index=1)

        self.assertEqual(UploadedFile.objects.count(), 1)

        page.delete_ajax_file(upload_index=0)
        page.wait_until_upload_is_removed(upload_index=0)

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_unicode_filename(self):
        page = self.page
        prefix = u'àęö'

        temp_file = page.create_temp_file('content1', prefix=prefix)

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

        uploaded_file = UploadedFile.objects.first()

        self.assertEqual(uploaded_file.original_filename, temp_file.base_name())
        self.assertEqual(str(uploaded_file), temp_file.base_name())
        self.assertTrue(prefix in temp_file.base_name())

        page.fill_title_field('abc')
        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_fail(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)

        el = page.find_upload_fail(temp_file)
        self.assertEqual(el.find_elements_by_link_text('Delete'), [])

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_success(self):
        page = self.page

        page.create_user('test1', 'password')
        page.login('test1', 'password')

        page.assert_page_contains_text('Title')

        temp_file = page.create_temp_file('content1')

        page.open('/')

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_for_delete_fail(self):
        page = self.page

        page.create_user('test1', 'password')
        page.login('test1', 'password')

        temp_file = page.create_temp_file('content1')

        page.open('/')

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.selenium.delete_cookie('sessionid')
        page.delete_ajax_file()
        page.find_delete_failed()

    @override_settings(FILE_FORM_MUST_LOGIN=True)
    def test_permission_for_delete_success(self):
        page = self.page

        page.create_user('test1', 'password')
        page.login('test1', 'password')

        temp_file = page.create_temp_file('content1')

        page.open('/')

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.delete_ajax_file()
        page.wait_until_upload_is_removed()

    @override_settings(LANGUAGE_CODE='nl')
    def test_translation_delete(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)

        page.delete_ajax_file(text='Verwijderen')
        page.wait_until_upload_is_removed()

    @override_settings(LANGUAGE_CODE='nl', FILE_FORM_MUST_LOGIN=True)
    def test_translation_delete_failed(self):
        page = self.page

        page.create_user('test1', 'password')
        page.login('test1', 'password')

        temp_file = page.create_temp_file('content1')

        page.open('/')

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

        page.selenium.delete_cookie('sessionid')
        page.delete_ajax_file(text='Verwijderen')
        page.find_delete_failed(text='Verwijderen mislukt')

    def test_escape_filename(self):
        page = self.page

        prefix = u"&amp;"

        temp_file = page.create_temp_file('content1', prefix=prefix)

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)

        uploaded_file = UploadedFile.objects.first()

        self.assertEqual(uploaded_file.original_filename, temp_file.base_name())
        self.assertEqual(str(uploaded_file), temp_file.base_name())
        self.assertTrue(prefix in temp_file.base_name())
