from django.conf.urls import url
from django_tus.views import TusUpload


urlpatterns = (
    url(r'^upload/$', TusUpload.as_view(), name='tus_upload'),
    url(r'^upload/(?P<resource_id>[0-9a-z-]+)$', TusUpload.as_view(), name='tus_upload_chunks'),
)
