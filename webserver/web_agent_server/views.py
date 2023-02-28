# Create your views here.

from django.http import HttpRequest, HttpResponse, JsonResponse, HttpResponseNotModified, FileResponse
from django.template.response import TemplateResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.static import was_modified_since
from django.conf import settings
from django.utils._os import safe_join
from django.utils.http import http_date

from json import loads
from posixpath import normpath
from pathlib import Path
from mimetypes import guess_type
from typing import Any, Type

from web_agent_server.utils import http403, http404
from .csp.reports import ReportsLogs


def index(request: HttpRequest) -> HttpResponse:
    return TemplateResponse(request=request, template="index.html", context={"nonce_value": "{nonce_value}"})

# We don't need to check for CSRF tokens here because this page is meant to be public for research purposes.
@csrf_exempt
def csp_endpoint(request: HttpRequest) -> JsonResponse | HttpResponse:
    if request.method == "GET":
        return JsonResponse({"reports": ReportsLogs.get_csp_reports()})
    elif request.method == "POST" and __validate_report(request.body, "csp-report"):
        result: bool = ReportsLogs.add_csp_report(loads(request.body))

        return JsonResponse({"result": result})
    else:
        return http403(request=request)

@csrf_exempt
def coep_endpoint(request: HttpRequest) -> JsonResponse | HttpResponse:
    if request.method == "GET":
        return JsonResponse({"reports": ReportsLogs.get_coep_reports()})
    elif request.method == "POST" and __validate_report(request.body, "coep-report"):
        result: bool = ReportsLogs.add_coep_report(loads(request.body))

        return JsonResponse({"result": result})
    else:
        return http403(request=request)

@csrf_exempt
def coop_endpoint(request: HttpRequest) -> JsonResponse | HttpResponse:
    if request.method == "GET":
        return JsonResponse({"reports": ReportsLogs.get_coop_reports()})
    elif request.method == "POST" and __validate_report(request.body, "coop-report"):
        result: bool = ReportsLogs.add_coop_report(loads(request.body))

        return JsonResponse({"result": result})
    else:
        return http403(request=request)

def static_files(request: HttpRequest) -> HttpResponse | FileResponse:
    path: str = normpath(request.path).lstrip("/")
    fullpath: Path = Path(safe_join(settings.STATICFILES_DIRS[0].replace("/static", ""), path))

    return __serve_static_file(request, fullpath)

def __serve_static_file(request: HttpRequest, fullpath: Path) -> HttpResponse | FileResponse:
    if fullpath.is_dir():
        return http403(request=request)

    if not fullpath.exists():
        return http404(request=request)

    # Respect the If-Modified-Since header.
    statobj = fullpath.stat()

    if not was_modified_since(request.META.get("HTTP_IF_MODIFIED_SINCE"), statobj.st_mtime):
        return HttpResponseNotModified()

    content_type, encoding = guess_type(str(fullpath))
    content_type = content_type or "application/octet-stream"
    response = FileResponse(fullpath.open("rb"), content_type=content_type)

    response["Last-Modified"] = http_date(statobj.st_mtime)

    if encoding:
        response["Content-Encoding"] = encoding

    return response

def favicon(request: HttpRequest) -> HttpResponse | FileResponse:
    path: str = normpath(request.path).lstrip("/")
    fullpath: Path = Path(safe_join(settings.STATICFILES_DIRS[0], "images", path))

    return __serve_static_file(request, fullpath)

def __validate_report(request_body: bytes, mandatory_report_key: str, allowed_inner_dict_values_types: list[Type[Any]]=[str, int]) -> bool:
    try:
        report: dict[Any, Any] = {**loads(request_body)}

        if mandatory_report_key not in report:
            return False

        if not isinstance(report[mandatory_report_key], dict):
            return False

        csp_report: dict[Any, Any] = report[mandatory_report_key]

        if any(not isinstance(key, str) for key in csp_report.keys()):
            return False

        if any(not isinstance(value, tuple(allowed_inner_dict_values_types)) for value in csp_report.values()):
            return False

        return True
    except Exception:
        return False