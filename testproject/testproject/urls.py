from django.conf.urls import url, include
from django.contrib import admin


urlpatterns = (
    url(r'^admin/', admin.site.urls),
    url(r'^upload/', include('django_file_form.urls')),
    url(r'', include('django_file_form_example.urls')),
)
