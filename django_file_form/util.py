from django.core.exceptions import ImproperlyConfigured, PermissionDenied
from django.db import models
from django.utils.module_loading import import_string
from django.conf import settings

from . import conf


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


def load_class(setting_string, conf_module=conf):
    class_name = getattr(conf_module, setting_string)

    try:
        return import_string(class_name)
    except ImportError:
        raise ImproperlyConfigured(
            f"{setting_string} refers to a class '{class_name}' that is not available"
        )


def check_permission(request):
    must_login = getattr(settings, 'FILE_FORM_MUST_LOGIN', False)

    if must_login and not request.user.is_authenticated:
        raise PermissionDenied()
