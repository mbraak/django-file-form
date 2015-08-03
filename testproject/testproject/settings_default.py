from pathlib import Path


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
TEMPLATE_DEBUG = DEBUG

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
    'django_file_form.ajaxuploader',
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

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

STATIC_URL = '/static/'
ROOT_URLCONF = 'testproject.urls'


MEDIA_ROOT, STATIC_ROOT = resolve_paths()

create_media_paths(Path(MEDIA_ROOT))


USE_TZ = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True
    }
]
