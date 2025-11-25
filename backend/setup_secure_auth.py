#!/usr/bin/env python
"""
Setup script for secure authentication system
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
    """Create migrations for the new authentication system"""
    print("🔧 Creating migrations for secure authentication...")
    
    # Remove old authentication app migrations if they exist
    auth_migrations_path = "authentication/migrations"
    if os.path.exists(auth_migrations_path):
        print("⚠️  Removing old authentication migrations...")
        import shutil
        shutil.rmtree(auth_migrations_path, ignore_errors=True)
    
    # Create migrations for accounts app
    print("📝 Creating migrations for accounts app...")
    execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
    
    # Create migrations for other apps
    apps = ['clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities']
    for app in apps:
        print(f"📝 Creating migrations for {app}...")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
        except Exception as e:
            print(f"⚠️  Warning for {app}: {e}")
    
    # Run general makemigrations
    print("📝 Running general makemigrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    print("🗄️  Applying all migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

def create_superuser():
    """Create superuser with UUID"""
    print("👤 Creating secure superuser...")
    
    from accounts.models import User
    
    if not User.objects.filter(email='admin@buy2rent.com').exists():
        user = User.objects.create_user(
            email='admin@buy2rent.com',
            username='admin',
            first_name='Admin',
            last_name='User',
            password='SecureAdmin123!',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"✅ Superuser created with UUID: {user.id}")
        print("📧 Email: admin@buy2rent.com")
        print("🔑 Password: SecureAdmin123!")
    else:
        print("✅ Superuser already exists")

def seed_sample_data():
    """Seed sample data with new user system"""
    print("🌱 Seeding sample data...")
    try:
        execute_from_command_line(['manage.py', 'seed_data'])
        print("✅ Sample data seeded successfully")
    except Exception as e:
        print(f"⚠️  Sample data seeding failed: {e}")
        print("You can run 'python manage.py seed_data' manually later")

def main():
    """Main setup function"""
    print("🔐 Buy2Rent Secure Authentication Setup")
    print("=" * 50)
    
    setup_django()
    
    try:
        create_migrations()
        create_superuser()
        seed_sample_data()
        
        print("\n" + "=" * 50)
        print("🎉 Secure authentication setup completed!")
        print("\n📋 What's new:")
        print("✅ UUID-based user IDs")
        print("✅ JWT Bearer token authentication")
        print("✅ Account lockout protection")
        print("✅ Strong password validation")
        print("✅ Session management")
        print("✅ Login attempt logging")
        print("✅ Enhanced security headers")
        
        print("\n🔑 Authentication Endpoints:")
        print("- POST /auth/login/ - Login with JWT")
        print("- POST /auth/refresh/ - Refresh JWT token")
        print("- POST /auth/register/ - Register new user")
        print("- POST /auth/logout/ - Logout and blacklist token")
        print("- GET /auth/profile/ - Get user profile")
        print("- POST /auth/change-password/ - Change password")
        print("- GET /auth/sessions/ - Manage user sessions")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Test authentication: http://localhost:8000/api/docs/")
        print("3. Admin panel: http://localhost:8000/admin/")
        print("   Email: admin@buy2rent.com")
        print("   Password: SecureAdmin123!")
        
        print("\n🔒 Security Features:")
        print("- Bearer token format: Authorization: Bearer <token>")
        print("- Account locks after 5 failed attempts")
        print("- Tokens expire in 1 hour (refresh in 7 days)")
        print("- All API endpoints require authentication")
        print("- Password must have uppercase, lowercase, number, special char")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
