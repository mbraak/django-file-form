import re

from django.test import TestCase, Client


class ModelTests(TestCase):
    def test_head(self):
        client = Client()

        resource_id = self.do_post(client)

        response = client.head(f"/upload/{resource_id}")
        self.assertEqual(response.status_code, 200)

    def do_post(self, client):
        response = client.post('/upload/', HTTP_TUS_RESUMABLE=True)
        self.assertEqual(response.status_code, 201)

        re_url_upload_resource = re.compile(r'http://testserver/upload/(.*)')

        self.assertRegex(response['Location'], re_url_upload_resource)

        return re_url_upload_resource.match(response['Location']).group(1)
