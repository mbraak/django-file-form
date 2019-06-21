from django_file_form.models import UploadedFile
from django_file_form_example.base_live_testcase import BaseLiveTestCase
from django_file_form_example.models import Example, Example2
from django_file_form_example.temp_file import TempFile


class LiveTestCase(BaseLiveTestCase):
    def test_submit_single_without_ajax(self):
        selenium = self.selenium

        temp_file = TempFile()
        try:
            temp_file.create('content1')

            self.get_page('/without_js')

            selenium.find_element_by_name('example-title').send_keys('xyz')

            selenium.find_element_by_name('example-input_file').send_keys(temp_file.path())

            selenium.find_element_by_class_name('btn').click()

            self.assert_page_contains_text('Upload success')

            self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

            example = Example.objects.get(title='xyz')
            self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))
        finally:
            temp_file.destroy()

    def test_submit_multiple_without_ajax(self):
        selenium = self.selenium

        temp_file1 = TempFile()
        temp_file2 = TempFile()
        try:
            temp_file1.create('content1')
            temp_file2.create('content2')

            self.get_page('/multiple_without_js')
            selenium.find_element_by_name('example-title').send_keys('abc')

            selenium.find_element_by_name('example-input_file').send_keys(temp_file1.path())
            selenium.find_element_by_name('example-input_file').send_keys(temp_file2.path())

            selenium.find_element_by_class_name('btn').click()

            self.assert_page_contains_text('Upload success')

            self.assertEqual(temp_file1.uploaded_file().read_text(), "content1")
            self.assertEqual(temp_file2.uploaded_file().read_text(), "content2")

            self.assertEqual(Example2.objects.count(), 1)

            example2 = Example2.objects.first()
            self.assertEqual(example2.title, 'abc')

            self.assertSetEqual(
                {f.input_file.name for f in example2.files.all()},
                {'example/%s' % temp_file1.base_name(), 'example/%s' % temp_file2.base_name()}
            )
        finally:
            temp_file1.destroy()
            temp_file2.destroy()

    def test_upload(self):
        selenium = self.selenium

        temp_file = TempFile()
        try:
            temp_file.create('content1')

            self.get_page('/')
            selenium.find_element_by_name('example-title').send_keys('abc')
            selenium.find_element_by_css_selector('input[type=file]').send_keys(temp_file.path())

            el = selenium.find_element_by_class_name('qq-upload-success')
            self.assertTrue(el.text.startswith(temp_file.base_name()))
            self.assertEqual(UploadedFile.objects.count(), 1)

            selenium.find_element_by_class_name('btn').click()

            self.assert_page_contains_text('Upload success')

            self.assertEqual(temp_file.uploaded_file().read_text(), "content1")

            example = Example.objects.get(title='abc')
            self.assertEqual(example.input_file.name, 'example/{0!s}'.format(temp_file.base_name()))
        finally:
            temp_file.destroy()

    def test_form_error(self):
        selenium = self.selenium

        temp_file = TempFile()
        try:
            temp_file.create('content1')

            self.get_page('/')
            selenium.find_element_by_css_selector('input[type=file]').send_keys(temp_file.path())

            el = selenium.find_element_by_class_name('qq-upload-success')
            self.assertTrue(el.text.startswith(temp_file.base_name()))

            selenium.find_element_by_id('id_example-title')
            selenium.find_element_by_class_name('btn').click()

            self.assert_page_contains_text('Title field is required')

            el = selenium.find_element_by_class_name('qq-upload-success')
            self.assertTrue(el.text.startswith(temp_file.base_name()))

            selenium.find_element_by_name('example-title').send_keys('abc')
            selenium.find_element_by_class_name('btn').click()
            self.assert_page_contains_text('Upload success')
        finally:
            temp_file.destroy()
