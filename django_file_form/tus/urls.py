from django.urls import path
from .views import handle_upload, start_upload


urlpatterns = [
    path("", start_upload, name="tus_upload"),
    path("<str:resource_id>", handle_upload, name="tus_upload_chunks"),
]
