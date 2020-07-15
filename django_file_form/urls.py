from django.conf.urls import url
from .views.tus import TusUpload
from django.urls import path
from .views.s3multipart import s3multipart


urlpatterns = (
    url(r'^upload/$', TusUpload.as_view(), name='tus_upload'),
    url(r'^upload/(?P<resource_id>[0-9a-z-]+)$', TusUpload.as_view(), name='tus_upload_chunks'),
    path('get_presigned_url/', s3multipart.get_presigned_url, name='get_presigned_url'),
    path('s3/multipart', s3multipart.createMultipartUpload, name='createMultipartUpload'),
    path('s3/multipart/<uploadId>/', s3multipart.getUploadedParts, name='getUploadedParts'),
    path('s3/multipart/<uploadId>/<int:partNumber>', s3multipart.signPartUpload, name='signPartUpload'),
    path('s3/multipart/<uploadId>/complete', s3multipart.completeMultipartUpload, name='completeMultipartUpload'),
    path('s3/multipart/<uploadId>/', s3multipart.abortMultipartUpload, name='abortMultipartUpload'),
)
