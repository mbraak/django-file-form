from django.contrib import admin

from . import models


class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'created']
    date_hierarchy = 'created'


admin.site.register(models.UploadedFile, UploadedFileAdmin)
