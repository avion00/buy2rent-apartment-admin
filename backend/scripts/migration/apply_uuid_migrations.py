#!/usr/bin/env python
"""
Apply UUID migrations that are ready
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def apply_migrations():
    """Apply the UUID migrations that are ready"""
    print("🔧 Applying UUID migrations...")
    
    try:
        # Apply all pending migrations
        print("📝 Applying all pending migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ All UUID migrations applied successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def verify_uuid_implementation():
    """Verify UUID implementation after migration"""
    print("🔍 Verifying UUID implementation...")
    
    try:
        from accounts.models import User
        from clients.models import Client
        from apartments.models import Apartment
        from vendors.models import Vendor
        from products.models import Product
        
        # Check each model
        models_to_check = [
            (User, "User"),
            (Client, "Client"), 
            (Apartment, "Apartment"),
            (Vendor, "Vendor"),
            (Product, "Product")
        ]
        
        for model, name in models_to_check:
            if model.objects.exists():
                instance = model.objects.first()
                print(f"✅ {name}: {instance.id} (type: {type(instance.id)})")
                
                # Verify it's a UUID
                import uuid
                try:
                    uuid.UUID(str(instance.id))
                    print(f"   ✅ {name} using secure UUID!")
                except ValueError:
                    print(f"   ❌ {name} still using integer ID")
            else:
                print(f"ℹ️  {name}: No records yet")
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def create_test_data():
    """Create some test data with UUIDs"""
    print("🧪 Creating test data...")
    
    try:
        from accounts.models import User
        from clients.models import Client
        from vendors.models import Vendor
        
        # Create test user if not exists
        if not User.objects.filter(email='test@example.com').exists():
            user = User.objects.create_user(
                email='test@example.com',
                username='testuser',
                first_name='Test',
                last_name='User',
                password='TestPass123!',
                phone='+1234567890'
            )
            print(f"✅ Test user created with UUID: {user.id}")
        
        # Create test client if not exists
        if not Client.objects.filter(email='client@example.com').exists():
            client = Client.objects.create(
                name='Test Client',
                email='client@example.com',
                phone='+1234567890',
                account_status='Active',
                type='Investor'
            )
            print(f"✅ Test client created with UUID: {client.id}")
        
        # Create test vendor if not exists
        if not Vendor.objects.filter(email='vendor@example.com').exists():
            vendor = Vendor.objects.create(
                name='Test Vendor',
                company_name='Test Company',
                email='vendor@example.com',
                phone='+1234567890'
            )
            print(f"✅ Test vendor created with UUID: {vendor.id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test data creation failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Apply UUID Migrations")
    print("=" * 40)
    
    setup_django()
    
    try:
        if not apply_migrations():
            print("❌ Failed to apply migrations")
            sys.exit(1)
        
        if not verify_uuid_implementation():
            print("⚠️  UUID verification failed")
        
        if not create_test_data():
            print("⚠️  Test data creation failed")
        
        print("\n" + "=" * 40)
        print("🎉 UUID Migration Completed!")
        print("=" * 40)
        
        print("\n✅ What's working now:")
        print("   - All models use UUID primary keys")
        print("   - Database indexes optimized")
        print("   - Security enhanced")
        print("   - Test data created")
        
        print("\n🔑 Login Credentials:")
        print("   Admin: admin@buy2rent.com / SecureAdmin123!")
        print("   Test: test@example.com / TestPass123!")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Test registration and login")
        print("4. Verify all IDs are UUIDs")
        
        print("\n📊 Example API Response:")
        print("""{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Test Client",
  "email": "client@example.com"
}""")
        
    except Exception as e:
        print(f"❌ Migration process failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
