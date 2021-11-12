from django.contrib.auth.models import User
from selenium.webdriver.common.by import By

from django_file_form_example.tests.utils.base_page import BasePage


class AdminPage(BasePage):
    def __init__(self, selenium, live_server_url, on_submit):
        super().__init__(selenium, live_server_url, on_submit)

        User.objects.create_superuser("admin", "admin@admin.nl", "password")

        self.login()

    def fill_input(self, name, value):
        input_element = self.find_input(name)
        input_element.clear()
        input_element.send_keys(value)

    def find_input(self, name):
        return self.selenium.find_element(By.NAME, name)

    def login(self):
        self.open("/admin/login/")
        self.assert_page_contains_text("Username:")

        self.fill_input("username", "admin")
        self.fill_input("password", "password")
        self.selenium.find_element(By.CSS_SELECTOR, "input[type=submit]").click()

        self.assert_page_contains_text("Site administration")

    def submit(self):
        self.on_submit()

        self.find_input("_save").click()
