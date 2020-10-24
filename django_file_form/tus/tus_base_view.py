import logging
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django_file_form import conf
from django_file_form.util import check_permission


logger = logging.getLogger(__name__)

tus_api_version = '1.0.0'
tus_api_version_supported = ['1.0.0', ]
tus_api_extensions = ['creation', 'termination', 'file-check']


def get_tus_response():
    response = HttpResponse()
    response['Tus-Resumable'] = tus_api_version
    response['Tus-Version'] = ",".join(tus_api_version_supported)
    response['Tus-Extension'] = ",".join(tus_api_extensions)
    response['Tus-Max-Size'] = conf.MAX_FILE_SIZE
    response['Access-Control-Allow-Origin'] = "*"
    response['Access-Control-Allow-Methods'] = "PATCH,HEAD,GET,POST,OPTIONS"
    response['Access-Control-Expose-Headers'] = "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset"
    response['Access-Control-Allow-Headers'] = "Tus-Resumable,upload-length,upload-metadata,Location,Upload-Offset,content-type"
    response['Cache-Control'] = 'no-store'

    return response


class TusBaseView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        check_permission(self.request)

        logger.info(f"TUS dispatch method={self.request.method}")

        return super(TusBaseView, self).dispatch(*args, **kwargs)