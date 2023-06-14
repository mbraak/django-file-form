import re

from django.test import TestCase, Client

from django_file_form_example.tests.utils.test_utils import remove_test_files


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

    def do_post(self, client):
        response = client.post("/upload/", HTTP_TUS_RESUMABLE=True)
        self.assertEqual(response.status_code, 201)

        re_url_upload_resource = re.compile(r"/upload/(.*)")

        self.assertRegex(response["Location"], re_url_upload_resource)

        return re_url_upload_resource.match(response["Location"]).group(1)
