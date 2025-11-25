#!/usr/bin/env python
"""
Simple migration fix - just fake the initial migration
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def fake_initial_migration():
    """Fake the initial accounts migration to fix dependencies"""
    print("🔧 Fixing migration dependencies...")
    
    try:
        # Create the accounts migration
        print("📝 Creating accounts migration...")
        execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
        
        # Fake apply the accounts migration (since auth_user table already exists)
        print("🔄 Fake applying accounts migration...")
        execute_from_command_line(['manage.py', 'migrate', 'accounts', '--fake-initial'])
        
        # Now apply all other migrations normally
        print("🔄 Applying remaining migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        return True
        
    except Exception as e:
        print(f"❌ Migration fix failed: {e}")
        return False

def test_user_creation():
    """Test if we can create users with the current setup"""
    print("🧪 Testing user creation...")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Try to create a simple user
        test_email = 'simple_test@example.com'
        
        # Remove if exists
        User.objects.filter(email=test_email).delete()
        
        # Create user with minimal fields
        user = User.objects.create_user(
            email=test_email,
            username='simpletest',
            password='TestPass123!'
        )
        
        print(f"✅ User created successfully: {user.email}")
        print(f"   ID: {user.id}")
        print(f"   Type: {type(user.id)}")
        
        return True
        
    except Exception as e:
        print(f"❌ User creation test failed: {e}")
        print("   This means the User model still has issues")
        return False

def main():
    """Main function"""
    print("🔧 Simple Migration Fix")
    print("=" * 40)
    
    setup_django()
    
    try:
        if not fake_initial_migration():
            print("❌ Migration fix failed")
            print("\n🔄 Try the complete fix instead:")
            print("   python fix_migration_dependencies.py")
            sys.exit(1)
        
        if not test_user_creation():
            print("❌ User creation still failing")
            print("\n🔄 Try the complete fix instead:")
            print("   python fix_migration_dependencies.py")
            sys.exit(1)
        
        print("\n✅ Simple fix completed!")
        print("\n🚀 Try registration now:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Try POST /auth/register/")
        
        print("\n📋 Use this JSON (minimal fields):")
        print("""{
  "email": "test@example.com",
  "username": "testuser",
  "first_name": "Test",
  "last_name": "User",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!"
}""")
        
    except Exception as e:
        print(f"❌ Simple fix failed: {e}")
        print("\n🔄 Try the complete fix:")
        print("   python fix_migration_dependencies.py")
        sys.exit(1)

if __name__ == '__main__':
    main()
