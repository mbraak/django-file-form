from pathlib import Path
import logging
import os

def mkdir_p(path):
    if not path.exists():
        path.mkdir()


def resolve_paths():
    base_dir = Path(__file__).parent.parent.resolve()

    return str(base_dir.joinpath('media')), str(base_dir.joinpath('static'))


def create_media_paths(media_root):
    mkdir_p(media_root)
    mkdir_p(media_root.joinpath('example'))
    mkdir_p(media_root.joinpath('temp_uploads'))


DEBUG = True

DATABASES = dict(
    default=dict(
        # ENGINE='django.db.backends.postgresql',
        ENGINE='django.db.backends.sqlite3',
        NAME='example',
        USER='postgres',
        PASSWORD='',
        HOST='',
        PORT='',
    )
)

INSTALLED_APPS = [
    # Project app
    'django_file_form_example',

    # Generic apps
    'django_file_form',
    'formtools',

    # Django
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
]

MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'csp.middleware.CSPMiddleware',
]

STATIC_URL = '/static/'
ROOT_URLCONF = 'testproject.urls'


MEDIA_ROOT, STATIC_ROOT = resolve_paths()

create_media_paths(Path(MEDIA_ROOT))

USE_TZ = True

TEMPLATES = [
    dict(
        BACKEND='django.template.backends.django.DjangoTemplates',
        APP_DIRS=True,
        OPTIONS=dict(
            context_processors=[
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.request"
            ]
        )
    ),
]

ALLOWED_HOSTS = ['*']

CSP_DEFAULT_SRC = ("'none'",)
CSP_STYLE_SRC = ("'self'")
CSP_SCRIPT_SRC = ("'self'",)
CSP_FONT_SRC = ("'self'")
CSP_IMG_SRC = ("'self'",)
CSP_CONNECT_SRC = ("'self'", os.environ.get("AWS_S3_ENDPOINT_URL", "") or os.environ.get("DJANGO_AWS_S3_ENDPOINT_URL", "") )


AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', '')
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL', '')

logging.basicConfig(level='INFO')
