import re
from django.test import Client, override_settings, TestCase
from django.core.exceptions import PermissionDenied

from django_file_form_example.tests.utils.test_utils import remove_test_files


def custom_check_permissions(request, _field_name):
    raise PermissionDenied()


def custom_check_permissions_with_message(request, _field_name):
    raise PermissionDenied('test message1')


class ViewTests(TestCase):
    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_post(self):
        self.do_post(Client())

    def test_post_without_metadata(self):
        response = Client().post("/upload/")
        self.assertEqual(response.status_code, 500)
        self.assertEqual(
            response.reason_phrase,
            "Received File upload for unsupported file transfer protocol",
        )

    def test_head(self):
        client = Client()

        resource_id = self.do_post(client)

        response = client.head(f"/upload/{resource_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Upload-Offset"], "0")
        self.assertEqual(response["Upload-Length"], "0")

    def test_head_with_unknown_resource_id(self):
        response = Client().head("/upload/unknown")
        self.assertEqual(response.status_code, 404)

    @override_settings(FILE_FORM_CHECK_PERMISSIONS="django_file_form_example.tests.test_views.custom_check_permissions")
    def test_custom_permissions(self):
        response = Client().post("/upload/", HTTP_TUS_RESUMABLE=True)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            dict(message=None, status='permission denied')
        )

    @override_settings(
        FILE_FORM_CHECK_PERMISSIONS="django_file_form_example.tests.test_views.custom_check_permissions_with_message"
    )
    def test_custom_permissions_with_custom_message(self):
        response = Client().post("/upload/", HTTP_TUS_RESUMABLE=True)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            dict(message='test message1', status='permission denied')
        )

    def do_post(self, client):
        response = client.post("/upload/", HTTP_TUS_RESUMABLE=True)
        self.assertEqual(response.status_code, 201)

        re_url_upload_resource = re.compile(r"/upload/(.*)")

        self.assertRegex(response["Location"], re_url_upload_resource)

        return re_url_upload_resource.match(response["Location"]).group(1)
