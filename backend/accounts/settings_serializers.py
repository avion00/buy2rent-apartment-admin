from rest_framework import serializers
from .settings_models import UserSettings


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user settings - full CRUD operations
    """
    # Read-only user info
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UserSettings
        fields = [
            'id',
            'user_email',
            'user_name',
            # Profile
            'company',
            'job_title',
            # Notification Channels
            'email_notifications',
            'push_notifications',
            'sms_notifications',
            # Notification Activity
            'order_updates',
            'payment_alerts',
            'delivery_notifications',
            'vendor_messages',
            'system_alerts',
            # Notification Reports
            'weekly_reports',
            'monthly_reports',
            # Notification Sound & Desktop
            'sound_enabled',
            'desktop_notifications',
            # Display
            'theme',
            'compact_view',
            'sidebar_collapsed',
            'show_avatars',
            'animations_enabled',
            # Regional
            'language',
            'timezone',
            'date_format',
            'time_format',
            'currency',
            'number_format',
            # Security
            'two_factor_enabled',
            # Timestamps
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_email', 'user_name', 'created_at', 'updated_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for notification settings only
    """
    class Meta:
        model = UserSettings
        fields = [
            # Notification Channels
            'email_notifications',
            'push_notifications',
            'sms_notifications',
            # Notification Activity
            'order_updates',
            'payment_alerts',
            'delivery_notifications',
            'vendor_messages',
            'system_alerts',
            # Notification Reports
            'weekly_reports',
            'monthly_reports',
            # Notification Sound & Desktop
            'sound_enabled',
            'desktop_notifications',
        ]


class DisplaySettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for display settings only
    """
    class Meta:
        model = UserSettings
        fields = [
            'theme',
            'compact_view',
            'sidebar_collapsed',
            'show_avatars',
            'animations_enabled',
        ]


class RegionalSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for regional settings only
    """
    class Meta:
        model = UserSettings
        fields = [
            'language',
            'timezone',
            'date_format',
            'time_format',
            'currency',
            'number_format',
        ]


class ProfileSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for additional profile settings
    """
    class Meta:
        model = UserSettings
        fields = [
            'company',
            'job_title',
        ]
