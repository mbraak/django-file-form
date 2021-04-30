import uuid
from datetime import datetime
from json import dumps
from pathlib import Path

from django.utils import timezone
from django.conf import settings

from django_file_form_example.models import Example, ExampleFile


def get_random_id():
    return uuid.uuid4().hex


def encode_datetime(*args, **kwargs):
    """
    Return a valid datetime.
    - depends on timezone settings
    """
    naive_datime = datetime(*args, **kwargs)

    if settings.USE_TZ:
        return timezone.make_aware(naive_datime, timezone.get_current_timezone())
    else:
        return naive_datime  # pragma: no cover


def remove_p(path):
    if path.exists():
        path.unlink()


def to_class_string(classes):
    return "".join(f".{v}" for v in classes if v)


def read_file(file):
    try:
        return file.read()
    finally:
        file.close()


def write_json(path, data):
    json = dumps(data)

    Path(path).write_text(json)


def count_temp_uploads():
    temp_uploads_path = Path(settings.MEDIA_ROOT).joinpath("temp_uploads")
    return len(list(temp_uploads_path.iterdir()))


def remove_example_file(filename):
    Path(settings.MEDIA_ROOT).joinpath("example").joinpath(filename).unlink()


def has_files(path: Path):
    files = list(entry for entry in path.iterdir() if entry.is_file())

    return len(files) != 0


def remove_empty_subdirectories(path: Path) -> object:
    for entry in path.iterdir():
        if entry.is_dir() and not has_files(entry):
            remove_empty_subdirectories(entry)
            entry.rmdir()


def remove_test_files():
    for example in Example.objects.all():
        example.input_file.delete()

    for example_file in ExampleFile.objects.all():
        example_file.input_file.delete()

    temp_uploads = Path(settings.MEDIA_ROOT).joinpath("temp_uploads")
    if temp_uploads.exists():
        for temp_file in temp_uploads.iterdir():
            temp_file.unlink()

    example_uploads = Path(settings.MEDIA_ROOT).joinpath("example")

    remove_empty_subdirectories(example_uploads)
