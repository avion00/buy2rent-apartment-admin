#!/usr/bin/env python
"""
Django setup script for Buy2Rent Apartment Admin Backend
Run this script to set up the database and create initial data
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.conf import settings

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def run_migrations():
    """Run database migrations"""
    print("Creating database migrations...")
    
    # Create migrations for each app explicitly
    apps = ['clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities', 'authentication']
    
    for app in apps:
        print(f"Creating migrations for {app}...")
        execute_from_command_line(['manage.py', 'makemigrations', app])
    
    # Also run general makemigrations to catch any remaining changes
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    print("Applying database migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

def create_superuser():
    """Create superuser if it doesn't exist"""
    from django.contrib.auth.models import User
    
    if not User.objects.filter(username='admin').exists():
        print("Creating superuser (admin/admin123)...")
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser created successfully!")
    else:
        print("Superuser already exists.")

def seed_data():
    """Seed sample data"""
    print("Seeding sample data...")
    execute_from_command_line(['manage.py', 'seed_data'])

def main():
    """Main setup function"""
    print("=== Buy2Rent Backend Setup ===")
    
    setup_django()
    
    try:
        run_migrations()
        create_superuser()
        seed_data()
        
        print("\n✅ Setup completed successfully!")
        print("\nNext steps:")
        print("1. Run: python manage.py runserver")
        print("2. Test APIs in Swagger UI: http://localhost:8000/api/docs/")
        print("3. Browse API: http://localhost:8000/api/")
        print("4. Admin: http://localhost:8000/admin/ (admin/admin123)")
        print("\n📚 API Documentation:")
        print("- Swagger UI: http://localhost:8000/api/docs/")
        print("- ReDoc: http://localhost:8000/api/redoc/")
        print("- OpenAPI Schema: http://localhost:8000/api/schema/")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
