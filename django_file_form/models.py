from pathlib import Path

from six import python_2_unicode_compatible, text_type

from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.db import models
from django.core.files import File
from django.utils import timezone

from .util import ModelManager


class UploadedFileManager(ModelManager):
    def delete_unused_files(self, delete=True, now=None):
        deleted_files = []

        for t in self.get_queryset():
            if t.must_be_deleted(now):
                if delete:
                    t.delete()

                deleted_files.append(Path(t.uploaded_file.name).name)

        temp_path = Path(settings.MEDIA_ROOT).joinpath('temp_uploads')

        for f in temp_path.iterdir():
            basename = f.name

            if not self.get_for_file(basename):
                if delete:
                    f.unlink()

                deleted_files.append(basename)

        return deleted_files

    def get_for_file(self, filename):
        return self.try_get(
            uploaded_file='temp_uploads/{0!s}'.format(filename)
        )


@python_2_unicode_compatible
class UploadedFile(models.Model):
    fs = FileSystemStorage()

    created = models.DateTimeField(default=timezone.now)
    uploaded_file = models.FileField(max_length=255, upload_to='temp_uploads', storage=fs)
    original_filename = models.CharField(max_length=255)
    field_name = models.CharField(max_length=255, null=True, blank=True)
    file_id = models.CharField(max_length=40)
    form_id = models.CharField(max_length=40)

    objects = UploadedFileManager()

    def __str__(self):
        return text_type(self.original_filename or '')

    def delete(self, using=None):
        super(UploadedFile, self).delete(using)

        if self.uploaded_file:
            path = self.get_path()

            if path.exists():
                path.unlink()

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
