from django.contrib import admin
from django.conf import settings

from django_file_form.model_admin import FileFormAdmin
from .models import Example, Example2, ExampleFile


class ExampleAdmin(FileFormAdmin):
    def get_file_form_js(self):
        if getattr(settings, "DJANGO_FILE_FORM_COVERAGE_JS", False):
            return "file_form/file_form.coverage.js"
        else:
            return super().get_file_form_js()  # pragma: no cover


class ExampleFileInline(admin.TabularInline):
    model = ExampleFile


class Example2Admin(admin.ModelAdmin):
    inlines = [ExampleFileInline]


admin.site.register(Example, ExampleAdmin)
admin.site.register(Example2, Example2Admin)
