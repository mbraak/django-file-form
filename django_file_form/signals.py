from django.dispatch import receiver
from django_tus.signals import tus_upload_finished_signal

from . import conf
from .models import UploadedFile


UPLOAD_DIR = conf.UPLOAD_DIR


@receiver(tus_upload_finished_signal)
def handle_upload_finished(sender, **kwargs):
    metadata = kwargs.get('metadata')
    file_id = kwargs.get('filename')
    upload_file_path = kwargs.get('upload_file_path')

    field_name = metadata.get('fieldName')
    form_id = metadata.get('formId')
    original_filename = metadata.get('filename')

    values = dict(
        uploaded_file=upload_file_path,
        file_id=file_id,
        form_id=form_id,
        original_filename=original_filename,
    )

    if field_name:
        values['field_name'] = field_name

    UploadedFile.objects.create(**values)