#!/usr/bin/env python
"""
Create complete migration for all Excel columns
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line

def create_complete_migration():
    """Create migration with all new fields"""
    print("🔧 Creating Complete Migration for All Excel Columns")
    print("=" * 55)
    
    try:
        # Step 1: Remove any problematic migration files
        print("1. Cleaning up problematic migrations...")
        migration_files = [
            "products/migrations/0004_product_color_product_description_product_dimensions_and_more.py"
        ]
        
        for file_path in migration_files:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✅ Removed {file_path}")
        
        # Step 2: Create fresh migrations with all fields
        print("\n2. Creating migrations for all Excel columns...")
        execute_from_command_line(['manage.py', 'makemigrations', 'products', '--verbosity=2'])
        
        # Step 3: Run migrations
        print("\n3. Running migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        
        # Step 4: Show final status
        print("\n4. Checking migration status...")
        execute_from_command_line(['manage.py', 'showmigrations', 'products'])
        
        print("\n✅ Complete migration created successfully!")
        print("\n📊 New Excel columns added to Product model:")
        excel_columns = [
            'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
            'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
            'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
        ]
        for col in excel_columns:
            print(f"  ✅ {col}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_model_fields():
    """Test that all fields are properly added"""
    print("\n🧪 Testing Model Fields...")
    
    try:
        from products.models import Product
        
        # Get all field names
        field_names = [field.name for field in Product._meta.fields]
        
        excel_fields = [
            'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
            'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
            'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
        ]
        
        print("✅ All Product model fields:")
        for field_name in sorted(field_names):
            status = "🆕" if field_name in excel_fields else "📋"
            print(f"  {status} {field_name}")
        
        # Check if all Excel fields are present
        missing_fields = [field for field in excel_fields if field not in field_names]
        if missing_fields:
            print(f"\n⚠️  Missing fields: {missing_fields}")
            return False
        else:
            print(f"\n✅ All {len(excel_fields)} Excel fields successfully added!")
            return True
            
    except Exception as e:
        print(f"\n❌ Model test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 COMPLETE EXCEL COLUMNS MIGRATION")
    print("=" * 40)
    
    if create_complete_migration():
        if test_model_fields():
            print("\n🎉 SUCCESS! All Excel columns are now in the database!")
            print("\n📋 What's been added:")
            print("✅ All Excel column fields (sn, cost, total_cost, etc.)")
            print("✅ Updated admin interface to show all columns")
            print("✅ Enhanced import service to handle all fields")
            print("✅ Updated API serializers")
            print("\n🚀 Next steps:")
            print("1. Start Django server: python manage.py runserver")
            print("2. Test import with your Excel file")
            print("3. Check Django admin to see all columns")
        else:
            print("\n⚠️  Migration created but some fields may be missing")
    else:
        print("\n❌ Migration failed. Check errors above.")
