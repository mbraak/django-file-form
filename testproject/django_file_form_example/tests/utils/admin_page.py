from django.contrib.auth.models import User

from django_file_form_example.tests.utils.base_page import BasePage


class AdminPage(BasePage):
    def __init__(self, selenium, live_server_url, on_submit):
        super().__init__(selenium, live_server_url, on_submit)

        User.objects.create_superuser('admin', 'admin@admin.nl', 'password')

        self.login()

    def login(self):
        self.open("/admin/login/")
        self.assert_page_contains_text("Username:")

        self.selenium.find_element_by_name("username").send_keys("admin")
        self.selenium.find_element_by_name("password").send_keys("password")
        self.selenium.find_element_by_css_selector("input[type=submit]").click()

        self.assert_page_contains_text("Site administration")
