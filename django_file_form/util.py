from django.core.exceptions import ImproperlyConfigured
from django.db import models
from django.utils.module_loading import import_string

from . import conf

try:
    from django.urls import reverse as url_reverse
except ImportError:
    from django.core.urlresolvers import reverse as url_reverse


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


def load_class(setting_string):
    try:
        return import_string(getattr(conf, setting_string))
    except ImportError:
        raise ImproperlyConfigured(
            "{0!s} refers to a class '{1!s}' that is not available".format(setting_string, getattr(conf, setting_string))
        )
