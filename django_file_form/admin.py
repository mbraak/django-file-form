from django.db import models
from django.contrib import admin
from django.forms import ModelForm

from .models import TemporaryUploadedFile
from .fields import UploadedFileField
from .forms import FileFormMixin
from .widgets import UploadWidget


class FileAdminForm(FileFormMixin, ModelForm):
    pass


class FileFormAdminMixin:
    change_form_template = 'django_file_form/admin_change_form.html'
    form = FileAdminForm
    formfield_overrides = {
        models.FileField: {
            'form_class': UploadedFileField,
            'widget': UploadWidget,
        }
    }

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        form.delete_temporary_files()


class TemporaryUploadedFileAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "created"]
    date_hierarchy = "created"


admin.site.register(TemporaryUploadedFile, TemporaryUploadedFileAdmin)
