import json

from django.core.files.storage import FileSystemStorage
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.views import generic
from django.urls import reverse
from django.conf import settings
from formtools.wizard.views import SessionWizardView
from django_file_form.util import get_upload_path
from django_file_form.models import PlaceholderUploadedFile

from . import forms


def file_form_js():
    if settings.DJANGO_FILE_FORM_COVERAGE_JS:
        return "file_form/file_form.coverage.js"
    else:
        return "file_form/file_form.js"


class BaseFormView(generic.FormView):
    template_name = "example_form.html"
    use_ajax = True
    custom_js_file = "example_form.js"

    def get_form_kwargs(self):
        # pass s3_upload_dir from view to form
        kwargs = super(BaseFormView, self).get_form_kwargs()
        if hasattr(self, "s3_upload_dir"):
            kwargs.update({"s3_upload_dir": self.s3_upload_dir})
        return kwargs

    def get_success_url(self):
        return reverse("example_success")

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        kwargs["use_ajax"] = self.use_ajax
        kwargs["custom_js_file"] = self.custom_js_file
        kwargs["file_form_js"] = file_form_js()
        return super().get_context_data(**kwargs)


class ExampleView(BaseFormView):
    form_class = forms.ExampleForm


class WithoutJsExampleView(ExampleView):
    use_ajax = False


class ExampleSuccessView(generic.TemplateView):
    template_name = "success.html"


class MultipleExampleView(BaseFormView):
    form_class = forms.MultipleFileExampleForm


class MultipleWithoutJsExampleView(MultipleExampleView):
    use_ajax = False


class WizardExampleview(SessionWizardView):
    form_list = [forms.MultipleFileExampleForm, forms.WizardStepForm]
    file_storage = FileSystemStorage(location=get_upload_path())
    template_name = "wizard.html"

    def done(self, form_list, **kwargs):
        return HttpResponseRedirect("/wizard")

    def get_context_data(self, **kwargs):
        kwargs["file_form_js"] = file_form_js()
        return super().get_context_data(**kwargs)


class FormSetExampleView(BaseFormView):
    form_class = forms.ExampleFormSet
    template_name = "form_set.html"


class PlaceholderView(BaseFormView):
    form_class = forms.PlaceholderExampleForm
    template_name = "placeholder_form.html"

    def get_initial(self):
        initial = super(PlaceholderView, self).get_initial()

        if self.request.method == "GET":
            initial["input_file"] = [
                PlaceholderUploadedFile("test_placeholder1.txt", size=1024),
                PlaceholderUploadedFile("test_placeholder2.txt", size=2048),
            ]
            initial["other_input_file"] = PlaceholderUploadedFile(
                "test_placeholder3.txt", size=512
            )

        return initial

    def form_valid(self, form):
        form.save()

        other_input_file_value = form["other_input_file"].value()

        return self.render_to_response(
            self.get_context_data(
                finished=True,
                input_files=[f.name for f in form["input_file"].value()],
                other_input_file=other_input_file_value.name
                if other_input_file_value
                else "",
            )
        )


class S3ExampleView(BaseFormView):
    form_class = forms.S3ExampleForm


class S3PlaceholderExampleView(PlaceholderView):
    s3_upload_dir = "s3_placeholder_example"


class WithAcceptExample(BaseFormView):
    form_class = forms.WithAcceptExampleForm


class WithCustomWidgetExample(PlaceholderView):
    custom_js_file = "example_form_custom_widget.js"
    form_class = forms.PlaceholderWidgetExampleForm

    def get_initial(self):
        initial = super(WithCustomWidgetExample, self).get_initial()

        if self.request.method == "GET":
            initial["input_file"] = [
                PlaceholderUploadedFile(
                    "test_placeholder1.txt",
                    size=1024,
                    metadata={"description": "placeholder 1"},
                ),
                PlaceholderUploadedFile(
                    "test_placeholder2.txt",
                    size=2048,
                    metadata={"description": "placeholder 2"},
                ),
            ]

        return initial


def permission_denied(request, exception):
    return HttpResponseForbidden(
        json.dumps(dict(status="permission denied")), content_type="application/json"
    )
