from pathlib import Path
from typing import Type, TYPE_CHECKING, TypeVar
from django.core.exceptions import PermissionDenied
from django.db import models
from django.conf import settings


class ModelManager(models.Manager):
    def try_get(self, **kwargs):
        qs = self.get_queryset().filter(**kwargs)
        if qs.exists():
            return qs.get()
        else:
            return None


def get_list(v):
    if isinstance(v, list):
        return v
    else:
        return [v]


def compact(l):
    return [v for v in l if v]


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


T = TypeVar('T')


def with_typehint(baseclass: Type[T]) -> Type[T]:
    """
    Useful function to make mixins with baseclass typehint

    ```
    class ReadonlyMixin(with_typehint(BaseAdmin))):
        ...
    ```
    """
    if TYPE_CHECKING:
        return baseclass

    return object
