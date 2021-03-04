from django.urls import include, path


urlpatterns = [
    path("upload/", include("django_file_form.tus.urls")),
    path("s3upload/", include("django_file_form.s3_multipart.urls")),
]
