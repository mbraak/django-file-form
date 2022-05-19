import os
from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone
from django.utils.module_loading import import_string

from .util import ModelManager, get_upload_path

# Import uploaded files for backward compatibility
from .uploaded_file import (
    PlaceholderUploadedFile,
    S3UploadedFileWithId,
    UploadedTusFile,
)


class TemporaryUploadedFileManager(ModelManager):
    def delete_unused_files(self, delete=True, now=None):
        deleted_files = []

        for t in self.get_queryset():
            if t.must_be_deleted(now):
                deleted_files.append(Path(t.uploaded_file.name).name)

                if delete:
                    t.delete()

        temp_path = get_upload_path()

        for f in temp_path.iterdir():
            basename = f.name

            if not self.get_for_file(basename):
                deleted_files.append(basename)

                if delete:
                    f.unlink()

        return deleted_files

    def for_field_and_form(self, field_name, form_id):
        return self.filter(form_id=form_id, field_name=field_name)

    def get_for_file(self, filename):
        return self.try_get(uploaded_file=get_upload_to_for_filename(filename))


def get_upload_to_for_filename(filename):
    path = getattr(settings, "FILE_FORM_UPLOAD_DIR", "temp_uploads")
    return os.path.join(path, filename)


def get_upload_to(_instance, filename):
    return get_upload_to_for_filename(filename)


if hasattr(settings, "FILE_FORM_TEMP_STORAGE"):
    storage_class = import_string(settings.FILE_FORM_TEMP_STORAGE)
else:
    storage_class = FileSystemStorage


class TemporaryUploadedFile(models.Model):
    """
    TemporaryUploadedFile is used for temporary storage of an uploaded file.

    * Added when a file is uploaded using the tus ajax upload
    * Removed when the form is submitted sucessfully
    * Or removed later by 'python manage.py delete_unused_files'
    """

    id = models.AutoField(primary_key=True)
    created = models.DateTimeField(default=timezone.now)
    uploaded_file = models.FileField(
        max_length=255, storage=storage_class(), upload_to=get_upload_to
    )
    original_filename = models.CharField(max_length=255)
    field_name = models.CharField(max_length=255, null=True, blank=True)
    file_id = models.CharField(max_length=40)
    form_id = models.CharField(max_length=40)

    objects = TemporaryUploadedFileManager()

    class Meta(object):
        index_together = (("form_id", "field_name"),)
        db_table = "django_file_form_uploadedfile"

    def __str__(self):
        return str(self.original_filename or "")

    def delete(self, *args, **kwargs):
        if self.uploaded_file and self.uploaded_file.storage.exists(
            self.uploaded_file.name
        ):
            self.uploaded_file.delete()

        super().delete(*args, **kwargs)

    def get_uploaded_file(self):
        return UploadedTusFile(
            file=self.uploaded_file, name=self.original_filename, file_id=self.file_id
        )

    def must_be_deleted(self, now=None):
        now = now or timezone.now()

        return (now - self.created).days >= 1
