import re
from django.contrib.auth.models import User
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

from .base_page import BasePage
from .test_utils import to_class_string


class Page(BasePage):
    def cancel_upload(self, upload_index=0):
        el = self.selenium.find_element(By.CSS_SELECTOR, f".dff-file-id-{upload_index}")
        el.find_element(By.LINK_TEXT, "Cancel").click()

    def create_user(self, username, password):
        u = User.objects.create(username=username, email=f"{username}@test.nl")
        u.set_password(password)
        u.save()

    def delete_ajax_file(self, upload_index=0, text="Delete", field_selector=None):
        el = self.selenium.find_element(
            By.CSS_SELECTOR,
            f"{field_selector or ''} .dff-file-id-{upload_index}.dff-upload-success",
        )
        el.find_element(By.LINK_TEXT, text).click()

    def fill_title_field(self, value, form_prefix="example"):
        self.find_title_field(form_prefix).send_keys(value)

    def find_delete_failed(self, upload_index=0, text="Delete failed"):
        el = self.selenium.find_element(
            By.CSS_SELECTOR, f".dff-file-id-{upload_index}.dff-upload-success"
        )
        el.find_element(By.XPATH, f"//*[contains(text(), '{text}')]")

    def find_title_field(self, form_prefix="example"):
        return self.selenium.find_element(By.NAME, f"{form_prefix}-title")

    def find_upload_element(self, upload_index=0, extra_class=None):
        classes = [f"dff-file-id-{upload_index}", extra_class]

        return self.selenium.find_element(By.CSS_SELECTOR, to_class_string(classes))

    def find_upload_fail(self, temp_file, upload_index=0):
        el = self.find_upload_element(upload_index, extra_class="dff-upload-fail")
        el.find_element(By.XPATH, f"//*[contains(text(), '{temp_file.base_name()}')]")
        el.find_element(By.XPATH, "//*[contains(text(), 'Upload failed')]")
        return el

    def find_upload_success(self, temp_file, upload_index=0, container_element=None):
        return self.find_upload_success_with_filename(
            temp_file.base_name(),
            upload_index=upload_index,
            container_element=container_element,
        )

    def find_upload_success_with_filename(
        self, filename, upload_index=0, container_element=None
    ):
        parent_element = container_element or self.selenium

        try:
            el = parent_element.find_element(
                By.CSS_SELECTOR, f".dff-file-id-{upload_index}.dff-upload-success"
            )

            assert filename in el.text, f"{filename} not found"
            return el
        except NoSuchElementException as e:  # pragma: no cover
            print(
                parent_element.find_element(
                    By.CSS_SELECTOR, ".dff-files"
                ).get_attribute("outerHTML")
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
        return len(self.selenium.find_elements(By.CSS_SELECTOR, ".dff-upload-success"))

    def get_hidden_uploads_value(self, form_prefix="example"):
        return self.selenium.find_element(
            By.NAME, f"{form_prefix}-input_file-uploads"
        ).get_property("value")

    def login(self, username, password):
        self.open("/login/?next=/")
        self.selenium.find_element(By.NAME, "username").send_keys(username)
        self.selenium.find_element(By.NAME, "password").send_keys(password)
        self.selenium.find_element(By.CSS_SELECTOR, "input[type=submit]").click()

    def submit(self):
        self.on_submit()
        self.selenium.find_element(By.CSS_SELECTOR, "input[type=submit]").click()

    def set_slow_network_conditions(self):
        self.selenium.set_network_conditions(latency=5, throughput=50 * 1024)

    def upload_multiple_using_js(self, *temp_files):
        self.selenium.find_element(By.CSS_SELECTOR, "input[type=file]").send_keys(
            "\n".join(temp_file.path() for temp_file in temp_files)
        )

    def upload_without_js(self, temp_file):
        self.selenium.find_element(By.NAME, "example-input_file").send_keys(
            temp_file.path()
        )

    def wait_until_upload_is_removed(self, upload_index=0, field_selector=None):
        WebDriverWait(self.selenium, timeout=10, poll_frequency=0.1).until_not(
            lambda selenium: selenium.find_element(
                By.CSS_SELECTOR, f"{field_selector or ''} .dff-file-id-{upload_index}"
            )
        )

    def wait_until_upload_starts(self, upload_index=0):
        def get_percentage(selenium):
            progress_element = selenium.find_element(
                By.CSS_SELECTOR, f".dff-file-id-{upload_index} .dff-progress-inner"
            )

            if not progress_element:  # pragma: no cover
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
