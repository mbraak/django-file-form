from django.forms import Form
from django.test import TestCase

from django_file_form.fields import UploadedFileField, MultipleUploadedFileField
from django_file_form.forms import FileFormMixin


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
