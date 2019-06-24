from django.core.files.base import ContentFile
from django.conf import settings

from django_file_form.models import UploadedFile
from django_file_form_example.base_live_testcase import BaseLiveTestCase
from django_file_form_example.models import Example, Example2
from django_file_form_example.page import Page
from django_file_form_example.test_utils import get_random_id, remove_p

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


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

        page.fill_title_field('abc')
        page.upload_using_js(temp_file)

        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))
        self.assertEqual(UploadedFile.objects.count(), 0)

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

        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(Example2.objects.count(), 1)

        example2 = Example2.objects.first()
        self.assertEqual(example2.title, 'abc')

        self.assertSetEqual(
            {f.input_file.name for f in example2.files.all()},
            {'example/%s' % temp_file1.base_name(), 'example/%s' % temp_file2.base_name()}
        )

        self.assertEqual(UploadedFile.objects.count(), 0)

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

    def test_ajax_delete(self):
        page = self.page

        temp_file = page.create_temp_file('content1')

        page.open('/')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.delete_ajax_file()
        page.find_not_upload_success()

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_existing_file(self):
        page = self.page

        example_filename = get_random_id()
        example_file_path = media_root.joinpath('example', example_filename)
        example = Example.objects.create(title='abc', input_file=ContentFile('xyz', example_filename))
        try:
            self.assertTrue(example_file_path.exists())

            page.open('/existing/%d' % example.id)
            el = self.selenium.find_element_by_css_selector('.existing-files')
            el.find_element_by_xpath("//*[contains(text(), '%s')]" % example_filename)
        finally:
            remove_p(example_file_path)


