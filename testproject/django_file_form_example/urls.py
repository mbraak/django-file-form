from django.urls import path
from django.contrib.auth.views import LoginView

from . import views


urlpatterns = (
    path("", views.ExampleView.as_view(), name="example"),
    path("accept", views.WithAcceptExample.as_view(), name="with_accept_example"),
    path(
        "custom_widget",
        views.WithCustomWidgetExample.as_view(),
        name="with_custom_widget",
    ),
    path("disabled", views.DisabledExampleView.as_view(), name="disabled"),
    path("form_set", views.FormSetExampleView.as_view(), name="form_set_example"),
    path("login/", LoginView.as_view(template_name="admin/login.html")),
    path("model_form", views.CreateModelFormView.as_view(), name="model_form_create"),
    path(
        "model_form/<int:pk>",
        views.EditModelFormView.as_view(),
        name="model_form_update",
    ),
    path(
        "model_form_multiple",
        views.CreateModelFormMultipleView.as_view(),
        name="model_form_multiple_create",
    ),
    path(
        "model_form_multiple/<int:pk>",
        views.EditModelFormMultipleView.as_view(),
        name="model_form_multiple_update",
    ),
    path(
        "model_form_multiple_s3",
        views.CreateModelFormMultipleS3View.as_view(),
        name="model_form_multiple_s3_create",
    ),
    path(
        "model_form_multiple_s3_set",
        views.ModelFormMultipleS3SetView.as_view(),
        name="model_form_multiple_s3_set_create",
    ),
    path("multiple", views.MultipleExampleView.as_view(), name="multiple_example"),
    path(
        "multiple_without_js",
        views.MultipleWithoutJsExampleView.as_view(),
        name="multiple_without_js_example",
    ),
    path("placeholder", views.PlaceholderView.as_view(), name="placeholder_example"),
    path("s3single", views.S3SingleExampleView.as_view(), name="s3_example"),
    path("s3multiple", views.S3MultipleExampleView.as_view(), name="s3_example"),
    path(
        "s3placeholder",
        views.S3PlaceholderExampleView.as_view(),
        name="s3_placeholder_example",
    ),
    path("success", views.ExampleSuccessView.as_view(), name="example_success"),
    path("without_js", views.WithoutJsExampleView.as_view(), name="without_js_example"),
    path("wizard", views.WizardExampleview.as_view(), name="wizard_example"),
)
