## Upgrade from version 1.0 (to 2.0)

* Add reference to `file_form/file_form.css`:
    * `<link rel="stylesheet" href="{% static "file_form/file_form.css" %}">`
* Remove `django_file_form.ajaxuploader` from `INSTALLED_APPS` in your settings
* Remove reference to `ajaxuploader/js/fileuploader.js` in your template
* Remove reference to `ajaxuploader/css/fileuploader.css` in your template
* You don't have to include jQuery; the fileuploader doesn't use it
* The setting `FILE_FORM_UPLOAD_BACKEND` is removed
* If you use custom CSS, you might have to change it.
    * The HTML uses the prefix `dff` now.
