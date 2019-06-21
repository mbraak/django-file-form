from django_file_form_example.temp_file import TempFile


class Page(object):
    def __init__(self, selenium, live_server_url):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.temp_files = []

    def create_temp_file(self, content):
        temp_file = TempFile()
        temp_file.create(content)

        self.temp_files.append(temp_file)

        return temp_file

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

    def open(self, page):
        self.selenium.get('%s%s' % (self.live_server_url, page))

    def fill_title_field(self, value):
        self.selenium.find_element_by_name('example-title').send_keys(value)

    def upload_without_js(self, temp_file):
        self.selenium.find_element_by_name('example-input_file').send_keys(temp_file.path())

    def upload_using_js(self, temp_file):
        self.selenium.find_element_by_css_selector('input[type=file]').send_keys(temp_file.path())

    def find_upload_success(self):
        # todo: find specific upload
        return self.selenium.find_element_by_class_name('qq-upload-success')

    def submit(self):
        self.selenium.find_element_by_class_name('btn').click()

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath("//*[contains(text(), '%s')]" % text)