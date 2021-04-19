## Model forms

You can add a file upload to a `ModelForm` by setting the `field_classes` attribute:

```python
class ExampleModelForm(FileFormMixin, ModelForm):
    class Meta:
        model = Example
        fields = ("title", "input_file")
        field_classes = dict(
            input_file=UploadedFileField,
        )
```

Also see `ExampleModelForm` and `ExampleMultipleModelForm` in the test project.
