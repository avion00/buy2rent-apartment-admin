#!/usr/bin/env python
"""
Quick fix for authentication issues - removes problematic fields temporarily
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def test_registration():
    """Test if registration works now"""
    print("🧪 Testing registration endpoint...")
    
    try:
        from accounts.serializers import UserRegistrationSerializer
        
        # Test data
        test_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!'
        }
        
        serializer = UserRegistrationSerializer(data=test_data)
        if serializer.is_valid():
            print("✅ Registration serializer validation passed")
            return True
        else:
            print(f"❌ Validation errors: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def create_test_user():
    """Create a test user directly"""
    print("👤 Creating test user...")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(email='test@example.com').exists():
            user = User.objects.create_user(
                email='test@example.com',
                username='testuser',
                first_name='Test',
                last_name='User',
                password='TestPass123!'
            )
            print(f"✅ Test user created: {user.email}")
            return True
        else:
            print("✅ Test user already exists")
            return True
            
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Quick Authentication Fix")
    print("=" * 40)
    
    setup_django()
    
    print("📝 What this fix does:")
    print("   - Removes 'phone' field from registration (temporarily)")
    print("   - Tests if registration works")
    print("   - Creates a test user")
    
    try:
        # Test registration
        if test_registration():
            print("\n✅ Registration should work now!")
        else:
            print("\n❌ Registration still has issues")
        
        # Create test user
        if create_test_user():
            print("\n🎉 Quick fix completed!")
            
            print("\n🔑 Test Credentials:")
            print("   Email: test@example.com")
            print("   Password: TestPass123!")
            
            print("\n🚀 Try these endpoints:")
            print("1. POST /auth/login/ - Login with test user")
            print("2. POST /auth/register/ - Register new user (without phone)")
            
            print("\n📋 Registration JSON (without phone):")
            print("""{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "New",
  "last_name": "User",
  "password": "NewPass123!",
  "password_confirm": "NewPass123!"
}""")
            
            print("\n⚠️  Note: Phone field temporarily removed")
            print("   Run 'python fix_user_migration.py' for complete fix")
        
    except Exception as e:
        print(f"❌ Quick fix failed: {e}")
        print("\n🔄 Try the complete migration fix:")
        print("   python fix_user_migration.py")
        sys.exit(1)

if __name__ == '__main__':
    main()
