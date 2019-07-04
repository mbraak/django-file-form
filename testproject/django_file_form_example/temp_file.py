import os
from tempfile import NamedTemporaryFile

from django.conf import settings

from django_file_form.models import UploadedFile

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


class TempFile(object):
    def __init__(self):
        self.named_temporary_file = None

    def create(self, content='abc', prefix=None):
        if self.named_temporary_file:
            raise Exception('Tempfile is already created')

        def create_named_temporary_file():
            f = NamedTemporaryFile(mode='w+b', prefix=prefix or 'tmp')
            f.write(content.encode())
            f.seek(0)

            return f

        self.named_temporary_file = create_named_temporary_file()

    def base_name(self):
        if not self.named_temporary_file:
            raise Exception('Tempfile is not created')

        return os.path.basename(self.named_temporary_file.name)

    def path(self):
        if not self.named_temporary_file:
            raise Exception('Tempfile is not created')

        return self.named_temporary_file.name

    def destroy(self):
        if self.named_temporary_file:
            uploaded_file = self.uploaded_file()

            if uploaded_file.exists():
                uploaded_file.unlink()

            self.named_temporary_file.close()
            self.named_temporary_file = None

            for uploaded_file in UploadedFile.objects.all():
                uploaded_file.uploaded_file.delete()

    def uploaded_file(self):
        if not self.named_temporary_file:
            raise Exception('Tempfile is not created')

        return Path(settings.MEDIA_ROOT).joinpath('example', self.base_name())
