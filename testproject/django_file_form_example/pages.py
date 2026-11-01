from django.urls import reverse


class Page:
    def __init__(self, url_name, title, description="", show_in_index=True):
        self.url_name = url_name
        self.title = title
        self.description = description
        self.show_in_index = show_in_index

    @property
    def url(self):
        return reverse(self.url_name)


PAGE_GROUPS = [
    (
        "Forms",
        [
            Page("example", "Single file", "A form with a single file field."),
            Page(
                "multiple_example",
                "Multiple files",
                "A form with a field that accepts multiple files.",
            ),
            Page(
                "with_accept_example",
                "Accept attribute",
                "Restrict the accepted file types.",
            ),
            Page(
                "placeholder_example",
                "Placeholder files",
                "Show placeholder files as initial values.",
            ),
            Page(
                "with_custom_widget",
                "Custom widget",
                "Store metadata with each file using a custom widget.",
            ),
            Page("disabled", "Disabled field", "A disabled file field."),
            Page(
                "form_set_example",
                "Form set",
                "A form set with a file field in each form.",
            ),
            Page(
                "wizard_example",
                "Wizard",
                "A multi-step form using django-formtools.",
            ),
        ],
    ),
    (
        "Model forms",
        [
            Page(
                "model_form_create",
                "Model form",
                "Create a model instance with a file field.",
            ),
            Page(
                "model_form_multiple_create",
                "Model form with multiple files",
                "Create a model instance with related files.",
            ),
            Page("model_form_update", "Edit model form", show_in_index=False),
            Page(
                "model_form_multiple_update",
                "Edit model form with multiple files",
                show_in_index=False,
            ),
        ],
    ),
    (
        "Without JavaScript",
        [
            Page(
                "without_js_example",
                "Single file without JavaScript",
                "Plain file input, no ajax upload.",
            ),
            Page(
                "multiple_without_js_example",
                "Multiple files without JavaScript",
                "Plain multiple file input, no ajax upload.",
            ),
        ],
    ),
    (
        "S3",
        [
            Page("s3_example", "S3 single file", "Upload a single file to S3."),
            Page(
                "s3_multiple_example",
                "S3 multiple files",
                "Upload multiple files to S3.",
            ),
            Page(
                "s3_placeholder_example",
                "S3 placeholder files",
                "Placeholder files combined with S3 uploads.",
            ),
            Page(
                "model_form_multiple_s3_create",
                "S3 model form",
                "A model form with multiple files stored on S3.",
            ),
            Page(
                "model_form_multiple_s3_set_create",
                "S3 model form set",
                "A form set of model forms with files stored on S3.",
            ),
        ],
    ),
]

PAGE_TITLES = {page.url_name: page.title for _, pages in PAGE_GROUPS for page in pages}


def get_index_groups():
    return [
        (group_title, [page for page in pages if page.show_in_index])
        for group_title, pages in PAGE_GROUPS
    ]


def page_title(request):
    resolver_match = getattr(request, "resolver_match", None)
    url_name = resolver_match.url_name if resolver_match else None

    return {"page_title": PAGE_TITLES.get(url_name, "")}
