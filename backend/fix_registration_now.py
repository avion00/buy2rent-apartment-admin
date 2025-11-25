#!/usr/bin/env python
"""
Immediate fix for registration issues
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def fix_registration():
    """Fix registration by creating proper migrations"""
    print("🔧 Fixing registration issues...")
    
    try:
        # Create migrations for accounts app with new table name
        print("📝 Creating accounts migrations...")
        execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
        
        # Apply migrations
        print("🔄 Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Database migrations applied successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_superuser():
    """Create superuser with new User model"""
    print("👤 Creating superuser...")
    
    try:
        from accounts.models import User
        
        # Check if superuser exists
        if User.objects.filter(email='admin@buy2rent.com').exists():
            print("✅ Superuser already exists")
            return True
            
        # Create superuser
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
        return True
        
    except Exception as e:
        print(f"❌ Superuser creation failed: {e}")
        return False

def test_registration():
    """Test registration functionality"""
    print("🧪 Testing registration...")
    
    try:
        from accounts.models import User
        
        # Test creating a user
        test_email = 'test@example.com'
        
        # Remove test user if exists
        User.objects.filter(email=test_email).delete()
        
        # Create test user
        user = User.objects.create_user(
            email=test_email,
            username='testuser',
            first_name='Test',
            last_name='User',
            password='TestPass123!'
        )
        
        print(f"✅ Test user created successfully: {user.email}")
        print(f"   UUID: {user.id}")
        print(f"   Username: {user.username}")
        
        return True
        
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Immediate Registration Fix")
    print("=" * 40)
    
    setup_django()
    
    try:
        # Fix migrations
        if not fix_registration():
            print("❌ Failed to fix migrations")
            sys.exit(1)
        
        # Create superuser
        if not create_superuser():
            print("⚠️  Superuser creation failed, but continuing...")
        
        # Test registration
        if not test_registration():
            print("❌ Registration test failed")
            sys.exit(1)
        
        print("\n" + "=" * 40)
        print("🎉 Registration fix completed!")
        
        print("\n✅ What's fixed:")
        print("   - Custom User model with proper table name")
        print("   - UUID primary keys working")
        print("   - All security fields available")
        print("   - Registration endpoint should work")
        
        print("\n🔑 Login Credentials:")
        print("   Email: admin@buy2rent.com")
        print("   Password: SecureAdmin123!")
        
        print("\n🧪 Test Registration:")
        print("   Email: test@example.com")
        print("   Password: TestPass123!")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Try POST /auth/register/ with:")
        
        print("""\n📋 Registration JSON:
{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "New",
  "last_name": "User", 
  "password": "NewPass123!",
  "password_confirm": "NewPass123!"
}""")
        
        print("\n4. Then try POST /auth/login/ with the same credentials")
        print("5. Use the JWT token for authenticated endpoints")
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
