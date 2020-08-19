import os

from django.core.exceptions import ValidationError
from django.forms import formset_factory, BaseFormSet, Form, CharField

from django_file_form.forms import UploadedFileField, MultipleUploadedFileField, FileFormMixin

from .models import Example, Example2, ExampleFile


class BaseForm(FileFormMixin, Form):
    title = CharField(required=False)

    def clean(self):
        cleaned_data = super(BaseForm, self).clean()

        if not cleaned_data['title']:
            raise ValidationError('Title field is required')

        return cleaned_data


class ExampleForm(BaseForm):
    prefix = 'example'
    input_file = UploadedFileField()

    def save(self):
        input_file = self.cleaned_data['input_file']

        Example.objects.create(
            title=self.cleaned_data['title'],
            input_file=input_file
        )

        input_file.close()

        self.delete_temporary_files()


class ExampleBaseFormSet(BaseFormSet):
    def save(self):
        for form in self.forms:
            form.save()


ExampleFormSet = formset_factory(ExampleForm, extra=2, formset=ExampleBaseFormSet)


class MultipleFileExampleForm(BaseForm):
    prefix = 'example'
    input_file = MultipleUploadedFileField()

    def save(self):
        example = Example2.objects.create(
            title=self.cleaned_data['title']
        )

        for f in self.cleaned_data['input_file']:
            ExampleFile.objects.create(
                example=example,
                input_file=f
            )
            f.close()

        self.delete_temporary_files()


class S3ExampleForm(BaseForm):
    prefix = 'example'
    input_file = MultipleUploadedFileField()

    def save(self):
        example = Example2.objects.create(
            title=self.cleaned_data['title']
        )
        for f in self.cleaned_data['input_file']:
            assert f.is_s3direct
            # FILE_FORM_UPLOAD_DIR/s3_upload_dir/basename_RANDOM.ext
            basename = os.path.splitext(os.path.basename(f.name))[0]
            # basename.ext
            original_basename = os.path.splitext(f.original_name)[0]
            assert basename.startswith(original_basename)
            # download from S3
            ExampleFile.objects.create(
                example=example,
                input_file=f
            )
            f.close()

class WizardStepForm(Form):
    name = CharField(required=False)


class PlaceholderExampleForm(BaseForm):
    prefix = 'example'
    input_file = MultipleUploadedFileField()
    other_input_file = UploadedFileField()

    def save(self):
        example = Example2.objects.create(
            title=self.cleaned_data['title']
        )

        for f in self.cleaned_data['input_file']:
            if f.is_placeholder:
                continue

            ExampleFile.objects.create(
                example=example,
                input_file=f
            )
            f.close()

        self.delete_temporary_files()


class WithAcceptExampleForm(BaseForm):
    prefix = 'example'
    input_file = MultipleUploadedFileField(accept='image/*')
