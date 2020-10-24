from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings


class Example(models.Model):
    fs = FileSystemStorage(location=settings.MEDIA_ROOT)

    title = models.CharField(max_length=255)
    input_file = models.FileField(max_length=255, upload_to="example", storage=fs)


class Example2(models.Model):
    title = models.CharField(max_length=255)


class ExampleFile(models.Model):
    fs = FileSystemStorage(location=settings.MEDIA_ROOT)

    example = models.ForeignKey(
        Example2, related_name="files", on_delete=models.CASCADE
    )
    input_file = models.FileField(max_length=255, upload_to="example", storage=fs)

    def __str__(self):
        return str(self.input_file)
