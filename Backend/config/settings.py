"""
Django settings for config project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# ---------------------------------------------------
# Base directory
# ---------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")


# ---------------------------------------------------
# Security
# ---------------------------------------------------
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-_*w3ls=^@)mq%njmm95u0lvslo^*jfqx3d+#ogpnu#ocr=juge"
)

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]


# ---------------------------------------------------
# Applications
# ---------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "corsheaders",
    "rest_framework",

    # Local apps
    "accounts.apps.AccountsConfig",
    "music",
]


# ---------------------------------------------------
# Middleware
# ---------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------------------------------------
# CORS (for React frontend)
# ---------------------------------------------------
# ---------------------------------------------------
# CORS
# ---------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "https://music-player-tune-hive.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "https://music-player-tune-hive.vercel.app",
]
# ---------------------------------------------------
# URL / WSGI
# ---------------------------------------------------
ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------
# Templates
# ---------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ---------------------------------------------------
# Database
# ---------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ---------------------------------------------------
# Custom user model
# ---------------------------------------------------
AUTH_USER_MODEL = "accounts.User"


# ---------------------------------------------------
# Password validation
# ---------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
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


# ---------------------------------------------------
# Internationalization
# ---------------------------------------------------
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ---------------------------------------------------
# Static files
# ---------------------------------------------------
STATIC_URL = "static/"


# ---------------------------------------------------
# Media files
# ---------------------------------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


# ---------------------------------------------------
# Django REST Framework
# ---------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


# ---------------------------------------------------
# JWT Settings
# ---------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


# ---------------------------------------------------
# Email Configuration
# ---------------------------------------------------
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend"
)

EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)


# ---------------------------------------------------
# OTP Settings
# ---------------------------------------------------
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5