from django.apps import AppConfig


class DjangoFileFormConfig(AppConfig):
    name = 'django_file_form'

    def ready(self):
        from . import signals
