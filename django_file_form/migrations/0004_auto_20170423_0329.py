from django.db import migrations
from django.db.models.indexes import Index


class Migration(migrations.Migration):
    dependencies = [
        ("django_file_form", "0003_auto_20170317_1230"),
    ]

    operations = [
        migrations.AddIndex(
            "uploadedfile",
            Index(fields=["form_id", "field_name"], name="form_id_field_name_idx")
        ),
    ]
