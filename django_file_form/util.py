import django
from django.db import models


def get_short_django_version():
    """
    Get first two numbers of Django version.
    E.g. (1, 5)
    """
    return django.VERSION[0:2]


class ModelManager(models.Manager):
    def try_get(self, **kwargs):
        qs = self.get_queryset().filter(**kwargs)
        if qs.exists():
            return qs.get()
        else:
            return None

    if get_short_django_version() < (1, 6):
        def get_queryset(self, *args, **kwargs):
            return self.get_query_set(*args, **kwargs)
