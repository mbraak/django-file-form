from pathlib import Path

from django.conf import settings
from django.test import override_settings

from django_file_form.models import UploadedFile
from django_file_form_example.base_live_testcase import BaseLiveTestCase
from django_file_form_example.models import Example, Example2
from django_file_form_example.page import Page
from django_file_form_example.test_utils import read_file, count_temp_uploads

media_root = Path(settings.MEDIA_ROOT)


class LiveTestCase(BaseLiveTestCase):
    page_class = Page

    def test_upload(self):
        page = self.page

        temp_file = page.create_temp_file('content1')
        temp_uploads_path = Path(settings.MEDIA_ROOT).joinpath('temp_uploads')
        original_temp_file_count = count_temp_uploads()

        page.open('/')

        page.selenium.find_element_by_css_selector('.dff-files')

        page.fill_title_field('abc')
        page.upload_using_js(temp_file)

        page.find_upload_success(temp_file)
        page.assert_page_contains_text('8 Bytes')
        self.assertEqual(UploadedFile.objects.count(), 1)

        uploaded_file = UploadedFile.objects.first()
        self.assertEqual(read_file(uploaded_file.uploaded_file), b'content1')
        self.assertTrue(uploaded_file.uploaded_file.name.startswith('temp_uploads/'))
        self.assertEqual(Path(str(uploaded_file.uploaded_file.path)).parent, temp_uploads_path)
        self.assertEqual(count_temp_uploads(), original_temp_file_count + 1)

        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, f'example/{temp_file.base_name()}')
        self.assertEqual(read_file(example.input_file), b'content1')

        self.assertEqual(UploadedFile.objects.count(), 0)
        self.assertFalse(Path(uploaded_file.uploaded_file.path).exists())

    def test_upload_binary_file(self):
        content = Path(__file__).parent.joinpath('../test_data/wikipedia.png').read_bytes()

        page = self.page
        temp_file = page.create_temp_file(content, binary=True)
        page.open('/')
        page.selenium.find_element_by_css_selector('.dff-files')
        page.upload_using_js(temp_file)

        page.find_upload_success(temp_file)
        self.assertEqual(UploadedFile.objects.count(), 1)

        uploaded_file = UploadedFile.objects.first()
        self.assertEqual(read_file(uploaded_file.uploaded_file), content)

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
            {f'example/{temp_file1.base_name()}', f'example/{temp_file2.base_name()}'}
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
        page.find_upload_success(temp_file2, upload_index=1)

        self.assertEqual(page.get_upload_count(), 1)

        page.submit()
        page.assert_page_contains_text('Upload success')

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, f'example/{temp_file2.base_name()}')

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
        page.assert_page_contains_text('8 Bytes')
        self.assertEqual(UploadedFile.objects.count(), 1)

        page.fill_title_field('abc')
        page.submit()

        page.assert_page_contains_text('Upload success')

        example = Example.objects.get(title='abc')
        self.assertEqual(example.input_file.name, f'example/{temp_file.base_name()}')

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

        page.submit()
        page.assert_page_contains_text('Title field is required')

        self.assertEqual(page.get_upload_count(), 0)

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
        page.fill_title_field('abc')

        page.upload_using_js(temp_file1)
        page.find_upload_success(temp_file1)

        page.upload_using_js(temp_file2)
        page.find_upload_success(temp_file2, upload_index=1)

        self.assertEqual(UploadedFile.objects.count(), 2)

        page.delete_ajax_file(upload_index=1)
        page.wait_until_upload_is_removed(upload_index=1)

        self.assertEqual(UploadedFile.objects.count(), 1)

        page.delete_ajax_file(upload_index=0)
        page.wait_until_upload_is_removed(upload_index=0)

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_unicode_filename(self):
        page = self.page
        prefix = 'àęö'

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

    def test_wizard(self):
        page = self.page
        temp_file = page.create_temp_file('content1')

        page.open('/wizard')
        page.fill_title_field('abc', form_prefix='0')
        page.upload_using_js(temp_file)

        page.find_upload_success(temp_file)
        page.submit()

        previous_button = page.selenium.find_element_by_css_selector('button')
        self.assertEqual(previous_button.text, 'Previous')
        previous_button.click()

        page.find_upload_success(temp_file)

    def test_form_set(self):
        page = self.page

        temp_file1 = page.create_temp_file('content1')
        temp_file2 = page.create_temp_file('content2')

        page.open('/form_set')

        page.fill_title_field('title1', form_prefix='form-0')

        file_input_element1 = page.selenium.find_element_by_css_selector('#id_form-0-input_file')
        page.upload_js_for_input(temp_file1, file_input_element1)
        page.find_upload_success_for_input(temp_file1, file_input_element1)

        page.fill_title_field('title2', form_prefix='form-1')

        file_input_element2 = page.selenium.find_element_by_css_selector('#id_form-1-input_file')
        page.upload_js_for_input(temp_file2, file_input_element2)
        page.find_upload_success_for_input(temp_file2, file_input_element2)

        self.assertEqual(UploadedFile.objects.count(), 2)

        uploaded_files = UploadedFile.objects.all()
        self.assertSetEqual(
            {read_file(uploaded_file.uploaded_file) for uploaded_file in uploaded_files},
            {b'content1', b'content2'}
        )

        page.submit()
        page.assert_page_contains_text('Upload success')

        example1 = Example.objects.get(title='title1')
        self.assertEqual(example1.input_file.name, f'example/{temp_file1.base_name()}')
        self.assertEqual(read_file(example1.input_file), b'content1')

        example2 = Example.objects.get(title='title2')
        self.assertEqual(example2.input_file.name, f'example/{temp_file2.base_name()}')
        self.assertEqual(read_file(example2.input_file), b'content2')

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_placeholder_files(self):
        page = self.page
        page.open('/placeholder')

        # placeholders exist
        el = page.selenium.find_element_by_css_selector('.dff-file-id-0.dff-upload-success')
        el.find_element_by_xpath("//*[contains(text(), 'test_placeholder1.txt')]")
        el.find_element_by_xpath("//*[contains(text(), '1 KB')]")

        el = page.selenium.find_element_by_css_selector('.dff-file-id-1.dff-upload-success')
        el.find_element_by_xpath("//*[contains(text(), 'test_placeholder2.txt')]")
        el.find_element_by_xpath("//*[contains(text(), '2 KB')]")

        # add file
        temp_file = page.create_temp_file('content1')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file, upload_index=1)

        # submit
        page.fill_title_field('abc')
        page.submit()

        page.assert_page_contains_text('Upload success')

        example = Example2.objects.get(title='abc')
        self.assertEqual(example.files.count(), 1)

        example_file = example.files.first()
        self.assertEqual(example_file.input_file.name, f'example/{temp_file.base_name()}')
        self.assertEqual(read_file(example_file.input_file), b'content1')

        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_placeholders_submit(self):
        page = self.page
        page.open('/placeholder')

        page.fill_title_field('abc')
        page.submit()

        page.assert_page_contains_text('Upload success')
        page.assert_page_contains_text('Input file: test_placeholder1.txt, test_placeholder2.txt')
        page.assert_page_contains_text('Other input file: test_placeholder3.txt')

    def test_delete_placeholder_file(self):
        page = self.page
        page.open('/placeholder')

        page.selenium.find_element_by_css_selector('#row-example-input_file .dff-file-id-0.dff-upload-success')
        self.assertEqual(len(page.selenium.find_elements_by_css_selector('#row-example-input_file .dff-files .dff-file')), 2)

        # click 'delete'
        page.delete_ajax_file()
        page.wait_until_upload_is_removed(0, '#row-example-input_file')

        # upload file
        temp_file = page.create_temp_file('content1')
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file, upload_index=1)

        # submit form
        page.submit()
        page.assert_page_contains_text('Title field is required')

        self.assertEqual(len(page.selenium.find_elements_by_css_selector('#row-example-input_file .dff-files .dff-file')), 2)
        self.assertEqual(len(page.selenium.find_elements_by_css_selector('#row-example-input_file .dff-files .dff-file')), 2)

        el = page.selenium.find_element_by_css_selector('#row-example-input_file .dff-file-id-0.dff-upload-success')
        el.find_element_by_xpath("//*[contains(text(), 'test_placeholder2.txt')]")
        el.find_element_by_xpath("//*[contains(text(), '2 KB')]")

        el = page.selenium.find_element_by_css_selector('#row-example-input_file .dff-file-id-1.dff-upload-success')
        el.find_element_by_xpath(f"//*[contains(text(), '{temp_file.base_name()}')]")

    def test_accept_attribute(self):
        page = self.page
        page.open('/accept')

        file_input = page.selenium.find_element_by_css_selector('#row-example-input_file input[type=file]')
        self.assertEqual(file_input.get_attribute('accept'), 'image/*')

    def test_replace_file_with_same_name(self):
        page = self.page
        page.open('/multiple')

        temp_file = page.create_temp_file('content1')

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file, upload_index=0)
        page.assert_page_contains_text('8 Bytes')

        temp_file.named_temporary_file.write(b'test-test-test')
        temp_file.named_temporary_file.seek(0)

        page.upload_using_js(temp_file)
        page.assert_page_contains_text('14 Bytes')

        self.assertEqual(page.get_upload_count(), 1)

        page.fill_title_field('abc')
        page.submit()
        page.assert_page_contains_text('Upload success')

        self.assertEqual(Example2.objects.count(), 1)
        example2 = Example2.objects.first()
        self.assertEqual(example2.files.count(), 1)
        example_file = example2.files.first()
        self.assertEqual(example_file.input_file.name, f'example/{temp_file.base_name()}')
        self.assertEqual(temp_file.uploaded_file().read_text(), "test-test-test")

    def test_cancel_upload(self):
        original_temp_file_count = count_temp_uploads()

        page = self.page
        page.open('/multiple')

        page.set_slow_network_conditions()

        temp_file = page.create_temp_file(b'a' * (2 ** 22), binary=True)
        page.upload_using_js(temp_file)
        page.cancel_upload()
        page.wait_until_upload_is_removed()

        self.assertEqual(UploadedFile.objects.count(), 0)
        self.assertEqual(count_temp_uploads(), original_temp_file_count)
