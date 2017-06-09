import os
import sys
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.db import models
from django.utils import timezone
from six import python_2_unicode_compatible, text_type

from . import conf
from .util import ModelManager, load_class


class UploadedFileManager(ModelManager):
    def delete_unused_files(self, delete=True, now=None):
        deleted_files = []

        for t in self.get_queryset():
            if t.must_be_deleted(now):
                if delete:
                    t.delete()

                deleted_files.append(Path(t.uploaded_file.name).name)

        temp_path = Path(settings.MEDIA_ROOT).joinpath(conf.UPLOAD_DIR)

        for f in temp_path.iterdir():
            basename = f.name

            if not self.get_for_file(basename):
                if delete:
                    f.unlink()

                deleted_files.append(basename)

        return deleted_files

    def get_for_file(self, filename):
        path = os.path.join(conf.UPLOAD_DIR, filename)
        return self.try_get(uploaded_file=path)


def get_storage():
    if ('makemigrations' in sys.argv or 'migrate' in sys.argv):
        return "settings.FILE_FORM_FILE_STORAGE"
    return load_class('FILE_STORAGE')()


def upload_to(instance, filename):
    return conf.UPLOAD_DIR


@python_2_unicode_compatible
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
        return text_type(self.original_filename or '')

    def delete(self, *args, **kwargs):
        if self.uploaded_file and self.uploaded_file.storage.exists(self.uploaded_file.name):
            self.uploaded_file.delete()

        super(UploadedFile, self).delete(*args, **kwargs)
                
    def must_be_deleted(self, now=None):
        now = now or timezone.now()

        return (now - self.created).days >= 1

    def get_path(self):
        if self.uploaded_file:
            return Path(self.uploaded_file.path)
        else:
            return None

    def get_uploaded_file(self):
        return UploadedFileWithId(
            self.uploaded_file,
            self.original_filename,
            self.file_id
        )


class UploadedFileWithId(File):
    def __init__(self, _file, name, file_id):
        super(UploadedFileWithId, self).__init__(_file, name)

        self.file_id = file_id

    def get_values(self):
        return dict(id=self.file_id, name=self.name)
