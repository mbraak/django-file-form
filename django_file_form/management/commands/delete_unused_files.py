from django.core.management.base import BaseCommand

from django_file_form.models import TemporaryUploadedFile


class Command(BaseCommand):
    help = "Removes temporary uploaded files and records. Deletes if the file is created at least one day ago."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show which files would be deleted, without deleting them.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        deleted_files = TemporaryUploadedFile.objects.delete_unused_files(
            delete=not dry_run
        )

        verbosity = options.get("verbosity")
        if verbosity:
            if not deleted_files:
                self.stdout.write("No files deleted")
            elif dry_run:
                self.stdout.write(
                    f"Files that would be deleted: {', '.join(deleted_files)}"
                )
            else:
                self.stdout.write(f"Deleted files: {', '.join(deleted_files)}")
