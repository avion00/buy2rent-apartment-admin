#!/usr/bin/env python
"""
Fix the category migration issue by cleaning up existing product data
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def fix_category_migration():
    """Fix the category foreign key constraint issue"""
    print("🔧 Fixing category migration issue...")
    
    try:
        with connection.cursor() as cursor:
            # Check if the products table exists and has category field
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='products_product';
            """)
            
            if cursor.fetchone():
                print("✅ Products table found")
                
                # Check current category values
                cursor.execute("""
                    SELECT category, COUNT(*) 
                    FROM products_product 
                    GROUP BY category;
                """)
                
                results = cursor.fetchall()
                print("Current category values:")
                for category, count in results:
                    print(f"  '{category}': {count} products")
                
                # Update empty string categories to NULL
                cursor.execute("""
                    UPDATE products_product 
                    SET category = NULL 
                    WHERE category = '' OR category IS NULL;
                """)
                
                updated_rows = cursor.rowcount
                print(f"✅ Updated {updated_rows} products with empty category to NULL")
                
                # Check if there are any other invalid category values
                cursor.execute("""
                    SELECT DISTINCT category 
                    FROM products_product 
                    WHERE category IS NOT NULL AND category != '';
                """)
                
                remaining_categories = cursor.fetchall()
                if remaining_categories:
                    print("⚠️  Remaining non-empty category values:")
                    for (category,) in remaining_categories:
                        print(f"  '{category}'")
                    
                    # Set all non-empty categories to NULL as well since ProductCategory doesn't exist yet
                    cursor.execute("""
                        UPDATE products_product 
                        SET category = NULL 
                        WHERE category IS NOT NULL;
                    """)
                    
                    updated_rows = cursor.rowcount
                    print(f"✅ Updated {updated_rows} more products to NULL category")
                
                print("✅ All category fields cleaned up")
                
            else:
                print("ℹ️  Products table not found, nothing to fix")
                
    except Exception as e:
        print(f"❌ Error fixing migration: {e}")
        return False
    
    return True

def run_migrations_after_fix():
    """Run migrations after fixing the data"""
    print("\n🚀 Running migrations...")
    
    try:
        from django.core.management import execute_from_command_line
        
        # Run migrations
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        print("✅ Migrations completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("🔧 FIXING CATEGORY MIGRATION ISSUE")
    print("=" * 50)
    
    # Step 1: Fix the data
    if fix_category_migration():
        print("\n" + "=" * 30)
        print("✅ Data cleanup completed!")
        print("Now you can run: python manage.py migrate")
        print("=" * 30)
    else:
        print("\n❌ Failed to fix data. Please check the errors above.")
        sys.exit(1)
