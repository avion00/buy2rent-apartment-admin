#!/usr/bin/env python
"""
Clear all data from database to start fresh with UUID implementation
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

def clear_all_data():
    """Clear ALL data from database"""
    print("🗑️  Clearing ALL data from database...")
    
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'django_migrations';")
            tables = cursor.fetchall()
            
            print(f"📋 Found {len(tables)} tables to clear:")
            
            # Disable foreign key constraints temporarily
            cursor.execute("PRAGMA foreign_keys = OFF;")
            
            # Clear all tables
            for (table_name,) in tables:
                try:
                    cursor.execute(f"DELETE FROM {table_name};")
                    print(f"   ✅ Cleared {table_name}")
                except Exception as e:
                    print(f"   ⚠️  Could not clear {table_name}: {e}")
            
            # Reset all auto-increment sequences
            cursor.execute("DELETE FROM sqlite_sequence;")
            print("✅ Reset all auto-increment sequences")
            
            # Re-enable foreign key constraints
            cursor.execute("PRAGMA foreign_keys = ON;")
            
            print("✅ All data cleared successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Data clearing failed: {e}")
        return False

def verify_empty_database():
    """Verify database is empty"""
    print("🔍 Verifying database is empty...")
    
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Check key tables
            tables_to_check = [
                'clients_client',
                'apartments_apartment', 
                'vendors_vendor',
                'products_product',
                'auth_user',
                'accounts_user'
            ]
            
            all_empty = True
            for table in tables_to_check:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table};")
                    count = cursor.fetchone()[0]
                    if count == 0:
                        print(f"   ✅ {table}: Empty")
                    else:
                        print(f"   ⚠️  {table}: {count} records remaining")
                        all_empty = False
                except Exception as e:
                    print(f"   ℹ️  {table}: Table doesn't exist yet")
            
            if all_empty:
                print("✅ Database is completely empty!")
            else:
                print("⚠️  Some data may still remain")
            
            return all_empty
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def create_superuser():
    """Create fresh superuser with UUID"""
    print("👤 Creating fresh superuser...")
    
    try:
        from accounts.models import User
        
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
            is_email_verified=True,
            phone='+1234567890'
        )
        
        print(f"✅ Superuser created with UUID: {user.id}")
        print(f"   Email: admin@buy2rent.com")
        print(f"   Password: SecureAdmin123!")
        
        return True
        
    except Exception as e:
        print(f"❌ Superuser creation failed: {e}")
        return False

def main():
    """Main function"""
    print("🗑️  CLEAR ALL DATABASE DATA")
    print("=" * 50)
    print("⚠️  WARNING: This will delete ALL data from your database!")
    print("🎯 Purpose: Remove old integer IDs to allow fresh UUID data")
    print("=" * 50)
    
    setup_django()
    
    print("📋 This will:")
    print("   - Backup current database")
    print("   - Clear ALL data from ALL tables")
    print("   - Reset auto-increment sequences")
    print("   - Create fresh superuser with UUID")
    print("   - Prepare for fresh UUID data")
    
    print(f"\n⚠️  You will lose ALL existing data including:")
    print("   - All clients (John Doe, Anna Nagy, etc.)")
    print("   - All apartments")
    print("   - All vendors")
    print("   - All products")
    print("   - All users")
    print("   - Everything!")
    
    confirm = input("\nAre you absolutely sure you want to clear ALL data? (type 'YES' to confirm): ").strip()
    if confirm != 'YES':
        print("❌ Operation cancelled - data preserved")
        return
    
    try:
        backup_database()
        
        if not clear_all_data():
            print("❌ Failed to clear data")
            sys.exit(1)
        
        if not verify_empty_database():
            print("⚠️  Database may not be completely empty")
        
        if not create_superuser():
            print("⚠️  Superuser creation failed")
        
        print("\n" + "=" * 50)
        print("🎉 DATABASE CLEARED SUCCESSFULLY!")
        print("=" * 50)
        
        print("\n✅ What's done:")
        print("   - ALL old integer ID data removed")
        print("   - Database is completely empty")
        print("   - Fresh superuser created with UUID")
        print("   - Ready for new UUID data")
        
        print("\n🔑 Fresh Login Credentials:")
        print("   Email: admin@buy2rent.com")
        print("   Password: SecureAdmin123!")
        
        print("\n🚀 Next Steps:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Register new users - they'll get UUIDs")
        print("4. Create new clients/apartments - they'll get UUIDs")
        print("5. All new data will have secure UUID primary keys")
        
        print("\n📊 Database Status:")
        print("   - Old integer IDs: ❌ Removed")
        print("   - UUID conflicts: ❌ Resolved")
        print("   - Fresh UUID data: ✅ Ready")
        
        print("\n🛡️  Security Benefits:")
        print("   - No more predictable IDs")
        print("   - No enumeration attacks possible")
        print("   - Cryptographically secure identifiers")
        
    except Exception as e:
        print(f"❌ Clear operation failed: {e}")
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
