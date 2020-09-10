import os
from .settings_default import *


DEBUG = True

SECRET_KEY = 'test_key'

DJANGO_FILE_FORM_COVERAGE_JS = 'COVERAGE' in os.environ
