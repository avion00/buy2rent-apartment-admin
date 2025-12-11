#!/usr/bin/env python
"""
Create user_settings table directly using Python's sqlite3
No Django required - just run: python create_settings_table.py
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')

print("=" * 60)
print("Creating user_settings table")
print("=" * 60)
print(f"Database: {db_path}")

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if table already exists
cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='user_settings';
""")
table_exists = cursor.fetchone() is not None

if table_exists:
    print("Table 'user_settings' already exists!")
else:
    # Create the table
    cursor.execute("""
        CREATE TABLE user_settings (
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
    print("Table 'user_settings' created successfully!")

# Record migration as applied
try:
    cursor.execute("""
        INSERT OR IGNORE INTO django_migrations (app, name, applied)
        VALUES ('accounts', '0002_usersettings', datetime('now'));
    """)
    print("Migration recorded in django_migrations")
except Exception as e:
    print(f"Note: Could not record migration: {e}")

# Commit and close
conn.commit()
conn.close()

print("=" * 60)
print("Done! Restart your Django server to use the new table.")
print("=" * 60)
