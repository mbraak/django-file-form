import threading

from django.test import override_settings
from flask_cors import CORS
from moto.server import DomainDispatcherApplication, create_backend_app
from werkzeug.serving import make_server
import boto3

from django_file_form_example.base_live_testcase import BaseLiveTestCase
from django_file_form_example.models import Example2
from django_file_form_example.page import Page
from django_file_form_example.test_utils import read_file


def create_backend_app_with_cors(service):
    backend_app = create_backend_app(service)
    CORS(backend_app, expose_headers=["ETag"])
    return backend_app


class S3ServerThread(threading.Thread):
    def run(self):
        application = DomainDispatcherApplication(
            create_backend_app_with_cors, service="s3"
        )
        self.server = make_server(
            "localhost",
            4566,
            application,
        )
        self.server.serve_forever()

    def terminate(self):
        self.server.shutdown()
        self.join()


@override_settings(
    AWS_STORAGE_BUCKET_NAME="mybucket",
    AWS_S3_ENDPOINT_URL="http://localhost:4566",
    AWS_ACCESS_KEY_ID="access1",
    AWS_SECRET_ACCESS_KEY="test1",
    CSP_CONNECT_SRC=("'self'", "http://localhost:4566"),
)
class S3TestCase(BaseLiveTestCase):
    page_class = Page

    def setUp(self):
        super().setUp()

        thread = S3ServerThread()
        thread.daemon = True
        thread.start()
        self.thread = thread

        s3 = boto3.resource(
            "s3",
            endpoint_url="http://localhost:4566",
            aws_access_key_id="access1",
            aws_secret_access_key="test1",
        )
        bucket = s3.Bucket("mybucket")
        bucket.create()

        for file in bucket.objects.all():
            s3.Object("mybucket", file.key).delete()

        self.bucket = bucket

    def tearDown(self):
        try:
            self.thread.terminate()
        finally:
            super().tearDown()

    def test_upload(self):
        page = self.page
        page.open("/s3multiple")

        temp_file = page.create_temp_file("content1")

        page.fill_title_field("abc")
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        page.assert_page_contains_text("8 Bytes")

        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 1)
        self.assertEqual(
            files_in_bucket[0].key, f"temp_uploads/s3_example/{temp_file.base_name()}"
        )

        page.submit()
        page.assert_page_contains_text("Upload success")

        example2 = Example2.objects.get(title="abc")
        self.assertEqual(example2.files.count(), 1)

        self.assertEqual(
            example2.files.all()[0].input_file.name, f"example/{temp_file.base_name()}"
        )
        self.assertEqual(read_file(example2.files.all()[0].input_file), b"content1")

    def test_submit_error(self):
        page = self.page
        page.open("/s3multiple")

        temp_file = page.create_temp_file("content1")

        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        page.assert_page_contains_text("8 Bytes")
        page.submit()

        page.assert_page_contains_text("Title field is required")
        page.find_upload_success(temp_file)
        page.assert_page_contains_text("8 Bytes")

        page.fill_title_field("abc")
        page.submit()
        page.assert_page_contains_text("Upload success")

        example2 = Example2.objects.get(title="abc")
        self.assertEqual(example2.files.count(), 1)

        self.assertEqual(
            example2.files.all()[0].input_file.name, f"example/{temp_file.base_name()}"
        )
        self.assertEqual(read_file(example2.files.all()[0].input_file), b"content1")

    def test_cancel_upload(self):
        page = self.page
        page.open("/s3multiple")

        page.set_slow_network_conditions()

        temp_file = page.create_temp_file(b"a" * (2 ** 21), binary=True)
        page.upload_using_js(temp_file)
        page.wait_until_upload_starts()
        page.cancel_upload()
        page.wait_until_upload_is_removed()

        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

    def test_upload_with_same_name(self):
        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

        page = self.page
        page.open("/s3multiple")

        temp_file = page.create_temp_file("content1")

        page.fill_title_field("abc")
        page.upload_using_js(temp_file)
        page.find_upload_success(temp_file)
        page.assert_page_contains_text("8 Bytes")

        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 1)
        self.assertEqual(
            files_in_bucket[0].key, f"temp_uploads/s3_example/{temp_file.base_name()}"
        )

        temp_file.named_temporary_file.write(b"test-test-test")
        temp_file.named_temporary_file.seek(0)

        page.upload_using_js(temp_file)
        page.assert_page_contains_text("14 Bytes")

        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 2)

        page.submit()
        page.assert_page_contains_text("Upload success")

        example2 = Example2.objects.get(title="abc")
        self.assertEqual(example2.files.count(), 1)

        self.assertEqual(
            example2.files.all()[0].input_file.name, f"example/{temp_file.base_name()}"
        )
        self.assertEqual(
            read_file(example2.files.all()[0].input_file), b"test-test-test"
        )

    def test_s3_placeholder(self):
        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

        page = self.page
        page.open("/s3placeholder")

        file_container = page.selenium.find_element_by_css_selector(
            "#row-example-input_file"
        )
        page.find_upload_success_with_filename(
            "test_placeholder1.txt", container_element=file_container
        )
        page.find_upload_success_with_filename(
            "test_placeholder2.txt", upload_index=1, container_element=file_container
        )

        other_file_container = page.selenium.find_element_by_css_selector(
            "#row-example-other-input_file"
        )
        page.find_upload_success_with_filename(
            "test_placeholder3.txt", container_element=other_file_container
        )

    def test_s3_placeholder_submit(self):
        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

        page = self.page
        page.open("/s3placeholder")

        file_container = page.selenium.find_element_by_css_selector(
            "#row-example-input_file"
        )

        temp_file = page.create_temp_file("content1")

        page.fill_title_field("abc")
        page.upload_using_js(temp_file)
        page.find_upload_success(
            temp_file, upload_index=2, container_element=file_container
        )
        page.assert_page_contains_text("8 Bytes")

        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 1)
        self.assertEqual(
            files_in_bucket[0].key,
            f"temp_uploads/s3_placeholder_example/{temp_file.base_name()}",
        )

        page.submit()

        page.assert_page_contains_text("Upload success")
        page.assert_page_contains_text("test_placeholder1.txt")
        page.assert_page_contains_text("test_placeholder2.txt")
        page.assert_page_contains_text("test_placeholder3.txt")
        page.assert_page_contains_text(temp_file.base_name())

    def test_s3_placeholder_submit_error(self):
        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

        page = self.page
        page.open("/s3placeholder")

        file_container = page.selenium.find_element_by_css_selector(
            "#row-example-input_file"
        )

        temp_file = page.create_temp_file("content1")

        page.upload_using_js(temp_file)
        page.find_upload_success(
            temp_file, upload_index=2, container_element=file_container
        )

        page.submit()

        page.assert_page_contains_text("Title field is required")

        file_container = page.selenium.find_element_by_css_selector(
            "#row-example-input_file"
        )
        page.find_upload_success_with_filename(
            "test_placeholder1.txt", container_element=file_container
        )
        page.find_upload_success_with_filename(
            "test_placeholder2.txt", upload_index=1, container_element=file_container
        )
        page.find_upload_success_with_filename(
            temp_file.base_name(), upload_index=2, container_element=file_container
        )

        other_file_container = page.selenium.find_element_by_css_selector(
            "#row-example-other-input_file"
        )
        page.find_upload_success_with_filename(
            "test_placeholder3.txt", container_element=other_file_container
        )

    def test_s3_placeholder_delete(self):
        files_in_bucket = list(self.bucket.objects.all())
        self.assertEqual(len(files_in_bucket), 0)

        page = self.page
        page.open("/s3placeholder")

        page.delete_ajax_file(field_selector="#row-example-input_file")
        page.wait_until_upload_is_removed(field_selector="#row-example-input_file")

        page.submit()

        page.assert_page_contains_text("Title field is required")

        file_container = page.selenium.find_element_by_css_selector(
            "#row-example-input_file"
        )

        page.find_upload_success_with_filename(
            "test_placeholder2.txt", upload_index=0, container_element=file_container
        )
