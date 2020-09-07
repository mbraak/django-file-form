from django.urls import path
from .views.tus import TusUpload

tus_patterns = [
    path('upload/', TusUpload.as_view(), name='tus_upload'),
    path('upload/<str:resource_id>', TusUpload.as_view(), name='tus_upload_chunks')
]

try:
    from .views.s3multipart import s3multipart
    s3_patterns = [
        path('s3upload/', s3multipart.create_multipart_upload, name='s3_upload'),
        path('s3upload/<upload_id>/', s3multipart.get_parts_or_abort_upload, name='get_parts_or_abort_upload'),
        path('s3upload/<upload_id>/<int:part_number>', s3multipart.sign_part_upload, name='sign_part_upload'),
        path('s3upload/<upload_id>/complete', s3multipart.complete_multipart_upload, name='complete_multipart_upload'),
    ]
except ImportError:
    s3_patterns = []

urlpatterns = tus_patterns + s3_patterns
