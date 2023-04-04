from django.forms import FileField
from django.forms.widgets import FILE_INPUT_CONTRADICTION
from django.core import validators

from .widgets import UploadWidget, UploadMultipleWidget
from .models import TemporaryUploadedFile
from .util import get_list


class UploadedFileField(FileField):
    widget = UploadWidget

    def __init__(self, *, accept=None, **kwargs):
        self.accept = accept

        super().__init__(**kwargs)

    # override

    def widget_attrs(self, widget):
        if self.accept:
            return dict(accept=self.accept)
        else:
            return dict()

    # new methods

    def delete_file_data(self, field_name, form_id):
        for f in TemporaryUploadedFile.objects.for_field_and_form(field_name, form_id):
            f.delete()

    def get_file_data(self, field_name, form_id):
        try:
            return (
                TemporaryUploadedFile.objects.for_field_and_form(field_name, form_id)
                .latest("created")
                .get_uploaded_file()
            )
        except TemporaryUploadedFile.DoesNotExist:
            return None
    def bound_data(self, data, initial):
        if data in (None, FILE_INPUT_CONTRADICTION):
            return initial
        return data


class MultipleUploadedFileField(UploadedFileField):
    widget = UploadMultipleWidget

    # override

    # These overrides are necessary to support multiple files. The FileField from Django doesn't support multiple files.

    def bound_data(self, data, initial):
        result = []

        if initial:
            result += get_list(initial)

        if data:
            result += get_list(data)

        return result

    def clean(self, data, initial=None):
        # Parameters:
        # * data: new data
        # * initial: initial data
        #
        # The original behaviour is to return either the new data or the initial data.
        # The new behaviour is to return the new data plus the initial data.
        return super().clean((data or []) + (initial or []))

    def to_python(self, data):
        if data in validators.EMPTY_VALUES:
            return None
        elif isinstance(data, list):
            return [super(MultipleUploadedFileField, self).to_python(f) for f in data]
        else:
            return [data]

    def widget_attrs(self, widget):
        attrs = super().widget_attrs(widget)

        attrs["multiple"] = "multiple"
        return attrs

    # new methods

    def get_file_data(self, field_name, form_id):
        temporary_uploaded_files = TemporaryUploadedFile.objects.for_field_and_form(
            field_name, form_id
        )

        return [f.get_uploaded_file() for f in temporary_uploaded_files]
