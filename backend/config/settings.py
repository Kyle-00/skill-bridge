import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core security
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-change-me-in-production',
)
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS', 'localhost,127.0.0.1'
).split(',')
ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS if h.strip()]

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'channels',

    # Local apps
    'accounts',
    'gigs',
    'projects',
    'orders',
    'reviews',
    'chat',
    'notifications',
    'analytics',
    'wallet',
    'matching',
    'uploads',
]

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv(
            'DATABASE_URL',
            'postgres://skill_user:12345678@localhost:5433/skillbridge_db',
        ),
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}

AUTH_USER_MODEL = 'accounts.User'

# ---------------------------------------------------------------------------
# REST framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

# ---------------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    if o.strip()
]
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
    if o.strip()
]

# ---------------------------------------------------------------------------
# Static and media files
# ---------------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# File uploads: S3 when configured, local filesystem otherwise.
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', '')
if AWS_STORAGE_BUCKET_NAME:
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = 'public-read'
    AWS_QUERYSTRING_AUTH = False
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }

BACKEND_ORIGIN = os.getenv('BACKEND_ORIGIN', '')
FILE_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = 26 * 1024 * 1024

# ---------------------------------------------------------------------------
# Channels (WebSocket)
# ---------------------------------------------------------------------------
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
        },
    },
}

# ---------------------------------------------------------------------------
# Default primary key field type
# ---------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Logging + Cache
# ---------------------------------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '{levelname} {asctime} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'skillbridge': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Redis cache when available (needed for M-Pesa callback mapping)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    }
} if os.getenv('REDIS_URL') else {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# ---------------------------------------------------------------------------
# Payment Gateways (Stripe & M-Pesa)
# ---------------------------------------------------------------------------
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', '')
MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE', '')
MPESA_PASSKEY = os.getenv('MPESA_PASSKEY', '')
MPESA_CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL', '')
MPESA_BASE_URL = os.getenv('MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke')
MPESA_INITIATOR_NAME = os.getenv('MPESA_INITIATOR_NAME', 'testapi')
MPESA_SECURITY_CREDENTIAL = os.getenv('MPESA_SECURITY_CREDENTIAL', '')