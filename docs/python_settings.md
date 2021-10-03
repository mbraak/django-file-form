## Python settings

Settings in `settings.py`:

* **FILE_FORM_CACHE_TIMEOUT** (int)
    * Cache timeout in seconds
    * The Default is 24 hours

* **FILE_FORM_MUST_LOGIN** (True / False):
    * Must the user be logged in to upload a file.
    * The default is `False`.

* **FILE_FORM_UPLOAD_DIR** (string):
    * The directory for the temporary uploads.
    * The setting is relative to `MEDIA_ROOT`.
    * The default is `temp_uploads`.

* **FILE_FORM_FILE_STORAGE** (string):
    * Dotted path to the class that is used to store temporary uploads.
    * The default is `django.core.files.storage.FileSystemStorage`.
    * Note that files will be uploaded to the local file system first regardless. This storage backend will be used only for fully uploaded files that are then passed back to the form when it's submitted.

* **FILE_FORM_CACHE** (string):
    * Name of a cache backend defined in `settings.CACHES`.
    * The default is Django's `default` cache.
    * The cache is used to store data about files while they are being uploaded. If the default might be cleared while a file upload is in progress then using a different backend like django's database cache might be more appropriate. Note that `cache.clear()` will clear the whole cache at a specified `LOCATION` regardless what the `KEY_PREFIX` is.

* **FILE_UPLOAD_PERMISSIONS** (octal) [django-setting]:
    * This is a setting from the DJANGO core.
    * Sets the the permissions for the uploaded files, for example: 0o644.
    * [See more details](https://docs.djangoproject.com/en/3.1/ref/settings/#std:setting-FILE_UPLOAD_PERMISSIONS)
