# Generated migration for UserSettings model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('company', models.CharField(blank=True, default='', max_length=255)),
                ('job_title', models.CharField(blank=True, default='', max_length=255)),
                # Notification Channels
                ('email_notifications', models.BooleanField(default=True)),
                ('push_notifications', models.BooleanField(default=True)),
                ('sms_notifications', models.BooleanField(default=False)),
                # Notification Activity
                ('order_updates', models.BooleanField(default=True)),
                ('payment_alerts', models.BooleanField(default=True)),
                ('delivery_notifications', models.BooleanField(default=True)),
                ('vendor_messages', models.BooleanField(default=True)),
                ('system_alerts', models.BooleanField(default=True)),
                # Notification Reports
                ('weekly_reports', models.BooleanField(default=False)),
                ('monthly_reports', models.BooleanField(default=True)),
                # Notification Sound & Desktop
                ('sound_enabled', models.BooleanField(default=True)),
                ('desktop_notifications', models.BooleanField(default=True)),
                # Display Settings
                ('theme', models.CharField(choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')], default='light', max_length=10)),
                ('compact_view', models.BooleanField(default=False)),
                ('sidebar_collapsed', models.BooleanField(default=False)),
                ('show_avatars', models.BooleanField(default=True)),
                ('animations_enabled', models.BooleanField(default=True)),
                # Regional Settings
                ('language', models.CharField(choices=[('en', 'English'), ('es', 'Spanish'), ('fr', 'French'), ('de', 'German'), ('zh', 'Chinese'), ('ja', 'Japanese'), ('hu', 'Hungarian')], default='en', max_length=5)),
                ('timezone', models.CharField(choices=[('UTC-12', 'UTC-12:00 Baker Island'), ('UTC-11', 'UTC-11:00 American Samoa'), ('UTC-10', 'UTC-10:00 Hawaii'), ('UTC-9', 'UTC-09:00 Alaska'), ('UTC-8', 'UTC-08:00 Pacific Time'), ('UTC-7', 'UTC-07:00 Mountain Time'), ('UTC-6', 'UTC-06:00 Central Time'), ('UTC-5', 'UTC-05:00 Eastern Time'), ('UTC-4', 'UTC-04:00 Atlantic Time'), ('UTC-3', 'UTC-03:00 Buenos Aires'), ('UTC-2', 'UTC-02:00 Mid-Atlantic'), ('UTC-1', 'UTC-01:00 Azores'), ('UTC+0', 'UTC+00:00 London'), ('UTC+1', 'UTC+01:00 Paris/Budapest'), ('UTC+2', 'UTC+02:00 Cairo'), ('UTC+3', 'UTC+03:00 Moscow'), ('UTC+4', 'UTC+04:00 Dubai'), ('UTC+5', 'UTC+05:00 Pakistan'), ('UTC+5:45', 'UTC+05:45 Nepal'), ('UTC+6', 'UTC+06:00 Bangladesh'), ('UTC+7', 'UTC+07:00 Bangkok'), ('UTC+8', 'UTC+08:00 Singapore'), ('UTC+9', 'UTC+09:00 Tokyo'), ('UTC+10', 'UTC+10:00 Sydney'), ('UTC+11', 'UTC+11:00 Solomon Islands'), ('UTC+12', 'UTC+12:00 New Zealand')], default='UTC+1', max_length=10)),
                ('date_format', models.CharField(choices=[('MM/DD/YYYY', 'MM/DD/YYYY (12/31/2024)'), ('DD/MM/YYYY', 'DD/MM/YYYY (31/12/2024)'), ('YYYY-MM-DD', 'YYYY-MM-DD (2024-12-31)'), ('DD.MM.YYYY', 'DD.MM.YYYY (31.12.2024)')], default='YYYY-MM-DD', max_length=15)),
                ('time_format', models.CharField(choices=[('12h', '12-hour (3:30 PM)'), ('24h', '24-hour (15:30)')], default='24h', max_length=5)),
                ('currency', models.CharField(choices=[('USD', 'USD - US Dollar ($)'), ('EUR', 'EUR - Euro (€)'), ('GBP', 'GBP - British Pound (£)'), ('HUF', 'HUF - Hungarian Forint (Ft)'), ('JPY', 'JPY - Japanese Yen (¥)'), ('CNY', 'CNY - Chinese Yuan (¥)'), ('INR', 'INR - Indian Rupee (₹)'), ('CAD', 'CAD - Canadian Dollar ($)'), ('AUD', 'AUD - Australian Dollar ($)')], default='HUF', max_length=5)),
                ('number_format', models.CharField(choices=[('en-US', '1,234.56 (US)'), ('de-DE', '1.234,56 (German)'), ('fr-FR', '1 234,56 (French)'), ('en-IN', '1,23,456.78 (Indian)'), ('hu-HU', '1 234,56 (Hungarian)')], default='hu-HU', max_length=10)),
                # Security
                ('two_factor_enabled', models.BooleanField(default=False)),
                # Timestamps
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                # User relationship
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_settings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Settings',
                'verbose_name_plural': 'User Settings',
                'db_table': 'user_settings',
            },
        ),
    ]
