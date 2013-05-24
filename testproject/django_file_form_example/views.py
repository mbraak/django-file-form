from path import path

from django.core.urlresolvers import reverse
from django.views import generic
from django.http import HttpResponse

from django_file_form.views import DeleteFile as OriginalDeleteFileView
from django_file_form.forms import ExistingFile

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
            name = path(example.input_file.name).basename()
            form_kwargs['initial'] = dict(
                input_file=ExistingFile(name, example.id)
            )

        return form_kwargs


class DeleteFileView(OriginalDeleteFileView):
    def delete(self, request, file_id):
        try:
            example_id = int(file_id)
            qs = Example.objects.filter(id=example_id)

            if not qs.exists:
                return super(DeleteFileView, self).delete(request, file_id)
            else:
                example = qs.get()
                example.input_file.delete()
                example.save()

                return HttpResponse("ok")
        except ValueError:
            return super(DeleteFileView, self).delete(request, file_id)