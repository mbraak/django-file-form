## Internals

### The TemporaryUploadedFile model

The `django-file-form` app uses the `TemporaryUploadedFile` model internally for temporary storage. If you want to store files in the database, you should use
your own model for that. Also see the `Example` model in the `django_file_form_example` app.
