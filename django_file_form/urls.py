from django.urls import path
from .views.tus import TusUpload
from .views.s3multipart import s3multipart

urlpatterns = (
    path('upload/', TusUpload.as_view(), name='tus_upload'),
    path('upload/<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),
    path('s3upload/', s3multipart.createMultipartUpload, name='createMultipartUpload'),
    path('s3upload/get_presigned_url/', s3multipart.get_presigned_url, name='get_presigned_url'),
    # request GET
    path('s3upload/<uploadId>/', s3multipart.getUploadedParts, name='getUploadedParts'),
    # request DELETE
    path('s3upload/<uploadId>/', s3multipart.abortMultipartUpload, name='abortMultipartUpload'),
    path('s3upload/<uploadId>/<int:partNumber>', s3multipart.signPartUpload, name='signPartUpload'),
    path('s3upload/<uploadId>/complete', s3multipart.completeMultipartUpload, name='completeMultipartUpload'),
)
