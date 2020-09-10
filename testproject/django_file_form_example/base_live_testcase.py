from pathlib import Path
from uuid import uuid4

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver import DesiredCapabilities

from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.chrome.options import Options

from .test_utils import read_testdata, write_json


class BaseLiveTestCase(StaticLiveServerTestCase):
    selenium = None
    page_class = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        options = Options()
        options.headless = True
        options.add_argument('--disable-dev-shm-usage')

        desired_capabilities = DesiredCapabilities.CHROME.copy()
        desired_capabilities['goog:loggingPrefs'] = {'browser': 'ALL'}

        cls.selenium = WebDriver(desired_capabilities=desired_capabilities, options=options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def setUp(self):
        self.page = self.page_class(self.selenium, self.live_server_url)

    def tearDown(self):
        try:
            if settings.DJANGO_FILE_FORM_COVERAGE_JS:
                self.save_coverage()
        finally:
            super().tearDown()

    def save_coverage(self):
        coverage = self.selenium.execute_script('return window.__coverage__')

        filename = uuid4().hex
        write_json(f'js_coverage/{filename}.json', coverage)

    def didTestHaveErrors(self):
        return any(error for (_, error) in self._outcome.errors if error)

    def tearDown(self):
        if self.didTestHaveErrors(): # pragma: no cover
            self.save_screenshot(self.id())
            self.print_browser_log()

        self.page.cleanup()

    @classmethod
    def save_screenshot(cls, method_name): # pragma: no cover
        screenshots_path = Path('screenshots')
        if not screenshots_path.exists():
            screenshots_path.mkdir()

        filename = str(screenshots_path.joinpath(method_name + ".png"))
        cls.selenium.get_screenshot_as_file(filename)

    @classmethod
    def print_browser_log(cls): # pragma: no cover
        for entry in cls.selenium.get_log('browser'):
            print(entry)
