from django.conf.urls import patterns, url, include
from django.contrib import admin


admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^upload/', include('django_file_form.urls')),
    url(r'', include('django_file_form_example.urls')),
)