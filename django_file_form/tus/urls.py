from django.urls import path
from .views import StartTusUpload, TusUpload

urlpatterns = [
    path('', StartTusUpload.as_view(), name='tus_upload'),
    path('<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
]
