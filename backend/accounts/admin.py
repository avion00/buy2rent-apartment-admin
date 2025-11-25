from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import User, UserSession, LoginAttempt


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Enhanced User admin with security features
    """
    list_display = [
        'email', 'username', 'full_name', 'is_active', 'is_staff', 
        'is_email_verified', 'failed_login_attempts', 'account_status',
        'last_login', 'created_at'
    ]
    list_filter = [
        'is_active', 'is_staff', 'is_superuser', 'is_email_verified',
        'created_at', 'last_login', 'failed_login_attempts'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'last_login', 'date_joined',
        'email_verification_token', 'password_reset_token', 'last_login_ip'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Personal Info', {
            'fields': ('id', 'email', 'username', 'first_name', 'last_name', 'phone', 'avatar')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Security', {
            'fields': (
                'is_email_verified', 'failed_login_attempts', 'account_locked_until',
                'last_password_change', 'force_password_change', 'last_login_ip'
            ),
        }),
        ('Tokens', {
            'fields': ('email_verification_token', 'password_reset_token', 'password_reset_expires'),
            'classes': ('collapse',),
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
        }),
    )
    
    add_fieldsets = (
        ('Create User', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    def account_status(self, obj):
        """Display account status with color coding"""
        if obj.is_account_locked():
            return format_html(
                '<span style="color: red; font-weight: bold;">🔒 LOCKED</span>'
            )
        elif not obj.is_active:
            return format_html(
                '<span style="color: orange; font-weight: bold;">⚠️ INACTIVE</span>'
            )
        elif obj.failed_login_attempts > 0:
            return format_html(
                '<span style="color: orange;">⚠️ {} Failed Attempts</span>',
                obj.failed_login_attempts
            )
        else:
            return format_html(
                '<span style="color: green;">✅ ACTIVE</span>'
            )
    account_status.short_description = 'Account Status'
    
    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Full Name'
    
    actions = ['unlock_accounts', 'lock_accounts', 'reset_failed_attempts']
    
    def unlock_accounts(self, request, queryset):
        """Unlock selected user accounts"""
        count = 0
        for user in queryset:
            if user.is_account_locked():
                user.unlock_account()
                count += 1
        self.message_user(request, f'{count} accounts unlocked successfully.')
    unlock_accounts.short_description = "Unlock selected accounts"
    
    def lock_accounts(self, request, queryset):
        """Lock selected user accounts"""
        count = 0
        for user in queryset:
            if not user.is_account_locked():
                user.lock_account(60)  # Lock for 1 hour
                count += 1
        self.message_user(request, f'{count} accounts locked successfully.')
    lock_accounts.short_description = "Lock selected accounts (1 hour)"
    
    def reset_failed_attempts(self, request, queryset):
        """Reset failed login attempts"""
        count = queryset.filter(failed_login_attempts__gt=0).update(failed_login_attempts=0)
        self.message_user(request, f'Reset failed attempts for {count} accounts.')
    reset_failed_attempts.short_description = "Reset failed login attempts"


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    User session admin for monitoring active sessions
    """
    list_display = [
        'user', 'ip_address', 'user_agent_short', 'is_active', 
        'created_at', 'last_activity', 'session_duration'
    ]
    list_filter = ['is_active', 'created_at', 'last_activity']
    search_fields = ['user__email', 'ip_address', 'user_agent']
    readonly_fields = ['id', 'created_at', 'session_duration']
    ordering = ['-last_activity']
    
    def user_agent_short(self, obj):
        """Display shortened user agent"""
        return obj.user_agent[:50] + '...' if len(obj.user_agent) > 50 else obj.user_agent
    user_agent_short.short_description = 'User Agent'
    
    def session_duration(self, obj):
        """Calculate session duration"""
        if obj.is_active:
            duration = timezone.now() - obj.created_at
        else:
            duration = obj.last_activity - obj.created_at
        
        days = duration.days
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    session_duration.short_description = 'Duration'
    
    actions = ['terminate_sessions']
    
    def terminate_sessions(self, request, queryset):
        """Terminate selected sessions"""
        count = queryset.filter(is_active=True).update(is_active=False)
        self.message_user(request, f'{count} sessions terminated.')
    terminate_sessions.short_description = "Terminate selected sessions"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """
    Login attempt admin for security monitoring
    """
    list_display = [
        'email', 'ip_address', 'success_status', 'failure_reason', 
        'timestamp', 'user_agent_short'
    ]
    list_filter = ['success', 'timestamp', 'failure_reason']
    search_fields = ['email', 'ip_address', 'failure_reason']
    readonly_fields = ['id', 'timestamp']
    ordering = ['-timestamp']
    
    def success_status(self, obj):
        """Display success status with color coding"""
        if obj.success:
            return format_html(
                '<span style="color: green; font-weight: bold;">✅ SUCCESS</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">❌ FAILED</span>'
            )
    success_status.short_description = 'Status'
    
    def user_agent_short(self, obj):
        """Display shortened user agent"""
        return obj.user_agent[:30] + '...' if len(obj.user_agent) > 30 else obj.user_agent
    user_agent_short.short_description = 'User Agent'
    
    def has_add_permission(self, request):
        """Disable manual addition of login attempts"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable editing of login attempts"""
        return False
