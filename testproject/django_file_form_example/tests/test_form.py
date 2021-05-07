from django.core.files.base import ContentFile
from django.forms import Form
from django.test import TestCase

from django_file_form.fields import UploadedFileField, MultipleUploadedFileField
from django_file_form.forms import FileFormMixin
from django_file_form.uploaded_file import UploadedTusFile, PlaceholderUploadedFile


class TestForm(FileFormMixin, Form):
    main_notebook = UploadedFileField(required=False)
    attachments = MultipleUploadedFileField(required=False)


class FormTests(TestCase):
    def test_empty_form(self):
        form = TestForm(
            data=dict(
                main_notebook=None,
                attachments=[],
            )
        )

        self.assertTrue(form.is_valid())

    def test_upload_notebook(self):
        uploaded_tus_file = UploadedTusFile(
            file=ContentFile("xyz", "test.txt"), file_id="111"
        )
        files = dict(main_notebook=uploaded_tus_file)

        form = TestForm(data=dict(), files=files)

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["main_notebook"].name, "test.txt")

    def test_upload_attachments(self):
        uploaded_tus_file1 = UploadedTusFile(
            file=ContentFile("abc", "test1.txt"), file_id="112"
        )
        uploaded_tus_file2 = UploadedTusFile(
            file=ContentFile("def", "test2.txt"), file_id="113"
        )
        files = dict(attachments=[uploaded_tus_file1, uploaded_tus_file2])

        form = TestForm(data=dict(), files=files)

        self.assertTrue(form.is_valid())

        self.assertSetEqual(
            {file.name for file in form.cleaned_data["attachments"]},
            {"test2.txt", "test1.txt"},
        )

    def test_placeholder(self):
        placeholder_uploaded_file = PlaceholderUploadedFile(
            name="placeholder1.txt", size=100
        )
        initial = dict(attachments=[placeholder_uploaded_file])

        form = TestForm(data=dict(), files=dict(), initial=initial)

        self.assertTrue(form.is_valid())
        self.assertEqual(
            [file.name for file in form.cleaned_data["attachments"]],
            ["placeholder1.txt"],
        )
