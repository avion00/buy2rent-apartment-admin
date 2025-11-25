from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import LoginSerializer, UserSerializer, SignupSerializer


@extend_schema(
    tags=['Authentication'],
    summary='User Login',
    description='Authenticate user and create session',
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(response=UserSerializer, description='Login successful'),
        400: OpenApiResponse(description='Invalid credentials'),
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'message': 'Login successful'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Authentication'],
    summary='User Logout',
    description='Logout user and destroy session',
    responses={
        200: OpenApiResponse(description='Logout successful'),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})


@extend_schema(
    tags=['Authentication'],
    summary='Get User Profile',
    description='Get current user profile information',
    responses={
        200: OpenApiResponse(response=UserSerializer, description='User profile data'),
        401: OpenApiResponse(description='Authentication required'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema(
    tags=['Authentication'],
    summary='User Registration',
    description='Create new user account',
    request=SignupSerializer,
    responses={
        201: OpenApiResponse(response=UserSerializer, description='Account created successfully'),
        400: OpenApiResponse(description='Validation errors'),
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Authentication'],
    summary='Check Authentication Status',
    description='Check if user is authenticated and get user data',
    responses={
        200: OpenApiResponse(description='Authentication status and user data'),
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({
            'authenticated': True,
            'user': serializer.data
        })
    return Response({'authenticated': False})
