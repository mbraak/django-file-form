from django.contrib import admin
from django.urls import include, path

from django_file_form_example.views import admin_login

urlpatterns = (
    path("admin/login/", admin_login),
    path("admin/", admin.site.urls),
    path("", include("django_file_form.urls")),
    path("", include("django_file_form_example.urls")),
)
