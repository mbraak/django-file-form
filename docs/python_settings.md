## Python settings

Settings in `settings.py`:

* **FILE_FORM_CACHE_TIMEOUT** (int)
    * Cache timeout in seconds
    * The Default is 24 hours
    * A tus upload expires this many seconds after it is started. The `delete_unused_files` command deletes files of unfinished uploads after they expire.

* **FILE_FORM_MAX_UPLOAD_SIZE** (int)
    * Maximum size of an uploaded file in bytes.
    * The default is `None`: no maximum.
    * Applies to tus uploads (not to uploads to S3). An upload of a larger file is rejected with `413` before any data is sent, and the browser shows "Upload failed."
    * The tus server reports the maximum in the `Tus-Max-Size` header.
    * This doesn't validate the file in the form; use a validator on the form field for a proper error message.

* **FILE_FORM_MUST_LOGIN** (True / False):
    * Must the user be logged in to upload a file.
    * The default is `False`.

* **FILE_FORM_UPLOAD_DIR** (string):
    * The directory for the temporary uploads.
    * The setting is relative to `MEDIA_ROOT`.
    * The default is `temp_uploads`.

* **FILE_FORM_TEMP_STORAGE** (string):
    * Dotted path to the class that is used to store temporary uploads.
    * The default is `django.core.files.storage.FileSystemStorage`.
    * Note that files will be uploaded to the local file system first regardless. This storage backend will be used only for fully uploaded files that are then passed back to the form when it's submitted.

* **FILE_FORM_CACHE** (string):
    * Name of a cache backend defined in `settings.CACHES`.
    * The default is Django's `default` cache.
    * The cache is used to store data about files while they are being uploaded. If the default might be cleared while a file upload is in progress then using a different backend like the Django database cache might be more appropriate. Note that `cache.clear()` will clear the whole cache at a specified `LOCATION` regardless what the `KEY_PREFIX` is.
    * The cache must be shared between all processes and servers that handle uploads, so don't use local-memory caching (Django's default) in production. See 'Multiple processes or servers' in the 'Details' section.

* **FILE_UPLOAD_PERMISSIONS** (octal) [django-setting]:
    * This is a setting from the DJANGO core.
    * Sets the permissions for the uploaded files, for example: 0o644.
    * [See more details](https://docs.djangoproject.com/en/3.1/ref/settings/#std:setting-FILE_UPLOAD_PERMISSIONS)
