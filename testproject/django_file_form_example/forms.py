from django import forms
from django.core.urlresolvers import reverse

from django_pony_forms.pony_forms import PonyFormMixin

from django_file_form.forms import UploadedFileField, MultipleUploadedFileField, FileFormMixin

from .models import Example, Example2, ExampleFile


class BaseForm(PonyFormMixin, FileFormMixin, forms.Form):
    title = forms.CharField()


class ExampleForm(BaseForm):
    input_file = UploadedFileField()

    def save(self):
        Example.objects.create(
            title=self.cleaned_data['title'],
            input_file=self.cleaned_data['input_file']
        )
        self.delete_temporary_files()


class MultipleFileExampleForm(BaseForm):
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


class ExistingFileForm(ExampleForm):
    def get_upload_url(self):
        return reverse('example_handle_upload')
