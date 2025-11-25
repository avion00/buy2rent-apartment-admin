#!/usr/bin/env python3
"""
Script to fix migration issues by removing problematic migration files
"""
import os
import sys

def remove_problematic_migrations():
    """Remove migration files that reference non-existent models"""
    
    # Path to the problematic migration
    migration_file = "apartments/migrations/0004_remove_importedproduct_unique_imported_apartment_sku_and_more.py"
    
    if os.path.exists(migration_file):
        try:
            os.remove(migration_file)
            print(f"✅ Removed problematic migration: {migration_file}")
        except Exception as e:
            print(f"❌ Error removing {migration_file}: {e}")
            return False
    else:
        print(f"ℹ️ Migration file not found: {migration_file}")
    
    return True

if __name__ == "__main__":
    print("🔧 Fixing Django migration issues...")
    
    if remove_problematic_migrations():
        print("✅ Migration cleanup completed successfully!")
        print("\nNext steps:")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py runserver")
    else:
        print("❌ Migration cleanup failed!")
        sys.exit(1)
