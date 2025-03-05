import json
from django.forms import ClearableFileInput
from django.utils.translation import gettext as _


TRANSLATIONS = {
    "Cancel": _("Cancel"),
    "Delete": _("Delete"),
    "Delete failed": _("Delete failed"),
    "Upload failed": _("Upload failed"),
    "Drop your files here": _("Drop your files here"),
    "Invalid file type": _("Invalid file type. Try again"),
}


class BaseUploadWidget(ClearableFileInput):
    template_name = "django_file_form/upload_widget.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)

        context["translations"] = json.dumps(TRANSLATIONS)

        return context
