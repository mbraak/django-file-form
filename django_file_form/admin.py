from django.contrib import admin

from .models import TemporaryUploadedFile


class TemporaryUploadedFileAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "created"]
    date_hierarchy = "created"


admin.site.register(TemporaryUploadedFile, TemporaryUploadedFileAdmin)
