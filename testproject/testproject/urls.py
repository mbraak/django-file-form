from django.urls import path, include
from django.contrib import admin


urlpatterns = (
    path("admin/", admin.site.urls),
    path("", include("django_file_form.urls")),
    path("", include("django_file_form_example.urls")),
)
