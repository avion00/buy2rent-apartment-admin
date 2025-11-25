#!/usr/bin/env python
"""
Script to create and run migrations for the updated product models
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line

def run_migrations():
    """Create and run migrations"""
    print("=== Creating and Running Migrations ===")
    
    try:
        # Create migrations for products app
        print("1. Creating migrations for products app...")
        execute_from_command_line(['manage.py', 'makemigrations', 'products'])
        
        # Run migrations
        print("2. Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migrations completed successfully!")
        
        # Show current migration status
        print("\n3. Current migration status:")
        execute_from_command_line(['manage.py', 'showmigrations', 'products'])
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = run_migrations()
    if not success:
        sys.exit(1)
