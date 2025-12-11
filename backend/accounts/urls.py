from django.urls import path
from .views import (
    SecureTokenObtainPairView,
    SecureTokenRefreshView,
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    LogoutView,
    UserSessionsView,
    check_auth_status
)
from .password_reset_views import (
    PasswordResetRequestView,
    PasswordResetConfirmView
)
from .settings_views import (
    UserSettingsView,
    NotificationSettingsView,
    DisplaySettingsView,
    RegionalSettingsView,
    ProfileSettingsView,
)

urlpatterns = [
    # Authentication endpoints
    path('login/', SecureTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', SecureTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('check/', check_auth_status, name='check_auth'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Password reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Session management
    path('sessions/', UserSessionsView.as_view(), name='user_sessions'),
    path('sessions/<uuid:session_id>/', UserSessionsView.as_view(), name='terminate_session'),
    
    # User Settings endpoints
    path('settings/', UserSettingsView.as_view(), name='user_settings'),
    path('settings/notifications/', NotificationSettingsView.as_view(), name='notification_settings'),
    path('settings/display/', DisplaySettingsView.as_view(), name='display_settings'),
    path('settings/regional/', RegionalSettingsView.as_view(), name='regional_settings'),
    path('settings/profile/', ProfileSettingsView.as_view(), name='profile_settings'),
]
