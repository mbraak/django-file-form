from pathlib import Path

from django.views import generic
from django.urls import reverse

from django_file_form.forms import ExistingFile
from django_file_form.uploader import FileFormUploader

from . import forms
from .models import Example


class BaseFormView(generic.FormView):
    template_name = 'example_form.html'

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(BaseFormView, self).form_valid(form)


class ExampleView(BaseFormView):
    form_class = forms.ExampleForm


class ExampleSuccessView(generic.TemplateView):
    template_name = 'success.html'


class MultipleExampleView(BaseFormView):
    form_class = forms.MultipleFileExampleForm


class ExistingFileExampleView(BaseFormView):
    form_class = forms.ExistingFileForm

    def get_form_kwargs(self):
        form_kwargs = super(ExistingFileExampleView, self).get_form_kwargs()

        example = Example.objects.get(id=self.kwargs['id'])

        if example.input_file:
            name = Path(example.input_file.name).name
            form_kwargs['initial'] = dict(
                input_file=ExistingFile(name)
            )

        return form_kwargs


handle_upload = FileFormUploader()
