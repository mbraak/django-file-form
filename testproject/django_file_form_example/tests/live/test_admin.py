from django_file_form_example.tests.utils.admin_page import AdminPage
from django_file_form_example.tests.utils.base_live_testcase import BaseLiveTestCase


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
