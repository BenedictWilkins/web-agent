"""
WSGI config for webserver project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os

from django.core.wsgi import get_wsgi_application
from django.core.handlers.wsgi import WSGIHandler

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webserver.settings")

application: WSGIHandler = get_wsgi_application()
