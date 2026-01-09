#!/usr/bin/env python
"""
Create migrations for all custom apps
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def create_migrations():
    """Create migrations for all custom apps"""
    print("🔧 Creating migrations for all custom apps...")
    
    # List of all custom apps
    apps = [
        'clients',
        'apartments', 
        'vendors',
        'products',
        'deliveries',
        'payments',
        'issues',
        'activities',
        'authentication'
    ]
    
    for app in apps:
        print(f"📝 Creating migrations for {app}...")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
            print(f"✅ Migrations created for {app}")
        except Exception as e:
            print(f"⚠️  Warning for {app}: {e}")
    
    # Run general makemigrations to catch any remaining changes
    print("📝 Running general makemigrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    print("\n🗄️  Applying all migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("\n✅ All migrations created and applied successfully!")

def main():
    """Main function"""
    print("🚀 Django Migrations Creator")
    print("=" * 40)
    
    setup_django()
    create_migrations()
    
    print("\n📋 Next steps:")
    print("1. python manage.py seed_data")
    print("2. python manage.py runserver")

if __name__ == '__main__':
    main()
