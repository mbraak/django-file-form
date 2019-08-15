from django.contrib.auth.models import User
from selenium.webdriver.support.wait import WebDriverWait

from django_file_form_example.temp_file import TempFile


class Page(object):
    def __init__(self, selenium, live_server_url):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.temp_files = []

    def create_temp_file(self, content, prefix=None):
        temp_file = TempFile()
        temp_file.create(content, prefix=prefix)

        self.temp_files.append(temp_file)

        return temp_file

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

    def open(self, page):
        self.selenium.get('%s%s' % (self.live_server_url, page))

    def fill_title_field(self, value):
        self.selenium.find_element_by_name('example-title').send_keys(value)

        WebDriverWait(self.selenium, timeout=10).until(
            lambda selenium: self.selenium.find_element_by_name('example-title').get_attribute('value') == value
        )

    def upload_without_js(self, temp_file):
        self.selenium.find_element_by_name('example-input_file').send_keys(temp_file.path())

    def upload_using_js(self, temp_file):
        self.selenium.find_element_by_css_selector('input[type=file]').send_keys(temp_file.path())

    def find_upload_success(self, temp_file, upload_index=0):
        el = self.selenium.find_element_by_css_selector('.qq-file-id-%d.qq-upload-success' % upload_index)
        el.find_element_by_xpath("//*[contains(text(), '%s')]" % temp_file.base_name())

    def find_upload_fail(self, temp_file, upload_index=0):
        el = self.selenium.find_element_by_css_selector('.qq-file-id-%d.qq-upload-fail' % upload_index)
        el.find_element_by_xpath("//*[contains(text(), '%s')]" % temp_file.base_name())

    def wait_until_upload_is_removed(self, upload_index=0):
        WebDriverWait(self.selenium, timeout=10).until_not(
            lambda selenium: selenium.find_element_by_css_selector('.qq-file-id-%d.qq-upload-success' % upload_index)
        )

    def find_delete_failed(self, upload_index=0):
        el = self.selenium.find_element_by_css_selector('.qq-file-id-%d.qq-upload-success' % upload_index)
        el.find_element_by_xpath("//*[contains(text(), '%s')]" % 'Delete failed')

    def submit(self):
        self.selenium.find_element_by_class_name('btn').click()

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath("//*[contains(text(), '%s')]" % text)

    def delete_ajax_file(self, upload_index=0):
        el = self.selenium.find_element_by_css_selector('.qq-file-id-%d.qq-upload-success' % upload_index)
        el.find_element_by_link_text('Delete').click()

    def create_user(self, username, password):
        u = User.objects.create(username=username, email='%s@test.nl' % username)
        u.set_password(password)
        u.save()

    def login(self, username, password):
        self.open('/login/?next=/')
        self.selenium.find_element_by_name('username').send_keys(username)
        self.selenium.find_element_by_name('password').send_keys(password)
        self.selenium.find_element_by_css_selector('input[type=submit]').click()
