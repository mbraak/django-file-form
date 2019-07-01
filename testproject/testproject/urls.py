from django.conf.urls import url, include
from django.contrib import admin


handler403 = 'django_file_form_example.views.permission_denied'

urlpatterns = (
    url(r'^admin/', admin.site.urls),
    url(r'', include('django_file_form.urls')),
    url(r'', include('django_file_form_example.urls')),
)
