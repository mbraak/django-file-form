from django.urls import path, include
from django.contrib import admin


handler403 = 'django_file_form_example.views.permission_denied'

urlpatterns = (
    path('admin/', admin.site.urls),
    path('', include('django_file_form.urls')),
    path('', include('django_file_form_example.urls')),
)
