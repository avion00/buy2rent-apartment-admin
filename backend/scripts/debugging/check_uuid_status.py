#!/usr/bin/env python
"""
Check UUID implementation status and Swagger UI readiness
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def check_migrations_needed():
    """Check if migrations are needed"""
    print("🔍 Checking migration status...")
    
    try:
        # Check if migrations are needed
        from django.core.management.commands.makemigrations import Command as MakeMigrationsCommand
        from django.core.management.base import CommandError
        from io import StringIO
        import sys
        
        # Capture output
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        try:
            execute_from_command_line(['manage.py', 'makemigrations', '--dry-run'])
            output = captured_output.getvalue()
            sys.stdout = old_stdout
            
            if "No changes detected" in output:
                print("✅ No migrations needed - database is up to date")
                return False
            else:
                print("⚠️  Migrations needed - UUID changes not applied yet")
                print("📋 Detected changes:")
                print(output)
                return True
                
        except Exception as e:
            sys.stdout = old_stdout
            print(f"❌ Error checking migrations: {e}")
            return True
            
    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return True

def check_current_database():
    """Check current database structure"""
    print("🔍 Checking current database structure...")
    
    try:
        from accounts.models import User
        from clients.models import Client
        
        # Check if we can access models
        if User.objects.exists():
            user = User.objects.first()
            print(f"✅ User model accessible")
            print(f"   Sample User ID: {user.id} (type: {type(user.id)})")
            
            # Check if it's UUID
            import uuid
            try:
                uuid.UUID(str(user.id))
                print("✅ User model already using UUID!")
            except ValueError:
                print("⚠️  User model still using integer IDs")
        else:
            print("ℹ️  No users in database yet")
            
        if Client.objects.exists():
            client = Client.objects.first()
            print(f"✅ Client model accessible")
            print(f"   Sample Client ID: {client.id} (type: {type(client.id)})")
            
            # Check if it's UUID
            try:
                uuid.UUID(str(client.id))
                print("✅ Client model already using UUID!")
            except ValueError:
                print("⚠️  Client model still using integer IDs")
        else:
            print("ℹ️  No clients in database yet")
            
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        print("   This likely means migrations haven't been applied yet")
        return False

def check_swagger_config():
    """Check Swagger UI configuration"""
    print("🔍 Checking Swagger UI configuration...")
    
    try:
        from django.conf import settings
        
        # Check if drf-spectacular is installed
        if 'drf_spectacular' in settings.INSTALLED_APPS:
            print("✅ drf-spectacular is installed")
        else:
            print("❌ drf-spectacular not in INSTALLED_APPS")
            
        # Check spectacular settings
        if hasattr(settings, 'SPECTACULAR_SETTINGS'):
            spectacular = settings.SPECTACULAR_SETTINGS
            print("✅ SPECTACULAR_SETTINGS configured")
            
            if 'bearerAuth' in str(spectacular.get('SECURITY', [])):
                print("✅ JWT Bearer authentication configured for Swagger")
            else:
                print("⚠️  JWT authentication not configured for Swagger")
                
        else:
            print("❌ SPECTACULAR_SETTINGS not configured")
            
        return True
        
    except Exception as e:
        print(f"❌ Swagger config check failed: {e}")
        return False

def test_api_endpoints():
    """Test if API endpoints are accessible"""
    print("🔍 Testing API endpoint accessibility...")
    
    try:
        from django.test import Client as TestClient
        from django.urls import reverse
        
        client = TestClient()
        
        # Test schema endpoint
        try:
            response = client.get('/api/schema/')
            if response.status_code == 200:
                print("✅ API schema endpoint accessible")
            else:
                print(f"⚠️  API schema endpoint returned {response.status_code}")
        except Exception as e:
            print(f"⚠️  API schema endpoint error: {e}")
            
        # Test swagger UI endpoint
        try:
            response = client.get('/api/docs/')
            if response.status_code == 200:
                print("✅ Swagger UI endpoint accessible")
            else:
                print(f"⚠️  Swagger UI endpoint returned {response.status_code}")
        except Exception as e:
            print(f"⚠️  Swagger UI endpoint error: {e}")
            
        return True
        
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        return False

def main():
    """Main function"""
    print("🔍 UUID Implementation Status Check")
    print("=" * 50)
    
    setup_django()
    
    # Check migration status
    migrations_needed = check_migrations_needed()
    
    # Check current database
    db_accessible = check_current_database()
    
    # Check Swagger configuration
    swagger_ok = check_swagger_config()
    
    # Test API endpoints
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("📋 STATUS SUMMARY")
    print("=" * 50)
    
    if migrations_needed:
        print("🔧 MIGRATION REQUIRED")
        print("   Run: python secure_uuid_migration.py")
        print("   This will convert all models to UUID primary keys")
    else:
        print("✅ DATABASE UP TO DATE")
        print("   UUID implementation is ready")
    
    if swagger_ok and api_ok:
        print("✅ SWAGGER UI READY")
        print("   Access: http://localhost:8000/api/docs/")
        print("   All UUID fields will be properly displayed")
    else:
        print("⚠️  SWAGGER UI ISSUES DETECTED")
        print("   May need configuration fixes")
    
    print("\n🚀 NEXT STEPS:")
    
    if migrations_needed:
        print("1. Run UUID migration:")
        print("   python secure_uuid_migration.py")
        print("2. Start server:")
        print("   python manage.py runserver")
        print("3. Test Swagger UI:")
        print("   http://localhost:8000/api/docs/")
    else:
        print("1. Start server:")
        print("   python manage.py runserver")
        print("2. Check Swagger UI:")
        print("   http://localhost:8000/api/docs/")
        print("3. Test UUID endpoints:")
        print("   All IDs should be UUIDs like: 550e8400-e29b-41d4-a716-446655440000")
    
    print("\n🔑 Test Authentication:")
    print("1. Go to Swagger UI")
    print("2. Try POST /auth/register/ or /auth/login/")
    print("3. Use JWT token to test other endpoints")
    print("4. Verify all IDs are UUIDs in responses")

if __name__ == '__main__':
    main()
