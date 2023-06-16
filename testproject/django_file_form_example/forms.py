import os

from django.core.exceptions import ValidationError
from django.forms import (
    formset_factory,
    BaseFormSet,
    Form,
    CharField,
    ModelForm,
    modelformset_factory,
)

from django_file_form.forms import (
    UploadedFileField,
    MultipleUploadedFileField,
    FileFormMixin,
)

from .models import Example, Example2, ExampleFile


class BaseForm(FileFormMixin, Form):
    title = CharField(required=False)

    def clean(self):
        cleaned_data = super().clean()

        if not cleaned_data["title"]:
            raise ValidationError("Title field is required")

        return cleaned_data


class ExampleForm(BaseForm):
    prefix = "example"
    input_file = UploadedFileField()

    def save(self):
        input_file = self.cleaned_data["input_file"]

        try:
            Example.objects.create(
                title=self.cleaned_data["title"], input_file=input_file
            )
        finally:
            input_file.close()

        self.delete_temporary_files()


class ExampleBaseFormSet(BaseFormSet):
    def save(self):
        for form in self.forms:
            form.save()


ExampleFormSet = formset_factory(ExampleForm, extra=2, formset=ExampleBaseFormSet)


class MultipleFileExampleForm(BaseForm):
    prefix = "example"
    input_file = MultipleUploadedFileField()

    def save(self):
        example = Example2.objects.create(title=self.cleaned_data["title"])

        for f in self.cleaned_data["input_file"]:
            try:
                ExampleFile.objects.create(example=example, input_file=f)
            finally:
                f.close()

        self.delete_temporary_files()


class S3SingleExampleForm(BaseForm):
    prefix = "example"
    input_file = UploadedFileField()
    s3_upload_dir = "s3_example"

    def save(self):
        input_file = self.cleaned_data["input_file"]
        try:
            assert input_file.is_s3direct
            filename = os.path.splitext(input_file.original_name)[0]

            example = Example(title=self.cleaned_data["title"])
            example.input_file.save(filename, input_file)
        finally:
            input_file.close()

        self.delete_temporary_files()


class S3MultipleExampleForm(BaseForm):
    prefix = "example"
    input_file = MultipleUploadedFileField()
    s3_upload_dir = "s3_example"

    def save(self):
        example = Example2.objects.create(title=self.cleaned_data["title"])
        for f in self.cleaned_data["input_file"]:
            try:
                assert f.is_s3direct

                # FILE_FORM_UPLOAD_DIR/s3_upload_dir/basename_RANDOM.ext
                basename = os.path.splitext(os.path.basename(f.name))[0]

                # basename.ext
                original_basename = os.path.splitext(f.original_name)[0]
                assert basename.startswith(original_basename)

                # download from S3
                example_file = ExampleFile(example=example)
                example_file.input_file.save(original_basename, f)
                example_file.save()
            finally:
                f.close()


class WizardStepForm(Form):
    name = CharField(required=False)


class PlaceholderExampleForm(BaseForm):
    prefix = "example"
    input_file = MultipleUploadedFileField()
    other_input_file = UploadedFileField()

    def save(self):
        example = Example2.objects.create(title=self.cleaned_data["title"])

        for f in self.cleaned_data["input_file"]:
            if f.is_placeholder:
                continue

            try:
                ExampleFile.objects.create(example=example, input_file=f)
            finally:
                f.close()

        self.delete_temporary_files()


class PlaceholderS3ExampleForm(BaseForm):
    prefix = "example"
    input_file = MultipleUploadedFileField()
    other_input_file = UploadedFileField()
    s3_upload_dir = "s3_placeholder_example"

    def save(self):
        self.delete_temporary_files()


class PlaceholderWidgetExampleForm(PlaceholderExampleForm):
    def save(self):
        Example2.objects.create(title=self.cleaned_data["title"])

        for f in self.cleaned_data["input_file"]:
            assert f.metadata is not None

        self.delete_temporary_files()


class WithAcceptExampleForm(BaseForm):
    prefix = "example"
    input_file = MultipleUploadedFileField(accept="image/*")


class ExampleModelForm(FileFormMixin, ModelForm):
    class Meta:
        model = Example
        fields = ("title", "input_file")
        field_classes = dict(
            input_file=UploadedFileField,
        )

    prefix = "example"


class ExampleMultipleModelForm(FileFormMixin, ModelForm):
    class Meta:
        model = Example2
        fields = ("title",)

    input_file = MultipleUploadedFileField()
    prefix = "example"


class ExampleMultipleModelS3Form(FileFormMixin, ModelForm):
    class Meta:
        model = Example2
        fields = ("title",)

    input_file = MultipleUploadedFileField()
    prefix = "example"
    s3_upload_dir = "s3_example"

    def save(self, commit=True):
        example = Example2.objects.create(title=self.cleaned_data["title"])

        for f in self.cleaned_data["input_file"]:
            try:
                ExampleFile.objects.create(example=example, input_file=f)
            finally:
                f.close()

        self.delete_temporary_files()


ExampleMultipleModelS3FormSet = modelformset_factory(
    model=Example2,
    form=ExampleMultipleModelS3Form,
    extra=2,
)


class DisabledExampleForm(ExampleForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["input_file"].disabled = True
