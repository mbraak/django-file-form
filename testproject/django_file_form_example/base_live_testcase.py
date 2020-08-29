from pathlib import Path

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver import DesiredCapabilities

from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.chrome.options import Options


class BaseLiveTestCase(StaticLiveServerTestCase):
    selenium = None
    page_class = None

    @classmethod
    def setUpClass(cls):
        super(BaseLiveTestCase, cls).setUpClass()

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
        super(BaseLiveTestCase, cls).tearDownClass()

    def setUp(self):
        self.page = self.page_class(self.selenium, self.live_server_url)

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
