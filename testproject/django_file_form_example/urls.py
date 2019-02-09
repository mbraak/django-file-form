from django.conf.urls import url

from . import views


urlpatterns = (
    url(r'^$', views.ExampleView.as_view(), name='example'),
    url(r'^success$', views.ExampleSuccessView.as_view(), name='example_success'),
    url(r'^multiple$', views.MultipleExampleView.as_view(), name='multiple_example'),
    url(r'^multiple_without_js$', views.MultipleWithoutJsExampleView.as_view(), name='multiple_without_js_example'),
    url(r'^existing/(?P<id>\d+)$', views.ExistingFileExampleView.as_view(), name='existing_file_example'),
    url(r'^handle_upload$', views.handle_upload, name='example_handle_upload'),
)
