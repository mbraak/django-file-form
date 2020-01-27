import json

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.views import generic
from django.urls import reverse
from formtools.wizard.views import SessionWizardView

from . import forms


class BaseFormView(generic.FormView):
    template_name = 'example_form.html'
    use_ajax = True
    custom_js_file = 'example_form.js'

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(BaseFormView, self).form_valid(form)

    def get_context_data(self, **kwargs):
        kwargs['use_ajax'] = self.use_ajax
        kwargs['custom_js_file'] = self.custom_js_file

        return super(BaseFormView, self).get_context_data(**kwargs)


class ExampleView(BaseFormView):
    form_class = forms.ExampleForm


class WithoutJsExampleView(ExampleView):
    use_ajax = False


class ExampleSuccessView(generic.TemplateView):
    template_name = 'success.html'


class MultipleExampleView(BaseFormView):
    form_class = forms.MultipleFileExampleForm


class MultipleWithoutJsExampleView(MultipleExampleView):
    use_ajax = False


class WizardExampleview(SessionWizardView):
    form_list = [forms.MultipleFileExampleForm, forms.WizardStepForm]
    file_storage = FileSystemStorage(location=settings.FILE_FORM_UPLOAD_DIR)
    template_name = 'wizard.html'

    def done(self, form_list, **kwargs):
        return HttpResponseRedirect('/wizard')


class FormSetExampleView(BaseFormView):
    form_class = forms.ExampleFormSet
    custom_js_file = 'example_form_set.js'


def permission_denied(request, exception):
    return HttpResponseForbidden(
        json.dumps(dict(status='permission denied')),
        content_type='application/json'
    )
