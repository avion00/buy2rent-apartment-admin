from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import LoginAttempt

User = get_user_model()


class PasswordResetRequestView(APIView):
    """
    Password reset request view - sends reset email
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Request Password Reset',
        description='Send password reset email to user',
        responses={
            200: OpenApiResponse(description='Password reset email sent'),
            400: OpenApiResponse(description='Invalid email format'),
        }
    )
    def post(self, request):
        """Request password reset"""
        try:
            email = request.data.get('email', '').strip().lower()
            
            if not email:
                return Response({
                    'error': 'Email Required',
                    'message': 'Please enter your email address.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            try:
                from django.core.validators import validate_email
                validate_email(email)
            except ValidationError:
                return Response({
                    'error': 'Invalid Email',
                    'message': 'Please enter a valid email address.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Always return success for security (don't reveal if email exists)
            try:
                user = User.objects.get(email=email, is_active=True)
                
                # Generate reset token
                import secrets
                reset_token = secrets.token_urlsafe(32)
                
                # Store reset token in cache (1 hour expiry)
                from django.core.cache import cache
                cache.set(f'password_reset_{reset_token}', user.id, timeout=3600)
                
                # For development, print reset link to console
                reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
                print(f"\n🔐 PASSWORD RESET LINK for {email}:")
                print(f"📧 {reset_link}")
                print("📝 Copy this link to reset password (valid for 1 hour)\n")
                
                # Log the reset request
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=True,
                    failure_reason="Password reset requested"
                )
                
            except User.DoesNotExist:
                # User doesn't exist, but don't reveal this for security
                pass
            
            return Response({
                'success': True,
                'message': 'If an account with this email exists, you will receive a password reset link shortly.',
                'note': 'For development: Check the console for the reset link.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Reset Failed',
                'message': 'An error occurred. Please try again.',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetConfirmView(APIView):
    """
    Password reset confirmation view - actually resets the password
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Confirm Password Reset',
        description='Reset password using token from email',
        responses={
            200: OpenApiResponse(description='Password reset successful'),
            400: OpenApiResponse(description='Invalid token or validation errors'),
        }
    )
    def post(self, request):
        """Confirm password reset"""
        try:
            token = request.data.get('token', '').strip()
            password = request.data.get('password', '')
            password_confirm = request.data.get('password_confirm', '')
            
            if not token:
                return Response({
                    'error': 'Token Required',
                    'message': 'Password reset token is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not password:
                return Response({
                    'error': 'Password Required',
                    'message': 'New password is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != password_confirm:
                return Response({
                    'error': 'Password Mismatch',
                    'message': 'Passwords do not match.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password strength
            try:
                from django.contrib.auth.password_validation import validate_password
                validate_password(password)
            except ValidationError as e:
                return Response({
                    'error': 'Weak Password',
                    'message': 'Password does not meet security requirements.',
                    'details': list(e.messages)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if token is valid
            from django.core.cache import cache
            user_id = cache.get(f'password_reset_{token}')
            
            if not user_id:
                return Response({
                    'error': 'Invalid Token',
                    'message': 'Password reset token is invalid or has expired.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user and reset password
            try:
                user = User.objects.get(id=user_id, is_active=True)
                user.set_password(password)
                user.save()
                
                # Invalidate the token
                cache.delete(f'password_reset_{token}')
                
                # Log the successful reset
                LoginAttempt.objects.create(
                    email=user.email,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=True,
                    failure_reason="Password reset completed"
                )
                
                return Response({
                    'success': True,
                    'message': 'Password has been reset successfully. You can now log in with your new password.'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    'error': 'User Not Found',
                    'message': 'User account not found or inactive.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': 'Reset Failed',
                'message': 'An error occurred while resetting your password. Please try again.',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
