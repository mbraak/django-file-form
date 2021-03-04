from django.contrib import admin

from django_file_form.admin import FileFormAdminMixin
from .models import Example, Example2, ExampleFile


class ExampleAdmin(FileFormAdminMixin, admin.ModelAdmin):
    class Media:
        css = {
            "all": ("file_form/file_form.css",)
        }
        js = ("file_form/file_form.js", "example_admin.js")


class ExampleFileInline(admin.TabularInline):
    model = ExampleFile


class Example2Admin(admin.ModelAdmin):
    inlines = [ExampleFileInline]


admin.site.register(Example, ExampleAdmin)
admin.site.register(Example2, Example2Admin)
