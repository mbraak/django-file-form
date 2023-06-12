from selenium.webdriver.common.by import By
from .temp_file import TempFile
from .test_utils import remove_test_files


class BasePage(object):
    def __init__(self, selenium, live_server_url, on_submit):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.on_submit = on_submit

        self.temp_files = []

    def assert_page_contains_text(self, text):
        self.selenium.find_element(By.XPATH, f"//*[contains(text(), '{text}')]")

    def find_elements_by_text(self, text):
        return self.selenium.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

        remove_test_files()

    def create_temp_file(self, content, prefix=None, binary=False):
        temp_file = TempFile()
        temp_file.create(content, prefix=prefix, binary=binary)

        self.temp_files.append(temp_file)

        return temp_file

    def open(self, page):
        self.selenium.get(f"{self.live_server_url}{page}")

    def upload_js_for_input(self, temp_file, input_element):
        return input_element.send_keys(temp_file.path())

    def upload_using_js(self, temp_file):
        self.upload_js_for_input(
            temp_file, self.selenium.find_element(By.CSS_SELECTOR, "input[type=file]")
        )
