from django.conf.urls import patterns, url

from . import views


urlpatterns = patterns(
    '',
    url(r'^$', views.ExampleFormView.as_view(), name='example_form'),
    url(r'^success$', views.ExampleSuccess.as_view(), name='example_success'),
    url(r'^multiple$', views.MultipleExampleForm.as_view(), name='multiple_example_form'),
)
