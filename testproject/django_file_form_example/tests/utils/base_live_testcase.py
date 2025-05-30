from pathlib import Path
from uuid import uuid4
from django.conf import settings
from django.test import LiveServerTestCase
from django.test.selenium import SeleniumTestCase, SeleniumTestCaseBase

from .test_utils import write_json


class SeleniumTestMetaClass(SeleniumTestCaseBase):
    def create_options(self):
        options = self.import_options(self.browser)()

        # Fix for Django 4.2
        if self.headless:
            options.add_argument("--headless")

        options.add_argument("--disable-dev-shm-usage")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

        return options


class BaseLiveTestCase(
    SeleniumTestCase, LiveServerTestCase, metaclass=SeleniumTestMetaClass
):
    browsers = ["chrome"]
    headless = True
    page_class = None

    def setUp(self):
        super().setUp()

        self.page = self.page_class(
            self.selenium, self.live_server_url, self.handle_coverage
        )
        self.selenium.set_network_conditions(latency=0, throughput=-1)

        self.setup_detect_test_error()

    def handle_coverage(self):
        if getattr(settings, "DJANGO_FILE_FORM_COVERAGE_JS", False):
            self.save_coverage()

    def save_coverage(self):
        coverage = self.selenium.execute_script("return window.__coverage__")

        filename = uuid4().hex
        write_json(f"js_coverage/{filename}.json", coverage)

    def tearDown(self):
        try:
            self.handle_coverage()
            self.handleErrors()
            self.page.cleanup()
        finally:
            super().tearDown()

    def setup_detect_test_error(self):
        self.error_count = len(self._outcome.result.errors)
        self.failure_count = len(self._outcome.result.failures)

    def did_test_have_errors(self):
        return self.error_count != len(
            self._outcome.result.errors
        ) or self.failure_count != len(self._outcome.result.failures)

    def handleErrors(self):
        if self.did_test_have_errors():  # pragma: no cover
            self.save_screenshot(self.id())
            self.print_browser_log()

    @classmethod
    def save_screenshot(cls, method_name):  # pragma: no cover
        screenshots_path = Path("screenshots")
        if not screenshots_path.exists():
            screenshots_path.mkdir()

        filename = str(screenshots_path.joinpath(method_name + ".png"))
        cls.selenium.get_screenshot_as_file(filename)

    @classmethod
    def print_browser_log(cls):  # pragma: no cover
        for entry in cls.selenium.get_log("browser"):
            print(entry)
