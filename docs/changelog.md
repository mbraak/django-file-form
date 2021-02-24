## Changelog

**development**

  * Issue #436: allow customization of the widget (thanks to Bo Peng)

**3.1.3 (19 january 2021)**

  * Issue #422: add model rename to migrations (thanks to Shrikrishna Singh)

**3.1.2 (27 december 2020)**

  * Issue #418: correctly remove upload

**3.1.1 (26 november 2020)**

  * Issue #388: add cross-site request forgery protection to tus uploads using the standard Django csrf token
  * Issue #393: fix delete-unused-files command (thanks to Seb Haase)
  * issue #401: optimization: use move instead of copy when possible

**3.1.0 (15 september 2020)**

  * Issue #324: get placeholder file for UploadWidget (thanks to Shrikrishna Singh)
  * Issue #330: allow upload directly to S3 compatible storages (thanks to Bo Peng)
  * Issue #331: fix error in deleting files (thanks to Bo Peng)
  * Issue #333: replace existing uploaded file with the same name (thanks to Bo Peng)
  * Issue #341: add javascript events (experimental)
  * Issue #346: allow definition of s3_upload_dir in form class (thanks to Bo Peng)

**3.0.1 (4 september 2020)**

  * Issue #347: add chunkSize parameter to avoid request error in Django

**3.0.0 (6 august 2020)**

  * Issue #320: fix UploadMultipleWidget to return correct placeholder files (thanks to Shrikrishna Singh)
  * Issue #325: support Django 3.1

**2.2.0 (22 july 2020)**

  * Issue #315: file is not removed after form error
  * Issue #313: allow using custom storage and custom cache (thanks to Balazs Endresz)

**2.1.3 (20 june 2020)**

  * Issue #304: rewrite frontend in typescript
  * Issue #305: don't change migration when setting changes (thanks to Lionqueen94)
  * Issue #307: add French translations; also make translations discoverable by makemessages (thanks to Simon Maillard)

**2.1.2 (20 april 2020)**

  * Issue #298: directory support for drop area
  * Issue #300: add migration so makemigrations will not create one (thanks to Lionqueen94)

**2.1.1 (7 april 2020)**

  * Issue #290: add javascript callbacks (thanks to Peter Dekkers)
  * Issue #296: fix progress bar
  * Issue #297: add retry delays

**2.1.0 (28 march 2020)**

  * Issue #266: allow relative `FILE_FORM_UPLOAD_DIR` setting (thanks to Bo Peng)
  * Issue #267: add drop area (thanks to Bo Peng)
  * Issue #275: show size of uploaded files (thanks to Bo Peng)
  * Issue #278: allow the addition of placeholder files (thanks to Bo Peng)
  * Issue #280: remove option `FILE_FORM_FILE_STORAGE`

**2.0.3 (15 february 2020)**

  * Issue #237: using with form set (thanks to Juan Carlos Carvajal)
  * Issue #259: include uncompressed js
  * Issue #260: correctly use formset prefix (thanks to Gzuba)
  * Issue #261: fix default for `FILE_FORM_UPLOAD_DIR` (thanks to Gzuba)

**2.0.2 (14 january 2020)**

  * Issue #247: support form wizard (thanks to Lionqueen94)
  * Issue #251: delete after submit

**2.0.1 (6 january 2020)**

  * Issue #240: add empty dff files div (thanks to Lionqueen94)
  * Issue #241: Csp compliance (thanks to Lionqueen94)

**2.0 (30 december 2019)**

  * Use tus instead of fine uploader

**1.0 (5 december 2019)**

  * Drop support for Python 2 and Django < 2
  * Issue #217: update fine uploader
  * Issue #219: use `Selenium` for all tests
  * Issue #222: use `pathlib2` (instead of pathlib)
  * Issue #235: support Django 3.0

**0.4.2 (3 March 2019)**

  * Issue #207: support form prefixes (thanks to Iw108)
  * Issue #201: fix multiple file upload without ajax (thanks to Lionqueen94)

**0.4.1 (5 January 2019)**

  * Issue #194: correctly call `is_authenticated` (thanks to Dureba)

**0.4.0 (3 August 2018)**

  * Support Django 2.1 and Python 3.7
  * Issue #173: add i18n to upload widget (thanks to Arman Roomana)

**0.3.0 (6 December 2017)**

  * Support Django 2.0
