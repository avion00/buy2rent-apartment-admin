#!/usr/bin/env python
"""
Fix admin duplicate field error and apartment extra_data issue
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def fix_admin_and_apartment_issues():
    """Fix admin duplicate field and apartment extra_data issues"""
    print("🔧 FIXING ADMIN AND APARTMENT ISSUES")
    print("=" * 40)
    
    try:
        # Step 1: Check if admin error is fixed
        print("1. Checking admin configuration...")
        try:
            from products.admin import ProductAdmin
            # Try to access fieldsets to see if there are duplicates
            fieldsets = ProductAdmin.fieldsets
            all_fields = []
            for name, options in fieldsets:
                fields = options.get('fields', [])
                if isinstance(fields, (list, tuple)):
                    all_fields.extend(fields)
            
            # Check for duplicates
            duplicates = []
            seen = set()
            for field in all_fields:
                if field in seen:
                    duplicates.append(field)
                seen.add(field)
            
            if duplicates:
                print(f"   ❌ Found duplicate fields: {duplicates}")
                return False
            else:
                print("   ✅ No duplicate fields found in admin")
        
        except Exception as e:
            print(f"   ❌ Admin check failed: {e}")
            return False
        
        # Step 2: Check apartment model
        print("\n2. Checking apartment model...")
        try:
            from apartments.models import Apartment
            
            # Check if extra_data field exists
            field_names = [field.name for field in Apartment._meta.fields]
            
            if 'extra_data' not in field_names:
                print("   ⚠️  extra_data field missing from Apartment model")
                
                # Check database schema
                with connection.cursor() as cursor:
                    cursor.execute("PRAGMA table_info(apartments_apartment);")
                    columns = cursor.fetchall()
                    db_columns = [col[1] for col in columns]
                    
                    if 'extra_data' in db_columns:
                        print("   ℹ️  extra_data exists in database but not in model")
                        print("   💡 This suggests a model/migration mismatch")
                    else:
                        print("   ℹ️  extra_data not in database either")
                        print("   💡 May need to add field or fix API calls")
            else:
                print("   ✅ extra_data field found in model")
        
        except Exception as e:
            print(f"   ❌ Apartment check failed: {e}")
        
        # Step 3: Try to run system check
        print("\n3. Running Django system check...")
        try:
            execute_from_command_line(['manage.py', 'check'])
            print("   ✅ System check passed!")
            return True
        except Exception as e:
            print(f"   ❌ System check failed: {e}")
            return False
    
    except Exception as e:
        print(f"\n❌ Fix failed: {e}")
        return False

def suggest_fixes():
    """Suggest manual fixes if needed"""
    print("\n🔧 MANUAL FIX SUGGESTIONS")
    print("=" * 25)
    
    print("If admin error persists:")
    print("1. Check products/admin.py for duplicate fields in fieldsets")
    print("2. Look for fields appearing in multiple fieldset sections")
    print("3. Remove duplicates, keeping fields in most logical section")
    
    print("\nIf apartment extra_data error persists:")
    print("1. Add extra_data field to Apartment model:")
    print("   extra_data = models.JSONField(default=dict, blank=True)")
    print("2. Create and run migration:")
    print("   python manage.py makemigrations apartments")
    print("   python manage.py migrate")
    print("3. Or modify API calls to not require extra_data")

if __name__ == "__main__":
    if fix_admin_and_apartment_issues():
        print("\n🎉 All issues fixed! You can now run:")
        print("python manage.py runserver")
    else:
        suggest_fixes()
        print("\n⚠️  Some issues remain. Try the manual fixes above.")
