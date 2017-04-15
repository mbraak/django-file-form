from django.conf import settings


# Must the client be logged in for an upload or delete?
MUST_LOGIN = getattr(settings, 'FILE_FORM_MUST_LOGIN', False)
UPLOAD_BACKEND = getattr(settings, 'FILE_FORM_UPLOAD_BACKEND',
                         'django_file_form.uploader.FileFormUploadBackend')
UPLOAD_DIR = getattr(settings, 'FILE_FORM_UPLOAD_DIR', 'temp_uploads')
FILE_STORAGE = getattr(settings, 'FILE_FORM_FILE_STORAGE',
                       'django.core.files.storage.FileSystemStorage')
