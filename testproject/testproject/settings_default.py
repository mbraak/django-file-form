import django

try:
    from pathlib import Path
except ImportError:
    from pathlib2 import Path


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
        ENGINE='django.db.backends.sqlite3',
        NAME='example.db',
        USER='',
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
    'django_tus',
    'django_bootstrap3_form',
    'django_pony_forms',

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
]

if django.VERSION[0:2] < (2, 0):
    MIDDLEWARE.append('django.contrib.auth.middleware.SessionAuthenticationMiddleware')

STATIC_URL = '/static/'
ROOT_URLCONF = 'testproject.urls'


MEDIA_ROOT, STATIC_ROOT = resolve_paths()

create_media_paths(Path(MEDIA_ROOT))

TUS_UPLOAD_DIR = Path(MEDIA_ROOT).joinpath('temp_uploads')
TUS_DESTINATION_DIR = TUS_UPLOAD_DIR

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
                "django.contrib.messages.context_processors.messages"
            ]
        )
    ),
]

ALLOWED_HOSTS = ['*']
