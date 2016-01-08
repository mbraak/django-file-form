import uuid
from datetime import datetime
from django.utils import timezone

import six

from django.conf import settings


def get_random_id():
    return uuid.uuid4().hex


def get_random_ids(count):
    for _ in six.moves.xrange(count):
        yield get_random_id()


def encode_datetime(*args, **kwargs):
    """
    Return a valid datetime.
    - depends on timezone settings
    """
    naive_datime = datetime(*args, **kwargs)

    if settings.USE_TZ:
        return timezone.make_aware(naive_datime, timezone.get_current_timezone())
    else:
        return naive_datime


def remove_p(path):
    if path.exists():
        path.unlink()
