from django.urls import path
from .views import start_upload, TusUpload

urlpatterns = [
    path('', start_upload, name='tus_upload'),
    path('<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
]
