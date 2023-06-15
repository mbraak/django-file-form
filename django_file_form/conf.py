from django.conf import settings


# Cache timeout in seconds; default is 24 hours
CACHE_TIMEOUT = getattr(settings, "FILE_FORM_CACHE_TIMEOUT", 3600 * 24)

#CHECK_PERMISSIONS = getattr(settings, "FILE_FORM_CHECK_PERMISSIONS", "django_file_form.django_util.check_permissions")
