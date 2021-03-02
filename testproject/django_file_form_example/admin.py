from django.contrib import admin
from django.db import models
from django.forms import ModelForm

from django_file_form.fields import UploadedFileField
from django_file_form.forms import FileFormMixin
from django_file_form.widgets import UploadWidget
from .models import Example, Example2, ExampleFile


class ExampleAdminForm(FileFormMixin, ModelForm):
    class Meta:
        model = Example
        fields = "__all__"


class ExampleAdmin(admin.ModelAdmin):
    class Media:
        css = {
            "all": ("file_form/file_form.css",)
        }
        js = ("file_form/file_form.js", "example_admin.js")

    change_form_template = 'django_file_form/admin_change_form.html'
    form = ExampleAdminForm

    formfield_overrides = {
        models.FileField: {
            'form_class': UploadedFileField,
            'widget': UploadWidget,
        }
    }

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        form.delete_temporary_files()


class ExampleFileInline(admin.TabularInline):
    model = ExampleFile


class Example2Admin(admin.ModelAdmin):
    inlines = [ExampleFileInline]


admin.site.register(Example, ExampleAdmin)
admin.site.register(Example2, Example2Admin)
