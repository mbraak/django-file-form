from django.urls import path


try:
    from . import views

    urlpatterns = [
        path("", views.create_upload, name="s3_upload"),
        path(
            "<upload_id>/",
            views.abort_upload,
            name="get_parts_or_abort_upload",
        ),
        path(
            "<upload_id>/<int:part_number>",
            views.sign_upload_part,
            name="sign_part_upload",
        ),
        path(
            "<upload_id>/complete",
            views.complete_upload,
            name="complete_multipart_upload",
        ),
    ]
except ImportError:  # pragma: no cover
    urlpatterns = []
