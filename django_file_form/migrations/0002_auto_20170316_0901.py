# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-16 14:01
from django.db import migrations, models

from . import storage


class Migration(migrations.Migration):

    dependencies = [
        ("django_file_form", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="uploadedfile",
            name="uploaded_file",
            field=models.FileField(
                max_length=255, storage=storage, upload_to="temp_uploads"
            ),
        ),
    ]