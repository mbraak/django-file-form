from django.core.urlresolvers import reverse
from django.views import generic

from . import forms


class ExampleView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(ExampleView, self).form_valid(form)


class ExampleSuccessView(generic.TemplateView):
    template_name = 'success.html'


class MultipleExampleView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.MultipleFileExampleForm

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(MultipleExampleView, self).form_valid(form)