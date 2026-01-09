#!/usr/bin/env python
"""
Script to apply the UserSettings migration
Run this from the backend directory with the virtual environment activated
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def main():
    print("=" * 60)
    print("Applying UserSettings Migration")
    print("=" * 60)
    
    # Check if table already exists
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_settings';
        """)
        table_exists = cursor.fetchone() is not None
    
    if table_exists:
        print("✅ user_settings table already exists")
    else:
        print("Creating user_settings table...")
        
        # Create the table directly
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_settings (
                    id CHAR(36) PRIMARY KEY,
                    company VARCHAR(255) DEFAULT '',
                    job_title VARCHAR(255) DEFAULT '',
                    email_notifications BOOLEAN DEFAULT 1,
                    push_notifications BOOLEAN DEFAULT 1,
                    sms_notifications BOOLEAN DEFAULT 0,
                    order_updates BOOLEAN DEFAULT 1,
                    payment_alerts BOOLEAN DEFAULT 1,
                    delivery_notifications BOOLEAN DEFAULT 1,
                    vendor_messages BOOLEAN DEFAULT 1,
                    system_alerts BOOLEAN DEFAULT 1,
                    weekly_reports BOOLEAN DEFAULT 0,
                    monthly_reports BOOLEAN DEFAULT 1,
                    sound_enabled BOOLEAN DEFAULT 1,
                    desktop_notifications BOOLEAN DEFAULT 1,
                    theme VARCHAR(10) DEFAULT 'light',
                    compact_view BOOLEAN DEFAULT 0,
                    sidebar_collapsed BOOLEAN DEFAULT 0,
                    show_avatars BOOLEAN DEFAULT 1,
                    animations_enabled BOOLEAN DEFAULT 1,
                    language VARCHAR(5) DEFAULT 'en',
                    timezone VARCHAR(10) DEFAULT 'UTC+1',
                    date_format VARCHAR(15) DEFAULT 'YYYY-MM-DD',
                    time_format VARCHAR(5) DEFAULT '24h',
                    currency VARCHAR(5) DEFAULT 'HUF',
                    number_format VARCHAR(10) DEFAULT 'hu-HU',
                    two_factor_enabled BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_id CHAR(36) UNIQUE NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE
                );
            """)
        print("✅ user_settings table created successfully")
    
    # Record migration as applied
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT OR IGNORE INTO django_migrations (app, name, applied)
            VALUES ('accounts', '0002_usersettings', datetime('now'));
        """)
    
    print("✅ Migration recorded")
    print("=" * 60)
    print("Done! You can now use the Settings API.")
    print("=" * 60)

if __name__ == '__main__':
    main()
