from django.http import HttpResponse, HttpResponseNotFound
from django.views import generic

from .models import UploadedFile
from .uploader import FileFormUploader


handle_upload = FileFormUploader()


class DeleteFile(generic.View):
    def delete(self, request, file_id):
        uploaded_file = UploadedFile.objects.try_get(file_id=file_id)

        if uploaded_file:
            uploaded_file.delete()
            return HttpResponse("ok")
        else:
            return HttpResponseNotFound()