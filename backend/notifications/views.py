from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    NotificationPreferenceSerializer,
    CreateNotificationSerializer
)
from .utils import create_notification


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'priority', 'is_read']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return notifications for the current user only"""
        return Notification.objects.filter(user=self.request.user)
    
    @extend_schema(
        tags=['Notifications'],
        summary='List user notifications',
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Notifications'],
        summary='Get notification details',
    )
    def retrieve(self, request, *args, **kwargs):
        notification = self.get_object()
        # Automatically mark as read when viewed
        if not notification.is_read:
            notification.mark_as_read()
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Notifications'],
        summary='Delete notification',
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        tags=['Notifications'],
        summary='Mark notification as read',
    )
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        tags=['Notifications'],
        summary='Mark all notifications as read',
    )
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.count()
        notifications.update(is_read=True, read_at=timezone.now())
        return Response({
            'status': 'success',
            'marked_count': count
        })
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        tags=['Notifications'],
        summary='Get unread notification count',
    )
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        tags=['Notifications'],
        summary='Get recent notifications',
    )
    def recent(self, request):
        # Get last 10 notifications
        notifications = self.get_queryset()[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    @extend_schema(
        tags=['Notifications'],
        summary='Clear all read notifications',
    )
    def clear_read(self, request):
        deleted_count = self.get_queryset().filter(is_read=True).delete()[0]
        return Response({
            'status': 'success',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        tags=['Notifications'],
        summary='Get notifications by type',
    )
    def by_type(self, request):
        notification_type = request.query_params.get('type')
        if not notification_type:
            return Response(
                {'error': 'type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = self.get_queryset().filter(notification_type=notification_type)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class NotificationPreferenceViewSet(viewsets.GenericViewSet):
    """
    ViewSet for managing notification preferences
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Notifications'],
        summary='Get user notification preferences',
    )
    def list(self, request):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['Notifications'],
        summary='Update notification preferences',
    )
    def create(self, request):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        tags=['Notifications'],
        summary='Enable all notifications',
    )
    def enable_all(self, request):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        preferences.email_enabled = True
        preferences.app_enabled = True
        preferences.email_order_updates = True
        preferences.email_delivery_updates = True
        preferences.email_payment_updates = True
        preferences.email_issue_updates = True
        preferences.email_system_messages = True
        preferences.app_order_updates = True
        preferences.app_delivery_updates = True
        preferences.app_payment_updates = True
        preferences.app_issue_updates = True
        preferences.app_system_messages = True
        preferences.save()
        
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        tags=['Notifications'],
        summary='Disable all notifications',
    )
    def disable_all(self, request):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        preferences.email_enabled = False
        preferences.app_enabled = False
        preferences.save()
        
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
