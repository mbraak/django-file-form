from django.urls import path
from .views import TusUpload

urlpatterns = [
    path('', TusUpload.as_view(), name='tus_upload'),
    path('<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
]
