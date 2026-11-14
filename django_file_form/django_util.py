from functools import wraps
from pathlib import Path

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse


def check_permission(request):
    must_login = getattr(settings, "FILE_FORM_MUST_LOGIN", False)

    if must_login and not request.user.is_authenticated:
        raise PermissionDenied()


def permission_required(view):
    """
    Return a json 403 response if the user may not upload files (see FILE_FORM_MUST_LOGIN)
    """

    @wraps(view)
    def wrapper(request, *args, **kwargs):
        try:
            check_permission(request)
        except PermissionDenied:
            return JsonResponse({"status": "permission denied"}, status=403)

        return view(request, *args, **kwargs)

    return wrapper


def get_upload_path():
    default_upload_dir = "temp_uploads"
    upload_path = Path(getattr(settings, "FILE_FORM_UPLOAD_DIR", default_upload_dir))

    if upload_path.is_absolute():
        return upload_path
    else:
        return Path(settings.MEDIA_ROOT).joinpath(upload_path)
