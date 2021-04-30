from pathlib import Path
from django.conf import settings

from django_file_form_example.models import Example, ExampleFile
from .temp_file import TempFile


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

        for example in Example.objects.all():
            example.input_file.delete()

        for example_file in ExampleFile.objects.all():
            example_file.input_file.delete()

        temp_uploads = Path(settings.MEDIA_ROOT).joinpath("temp_uploads")
        if temp_uploads.exists():
            for temp_file in temp_uploads.iterdir():
                temp_file.unlink()

        if temp_uploads.exists() and len(list(temp_uploads.iterdir())) > 0:
            raise Exception("temp_uploads dir is not empty")

        example_uploads = Path(settings.MEDIA_ROOT).joinpath("example")
        if example_uploads.exists() and len(list(example_uploads.iterdir())) > 0:
            raise Exception("example dir is not empty")

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
            temp_file, self.selenium.find_element_by_css_selector("input[type=file]")
        )
