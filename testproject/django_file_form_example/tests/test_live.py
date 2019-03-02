import os
from tempfile import NamedTemporaryFile

from django.contrib.staticfiles.testing import StaticLiveServerTestCase

from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options

from django_file_form_example.models import Example2


class LiveTestCase(StaticLiveServerTestCase):
    selenium = None

    @classmethod
    def setUpClass(cls):
        super(LiveTestCase, cls).setUpClass()

        options = Options()
        options.headless = True

        cls.selenium = WebDriver(options=options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(LiveTestCase, cls).tearDownClass()

    def test_submit_multiple_without_ajax(self):
        selenium = self.selenium

        file1 = None
        file2 = None
        try:
            file1 = NamedTemporaryFile(mode='w+b')
            file1.write('content1'.encode())
            file1.seek(0)

            file2 = NamedTemporaryFile(mode='w+b')
            file2.write('content2'.encode())
            file2.seek(0)

            filename1 = os.path.basename(file1.name)
            filename2 = os.path.basename(file2.name)

            selenium.get('%s%s' % (self.live_server_url, '/multiple_without_js'))
            selenium.find_element_by_name('example-title').send_keys('abc')

            selenium.find_element_by_name('example-input_file').send_keys(file1.name)
            selenium.find_element_by_name('example-input_file').send_keys(file2.name)

            selenium.find_element_by_class_name('btn').click()

            selenium.find_element_by_xpath("//*[contains(text(), 'Upload success')]")

            self.assertEqual(Example2.objects.count(), 1)

            example2 = Example2.objects.first()
            self.assertEqual(example2.title, 'abc')

            self.assertSetEqual(
                {f.input_file.name for f in example2.files.all()},
                {'example/%s' % filename1, 'example/%s' % filename2}
            )
        finally:
            if file1:
                file1.close()

            if file2:
                file2.close()
