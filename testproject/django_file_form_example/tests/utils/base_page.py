class BasePage(object):
    def __init__(self, selenium, live_server_url, on_submit):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.on_submit = on_submit

    def cleanup(self):
        pass

    def open(self, page):
        self.selenium.get(f"{self.live_server_url}{page}")

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath(f"//*[contains(text(), '{text}')]")
