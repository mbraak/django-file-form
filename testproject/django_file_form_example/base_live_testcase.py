from pathlib import Path

from django.contrib.staticfiles.testing import StaticLiveServerTestCase

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

        cls.selenium = WebDriver(options=options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(BaseLiveTestCase, cls).tearDownClass()

    def setUp(self):
        self.page = self.page_class(self.selenium, self.live_server_url)

    def tearDown(self):
        if any(error for (_, error) in self._outcome.errors if error):
            self.save_screenshot(self.id())

        self.page.cleanup()

    @classmethod
    def save_screenshot(cls, method_name):
        screenshots_path = Path('screenshots')
        if not screenshots_path.exists():
            screenshots_path.mkdir()

        filename = str(screenshots_path.joinpath(method_name + ".png"))
        cls.selenium.get_screenshot_as_file(filename)
