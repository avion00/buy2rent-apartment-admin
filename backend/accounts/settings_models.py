import uuid
from django.db import models
from django.conf import settings


class UserSettings(models.Model):
    """
    User settings and preferences model.
    Stores all user-specific settings for the application.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_settings'
    )
    
    # Additional Profile Fields
    company = models.CharField(max_length=255, blank=True, default='')
    job_title = models.CharField(max_length=255, blank=True, default='')
    
    # Notification Preferences - Channels
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Notification Preferences - Activity
    order_updates = models.BooleanField(default=True)
    payment_alerts = models.BooleanField(default=True)
    delivery_notifications = models.BooleanField(default=True)
    vendor_messages = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)
    
    # Notification Preferences - Reports
    weekly_reports = models.BooleanField(default=False)
    monthly_reports = models.BooleanField(default=True)
    
    # Notification Preferences - Sound & Desktop
    sound_enabled = models.BooleanField(default=True)
    desktop_notifications = models.BooleanField(default=True)
    
    # Display Settings
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    compact_view = models.BooleanField(default=False)
    sidebar_collapsed = models.BooleanField(default=False)
    show_avatars = models.BooleanField(default=True)
    animations_enabled = models.BooleanField(default=True)
    
    # Regional Settings
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('zh', 'Chinese'),
        ('ja', 'Japanese'),
        ('hu', 'Hungarian'),
    ]
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    
    TIMEZONE_CHOICES = [
        ('UTC-12', 'UTC-12:00 Baker Island'),
        ('UTC-11', 'UTC-11:00 American Samoa'),
        ('UTC-10', 'UTC-10:00 Hawaii'),
        ('UTC-9', 'UTC-09:00 Alaska'),
        ('UTC-8', 'UTC-08:00 Pacific Time'),
        ('UTC-7', 'UTC-07:00 Mountain Time'),
        ('UTC-6', 'UTC-06:00 Central Time'),
        ('UTC-5', 'UTC-05:00 Eastern Time'),
        ('UTC-4', 'UTC-04:00 Atlantic Time'),
        ('UTC-3', 'UTC-03:00 Buenos Aires'),
        ('UTC-2', 'UTC-02:00 Mid-Atlantic'),
        ('UTC-1', 'UTC-01:00 Azores'),
        ('UTC+0', 'UTC+00:00 London'),
        ('UTC+1', 'UTC+01:00 Paris/Budapest'),
        ('UTC+2', 'UTC+02:00 Cairo'),
        ('UTC+3', 'UTC+03:00 Moscow'),
        ('UTC+4', 'UTC+04:00 Dubai'),
        ('UTC+5', 'UTC+05:00 Pakistan'),
        ('UTC+5:45', 'UTC+05:45 Nepal'),
        ('UTC+6', 'UTC+06:00 Bangladesh'),
        ('UTC+7', 'UTC+07:00 Bangkok'),
        ('UTC+8', 'UTC+08:00 Singapore'),
        ('UTC+9', 'UTC+09:00 Tokyo'),
        ('UTC+10', 'UTC+10:00 Sydney'),
        ('UTC+11', 'UTC+11:00 Solomon Islands'),
        ('UTC+12', 'UTC+12:00 New Zealand'),
    ]
    timezone = models.CharField(max_length=10, choices=TIMEZONE_CHOICES, default='UTC+1')
    
    DATE_FORMAT_CHOICES = [
        ('MM/DD/YYYY', 'MM/DD/YYYY (12/31/2024)'),
        ('DD/MM/YYYY', 'DD/MM/YYYY (31/12/2024)'),
        ('YYYY-MM-DD', 'YYYY-MM-DD (2024-12-31)'),
        ('DD.MM.YYYY', 'DD.MM.YYYY (31.12.2024)'),
    ]
    date_format = models.CharField(max_length=15, choices=DATE_FORMAT_CHOICES, default='YYYY-MM-DD')
    
    TIME_FORMAT_CHOICES = [
        ('12h', '12-hour (3:30 PM)'),
        ('24h', '24-hour (15:30)'),
    ]
    time_format = models.CharField(max_length=5, choices=TIME_FORMAT_CHOICES, default='24h')
    
    CURRENCY_CHOICES = [
        ('USD', 'USD - US Dollar ($)'),
        ('EUR', 'EUR - Euro (€)'),
        ('GBP', 'GBP - British Pound (£)'),
        ('HUF', 'HUF - Hungarian Forint (Ft)'),
        ('JPY', 'JPY - Japanese Yen (¥)'),
        ('CNY', 'CNY - Chinese Yuan (¥)'),
        ('INR', 'INR - Indian Rupee (₹)'),
        ('CAD', 'CAD - Canadian Dollar ($)'),
        ('AUD', 'AUD - Australian Dollar ($)'),
    ]
    currency = models.CharField(max_length=5, choices=CURRENCY_CHOICES, default='HUF')
    
    NUMBER_FORMAT_CHOICES = [
        ('en-US', '1,234.56 (US)'),
        ('de-DE', '1.234,56 (German)'),
        ('fr-FR', '1 234,56 (French)'),
        ('en-IN', '1,23,456.78 (Indian)'),
        ('hu-HU', '1 234,56 (Hungarian)'),
    ]
    number_format = models.CharField(max_length=10, choices=NUMBER_FORMAT_CHOICES, default='hu-HU')
    
    # Security Settings
    two_factor_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_settings'
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'
    
    def __str__(self):
        return f"Settings for {self.user.email}"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create settings for a user"""
        settings, created = cls.objects.get_or_create(user=user)
        return settings
    
    def reset_to_defaults(self):
        """Reset all settings to default values"""
        # Notification defaults
        self.email_notifications = True
        self.push_notifications = True
        self.sms_notifications = False
        self.order_updates = True
        self.payment_alerts = True
        self.delivery_notifications = True
        self.vendor_messages = True
        self.system_alerts = True
        self.weekly_reports = False
        self.monthly_reports = True
        self.sound_enabled = True
        self.desktop_notifications = True
        
        # Display defaults
        self.theme = 'light'
        self.compact_view = False
        self.sidebar_collapsed = False
        self.show_avatars = True
        self.animations_enabled = True
        
        # Regional defaults
        self.language = 'en'
        self.timezone = 'UTC+1'
        self.date_format = 'YYYY-MM-DD'
        self.time_format = '24h'
        self.currency = 'HUF'
        self.number_format = 'hu-HU'
        
        self.save()
