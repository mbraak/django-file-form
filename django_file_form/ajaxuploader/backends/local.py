from io import FileIO, BufferedWriter
import os

from django.conf import settings

from django_file_form.ajaxuploader.backends.base import AbstractUploadBackend


class LocalUploadBackend(AbstractUploadBackend):
    UPLOAD_DIR = getattr(settings, "UPLOAD_DIR", "uploads")

    def setup(self, filename, *args, **kwargs):
        self._path = self.get_path(filename, *args, **kwargs)
        try:
            os.makedirs(os.path.realpath(os.path.dirname(self._path)))
        except OSError:
            pass
        self._dest = BufferedWriter(FileIO(self._path, "w"))

    def get_path(self, filename, *args, **kwargs):
        return os.path.join(settings.MEDIA_ROOT, self.UPLOAD_DIR, filename)

    def upload_chunk(self, chunk, *args, **kwargs):
        self._dest.write(chunk)

    def upload_complete(self, request, filename, file_id, *args, **kwargs):
        path = settings.MEDIA_URL + self.UPLOAD_DIR + "/" + filename
        self._dest.close()
        return {"path": path}

    def update_filename(self, request, filename, *args, **kwargs):
        """
        Returns a new name for the file being uploaded.
        Ensure file with name doesn't exist, and if it does,
        create a unique filename to avoid overwriting
        """
        self._dir = os.path.dirname(self.get_path(filename, *args, **kwargs))
        unique_filename = False
        filename_suffix = 0

        # Check if file at filename exists
        if os.path.isfile(os.path.join(self._dir, filename)):
            while not unique_filename:
                try:
                    if filename_suffix == 0:
                        open(os.path.join(self._dir, filename))
                    else:
                        filename_no_extension, extension = os.path.splitext(filename)
                        open(os.path.join(self._dir, filename_no_extension + str(filename_suffix) + extension))
                    filename_suffix += 1
                except IOError:
                    unique_filename = True

        if filename_suffix == 0:
            return filename
        else:
            return filename_no_extension + str(filename_suffix) + extension
