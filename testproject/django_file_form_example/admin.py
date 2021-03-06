from django.contrib import admin

from django_file_form.model_admin import FileFormAdmin
from .models import Example, Example2, ExampleFile


class ExampleAdmin(FileFormAdmin):
    pass


class ExampleFileInline(admin.TabularInline):
    model = ExampleFile


class Example2Admin(admin.ModelAdmin):
    inlines = [ExampleFileInline]


admin.site.register(Example, ExampleAdmin)
admin.site.register(Example2, Example2Admin)
