from django.db import models

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
