# Temporary production settings with authentication disabled
# WARNING: This is for testing only - re-enable authentication for production use!

from .settings import *

# Override REST Framework settings to disable authentication temporarily
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Temporarily allow all requests
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'EXCEPTION_HANDLER': 'accounts.exceptions.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Ensure CORS is properly configured for production
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins
CORS_ALLOW_CREDENTIALS = True

print("⚠️  WARNING: Running with authentication disabled - FOR TESTING ONLY!")
