from django.core.management.base import BaseCommand

from django_file_form.models import TemporaryUploadedFile


class Command(BaseCommand):
    help = "Removes temporary uploaded files and records. Deletes if the file is created at least one day ago."

    def handle(self, *args, **options):
        deleted_files = TemporaryUploadedFile.objects.delete_unused_files()

        verbosity = options.get("verbosity")
        if verbosity:
            if not deleted_files:
                print("No files deleted")
            else:
                print("Deleted files: {0!s}".format(", ".join(deleted_files)))
