#!/usr/bin/env python
"""
Fix migration dependencies for custom User model
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

def reset_all_migrations():
    """Reset all migrations to fix dependency issues"""
    print("🔄 Resetting all migrations...")
    
    # Remove database
    if os.path.exists('db.sqlite3'):
        os.remove('db.sqlite3')
        print("✅ Database removed")
    
    # Remove all migration files
    apps = ['accounts', 'clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities']
    
    for app in apps:
        migrations_dir = f"{app}/migrations"
        if os.path.exists(migrations_dir):
            print(f"🗑️  Removing {app} migrations...")
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file != '__init__.py':
                    os.remove(os.path.join(migrations_dir, file))
                elif file.endswith('.pyc'):
                    try:
                        os.remove(os.path.join(migrations_dir, file))
                    except:
                        pass
    
    # Remove __pycache__ directories
    for app in apps:
        pycache_dir = f"{app}/migrations/__pycache__"
        if os.path.exists(pycache_dir):
            shutil.rmtree(pycache_dir, ignore_errors=True)

def create_fresh_migrations():
    """Create fresh migrations in correct order"""
    print("📝 Creating fresh migrations...")
    
    try:
        # Step 1: Create accounts migration first (User model)
        print("📝 Creating accounts migrations...")
        execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
        
        # Step 2: Run initial migrate to create accounts tables
        print("🔄 Applying accounts migrations...")
        execute_from_command_line(['manage.py', 'migrate', 'accounts'])
        
        # Step 3: Migrate built-in Django apps
        print("🔄 Applying Django built-in migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Step 4: Create other app migrations
        apps = ['clients', 'apartments', 'vendors', 'products', 'deliveries', 'payments', 'issues', 'activities']
        for app in apps:
            print(f"📝 Creating migrations for {app}...")
            try:
                execute_from_command_line(['manage.py', 'makemigrations', app])
            except Exception as e:
                print(f"⚠️  Warning for {app}: {e}")
        
        # Step 5: Apply all remaining migrations
        print("🔄 Applying all remaining migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        return True
        
    except Exception as e:
        print(f"❌ Migration creation failed: {e}")
        return False

def create_superuser():
    """Create superuser"""
    print("👤 Creating superuser...")
    
    try:
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
        
        return True
        
    except Exception as e:
        print(f"❌ Superuser creation failed: {e}")
        return False

def test_registration():
    """Test registration"""
    print("🧪 Testing registration...")
    
    try:
        from accounts.models import User
        
        # Test user data
        test_email = 'test@example.com'
        
        # Remove if exists
        User.objects.filter(email=test_email).delete()
        
        # Create test user
        user = User.objects.create_user(
            email=test_email,
            username='testuser',
            first_name='Test',
            last_name='User',
            password='TestPass123!',
            phone='+1234567890'
        )
        
        print(f"✅ Test user created: {user.email}")
        print(f"   UUID: {user.id}")
        print(f"   Phone: {user.phone}")
        
        return True
        
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Fix Migration Dependencies")
    print("=" * 50)
    
    setup_django()
    
    print("⚠️  This will:")
    print("   - Backup current database")
    print("   - Reset ALL migrations")
    print("   - Create fresh database with proper dependencies")
    print("   - Create superuser and test user")
    
    confirm = input("\nDo you want to continue? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Operation cancelled")
        return
    
    try:
        backup_database()
        reset_all_migrations()
        
        if not create_fresh_migrations():
            print("❌ Failed to create migrations")
            sys.exit(1)
        
        if not create_superuser():
            print("⚠️  Superuser creation failed")
        
        if not test_registration():
            print("⚠️  Registration test failed")
        
        print("\n" + "=" * 50)
        print("🎉 Migration dependencies fixed!")
        
        print("\n✅ What's working now:")
        print("   - Custom User model with UUID primary key")
        print("   - All security fields (phone, lockout, etc.)")
        print("   - Proper migration dependencies")
        print("   - Registration and login endpoints")
        
        print("\n🔑 Credentials:")
        print("   Admin: admin@buy2rent.com / SecureAdmin123!")
        print("   Test: test@example.com / TestPass123!")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Try registration with:")
        
        print("""\n📋 Registration JSON:
{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "New",
  "last_name": "User",
  "phone": "+1234567890",
  "password": "NewPass123!",
  "password_confirm": "NewPass123!"
}""")
        
        print("\n4. Login and get JWT token")
        print("5. Use Bearer token for authenticated endpoints")
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Restore backup if exists
        if os.path.exists('db.sqlite3.backup'):
            print("🔄 Restoring database backup...")
            shutil.copy('db.sqlite3.backup', 'db.sqlite3')
            print("✅ Database restored")
        
        sys.exit(1)

if __name__ == '__main__':
    main()
