## Django admin

Use `FileFormAdmin` instead of `ModelAdmin` to support django-file-form uploads.

```python
from django_file_form.model_admin import FileFormAdmin

class ExampleAdmin(FileFormAdmin):
    pass

admin.site.register(Example, ExampleAdmin)
```

- Also see the testproject in the repository.
- Inline forms are not supported.
