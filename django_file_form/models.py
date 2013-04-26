from datetime import datetime

from path import path

from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.db import models
from django.core.files.uploadedfile import SimpleUploadedFile

from .util import ModelManager


class UploadedFileManager(ModelManager):
    def delete_unused_files(self, delete=True, now=None):
        deleted_files = []

        for t in self.get_query_set():
            if t.must_be_deleted(now):
                if delete:
                    t.delete()

                deleted_files.append(path(t.uploaded_file.name).basename())

        temp_path = path(settings.MEDIA_ROOT).joinpath('temp_uploads')

        for f in temp_path.files():
            basename = f.basename()

            if not self.get_for_file(basename):
                if delete:
                    f.remove()

                deleted_files.append(basename)

        return deleted_files

    def get_for_file(self, filename):
        return self.try_get(
            uploaded_file='temp_uploads/%s' % filename
        )


class UploadedFile(models.Model):
    fs = FileSystemStorage(location=settings.MEDIA_ROOT)

    created = models.DateTimeField(default=datetime.now)
    uploaded_file = models.FileField(max_length=255, upload_to='temp_uploads', storage=fs)
    field_name = models.CharField(max_length=255, null=True, blank=True)
    file_id = models.CharField(max_length=40)
    form_id = models.CharField(max_length=40)

    objects = UploadedFileManager()

    def __unicode__(self):
        return self.get_basename()

    def delete(self, using=None):
        super(UploadedFile, self).delete(using)

        if self.uploaded_file:
            self.get_path().remove_p()

    def must_be_deleted(self, now=None):
        now = now or datetime.now()

        return (now - self.created).days >= 1

    def get_basename(self):
        p = self.get_path()

        if p:
            return p.basename()
        else:
            return None

    def get_path(self):
        if self.uploaded_file:
            return path(self.uploaded_file.path)
        else:
            return None

    def get_simple_uploaded_file(self):
        return SimpleUploadedFileWithId(
            self.get_basename(),
            self.get_path().bytes(),
            self.file_id
        )


class SimpleUploadedFileWithId(SimpleUploadedFile):
    def __init__(self, name, content, file_id, content_type='text/plain'):
        super(SimpleUploadedFileWithId, self).__init__(name, content, content_type)

        self.file_id = file_id