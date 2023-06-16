import os

from django.core.files.storage import FileSystemStorage
from django.db.models.fields.files import FieldFile
from django.http import HttpResponseRedirect
from django.views import generic
from django.urls import reverse
from django.conf import settings
from django.views.generic.base import ContextMixin
from formtools.wizard.views import SessionWizardView

from django_file_form.type_util import with_typehint
from django_file_form.django_util import get_upload_path
from django_file_form.uploaded_file import PlaceholderUploadedFile

from . import forms
from .models import Example, Example2, ExampleFile


def file_form_js():
    if getattr(settings, "DJANGO_FILE_FORM_COVERAGE_JS", False):
        return "file_form/file_form.coverage.js"
    else:
        return "file_form/file_form.min.js"  # pragma: no cover


class BaseFormView(generic.FormView):
    use_ajax = True
    custom_js_files = ["example_form.js"]
    template_name = "example_form.html"

    def get_success_url(self):
        return reverse("example_success")

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        kwargs["custom_js_files"] = self.custom_js_files
        kwargs["file_form_js"] = file_form_js()
        kwargs["use_ajax"] = self.use_ajax

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
        initial = super().get_initial()

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


class S3SingleExampleView(BaseFormView):
    form_class = forms.S3SingleExampleForm


class S3MultipleExampleView(BaseFormView):
    form_class = forms.S3MultipleExampleForm


class S3PlaceholderExampleView(PlaceholderView):
    form_class = forms.PlaceholderS3ExampleForm


class WithAcceptExample(BaseFormView):
    form_class = forms.WithAcceptExampleForm


class WithCustomWidgetExample(PlaceholderView):
    custom_js_files = ["eventemitter3.js", "example_form_custom_widget.js"]
    form_class = forms.PlaceholderWidgetExampleForm

    def get_initial(self):
        initial = super().get_initial()

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


class FileModelFormMixin(with_typehint(ContextMixin)):
    template_name = "example_form.html"
    form_class = forms.ExampleModelForm
    model = Example

    def get_context_data(self, **kwargs):
        kwargs["custom_js_files"] = ["example_form.js"]
        kwargs["file_form_js"] = file_form_js()
        kwargs["use_ajax"] = True

        return super().get_context_data(**kwargs)

    def get_success_url(self):
        return reverse("example_success")


class CreateModelFormView(FileModelFormMixin, generic.CreateView):
    pass


class EditModelFormView(FileModelFormMixin, generic.UpdateView):
    def form_valid(self, form):
        initial_input_file = form.initial["input_file"]
        initial_input_file_path = (
            initial_input_file.path
            if isinstance(initial_input_file, FieldFile)
            else None
        )

        form.save()

        input_file = form.cleaned_data["input_file"]

        if initial_input_file_path and not isinstance(input_file, FieldFile):
            os.unlink(initial_input_file_path)

        return HttpResponseRedirect(self.get_success_url())


class FileModelFormMultipleMixin(FileModelFormMixin):
    form_class = forms.ExampleMultipleModelForm
    model = Example2

    def form_valid(self, form):
        instance = form.save()

        # remove deleted files
        not_deleted_original_filenames = {
            f.name for f in form.cleaned_data["input_file"] if isinstance(f, FieldFile)
        }

        for example_file in instance.files.all():
            if example_file.input_file not in not_deleted_original_filenames:
                example_file.input_file.delete()
                example_file.delete()

        # create new files
        for f in form.cleaned_data["input_file"]:
            if not isinstance(f, FieldFile):
                try:
                    ExampleFile.objects.create(example=instance, input_file=f)
                finally:
                    f.close()

        form.delete_temporary_files()

        return HttpResponseRedirect(reverse("example_success"))


class CreateModelFormMultipleView(FileModelFormMultipleMixin, generic.CreateView):
    pass


class EditModelFormMultipleView(FileModelFormMultipleMixin, generic.UpdateView):
    def get_initial(self):
        initial = super().get_initial()

        initial["input_file"] = [
            example_file.input_file for example_file in self.object.files.all()
        ]
        return initial


class CreateModelFormMultipleS3View(FileModelFormMultipleMixin, generic.CreateView):
    form_class = forms.ExampleMultipleModelS3Form


class ModelFormMultipleS3SetView(BaseFormView):
    form_class = forms.ExampleMultipleModelS3FormSet
    template_name = "form_set.html"


class DisabledExampleView(ExampleView):
    form_class = forms.DisabledExampleForm
