from django import forms

from django_pony_forms.pony_forms import BootstrapFormMixin

from django_file_form.forms import UploadedFileField, MultipleUploadedFileField, FileFormMixin

from .models import Example, Example2, ExampleFile


class ExampleForm(BootstrapFormMixin, FileFormMixin, forms.Form):
    title = forms.CharField()
    input_file = UploadedFileField()

    def save(self):
        Example.objects.create(
            title=self.cleaned_data['title'],
            input_file=self.cleaned_data['input_file']
        )


class MultipleFileExampleForm(BootstrapFormMixin, FileFormMixin, forms.Form):
    title = forms.CharField()
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