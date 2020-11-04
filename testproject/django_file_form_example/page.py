import re
from django.contrib.auth.models import User
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.wait import WebDriverWait

from django_file_form_example.temp_file import TempFile
from django_file_form_example.test_utils import to_class_string


class Page(object):
    def __init__(self, selenium, live_server_url, on_submit):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.on_submit = on_submit
        self.temp_files = []

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath(f"//*[contains(text(), '{text}')]")

    def cancel_upload(self, upload_index=0):
        el = self.selenium.find_element_by_css_selector(f".dff-file-id-{upload_index}")
        el.find_element_by_link_text("Cancel").click()

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

    def create_temp_file(self, content, prefix=None, binary=False):
        temp_file = TempFile()
        temp_file.create(content, prefix=prefix, binary=binary)

        self.temp_files.append(temp_file)

        return temp_file

    def create_user(self, username, password):
        u = User.objects.create(username=username, email=f"{username}@test.nl")
        u.set_password(password)
        u.save()

    def delete_ajax_file(self, upload_index=0, text="Delete", field_selector=None):
        el = self.selenium.find_element_by_css_selector(
            f"{field_selector or ''} .dff-file-id-{upload_index}.dff-upload-success"
        )
        el.find_element_by_link_text(text).click()

    def fill_title_field(self, value, form_prefix="example"):
        self.selenium.find_element_by_name(f"{form_prefix}-title").send_keys(value)

    def find_delete_failed(self, upload_index=0, text="Delete failed"):
        el = self.selenium.find_element_by_css_selector(
            f".dff-file-id-{upload_index}.dff-upload-success"
        )
        el.find_element_by_xpath(f"//*[contains(text(), '{text}')]")

    def find_upload_element(self, upload_index=0, extra_class=None):
        classes = [f"dff-file-id-{upload_index}", extra_class]

        return self.selenium.find_element_by_css_selector(to_class_string(classes))

    def find_upload_fail(self, temp_file, upload_index=0):
        el = self.find_upload_element(upload_index, extra_class="dff-upload-fail")
        el.find_element_by_xpath(f"//*[contains(text(), '{temp_file.base_name()}')]")
        el.find_element_by_xpath("//*[contains(text(), 'Upload failed')]")
        return el

    def find_upload_success(self, temp_file, upload_index=0, container_element=None):
        parent_element = container_element or self.selenium

        try:
            el = parent_element.find_element_by_css_selector(
                f".dff-file-id-{upload_index}.dff-upload-success"
            )
            return el.find_element_by_xpath(
                f"//*[contains(text(), '{temp_file.base_name()}')]"
            )
        except NoSuchElementException as e:
            print(
                parent_element.find_element_by_css_selector(".dff-files").get_attribute(
                    "outerHTML"
                )
            )
            raise e

    def find_upload_success_for_input(self, temp_file, input_element, upload_index=0):
        container_element = input_element.get_property("parentElement")
        assert container_element.get_attribute("class") == "dff-container"

        uploader_element = container_element.get_property("parentElement")
        assert uploader_element.get_attribute("class") == "dff-uploader"

        return self.find_upload_success(
            temp_file, upload_index=upload_index, container_element=uploader_element
        )

    def get_upload_count(self):
        return len(self.selenium.find_elements_by_css_selector(".dff-upload-success"))

    def login(self, username, password):
        self.open("/login/?next=/")
        self.selenium.find_element_by_name("username").send_keys(username)
        self.selenium.find_element_by_name("password").send_keys(password)
        self.selenium.find_element_by_css_selector("input[type=submit]").click()

    def open(self, page):
        self.selenium.get(f"{self.live_server_url}{page}")

    def submit(self):
        self.on_submit()
        self.selenium.find_element_by_css_selector("input[type=submit]").click()

    def set_slow_network_conditions(self):
        self.selenium.set_network_conditions(latency=5, throughput=50 * 1024)

    def upload_js_for_input(self, temp_file, input_element):
        return input_element.send_keys(temp_file.path())

    def upload_multiple_using_js(self, *temp_files):
        self.selenium.find_element_by_css_selector("input[type=file]").send_keys(
            "\n".join(temp_file.path() for temp_file in temp_files)
        )

    def upload_using_js(self, temp_file):
        self.upload_js_for_input(
            temp_file, self.selenium.find_element_by_css_selector("input[type=file]")
        )

    def upload_without_js(self, temp_file):
        self.selenium.find_element_by_name("example-input_file").send_keys(
            temp_file.path()
        )

    def wait_until_upload_is_removed(self, upload_index=0, field_selector=None):
        WebDriverWait(self.selenium, timeout=10, poll_frequency=0.1).until_not(
            lambda selenium: selenium.find_element_by_css_selector(
                f"{field_selector or ''} .dff-file-id-{upload_index}"
            )
        )

    def wait_until_upload_starts(self, upload_index=0):
        def get_percentage(selenium):
            progress_element = selenium.find_element_by_css_selector(
                f".dff-file-id-{upload_index} .dff-progress-inner"
            )

            if not progress_element:
                return 0.0

            style = progress_element.get_attribute("style")
            m = re.match(r"^width: (\d+\.\d+)%;$", style)

            if not m:  # pragma: no cover
                return 0.0
            else:
                return float(m.group(1))

        WebDriverWait(self.selenium, timeout=10, poll_frequency=0.1).until(
            lambda selenium: get_percentage(selenium) > 5
        )
