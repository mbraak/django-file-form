from django.conf.urls import url

from . import views


urlpatterns = (
    url(r'^handle_upload$', views.handle_upload, name='file_form_handle_upload'),
    url(r'^handle_delete$', views.DeleteFile.as_view(), name='file_form_handle_delete_no_args'),
    url(r'^handle_delete/(?P<file_id>[\w-]+)$', views.DeleteFile.as_view(), name='file_form_handle_delete'),
)
