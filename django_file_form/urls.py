from django.urls import include, path
from .tus.views import TusUpload

urlpatterns = [
    path('upload/', TusUpload.as_view(), name='tus_upload'),
    path('upload/<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
    path('s3upload/', include('django_file_form.s3_multipart.urls'))
]
