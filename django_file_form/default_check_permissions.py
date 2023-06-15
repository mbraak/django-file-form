from django.conf import settings
from django.core.exceptions import PermissionDenied


# Default implementation of check_permissions
def check_permissions(request, _field_name):
    must_login = getattr(settings, "FILE_FORM_MUST_LOGIN", False)

    if must_login and not request.user.is_authenticated:
        raise PermissionDenied()
