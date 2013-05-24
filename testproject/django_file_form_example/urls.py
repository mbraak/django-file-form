from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns(
    '',
    url(r'^$', views.ExampleView.as_view(), name='example'),
    url(r'^success$', views.ExampleSuccessView.as_view(), name='example_success'),
    url(r'^multiple$', views.MultipleExampleView.as_view(), name='multiple_example'),
)
