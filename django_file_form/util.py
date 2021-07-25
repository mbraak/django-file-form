from os.path import normcase, sep
from pathlib import Path
from typing import List, Type, TYPE_CHECKING, TypeVar
from django.core.exceptions import PermissionDenied
from django.db import models
from django.conf import settings
from django.core.exceptions import SuspiciousFileOperation


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


T = TypeVar("T")


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


def safe_join(base: Path, *paths: List[str]) -> Path:
    """
    Join one or more path components to the base path component intelligently.
    Return a normalized, absolute version of the final path.

    Raise ValueError if the final path isn't located inside of the base path
    component.
    """
    final_path = base.joinpath(*paths).resolve()
    base_path = base.resolve()

    # Ensure final_path starts with base_path (using normcase to ensure we
    # don't false-negative on case insensitive operating systems like Windows),
    # further, one of the following conditions must be true:
    #  a) The next character is the path separator (to prevent conditions like
    #     safe_join("/dir", "/../d"))
    #  b) The final path must be the same as the base path.
    #  c) The base path must be the most root path (meaning either "/" or "C:\\")
    if (
        not normcase(final_path).startswith(normcase(str(base_path) + sep))
        and normcase(final_path) != normcase(base_path)
        and normcase(base_path.parent) != normcase(base_path)
    ):
        raise SuspiciousFileOperation(
            "The joined path ({}) is located outside of the base path "
            "component ({})".format(final_path, base_path)
        )

    return final_path
