#!/usr/bin/env python
"""Verify user_settings table structure"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 60)
print("Verifying user_settings table")
print("=" * 60)

# Get table info
cursor.execute("PRAGMA table_info(user_settings);")
columns = cursor.fetchall()

if columns:
    print(f"Found {len(columns)} columns:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
else:
    print("Table not found or empty!")

# Check for any existing records
cursor.execute("SELECT COUNT(*) FROM user_settings;")
count = cursor.fetchone()[0]
print(f"\nExisting records: {count}")

conn.close()
print("=" * 60)
