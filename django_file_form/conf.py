from django.conf import settings

# Cache timeout in seconds; default is 24 hours
CACHE_TIMEOUT = getattr(settings, "FILE_FORM_CACHE_TIMEOUT", 3600 * 24)


def get_max_upload_size():
    """
    Maximum size of an uploaded file in bytes; None means no maximum
    """
    return getattr(settings, "FILE_FORM_MAX_UPLOAD_SIZE", None)
