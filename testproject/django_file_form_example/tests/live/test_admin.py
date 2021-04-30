from django.core.files.base import ContentFile

from django_file_form_example.models import Example
from django_file_form_example.tests.utils.admin_page import AdminPage
from django_file_form_example.tests.utils.base_live_testcase import BaseLiveTestCase
from django_file_form_example.tests.utils.test_utils import (
    read_file,
    get_random_id,
    remove_example_file,
)


class AdminTestCase(BaseLiveTestCase):
    page_class = AdminPage

    def test_add_record(self):
        page = self.page

        temp_file = page.create_temp_file("content1")

        page.open("/admin/django_file_form_example/example/add/")
        page.assert_page_contains_text("Add example")
        page.assert_page_contains_text("Drop your files here")

        page.fill_input("title", "title1")

        page.upload_using_js(temp_file)
        page.assert_page_contains_text("8 Bytes")

        page.submit()
        page.assert_page_contains_text("Select example to change")

    def test_edit_record(self):
        original_filename = get_random_id()
        example = Example.objects.create(
            title="title1",
            input_file=ContentFile("original", original_filename),
        )
        try:
            page = self.page
            temp_file = page.create_temp_file("new_content")

            page.open(f"/admin/django_file_form_example/example/{example.id}/")
            page.assert_page_contains_text("Change example")

            page.fill_input("title", "changed title")
            page.upload_using_js(temp_file)
            page.assert_page_contains_text("11 Bytes")

            page.submit()
            page.assert_page_contains_text("Select example to change")

            example.refresh_from_db()
            self.assertEqual(example.title, "changed title")
            self.assertEqual(read_file(example.input_file), b"new_content")
        finally:
            remove_example_file(original_filename)
