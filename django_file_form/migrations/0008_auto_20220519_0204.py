# Generated by Django 2.2.28 on 2022-05-19 07:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("django_file_form", "0007_auto_20210119_0104"),
    ]

    operations = [
        migrations.AlterField(
            model_name="temporaryuploadedfile",
            name="id",
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
