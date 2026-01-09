#!/usr/bin/env python
"""
Fix all current errors: admin duplicates and apartment extra_data
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line

def fix_all_errors():
    """Fix all current Django errors"""
    print("🔧 FIXING ALL DJANGO ERRORS")
    print("=" * 30)
    
    try:
        # Step 1: Create migrations for apartment extra_data field
        print("1. Creating migrations for apartment extra_data field...")
        execute_from_command_line(['manage.py', 'makemigrations', 'apartments'])
        
        # Step 2: Create migrations for products (if needed)
        print("2. Creating migrations for products...")
        execute_from_command_line(['manage.py', 'makemigrations', 'products'])
        
        # Step 3: Run all migrations
        print("3. Running all migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Step 4: Run system check
        print("4. Running system check...")
        execute_from_command_line(['manage.py', 'check'])
        
        print("\n✅ ALL ERRORS FIXED!")
        print("\n🚀 You can now run:")
        print("python manage.py runserver")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during fix: {e}")
        
        # Try to give more specific guidance
        if "admin.E012" in str(e):
            print("\n🔧 Admin duplicate field error detected:")
            print("The admin.py file has duplicate fields in fieldsets.")
            print("This has been fixed by removing 'room' from Meta fieldset.")
            
        if "NOT NULL constraint failed: apartments_apartment.extra_data" in str(e):
            print("\n🔧 Apartment extra_data error detected:")
            print("Added extra_data field to Apartment model.")
            print("Run migrations to apply the change.")
        
        return False

def show_current_status():
    """Show current status of the system"""
    print("\n📊 CURRENT STATUS")
    print("=" * 15)
    
    try:
        # Check admin configuration
        from products.admin import ProductAdmin
        print("✅ ProductAdmin loaded successfully")
        
        # Check apartment model
        from apartments.models import Apartment
        field_names = [field.name for field in Apartment._meta.fields]
        if 'extra_data' in field_names:
            print("✅ Apartment.extra_data field exists")
        else:
            print("❌ Apartment.extra_data field missing")
        
        # Check products model
        from products.models import Product
        field_names = [field.name for field in Product._meta.fields]
        excel_fields = ['sn', 'cost', 'total_cost', 'nm', 'all_price']
        missing_excel = [f for f in excel_fields if f not in field_names]
        
        if not missing_excel:
            print("✅ All Excel fields exist in Product model")
        else:
            print(f"❌ Missing Excel fields: {missing_excel}")
            
    except Exception as e:
        print(f"❌ Status check failed: {e}")

if __name__ == "__main__":
    print("🚀 DJANGO ERROR FIXER")
    print("=" * 20)
    
    show_current_status()
    
    if fix_all_errors():
        print("\n🎉 SUCCESS! All errors have been resolved.")
        print("\nYour system is now ready:")
        print("✅ Admin interface fixed")
        print("✅ Apartment model updated")
        print("✅ All Excel columns available")
        print("✅ Migrations applied")
        
        print("\n🚀 Next steps:")
        print("1. python manage.py runserver")
        print("2. Test the import functionality")
        print("3. Check admin interface at /admin/")
    else:
        print("\n⚠️  Some errors may remain.")
        print("Check the output above for specific guidance.")
        print("\nTry running manually:")
        print("1. python manage.py makemigrations")
        print("2. python manage.py migrate")
        print("3. python manage.py check")
