import json

from django.core.files.base import ContentFile
from django.forms import Form
from django.forms.widgets import FILE_INPUT_CONTRADICTION
from django.test import TestCase
from django.utils.datastructures import MultiValueDict

from django_file_form.fields import MultipleUploadedFileField, UploadedFileField
from django_file_form.forms import FileFormMixin
from django_file_form.models import TemporaryUploadedFile
from django_file_form.uploaded_file import PlaceholderUploadedFile, UploadedTusFile
from django_file_form_example.tests.utils.test_utils import (
    get_random_id,
    read_file,
    remove_test_files,
)


class TestForm(FileFormMixin, Form):
    main_notebook = UploadedFileField(required=False)
    attachments = MultipleUploadedFileField(required=False)


class FormTests(TestCase):
    def test_empty_form(self):
        form = TestForm(
            data={
                "main_notebook": None,
                "attachments": [],
            }
        )

        self.assertTrue(form.is_valid())

    def test_upload_notebook(self):
        uploaded_tus_file = UploadedTusFile(
            file=ContentFile("xyz", "test.txt"), file_id="111"
        )
        files = {"main_notebook": uploaded_tus_file}

        form = TestForm(data={}, files=files)

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["main_notebook"].name, "test.txt")

    def test_upload_attachments(self):
        uploaded_tus_file1 = UploadedTusFile(
            file=ContentFile("abc", "test1.txt"), file_id="112"
        )
        uploaded_tus_file2 = UploadedTusFile(
            file=ContentFile("def", "test2.txt"), file_id="113"
        )
        files = {"attachments": [uploaded_tus_file1, uploaded_tus_file2]}

        form = TestForm(data={}, files=files)

        self.assertTrue(form.is_valid())

        self.assertSetEqual(
            {file.name for file in form.cleaned_data["attachments"]},
            {"test2.txt", "test1.txt"},
        )

    def test_placeholder(self):
        placeholder_uploaded_file = PlaceholderUploadedFile(
            name="placeholder1.txt", size=100
        )
        initial = {"attachments": [placeholder_uploaded_file]}

        form = TestForm(data={}, files={}, initial=initial)

        self.assertTrue(form.is_valid())
        self.assertEqual(
            [file.name for file in form.cleaned_data["attachments"]],
            ["placeholder1.txt"],
        )


class S3TestForm(TestForm):
    s3_upload_dir = "s3_dir"


def create_temporary_uploaded_file(form_id, field_name, filename, content):
    return TemporaryUploadedFile.objects.create(
        file_id=get_random_id(),
        form_id=form_id,
        field_name=field_name,
        original_filename=filename,
        uploaded_file=ContentFile(content, get_random_id()),
    )


def existing_uploads(*names):
    return json.dumps([{"type": "existing", "name": name, "size": 3} for name in names])


class FileFormMixinTests(TestCase):
    def tearDown(self) -> None:
        try:
            remove_test_files()
        finally:
            super().tearDown()

    def test_hidden_fields(self):
        form = TestForm()

        self.assertEqual(form.fields["upload_url"].initial, "/upload/")
        self.assertNotIn("s3_upload_dir", form.fields)
        self.assertTrue(form.fields["form_id"].initial)
        self.assertEqual(form.fields["main_notebook-uploads"].initial, "[]")
        self.assertEqual(form.fields["attachments-uploads"].initial, "[]")

    def test_s3_upload_dir_on_class(self):
        form = S3TestForm()

        self.assertEqual(form.fields["upload_url"].initial, "/s3upload/")
        self.assertEqual(form.fields["s3_upload_dir"].initial, "s3_dir")

    def test_s3_upload_dir_argument(self):
        form = S3TestForm(s3_upload_dir="other_dir")

        self.assertEqual(form.fields["upload_url"].initial, "/s3upload/")
        self.assertEqual(form.fields["s3_upload_dir"].initial, "other_dir")

    def test_temporary_uploads(self):
        form_id = get_random_id()
        create_temporary_uploaded_file(form_id, "main_notebook", "notebook.txt", b"abc")
        create_temporary_uploaded_file(form_id, "attachments", "a1.txt", b"def")
        create_temporary_uploaded_file(form_id, "attachments", "a2.txt", b"ghi")
        # Other forms and fields are ignored
        create_temporary_uploaded_file(get_random_id(), "attachments", "x.txt", b"x")
        create_temporary_uploaded_file(form_id, "other_field", "y.txt", b"y")

        form = TestForm(data={"form_id": form_id})

        self.assertTrue(form.is_valid())
        notebook = form.cleaned_data["main_notebook"]
        self.assertIsInstance(notebook, UploadedTusFile)
        self.assertEqual(notebook.name, "notebook.txt")
        self.assertEqual(read_file(notebook), b"abc")
        self.assertCountEqual(
            [(f.name, read_file(f)) for f in form.cleaned_data["attachments"]],
            [("a1.txt", b"def"), ("a2.txt", b"ghi")],
        )

    def test_temporary_uploads_with_latest_file_for_single_field(self):
        form_id = get_random_id()
        create_temporary_uploaded_file(form_id, "main_notebook", "first.txt", b"abc")
        create_temporary_uploaded_file(form_id, "main_notebook", "second.txt", b"def")

        form = TestForm(data={"form_id": form_id})

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["main_notebook"].name, "second.txt")

    def test_temporary_uploads_with_files_dict(self):
        # django-formtools passes a dict instead of a MultiValueDict
        form_id = get_random_id()
        create_temporary_uploaded_file(form_id, "main_notebook", "notebook.txt", b"abc")
        create_temporary_uploaded_file(form_id, "attachments", "a1.txt", b"def")
        create_temporary_uploaded_file(form_id, "attachments", "a2.txt", b"ghi")

        files = {}
        form = TestForm(data={"form_id": form_id}, files=files)

        self.assertIsInstance(files["attachments"], list)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["main_notebook"].name, "notebook.txt")
        self.assertCountEqual(
            [f.name for f in form.cleaned_data["attachments"]], ["a1.txt", "a2.txt"]
        )

    def test_temporary_uploads_with_files_multi_value_dict(self):
        form_id = get_random_id()
        create_temporary_uploaded_file(form_id, "attachments", "a1.txt", b"def")
        create_temporary_uploaded_file(form_id, "attachments", "a2.txt", b"ghi")

        files = MultiValueDict()
        TestForm(data={"form_id": form_id}, files=files)

        self.assertCountEqual(
            [f.name for f in files.getlist("attachments")], ["a1.txt", "a2.txt"]
        )

    def test_without_temporary_uploads(self):
        form = TestForm(data={"form_id": get_random_id()})

        self.assertEqual(dict(form.files), {})
        self.assertTrue(form.is_valid())
        # Without upload data the single file widget returns False ("no file")
        self.assertIs(form.cleaned_data["main_notebook"], False)
        self.assertIsNone(form.cleaned_data["attachments"])

    def test_temporary_uploads_with_prefix(self):
        form_id = get_random_id()
        create_temporary_uploaded_file(
            form_id, "form1-main_notebook", "notebook.txt", b"abc"
        )

        form = TestForm(data={"form1-form_id": form_id}, prefix="form1")

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["main_notebook"].name, "notebook.txt")

    def test_delete_temporary_files(self):
        form_id = get_random_id()
        create_temporary_uploaded_file(form_id, "main_notebook", "notebook.txt", b"abc")
        create_temporary_uploaded_file(form_id, "attachments", "a1.txt", b"def")
        other = create_temporary_uploaded_file(
            get_random_id(), "attachments", "x.txt", b"x"
        )

        form = TestForm(data={"form_id": form_id})
        form.delete_temporary_files()

        self.assertEqual(list(TemporaryUploadedFile.objects.all()), [other])

    def test_delete_temporary_files_without_form_id(self):
        temporary_uploaded_file = create_temporary_uploaded_file(
            get_random_id(), "attachments", "a1.txt", b"def"
        )

        TestForm(data={}).delete_temporary_files()

        self.assertEqual(
            list(TemporaryUploadedFile.objects.all()), [temporary_uploaded_file]
        )

    def test_keep_existing_file(self):
        initial_file = PlaceholderUploadedFile(name="existing.txt", size=3)

        form = TestForm(
            data={"main_notebook-uploads": existing_uploads("existing.txt")},
            initial={"main_notebook": initial_file},
        )

        self.assertTrue(form.is_valid())
        self.assertIs(form.cleaned_data["main_notebook"], initial_file)

    def test_remove_existing_file(self):
        form = TestForm(
            data={"main_notebook-uploads": "[]"},
            initial={
                "main_notebook": PlaceholderUploadedFile(name="existing.txt", size=3)
            },
        )

        self.assertTrue(form.is_valid())
        self.assertFalse(form.cleaned_data["main_notebook"])

    def test_keep_some_existing_files(self):
        file1 = PlaceholderUploadedFile(name="existing1.txt", size=3)
        file2 = PlaceholderUploadedFile(name="existing2.txt", size=3)

        form = TestForm(
            data={"attachments-uploads": existing_uploads("existing2.txt")},
            initial={"attachments": [file1, file2]},
        )

        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data["attachments"], [file2])

    def test_placeholder_upload_for_single_field(self):
        form = TestForm(
            data={
                "main_notebook-uploads": json.dumps(
                    [
                        {
                            "type": "placeholder",
                            "id": "id1",
                            "name": "placeholder1.txt",
                            "size": 3,
                        }
                    ]
                )
            }
        )

        self.assertTrue(form.is_valid())
        notebook = form.cleaned_data["main_notebook"]
        self.assertIsInstance(notebook, PlaceholderUploadedFile)
        self.assertEqual(notebook.name, "placeholder1.txt")

    def test_upload_data_and_metadata_from_initial(self):
        form = TestForm(
            initial={
                "main_notebook": PlaceholderUploadedFile(
                    name="placeholder1.txt",
                    file_id="id1",
                    size=3,
                    metadata={"description": "abc"},
                )
            }
        )

        self.assertEqual(
            json.loads(form.fields["main_notebook-uploads"].initial),
            [
                {
                    "id": "id1",
                    "name": "placeholder1.txt",
                    "size": 3,
                    "type": "placeholder",
                }
            ],
        )
        self.assertEqual(
            json.loads(form.fields["main_notebook-metadata"].initial),
            {"placeholder1.txt": {"description": "abc"}},
        )


class FieldTests(TestCase):
    def test_accept(self):
        form = Form()
        form.fields["f"] = UploadedFileField(accept="image/*")
        form.fields["m"] = MultipleUploadedFileField(accept=".pdf")

        self.assertEqual(form.fields["f"].widget.attrs, {"accept": "image/*"})
        self.assertEqual(
            form.fields["m"].widget.attrs, {"accept": ".pdf", "multiple": "multiple"}
        )
        self.assertEqual(UploadedFileField().widget.attrs, {})

    def test_bound_data(self):
        field = UploadedFileField()

        self.assertEqual(field.bound_data("new", "initial"), "new")
        self.assertEqual(field.bound_data(None, "initial"), "initial")
        self.assertEqual(
            field.bound_data(FILE_INPUT_CONTRADICTION, "initial"), "initial"
        )

    def test_multiple_bound_data(self):
        field = MultipleUploadedFileField()

        self.assertEqual(field.bound_data(None, None), [])
        self.assertEqual(field.bound_data(["new"], None), ["new"])
        self.assertEqual(field.bound_data(None, "initial"), ["initial"])
        self.assertEqual(
            field.bound_data(["new1", "new2"], ["initial"]),
            ["initial", "new1", "new2"],
        )

    def test_multiple_to_python(self):
        field = MultipleUploadedFileField()
        file = UploadedTusFile(file=ContentFile("abc", "test.txt"), file_id="1")

        self.assertIsNone(field.to_python(None))
        self.assertIsNone(field.to_python([]))
        self.assertEqual(field.to_python([file]), [file])
        self.assertEqual(field.to_python(file), [file])
