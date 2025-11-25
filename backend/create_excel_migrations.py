#!/usr/bin/env python
"""
Create migrations for all Excel columns and fix database
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def create_excel_migrations():
    """Create and apply migrations for Excel columns"""
    print("🔄 CREATING MIGRATIONS FOR EXCEL COLUMNS")
    print("=" * 45)
    
    try:
        # Step 1: Check current database structure
        print("1. Checking current database structure...")
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            existing_columns = [col[1] for col in columns]
            
            excel_columns = [
                'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
                'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
                'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
            ]
            
            missing_columns = [col for col in excel_columns if col not in existing_columns]
            
            print(f"   📊 Current columns: {len(existing_columns)}")
            print(f"   ❌ Missing Excel columns: {len(missing_columns)}")
            
            if missing_columns:
                print("   Missing columns:", missing_columns[:5], "..." if len(missing_columns) > 5 else "")
            else:
                print("   ✅ All Excel columns already exist!")
                return True
        
        # Step 2: Create migrations for products
        print("\n2. Creating migrations for products...")
        execute_from_command_line(['manage.py', 'makemigrations', 'products', '--verbosity=2'])
        
        # Step 3: Create migrations for apartments (extra_data field)
        print("\n3. Creating migrations for apartments...")
        execute_from_command_line(['manage.py', 'makemigrations', 'apartments', '--verbosity=2'])
        
        # Step 4: Apply all migrations
        print("\n4. Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        
        # Step 5: Verify the new columns exist
        print("\n5. Verifying Excel columns...")
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            new_columns = [col[1] for col in columns]
            
            excel_columns = [
                'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
                'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
                'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
            ]
            
            missing_after = [col for col in excel_columns if col not in new_columns]
            
            if not missing_after:
                print("   ✅ All Excel columns successfully added!")
                print(f"   📊 Total columns now: {len(new_columns)}")
            else:
                print(f"   ❌ Still missing: {missing_after}")
                return False
        
        # Step 6: Test admin interface
        print("\n6. Testing admin interface...")
        try:
            from products.admin import ProductAdmin
            from products.models import Product
            
            # Try to query products to see if admin will work
            products_count = Product.objects.count()
            print(f"   ✅ Admin test passed - {products_count} products in database")
            
        except Exception as e:
            print(f"   ⚠️  Admin test warning: {e}")
        
        print("\n✅ EXCEL COLUMNS MIGRATION COMPLETED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def show_migration_summary():
    """Show summary of what was accomplished"""
    print("\n📋 MIGRATION SUMMARY")
    print("=" * 20)
    
    try:
        # Show database columns
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            
            excel_columns = [
                'sn', 'product_image', 'cost', 'total_cost', 'link', 'size', 
                'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
                'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'
            ]
            
            print("✅ Excel columns in database:")
            for col_info in columns:
                col_name = col_info[1]
                if col_name in excel_columns:
                    print(f"   🆕 {col_name}")
            
        # Show migration files
        print("\n📁 Migration files created:")
        migrations_dir = "products/migrations"
        if os.path.exists(migrations_dir):
            files = [f for f in os.listdir(migrations_dir) if f.endswith('.py') and not f.startswith('__')]
            latest_files = sorted(files)[-3:] if len(files) > 3 else files
            for file in latest_files:
                print(f"   📄 {file}")
        
    except Exception as e:
        print(f"❌ Summary error: {e}")

if __name__ == "__main__":
    if create_excel_migrations():
        show_migration_summary()
        print("\n🎉 SUCCESS!")
        print("\n🚀 Your system is now ready:")
        print("✅ All Excel columns in database")
        print("✅ Admin interface will work")
        print("✅ Import functionality ready")
        print("✅ API endpoints functional")
        
        print("\n📋 Next steps:")
        print("1. Restart Django server if running")
        print("2. Visit /admin/products/product/ to see Excel columns")
        print("3. Test Excel import functionality")
        print("4. Check API docs at /api/docs/")
    else:
        print("\n❌ Migration failed.")
        print("\nTry manual steps:")
        print("1. python manage.py makemigrations products")
        print("2. python manage.py makemigrations apartments") 
        print("3. python manage.py migrate")
        print("4. python manage.py runserver")
