# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import django.core.files.storage


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UploadedFile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(default=django.utils.timezone.now)),
                ('uploaded_file', models.FileField(storage=django.core.files.storage.FileSystemStorage(), max_length=255, upload_to=b'temp_uploads')),
                ('original_filename', models.CharField(max_length=255)),
                ('field_name', models.CharField(max_length=255, null=True, blank=True)),
                ('file_id', models.CharField(max_length=40)),
                ('form_id', models.CharField(max_length=40)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
