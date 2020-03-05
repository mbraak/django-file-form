from django.conf import settings


# in bytes, default is 4 GB
MAX_FILE_SIZE = getattr(settings, 'FILE_FORM_MAX_FILE_SIZE', 4294967296)

# in seconds
TIMEOUT = 3600
