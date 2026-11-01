from django.contrib import admin
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.test import TestCase, override_settings

from django_file_form.models import TemporaryUploadedFile
from django_file_form_example.models import Example
from django_file_form_example.tests.utils.test_utils import (
    get_random_id,
    remove_test_files,
)

# The manifest storage needs collectstatic, which unit tests shouldn't depend on
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


@override_settings(STORAGES=STORAGES)
class ModelAdminTests(TestCase):
    def setUp(self):
        super().setUp()

        self.client.force_login(
            User.objects.create_superuser("admin", "admin@example.com", "password")
        )

    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_media(self):
        media = admin.site.get_model_admin(Example).media

        self.assertIn("file_form/file_form.min.js", media._js)
        self.assertIn("file_form/auto_init.js", media._js)
        self.assertEqual(media._css["all"], ["file_form/file_form.css"])

    def test_add_page(self):
        response = self.client.get("/admin/django_file_form_example/example/add/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "file_form/file_form.css")
        self.assertContains(response, "file_form/auto_init.js")
        self.assertContains(response, 'name="form_id"')
        self.assertContains(response, 'name="input_file-uploads"')

    def test_save_model_deletes_temporary_files(self):
        form_id = get_random_id()
        temporary_uploaded_file = TemporaryUploadedFile.objects.create(
            file_id=get_random_id(),
            form_id=form_id,
            field_name="input_file",
            original_filename="test.txt",
            uploaded_file=ContentFile(b"abc", "test.txt"),
        )
        temporary_file_name = temporary_uploaded_file.uploaded_file.name

        response = self.client.post(
            "/admin/django_file_form_example/example/add/",
            {"title": "example1", "form_id": form_id, "input_file-uploads": "[]"},
        )

        self.assertEqual(response.status_code, 302)

        example = Example.objects.get(title="example1")
        self.assertEqual(example.input_file.name, "example/test.txt")
        self.assertEqual(example.input_file.read(), b"abc")
        example.input_file.close()

        self.assertFalse(TemporaryUploadedFile.objects.exists())
        self.assertFalse(
            temporary_uploaded_file.uploaded_file.storage.exists(temporary_file_name)
        )
