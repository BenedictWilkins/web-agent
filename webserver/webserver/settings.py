from pathlib import Path

import os


# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR: Path = Path(__file__).resolve().parent.parent
WEB_AGENT_DIR: Path = Path(BASE_DIR, "web_agent_server")

# Quick-start development settings - unsuitable for production
# SECURITY WARNING: keep the secret key used in production secret!
# TODO: Change this in production. This is just for testing purposes. It can be safely committed to the repo.
SECRET_KEY: str = "cCqOwRaWU6d53sCjI8kh4m45kwm7EYNez_p5N6JqO2GTVMY1-g3zefTqQG-vsDArcBzvxIvrsZOQvEReC1bOfw"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG: bool = False

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# Application definition
INSTALLED_APPS: list[str] = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django_extensions"
]

MIDDLEWARE: list[str] = [
    "middleware.allow_requests.AllowRequestsMiddleware",
    "middleware.csp_manager.CSPMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "middleware.security_headers.SecurityHeadersMiddleware",
    "middleware.internal_errors_handler.InternalServerErrorMiddleware"
]

ROOT_URLCONF: str = "webserver.urls"

TEMPLATES: list[dict[str, str | list[str] | bool | dict[str, list[str]]]] = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.abspath(os.path.join(WEB_AGENT_DIR, "templates"))],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION: str = "webserver.wsgi.application"


# Database
DATABASES: dict[str, dict[str, str | Path]] = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS: list[dict[str, str]] = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization

LANGUAGE_CODE: str = "en-gb"
TIME_ZONE: str = "UTC"
USE_I18N: bool = True
USE_L10N: bool = True
USE_TZ: bool = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(WEB_AGENT_DIR, "static")]

# Default primary key field type

DEFAULT_AUTO_FIELD: str = "django.db.models.BigAutoField"

REPORTING_ENDPOINTS: dict[str, str] = {
    "csp": "/csp-endpoint",
    "coep": "/coep-endpoint",
    "coop": "/coop-endpoint"
}

# If `False``, the `Report-To` header will not be sent, and all the `report-to` directives will be replaced by `report-uri` directives.
REPORT_TO_ACTIVE: bool = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
