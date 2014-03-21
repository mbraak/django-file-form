import uuid

from django.core.exceptions import PermissionDenied

from .ajaxuploader.backends.local import LocalUploadBackend
from .ajaxuploader.views import AjaxFileUploader

from .models import UploadedFile
from . import conf


class FileFormUploadBackend(LocalUploadBackend):
    UPLOAD_DIR = 'temp_uploads'

    def upload_complete(self, request, filename, file_id, *args, **kwargs):
        result = super(FileFormUploadBackend, self).upload_complete(request, filename, file_id, *args, **kwargs)

        values = dict(
            uploaded_file='%s/%s' % (self.UPLOAD_DIR, filename),
            file_id=file_id,
            form_id=request.POST['form_id'],
            original_filename=request.FILES['qqfile'].name,
        )

        field_name = request.POST.get('field_name', None)
        if field_name:
            values['field_name'] = field_name

        UploadedFile.objects.create(**values)

        return result

    def update_filename(self, request, filename, *args, **kwargs):
        return uuid.uuid4().hex


class FileFormUploader(AjaxFileUploader):
    def __init__(self, backend=None, **kwargs):
        backend = backend or FileFormUploadBackend

        super(FileFormUploader, self).__init__(backend, **kwargs)

    def __call__(self, request, *args, **kwargs):
        if conf.MUST_LOGIN and not request.user.is_authenticated():
            raise PermissionDenied()

        return super(FileFormUploader, self).__call__(request, *args, **kwargs)