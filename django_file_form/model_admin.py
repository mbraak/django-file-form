from django.db import models
from django.forms import ModelForm
from django.contrib import admin

from .fields import UploadedFileField
from .forms import FileFormMixin
from .util import with_typehint
from .widgets import UploadWidget


class FileAdminForm(FileFormMixin, ModelForm):
    pass


class FileFormAdminMixin(with_typehint(admin.ModelAdmin)):
    change_form_template = "django_file_form/admin_change_form.html"
    form = FileAdminForm
    formfield_overrides = {
        models.FileField: {
            "form_class": UploadedFileField,
            "widget": UploadWidget,
        }
    }

    class Media:
        css = {"all": ("file_form/file_form.css",)}
        js = ("file_form/file_form.js", "file_form/auto_init.js")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        form.delete_temporary_files()


class FileFormAdmin(FileFormAdminMixin, admin.ModelAdmin):
    pass
