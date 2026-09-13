from django.contrib import admin
from django.urls import include, path

urlpatterns = (
    path("admin/", admin.site.urls),
    path("", include("django_file_form.urls")),
    path("", include("django_file_form_example.urls")),
)
