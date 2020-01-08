import json

from django.http import HttpResponseForbidden
from django.views import generic
from django.urls import reverse

from . import forms


class BaseFormView(generic.FormView):
    template_name = 'example_form.html'
    use_ajax = True

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(BaseFormView, self).form_valid(form)

    def get_context_data(self, **kwargs):
        kwargs['use_ajax'] = self.use_ajax

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


def permission_denied(request, exception):
    return HttpResponseForbidden(
        json.dumps(dict(status='permission denied')),
        content_type='application/json'
    )
