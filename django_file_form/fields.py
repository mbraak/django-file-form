from django.forms import FileField
from django.core import validators

from .widgets import UploadWidget, UploadMultipleWidget
from .models import TemporaryUploadedFile
from .util import get_list


class UploadedFileField(FileField):
    widget = UploadWidget

    def __init__(self, *, accept=None, **kwargs):
        self.accept = accept

        super().__init__(**kwargs)

    def get_file_data(self, field_name, form_id):
        try:
            return (
                self._get_file_qs(field_name, form_id)
                .latest("created")
                .get_uploaded_file()
            )
        except TemporaryUploadedFile.DoesNotExist:
            return None

    def delete_file_data(self, field_name, form_id):
        qs = self._get_file_qs(field_name, form_id)

        for f in qs:
            f.delete()

    def widget_attrs(self, widget):
        if self.accept:
            return dict(accept=self.accept)
        else:
            return dict()

    def _get_file_qs(self, field_name, form_id):
        return TemporaryUploadedFile.objects.filter(form_id=form_id, field_name=field_name)


class MultipleUploadedFileField(UploadedFileField):
    widget = UploadMultipleWidget

    def widget_attrs(self, widget):
        attrs = super().widget_attrs(widget)

        attrs["multiple"] = "multiple"
        return attrs

    def get_file_data(self, field_name, form_id):
        qs = self._get_file_qs(field_name, form_id)

        return [f.get_uploaded_file() for f in qs]

    def to_python(self, data):
        if data in validators.EMPTY_VALUES:
            return None
        elif isinstance(data, list):
            return [super(MultipleUploadedFileField, self).to_python(f) for f in data]
        else:
            return [data]

    def bound_data(self, data, initial):
        result = []

        if initial:
            result += get_list(initial)

        if data:
            result += get_list(data)

        return result
