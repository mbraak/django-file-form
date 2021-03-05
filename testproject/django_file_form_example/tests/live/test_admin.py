from django_file_form_example.tests.utils.admin_page import AdminPage
from django_file_form_example.tests.utils.base_live_testcase import BaseLiveTestCase


class AdminTestCase(BaseLiveTestCase):
    page_class = AdminPage

    def test_add_record(self):
        page = self.page

        page.open("/admin/django_file_form_example/example/add/")
        page.assert_page_contains_text("Add example")
        page.assert_page_contains_text("Drop your files here")

