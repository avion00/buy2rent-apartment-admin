#!/usr/bin/env python
"""
Fix user migration issues by resetting database with new custom User model
"""

import os
import sys
import django
import shutil
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def backup_database():
    """Backup existing database"""
    if os.path.exists('db.sqlite3'):
        print("📦 Backing up existing database...")
        shutil.copy('db.sqlite3', 'db.sqlite3.backup')
        print("✅ Database backed up to db.sqlite3.backup")

def reset_migrations():
    """Reset all migrations"""
    print("🔄 Resetting migrations...")
    
    # Remove all migration files except __init__.py
    apps = ['accounts', 'clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities']
    
    for app in apps:
        migrations_dir = f"{app}/migrations"
        if os.path.exists(migrations_dir):
            print(f"🗑️  Removing {app} migrations...")
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file != '__init__.py':
                    os.remove(os.path.join(migrations_dir, file))
                elif file.endswith('.pyc'):
                    os.remove(os.path.join(migrations_dir, file))
    
    # Remove old authentication app migrations if exists
    if os.path.exists('authentication'):
        print("🗑️  Removing old authentication app...")
        shutil.rmtree('authentication', ignore_errors=True)

def create_fresh_database():
    """Create fresh database with new User model"""
    print("🗄️  Creating fresh database...")
    
    # Remove existing database
    if os.path.exists('db.sqlite3'):
        os.remove('db.sqlite3')
        print("✅ Old database removed")
    
    # Create new migrations
    print("📝 Creating new migrations...")
    
    # Create accounts migrations first (since other apps depend on User)
    execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
    
    # Create other app migrations
    apps = ['clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities']
    for app in apps:
        print(f"📝 Creating migrations for {app}...")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
        except Exception as e:
            print(f"⚠️  Warning for {app}: {e}")
    
    # Run general makemigrations
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    # Apply all migrations
    print("🔄 Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

def create_superuser():
    """Create new superuser with custom User model"""
    print("👤 Creating superuser...")
    
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
            is_active=True,
            is_email_verified=True
        )
        print(f"✅ Superuser created with UUID: {user.id}")
        print("📧 Email: admin@buy2rent.com")
        print("🔑 Password: SecureAdmin123!")
    else:
        print("✅ Superuser already exists")

def seed_sample_data():
    """Seed sample data"""
    print("🌱 Seeding sample data...")
    try:
        execute_from_command_line(['manage.py', 'seed_data'])
        print("✅ Sample data seeded successfully")
    except Exception as e:
        print(f"⚠️  Sample data seeding failed: {e}")
        print("You can run 'python manage.py seed_data' manually later")

def main():
    """Main function"""
    print("🔧 Fixing User Migration Issues")
    print("=" * 50)
    
    setup_django()
    
    try:
        # Ask for confirmation
        print("⚠️  This will:")
        print("   - Backup your current database")
        print("   - Reset all migrations")
        print("   - Create a fresh database with custom User model")
        print("   - Create new superuser")
        
        confirm = input("\nDo you want to continue? (y/N): ").lower().strip()
        if confirm != 'y':
            print("❌ Operation cancelled")
            return
        
        backup_database()
        reset_migrations()
        create_fresh_database()
        create_superuser()
        seed_sample_data()
        
        print("\n" + "=" * 50)
        print("🎉 User migration fix completed!")
        print("\n✅ What's fixed:")
        print("   - Custom User model with UUID primary key")
        print("   - All fields including phone, security fields")
        print("   - Proper database schema")
        print("   - Fresh migrations")
        
        print("\n🔑 Login Credentials:")
        print("   Email: admin@buy2rent.com")
        print("   Password: SecureAdmin123!")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Test registration: http://localhost:8000/api/docs/")
        print("3. Try /auth/register/ endpoint")
        
        print("\n📋 Test Registration Data:")
        print("""{
  "email": "test@example.com",
  "username": "testuser",
  "first_name": "Test",
  "last_name": "User",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!"
}""")
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Restore backup if exists
        if os.path.exists('db.sqlite3.backup'):
            print("🔄 Restoring database backup...")
            shutil.copy('db.sqlite3.backup', 'db.sqlite3')
            print("✅ Database restored from backup")
        
        sys.exit(1)

if __name__ == '__main__':
    main()
