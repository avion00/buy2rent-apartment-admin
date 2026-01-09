#!/usr/bin/env python
"""
Final migration fix - simple approach
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line

def fix_migrations():
    """Simple migration fix"""
    print("🔧 Final Migration Fix")
    print("=" * 25)
    
    try:
        # Step 1: Remove problematic migration files
        migration_files = [
            "products/migrations/0004_product_color_product_description_product_dimensions_and_more.py"
        ]
        
        for file_path in migration_files:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✅ Removed {file_path}")
        
        # Step 2: Create fresh migrations
        print("\n📝 Creating fresh migrations...")
        execute_from_command_line(['manage.py', 'makemigrations', 'products'])
        
        # Step 3: Run migrations
        print("\n🚀 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("\n✅ Migration fix completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    if fix_migrations():
        print("\n🎉 Ready to test the import system!")
        print("Next steps:")
        print("1. Start Django server: python manage.py runserver")
        print("2. Test API endpoints at: http://localhost:8000/api/docs/")
        print("3. Use frontend import dialog")
    else:
        print("\n❌ Migration fix failed.")
        print("Manual steps:")
        print("1. Delete products/migrations/0004_*.py files")
        print("2. Run: python manage.py makemigrations products")
        print("3. Run: python manage.py migrate")
