# -*- coding: utf-8 -*-
import django.core.files.storage
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Example",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                (
                    "input_file",
                    models.FileField(
                        max_length=255,
                        storage=django.core.files.storage.FileSystemStorage(
                            location="/Users/marcobraak/devshare/django-file-form/testproject/media"
                        ),
                        upload_to="example",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Example2",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="ExampleFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "input_file",
                    models.FileField(
                        max_length=255,
                        storage=django.core.files.storage.FileSystemStorage(
                            location="/Users/marcobraak/devshare/django-file-form/testproject/media"
                        ),
                        upload_to="example",
                    ),
                ),
                (
                    "example",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="files",
                        to="django_file_form_example.Example2",
                    ),
                ),
            ],
        ),
    ]
