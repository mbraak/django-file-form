import os
import uuid

from . import conf
from .ajaxuploader.backends.local import LocalUploadBackend
from .ajaxuploader.views import AjaxFileUploader
from .models import UploadedFile
from .util import load_class, check_permission


class FileFormUploadBackend(LocalUploadBackend):
    UPLOAD_DIR = conf.UPLOAD_DIR

    def upload_complete(self, request, filename, file_id, *args, **kwargs):
        result = super(FileFormUploadBackend, self).upload_complete(
            request, filename, file_id, *args, **kwargs)

        # get the filename if only resized image is uploaded
        if request.POST.get('qqfilename'):
            original_filename = request.POST['qqfilename']
        else:
            original_filename = request.FILES['qqfile'].name

        values = dict(
            uploaded_file=os.path.join(self.UPLOAD_DIR, filename),
            file_id=file_id,
            form_id=request.POST['form_id'],
            original_filename=original_filename,
        )

        field_name = request.POST.get('field_name')
        if field_name:
            values['field_name'] = field_name

        UploadedFile.objects.create(**values)

        return result

    def update_filename(self, request, filename, *args, **kwargs):
        return uuid.uuid4().hex


class FileFormUploader(AjaxFileUploader):
    def __init__(self, backend=None, **kwargs):
        if not backend:
            backend = load_class('UPLOAD_BACKEND')
        super(FileFormUploader, self).__init__(backend, **kwargs)

    def __call__(self, request, *args, **kwargs):
        check_permission(request)

        return super(FileFormUploader, self).__call__(request, *args, **kwargs)
