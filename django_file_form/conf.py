from django.conf import settings


# Cache timeout in seconds; default is 24 hours
CACHE_TIMEOUT = getattr(settings, "FILE_FORM_CACHE_TIMEOUT", 3600 * 24)
