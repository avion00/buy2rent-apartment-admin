from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import logout
from django.utils import timezone
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiResponse
import uuid

from .models import User, UserSession, LoginAttempt
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    ChangePasswordSerializer
)


class SecureTokenObtainPairView(TokenObtainPairView):
    """
    Secure JWT token obtain view with enhanced security logging
    """
    serializer_class = UserLoginSerializer
    
    @extend_schema(
        tags=['Authentication'],
        summary='Login with JWT Token',
        description='Authenticate user and return JWT access and refresh tokens',
        request=UserLoginSerializer,
        responses={
            200: OpenApiResponse(description='Login successful with JWT tokens'),
            400: OpenApiResponse(description='Invalid credentials or validation errors'),
            423: OpenApiResponse(description='Account locked due to failed attempts'),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        try:
            # Validate without raising exception to handle errors gracefully
            if not serializer.is_valid():
                # Handle validation errors with user-friendly messages
                errors = serializer.errors
                
                # Check for common error types and provide friendly messages
                if 'non_field_errors' in errors:
                    error_msg = "Invalid email or password. Please check your credentials and try again."
                elif 'email' in errors:
                    error_msg = "Please enter a valid email address."
                elif 'password' in errors:
                    error_msg = "Password is required."
                else:
                    error_msg = "Please check your login credentials and try again."
                
                return Response({
                    'error': 'Login Failed',
                    'message': error_msg,
                    'details': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Create user session
            session = UserSession.objects.create(
                user=user,
                session_key=str(uuid.uuid4()),
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Add custom claims to token
            access_token['session_id'] = str(session.id)
            access_token['user_id'] = str(user.id)
            access_token['email'] = user.email
            
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
                'token_type': 'Bearer',
                'expires_in': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Login Failed',
                'message': 'An unexpected error occurred. Please try again.',
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


class SecureTokenRefreshView(TokenRefreshView):
    """
    Secure JWT token refresh view
    """
    @extend_schema(
        tags=['Authentication'],
        summary='Refresh JWT Token',
        description='Refresh JWT access token using refresh token',
        responses={
            200: OpenApiResponse(description='Token refreshed successfully'),
            401: OpenApiResponse(description='Invalid or expired refresh token'),
        }
    )
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except TokenError as e:
            return Response({
                'error': 'Token refresh failed',
                'detail': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class UserRegistrationView(APIView):
    """
    Secure user registration view - NO AUTHENTICATION REQUIRED
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Explicitly disable authentication
    
    @extend_schema(
        tags=['Authentication'],
        summary='User Registration (Public)',
        description='Register a new user account with strong password requirements. No authentication required.',
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(response=UserProfileSerializer, description='User created successfully'),
            400: OpenApiResponse(description='Validation errors'),
            409: OpenApiResponse(description='User already exists'),
            422: OpenApiResponse(description='Password validation failed'),
            500: OpenApiResponse(description='Internal server error'),
        }
    )
    def post(self, request):
        """Register a new user account"""
        try:
            # Validate request data
            if not request.data:
                return Response({
                    'error': 'Bad Request',
                    'message': 'Request body is required',
                    'details': {
                        'required_fields': ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize serializer
            serializer = UserRegistrationSerializer(data=request.data)
            
            if serializer.is_valid():
                try:
                    # Create user
                    user = serializer.save()
                    
                    # Log successful registration
                    LoginAttempt.objects.create(
                        email=user.email,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        success=True,
                        failure_reason="Registration Success"
                    )
                    
                    # Generate JWT tokens for immediate login
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    return Response({
                        'success': True,
                        'message': 'User registered successfully',
                        'user': UserProfileSerializer(user).data,
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh)
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    # Log failed registration attempt
                    email = request.data.get('email', 'unknown')
                    LoginAttempt.objects.create(
                        email=email,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        success=False,
                        failure_reason=f"Registration failed: {str(e)}"
                    )
                    
                    return Response({
                        'error': 'Registration Failed',
                        'message': 'Failed to create user account',
                        'details': str(e)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            else:
                # Handle validation errors
                email = request.data.get('email', 'unknown')
                
                # Log failed registration attempt
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=False,
                    failure_reason=f"Validation failed: {serializer.errors}"
                )
                
                # Format validation errors for better UX
                formatted_errors = {}
                for field, errors in serializer.errors.items():
                    if field == 'non_field_errors':
                        formatted_errors['general'] = errors
                    else:
                        formatted_errors[field] = errors[0] if isinstance(errors, list) else errors
                
                return Response({
                    'error': 'Validation Failed',
                    'message': 'Please correct the following errors',
                    'errors': formatted_errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            # Catch any unexpected errors
            return Response({
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred during registration',
                'details': str(e) if settings.DEBUG else 'Please try again later'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(APIView):
    """
    User profile management view
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Get User Profile',
        description='Get current user profile information',
        responses={
            200: OpenApiResponse(response=UserProfileSerializer, description='User profile data'),
            401: OpenApiResponse(description='Authentication required'),
        }
    )
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Authentication'],
        summary='Update User Profile',
        description='Update current user profile information',
        request=UserProfileSerializer,
        responses={
            200: OpenApiResponse(response=UserProfileSerializer, description='Profile updated successfully'),
            400: OpenApiResponse(description='Validation errors'),
        }
    )
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    Secure password change view
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Change Password',
        description='Change user password with current password verification',
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description='Password changed successfully'),
            400: OpenApiResponse(description='Validation errors'),
        }
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            
            # Invalidate all existing sessions
            UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
            
            return Response({
                'message': 'Password changed successfully. Please login again.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Secure logout view that blacklists refresh token
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Authentication'],
        summary='User Logout',
        description='Logout user and invalidate tokens',
        responses={
            200: OpenApiResponse(description='Logout successful'),
        }
    )
    def post(self, request):
        try:
            # Get refresh token from request
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Deactivate user session
            UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
            
            # Django logout
            logout(request)
            
            return Response({
                'message': 'Logout successful'
            })
        except Exception as e:
            return Response({
                'message': 'Logout completed',
                'note': 'Some tokens may still be valid until expiry'
            })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@extend_schema(
    tags=['Authentication'],
    summary='Check Authentication Status',
    description='Check if user is authenticated and get user data',
    responses={
        200: OpenApiResponse(description='Authentication status and user data'),
    }
)
def check_auth_status(request):
    """Check authentication status"""
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': UserProfileSerializer(request.user).data
        })
    return Response({
        'authenticated': False,
        'user': None
    })


class UserSessionsView(APIView):
    """
    View to manage user sessions
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Authentication'],
        summary='Get User Sessions',
        description='Get all active sessions for current user',
        responses={
            200: OpenApiResponse(description='List of user sessions'),
        }
    )
    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True)
        data = []
        for session in sessions:
            data.append({
                'id': session.id,
                'ip_address': session.ip_address,
                'user_agent': session.user_agent,
                'created_at': session.created_at,
                'last_activity': session.last_activity,
                'is_current': session.ip_address == self.get_client_ip(request)
            })
        return Response(data)
    
    @extend_schema(
        tags=['Authentication'],
        summary='Terminate Session',
        description='Terminate a specific user session',
        responses={
            200: OpenApiResponse(description='Session terminated'),
            404: OpenApiResponse(description='Session not found'),
        }
    )
    def delete(self, request, session_id):
        try:
            session = UserSession.objects.get(id=session_id, user=request.user)
            session.is_active = False
            session.save()
            return Response({'message': 'Session terminated'})
        except UserSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
