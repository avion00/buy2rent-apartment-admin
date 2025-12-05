from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_email', 'title', 'message',
            'notification_type', 'priority', 'related_object_type',
            'related_object_id', 'is_read', 'read_at', 'action_url',
            'action_text', 'metadata', 'time_ago', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_email', 'time_ago']
    
    def get_time_ago(self, obj):
        """Get human-readable time since notification was created"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days > 1 else ''} ago"
        else:
            return obj.created_at.strftime("%Y-%m-%d")


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'email_order_updates', 'email_delivery_updates',
            'email_payment_updates', 'email_issue_updates', 'email_system_messages',
            'app_enabled', 'app_order_updates', 'app_delivery_updates',
            'app_payment_updates', 'app_issue_updates', 'app_system_messages',
            'daily_digest', 'weekly_digest'
        ]


class CreateNotificationSerializer(serializers.Serializer):
    """Serializer for creating notifications programmatically"""
    user_id = serializers.UUIDField(required=False)
    user_email = serializers.EmailField(required=False)
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(
        choices=['info', 'success', 'warning', 'error', 'order', 
                'delivery', 'payment', 'issue', 'system'],
        default='info'
    )
    priority = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'urgent'],
        default='medium'
    )
    related_object_type = serializers.CharField(max_length=50, required=False)
    related_object_id = serializers.CharField(max_length=255, required=False)
    action_url = serializers.CharField(max_length=500, required=False)
    action_text = serializers.CharField(max_length=100, required=False)
    metadata = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data):
        if not data.get('user_id') and not data.get('user_email'):
            raise serializers.ValidationError(
                "Either user_id or user_email must be provided"
            )
        return data
