#!/usr/bin/env python
"""
Apply migration for file storage feature
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command

print("=" * 60)
print("🔄 APPLYING FILE STORAGE MIGRATION")
print("=" * 60)

try:
    # Check for migration conflicts
    print("\n📝 Step 1: Checking for migration conflicts...")
    
    # Remove duplicate migration if it exists
    duplicate_migration = 'products/migrations/0002_add_uploaded_file_to_import_session.py'
    if os.path.exists(duplicate_migration):
        print(f"   ⚠️  Found duplicate migration: {duplicate_migration}")
        print("   🗑️  Removing duplicate migration...")
        os.remove(duplicate_migration)
        print("   ✅ Duplicate removed")
    
    # Apply migrations (don't create new ones, use existing 0010_)
    print("\n📝 Step 2: Applying migrations...")
    call_command('migrate', 'products')
    
    print("\n✅ Migration completed successfully!")
    print("\n📋 Summary of changes:")
    print("   • Added 'uploaded_file' field to ImportSession model")
    print("   • Files will be stored in: media/import_files/YYYY/MM/DD/")
    print("   • Old imports won't have files (uploaded_file will be null)")
    print("   • New imports will automatically save files")
    
    print("\n🎯 Next steps:")
    print("   1. Upload a new Excel/CSV file via the API")
    print("   2. Check the media/import_files/ folder for saved files")
    print("   3. Access files via the API or Django admin")
    
    print("\n📊 Verify migration:")
    print("   Run: python manage.py showmigrations products")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    print("\n💡 Try manually:")
    print("   1. cd products/migrations")
    print("   2. rm 0002_add_uploaded_file_to_import_session.py")
    print("   3. cd ../..")
    print("   4. python manage.py migrate products")
    sys.exit(1)

print("\n" + "=" * 60)
