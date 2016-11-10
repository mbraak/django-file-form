from __future__ import print_function

from django.core.management.base import BaseCommand

from django_file_form.models import UploadedFile


class Command(BaseCommand):
    def handle(self, *args, **options):
        deleted_files = UploadedFile.objects.delete_unused_files()

        verbosity = options.get('verbosity')
        if verbosity:
            if not deleted_files:
                print('No files deleted')
            else:
                print('Deleted files: {0!s}'.format(', '.join(deleted_files)))
