#!/usr/bin/env python
"""
Final fix for migration issues - removes corrupted files
"""
import os
import sys

print("=" * 60)
print("🔧 FIXING MIGRATION ISSUES - FINAL FIX")
print("=" * 60)

migrations_dir = 'products/migrations'

# Files to remove
files_to_remove = [
    '0002_add_uploaded_file_to_import_session.py',
    '0011_merge_20251201_0729.py'
]

print("\n📝 Step 1: Removing problematic migration files...")

removed_count = 0
for filename in files_to_remove:
    filepath = os.path.join(migrations_dir, filename)
    if os.path.exists(filepath):
        print(f"\n🗑️  Removing: {filename}")
        try:
            os.remove(filepath)
            print(f"   ✅ Removed successfully")
            removed_count += 1
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print(f"\n✓  Already removed: {filename}")

print("\n" + "=" * 60)
print(f"✅ Cleanup complete! Removed {removed_count} file(s)")
print("=" * 60)

print("\n📝 Next steps:")
print("   1. Run: python manage.py showmigrations products")
print("   2. Run: python manage.py migrate products")
print("   3. Run: python manage.py runserver")

print("\n💡 The correct migration is: 0010_importsession_uploaded_file.py")
print("   This adds the 'uploaded_file' field to ImportSession model")
print("\n")

sys.exit(0)
