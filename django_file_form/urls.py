from django.urls import path
from .views.tus import TusUpload


urlpatterns = (
    path('upload/', TusUpload.as_view(), name='tus_upload'),
    path('upload/<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
)
