from django.conf import settings


# Must the client be logged in for an upload or delete?
MUST_LOGIN = getattr(settings, 'FILE_FORM_MUST_LOGIN', False)
