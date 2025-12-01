#!/usr/bin/env python
"""
Clean up conflicting migration files
"""
import os

print("=" * 60)
print("🧹 CLEANING UP MIGRATION CONFLICTS")
print("=" * 60)

migrations_dir = 'products/migrations'

# Files to remove
files_to_remove = [
    '0002_add_uploaded_file_to_import_session.py',
    '0011_merge_20251201_0729.py'
]

removed_count = 0

for filename in files_to_remove:
    filepath = os.path.join(migrations_dir, filename)
    if os.path.exists(filepath):
        print(f"\n🗑️  Removing: {filename}")
        os.remove(filepath)
        print(f"   ✅ Deleted")
        removed_count += 1
    else:
        print(f"\n✓  Already removed: {filename}")

print("\n" + "=" * 60)
print(f"✅ Cleanup complete! Removed {removed_count} file(s)")
print("=" * 60)

print("\n📝 Next steps:")
print("   1. Run: python manage.py migrate products")
print("   2. Run: python manage.py runserver")
print("   3. Test file upload via API")

print("\n💡 The correct migration is: 0010_importsession_uploaded_file.py")
print("   This adds the 'uploaded_file' field to ImportSession model")
print("\n")
