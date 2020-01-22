import sys
import os
from pathlib import Path

from django.conf import settings
from django.core.files import uploadedfile
from django.db import models
from django.utils import timezone
from . import conf
from .util import ModelManager, load_class


class UploadedFileManager(ModelManager):
    def delete_unused_files(self, delete=True, now=None):
        deleted_files = []

        for t in self.get_queryset():
            if t.must_be_deleted(now):
                deleted_files.append(Path(t.uploaded_file.name).name)

                if delete:
                    t.delete()

        temp_path = Path(settings.MEDIA_ROOT).joinpath(conf.UPLOAD_DIR)

        for f in temp_path.iterdir():
            basename = f.name

            if not self.get_for_file(basename):
                deleted_files.append(basename)

                if delete:
                    f.unlink()

        return deleted_files

    def get_for_file(self, filename):
        path = Path(conf.UPLOAD_DIR).joinpath(filename)
        return self.try_get(uploaded_file=path)


def get_storage():
    if 'makemigrations' in sys.argv or 'migrate' in sys.argv:
        return "settings.FILE_FORM_FILE_STORAGE"
    return load_class('FILE_STORAGE')()


def upload_to(instance, filename):
    return str(conf.UPLOAD_DIR)


class UploadedFile(models.Model):
    created = models.DateTimeField(default=timezone.now)
    uploaded_file = models.FileField(max_length=255, upload_to=upload_to,
                                     storage=get_storage())
    original_filename = models.CharField(max_length=255)
    field_name = models.CharField(max_length=255, null=True, blank=True)
    file_id = models.CharField(max_length=40)
    form_id = models.CharField(max_length=40)

    objects = UploadedFileManager()

    class Meta(object):
        # Query string to get back existing uploaded file is using form_id and field_name
        index_together = (("form_id", "field_name"),)

    def __str__(self):
        return str(self.original_filename or '')

    def delete(self, *args, **kwargs):
        if self.uploaded_file and self.uploaded_file.storage.exists(self.uploaded_file.name):
            self.uploaded_file.delete()

        super(UploadedFile, self).delete(*args, **kwargs)

    def must_be_deleted(self, now=None):
        now = now or timezone.now()

        return (now - self.created).days >= 1

    def get_uploaded_file(self):
        return UploadedFileWithId(
            file=self.uploaded_file,
            name=self.original_filename,
            file_id=self.file_id
        )


class UploadedFileWithId(uploadedfile.UploadedFile):
    def __init__(self, file_id, **kwargs):
        super(UploadedFileWithId, self).__init__(**kwargs)

        self.file_id = file_id
        self.size = os.path.getsize(self.file.name)

    def get_values(self):
        return dict(id=self.file_id, name=self.name)
