from __future__ import print_function

from django.core.management.base import NoArgsCommand

from django_file_form.models import UploadedFile


class Command(NoArgsCommand):
    def handle_noargs(self, **options):
        deleted_files = UploadedFile.objects.delete_unused_files()

        verbosity = options.get('verbosity')
        if verbosity:
            if not deleted_files:
                print('No files deleted')
            else:
                print('Deleted files: %s' % ', '.join(deleted_files))