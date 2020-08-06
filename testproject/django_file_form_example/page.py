from django.contrib.auth.models import User
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.wait import WebDriverWait

from django_file_form_example.temp_file import TempFile
from django_file_form_example.test_utils import to_class_string


class Page(object):
    def __init__(self, selenium, live_server_url):
        self.selenium = selenium
        self.live_server_url = live_server_url
        self.temp_files = []

    def create_temp_file(self, content, prefix=None, binary=False):
        temp_file = TempFile()
        temp_file.create(content, prefix=prefix, binary=binary)

        self.temp_files.append(temp_file)

        return temp_file

    def cleanup(self):
        for temp_file in self.temp_files:
            temp_file.destroy()

    def open(self, page):
        self.selenium.get('%s%s' % (self.live_server_url, page))

    def fill_title_field(self, value, form_prefix='example'):
        self.selenium.find_element_by_name(f'{form_prefix}-title').send_keys(value)

    def upload_without_js(self, temp_file):
        self.selenium.find_element_by_name('example-input_file').send_keys(temp_file.path())

    def upload_using_js(self, temp_file):
        self.upload_js_for_input(
            temp_file,
            self.selenium.find_element_by_css_selector('input[type=file]')
        )

    def upload_js_for_input(self, temp_file, input_element):
        return input_element.send_keys(temp_file.path())

    def upload_multiple_using_js(self, *temp_files):
        self.selenium.find_element_by_css_selector('input[type=file]').send_keys(
            "\n".join(temp_file.path() for temp_file in temp_files)
        )

    def find_upload_success(self, temp_file, upload_index=0, container_element=None):
        parent_element = container_element or self.selenium

        try:
            el = parent_element.find_element_by_css_selector('.dff-file-id-%d.dff-upload-success' % upload_index)
            return el.find_element_by_xpath("//*[contains(text(), '%s')]" % temp_file.base_name())
        except NoSuchElementException as e:
            print(
                parent_element.find_element_by_css_selector('.dff-files').get_attribute('outerHTML')
            )
            raise e

    def find_upload_success_for_input(self, temp_file, input_element, upload_index=0):
        container_element = input_element.get_property('parentElement')
        assert container_element.get_attribute('class') == 'dff-container'

        uploader_element = container_element.get_property('parentElement')
        assert uploader_element.get_attribute('class') == 'dff-uploader'

        return self.find_upload_success(temp_file, upload_index=upload_index, container_element=uploader_element)

    def get_upload_count(self):
        return len(self.selenium.find_elements_by_css_selector('.dff-upload-success'))

    def find_upload_fail(self, temp_file, upload_index=0):
        el = self.find_upload_element(upload_index, extra_class='dff-upload-fail')
        el.find_element_by_xpath("//*[contains(text(), '%s')]" % temp_file.base_name())
        el.find_element_by_xpath("//*[contains(text(), 'Upload failed')]")
        return el

    def find_upload_element(self, upload_index=0, extra_class=None):
        classes = ['dff-file-id-%d' % upload_index, extra_class]

        return self.selenium.find_element_by_css_selector(to_class_string(classes))

    def wait_until_upload_is_removed(self, upload_index=0, field_selector=None):
        WebDriverWait(self.selenium, timeout=10).until_not(
            lambda selenium: selenium.find_element_by_css_selector('%s .dff-file-id-%d.dff-upload-success' % (field_selector or '', upload_index))
        )

    def find_delete_failed(self, upload_index=0, text='Delete failed'):
        el = self.selenium.find_element_by_css_selector('.dff-file-id-%d.dff-upload-success' % upload_index)
        el.find_element_by_xpath("//*[contains(text(), '%s')]" % text)

    def submit(self):
        self.selenium.find_element_by_css_selector('input[type=submit]').click()

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath("//*[contains(text(), '%s')]" % text)

    def delete_ajax_file(self, upload_index=0, text='Delete', field_selector=None):
        el = self.selenium.find_element_by_css_selector('%s .dff-file-id-%d.dff-upload-success' % (field_selector or '', upload_index))
        el.find_element_by_link_text(text).click()

    def create_user(self, username, password):
        u = User.objects.create(username=username, email='%s@test.nl' % username)
        u.set_password(password)
        u.save()

    def login(self, username, password):
        self.open('/login/?next=/')
        self.selenium.find_element_by_name('username').send_keys(username)
        self.selenium.find_element_by_name('password').send_keys(password)
        self.selenium.find_element_by_css_selector('input[type=submit]').click()
