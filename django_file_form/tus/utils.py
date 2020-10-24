import os
from django.conf import settings
from django.core.cache import caches
from django.core.files import File
from django_file_form.models import UploadedFile


cache = caches[getattr(settings, 'FILE_FORM_CACHE', 'default')]


def remove_resource_from_cache(resource_id):
    cache.delete_many([
        "tus-uploads/{}/file_size".format(resource_id),
        "tus-uploads/{}/filename".format(resource_id),
        "tus-uploads/{}/offset".format(resource_id),
        "tus-uploads/{}/metadata".format(resource_id),
    ])


def create_uploaded_file_in_db(field_name, file_id, form_id, original_filename, uploaded_file):
    with open(uploaded_file, 'rb') as fh:
        values = dict(
            file_id=file_id,
            form_id=form_id,
            uploaded_file=File(file=fh, name=uploaded_file.name),
            original_filename=original_filename
        )

        if field_name:
            values['field_name'] = field_name

        UploadedFile.objects.create(**values)

    os.remove(uploaded_file)
