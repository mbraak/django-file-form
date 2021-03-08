from django_file_form_example.tests.utils.base_live_testcase import BaseLiveTestCase
from django_file_form_example.tests.utils.page import Page
from django_file_form_example.models import Example, Example2


class LiveTestCase(BaseLiveTestCase):
    page_class = Page

    def test_submit_single(self):
        page = self.page

        temp_file = page.create_temp_file(content="content")

        page.open("/without_js")
        page.fill_title_field("xyz")
        page.upload_without_js(temp_file)
        page.submit()

        page.assert_page_contains_text("Upload success")

        self.assertEqual(temp_file.uploaded_file().read_text(), "content")

        example = Example.objects.get(title="xyz")
        self.assertEqual(example.input_file.name, f"example/{temp_file.base_name()}")

    def test_submit_multiple(self):
        page = self.page

        temp_file1 = page.create_temp_file("content1")
        temp_file2 = page.create_temp_file("content2")

        page.open("/multiple_without_js")
        page.fill_title_field("abc")
        page.upload_without_js(temp_file1)
        page.upload_without_js(temp_file2)
        page.submit()

        page.assert_page_contains_text("Upload success")

        self.assertEqual(temp_file1.uploaded_file().read_text(), "content1")
        self.assertEqual(temp_file2.uploaded_file().read_text(), "content2")

        self.assertEqual(Example2.objects.count(), 1)

        example2 = Example2.objects.first()
        self.assertEqual(example2.title, "abc")

        self.assertSetEqual(
            {f.input_file.name for f in example2.files.all()},
            {f"example/{temp_file1.base_name()}", f"example/{temp_file2.base_name()}"},
        )
