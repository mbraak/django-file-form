class AbstractUploadBackend:
    BUFFER_SIZE = 10485760  # 10MB

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def setup(self, filename, *args, **kwargs):
        """Responsible for doing any pre-processing needed before the upload
        starts."""

    def update_filename(self, request, filename, *args, **kwargs):
        """Returns a new name for the file being uploaded."""

    def upload_chunk(self, chunk, *args, **kwargs):
        """Called when a string was read from the client, responsible for writing that string to the destination file."""
        raise NotImplementedError

    def upload_complete(self, request, filename, file_id, *args, **kwargs):
        """Overriden to performs any actions needed post-upload, and returns
        a dict to be added to the render / json context"""

    def upload(self, uploaded, *args, **kwargs):
        try:
            for chunk in uploaded.chunks():
                self.upload_chunk(chunk, *args, **kwargs)

            return True
        except:
            # things went badly.
            return False
