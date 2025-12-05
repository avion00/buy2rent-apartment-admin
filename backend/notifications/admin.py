from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'title', 'message')
        }),
        ('Type & Priority', {
            'fields': ('notification_type', 'priority')
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id')
        }),
        ('Action', {
            'fields': ('action_url', 'action_text')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_enabled', 'app_enabled', 'daily_digest', 'weekly_digest']
    list_filter = ['email_enabled', 'app_enabled', 'daily_digest', 'weekly_digest']
    search_fields = ['user__email']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Notifications', {
            'fields': (
                'email_enabled',
                'email_order_updates',
                'email_delivery_updates',
                'email_payment_updates',
                'email_issue_updates',
                'email_system_messages'
            )
        }),
        ('In-App Notifications', {
            'fields': (
                'app_enabled',
                'app_order_updates',
                'app_delivery_updates',
                'app_payment_updates',
                'app_issue_updates',
                'app_system_messages'
            )
        }),
        ('Digest Settings', {
            'fields': ('daily_digest', 'weekly_digest')
        }),
    )
