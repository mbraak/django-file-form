from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.module_loading import import_string


if hasattr(settings, "FILE_FORM_TEMP_STORAGE"):
    storage_class = import_string(settings.FILE_FORM_TEMP_STORAGE)
else:
    storage_class = FileSystemStorage

storage = storage_class()
