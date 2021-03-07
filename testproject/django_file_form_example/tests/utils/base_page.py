from .temp_file import TempFile


def upload_js_for_input(temp_file, input_element):
    return input_element.send_keys(temp_file.path())


class BasePage(object):
    def __init__(self, selenium, live_server_url, on_submit):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.on_submit = on_submit

        self.temp_files = []

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath(f"//*[contains(text(), '{text}')]")

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

    def create_temp_file(self, content, prefix=None, binary=False):
        temp_file = TempFile()
        temp_file.create(content, prefix=prefix, binary=binary)

        self.temp_files.append(temp_file)

        return temp_file

    def open(self, page):
        self.selenium.get(f"{self.live_server_url}{page}")

    def upload_using_js(self, temp_file):
        upload_js_for_input(
            temp_file, self.selenium.find_element_by_css_selector("input[type=file]")
        )
