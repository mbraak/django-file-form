from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("django_file_form", "0006_auto_20200501_0908"),
    ]

    operations = [
        migrations.RenameModel(
            new_name="TemporaryUploadedFile",
            old_name="UploadedFile",
        ),
        migrations.AlterModelTable(
            name="TemporaryUploadedFile",
            table="django_file_form_uploadedfile",
        ),
    ]
