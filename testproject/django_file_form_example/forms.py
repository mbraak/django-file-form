from django.core.exceptions import ValidationError
from django.forms import formset_factory

import django_bootstrap3_form

from django_file_form.forms import UploadedFileField, MultipleUploadedFileField, FileFormMixin

from .models import Example, Example2, ExampleFile


class BaseForm(FileFormMixin, django_bootstrap3_form.BootstrapForm):
    title = django_bootstrap3_form.CharField(required=False)

    def clean(self):
        cleaned_data = super(BaseForm, self).clean()

        if not cleaned_data['title']:
            raise ValidationError('Title field is required')

        return cleaned_data


class ExampleForm(BaseForm):
    prefix = 'example'
    input_file = UploadedFileField()

    def save(self):
        Example.objects.create(
            title=self.cleaned_data['title'],
            input_file=self.cleaned_data['input_file']
        )
        self.delete_temporary_files()


ExampleFormSet = formset_factory(ExampleForm, extra=2)


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

        self.delete_temporary_files()
