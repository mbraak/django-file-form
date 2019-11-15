from django.conf import settings


UPLOAD_DIR = getattr(settings, 'FILE_FORM_UPLOAD_DIR', 'temp_uploads')
FILE_STORAGE = getattr(settings, 'FILE_FORM_FILE_STORAGE', 'django.core.files.storage.FileSystemStorage')
