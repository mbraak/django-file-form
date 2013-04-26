from django.core.urlresolvers import reverse
from django.views import generic

import forms


class ExampleFormView(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.ExampleForm

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(ExampleFormView, self).form_valid(form)


class ExampleSuccess(generic.TemplateView):
    template_name = 'success.html'


class MultipleExampleForm(generic.FormView):
    template_name = 'example_form.html'
    form_class = forms.MultipleFileExampleForm

    def get_success_url(self):
        return reverse('example_success')

    def form_valid(self, form):
        form.save()
        return super(MultipleExampleForm, self).form_valid(form)