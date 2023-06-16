from pathlib import Path
from django.core.exceptions import PermissionDenied
from django.conf import settings


def check_permission(request):
    must_login = getattr(settings, "FILE_FORM_MUST_LOGIN", False)

    if must_login and not request.user.is_authenticated:
        raise PermissionDenied()


def get_upload_path():
    default_upload_dir = "temp_uploads"
    upload_path = Path(getattr(settings, "FILE_FORM_UPLOAD_DIR", default_upload_dir))

    if upload_path.is_absolute():
        return upload_path
    else:
        return Path(settings.MEDIA_ROOT).joinpath(upload_path)
