from django.conf import settings


# in seconds
TIMEOUT = getattr(settings, 'FILE_FORM_CACHE_TIMEOUT', 3600)
