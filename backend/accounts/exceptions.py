"""
Custom exceptions for enhanced error handling
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for professional error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get the view and request from context
    view = context.get('view', None)
    request = context.get('request', None)
    
    # Log the exception
    logger.error(f"Exception in {view.__class__.__name__ if view else 'Unknown'}: {exc}")
    
    if response is not None:
        # Customize the error response format
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': {},
            'status_code': response.status_code
        }
        
        if response.status_code == 400:
            custom_response_data['message'] = 'Validation failed'
            custom_response_data['details'] = response.data
            
        elif response.status_code == 401:
            custom_response_data['message'] = 'Authentication required'
            custom_response_data['details'] = {
                'auth_required': True,
                'message': 'Please provide valid authentication credentials'
            }
            
        elif response.status_code == 403:
            custom_response_data['message'] = 'Permission denied'
            custom_response_data['details'] = {
                'permission_denied': True,
                'message': 'You do not have permission to perform this action'
            }
            
        elif response.status_code == 404:
            custom_response_data['message'] = 'Resource not found'
            custom_response_data['details'] = {
                'not_found': True,
                'message': 'The requested resource was not found'
            }
            
        elif response.status_code == 405:
            custom_response_data['message'] = 'Method not allowed'
            custom_response_data['details'] = {
                'method_not_allowed': True,
                'allowed_methods': response.data.get('detail', '')
            }
            
        elif response.status_code == 429:
            custom_response_data['message'] = 'Rate limit exceeded'
            custom_response_data['details'] = {
                'rate_limited': True,
                'message': 'Too many requests. Please try again later.'
            }
            
        elif response.status_code >= 500:
            custom_response_data['message'] = 'Internal server error'
            custom_response_data['details'] = {
                'server_error': True,
                'message': 'An unexpected error occurred. Please try again later.'
            }
        
        response.data = custom_response_data
        
    else:
        # Handle exceptions not caught by DRF
        if isinstance(exc, ValidationError):
            custom_response_data = {
                'error': True,
                'message': 'Validation error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
                'status_code': 400
            }
            response = Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)
            
        elif isinstance(exc, IntegrityError):
            custom_response_data = {
                'error': True,
                'message': 'Database integrity error',
                'details': {
                    'integrity_error': True,
                    'message': 'This operation would violate database constraints'
                },
                'status_code': 409
            }
            response = Response(custom_response_data, status=status.HTTP_409_CONFLICT)
            
        else:
            # Generic server error
            custom_response_data = {
                'error': True,
                'message': 'Internal server error',
                'details': {
                    'server_error': True,
                    'message': 'An unexpected error occurred'
                },
                'status_code': 500
            }
            response = Response(custom_response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return response


class AuthenticationError(Exception):
    """Custom authentication error"""
    pass


class ValidationError(Exception):
    """Custom validation error"""
    pass


class PermissionError(Exception):
    """Custom permission error"""
    pass


class BusinessLogicError(Exception):
    """Custom business logic error"""
    pass
