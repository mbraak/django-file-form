from ajaxuploader.backends.local import LocalUploadBackend
from ajaxuploader.views import AjaxFileUploader

from .models import UploadedFile


class FileFormUploadBackend(LocalUploadBackend):
    UPLOAD_DIR = 'temp_uploads'

    def upload_complete(self, request, filename, file_id, *args, **kwargs):
        result = super(FileFormUploadBackend, self).upload_complete(request, filename, file_id, *args, **kwargs)

        values = dict(
            uploaded_file='%s/%s' % (self.UPLOAD_DIR, filename),
            file_id=file_id,
            form_id=request.POST['form_id'],
        )

        field_name = request.POST.get('field_name', None)
        if field_name:
            values['field_name'] = field_name

        UploadedFile.objects.create(**values)
        return result


class FileFormUploader(AjaxFileUploader):
    def __init__(self, backend=None, **kwargs):
        backend = backend or FileFormUploadBackend

        super(FileFormUploader, self).__init__(backend, **kwargs)