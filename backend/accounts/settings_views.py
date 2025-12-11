from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .settings_models import UserSettings
from .settings_serializers import (
    UserSettingsSerializer,
    NotificationSettingsSerializer,
    DisplaySettingsSerializer,
    RegionalSettingsSerializer,
    ProfileSettingsSerializer,
)


class UserSettingsView(APIView):
    """
    View for managing all user settings
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Settings'],
        summary='Get User Settings',
        description='Get all settings for the current user',
        responses={
            200: OpenApiResponse(response=UserSettingsSerializer, description='User settings'),
            401: OpenApiResponse(description='Authentication required'),
        }
    )
    def get(self, request):
        """Get current user's settings"""
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Settings'],
        summary='Update User Settings',
        description='Update all or partial settings for the current user',
        request=UserSettingsSerializer,
        responses={
            200: OpenApiResponse(response=UserSettingsSerializer, description='Settings updated'),
            400: OpenApiResponse(description='Validation errors'),
        }
    )
    def put(self, request):
        """Update current user's settings"""
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Settings updated successfully',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        tags=['Settings'],
        summary='Reset Settings to Default',
        description='Reset all settings to their default values',
        responses={
            200: OpenApiResponse(response=UserSettingsSerializer, description='Settings reset to defaults'),
        }
    )
    def delete(self, request):
        """Reset settings to defaults"""
        settings = UserSettings.get_or_create_for_user(request.user)
        settings.reset_to_defaults()
        serializer = UserSettingsSerializer(settings)
        return Response({
            'message': 'Settings reset to defaults',
            'settings': serializer.data
        })


class NotificationSettingsView(APIView):
    """
    View for managing notification settings only
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Settings'],
        summary='Get Notification Settings',
        description='Get notification preferences for the current user',
        responses={
            200: OpenApiResponse(response=NotificationSettingsSerializer, description='Notification settings'),
        }
    )
    def get(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = NotificationSettingsSerializer(settings)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Settings'],
        summary='Update Notification Settings',
        description='Update notification preferences',
        request=NotificationSettingsSerializer,
        responses={
            200: OpenApiResponse(response=NotificationSettingsSerializer, description='Settings updated'),
        }
    )
    def put(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Notification settings updated',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DisplaySettingsView(APIView):
    """
    View for managing display settings only
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Settings'],
        summary='Get Display Settings',
        description='Get display preferences for the current user',
        responses={
            200: OpenApiResponse(response=DisplaySettingsSerializer, description='Display settings'),
        }
    )
    def get(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = DisplaySettingsSerializer(settings)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Settings'],
        summary='Update Display Settings',
        description='Update display preferences',
        request=DisplaySettingsSerializer,
        responses={
            200: OpenApiResponse(response=DisplaySettingsSerializer, description='Settings updated'),
        }
    )
    def put(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = DisplaySettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Display settings updated',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegionalSettingsView(APIView):
    """
    View for managing regional settings only
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Settings'],
        summary='Get Regional Settings',
        description='Get regional preferences for the current user',
        responses={
            200: OpenApiResponse(response=RegionalSettingsSerializer, description='Regional settings'),
        }
    )
    def get(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = RegionalSettingsSerializer(settings)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Settings'],
        summary='Update Regional Settings',
        description='Update regional preferences',
        request=RegionalSettingsSerializer,
        responses={
            200: OpenApiResponse(response=RegionalSettingsSerializer, description='Settings updated'),
        }
    )
    def put(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = RegionalSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Regional settings updated',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileSettingsView(APIView):
    """
    View for managing additional profile settings (company, job title)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Settings'],
        summary='Get Profile Settings',
        description='Get additional profile settings for the current user',
        responses={
            200: OpenApiResponse(response=ProfileSettingsSerializer, description='Profile settings'),
        }
    )
    def get(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = ProfileSettingsSerializer(settings)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Settings'],
        summary='Update Profile Settings',
        description='Update additional profile settings',
        request=ProfileSettingsSerializer,
        responses={
            200: OpenApiResponse(response=ProfileSettingsSerializer, description='Settings updated'),
        }
    )
    def put(self, request):
        settings = UserSettings.get_or_create_for_user(request.user)
        serializer = ProfileSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile settings updated',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
