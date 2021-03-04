# -*- coding: utf-8 -*-
from django.db import models, migrations
import django.utils.timezone

from . import storage


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="UploadedFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        verbose_name="ID",
                        serialize=False,
                        auto_created=True,
                        primary_key=True,
                    ),
                ),
                ("created", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "uploaded_file",
                    models.FileField(
                        storage=storage, max_length=255, upload_to=b"temp_uploads"
                    ),
                ),
                ("original_filename", models.CharField(max_length=255)),
                ("field_name", models.CharField(max_length=255, null=True, blank=True)),
                ("file_id", models.CharField(max_length=40)),
                ("form_id", models.CharField(max_length=40)),
            ],
            options={},
            bases=(models.Model,),
        ),
    ]
