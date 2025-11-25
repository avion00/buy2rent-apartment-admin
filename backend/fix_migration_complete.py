#!/usr/bin/env python
"""
Complete fix for the migration issue
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def fix_migration_issue():
    """Complete fix for the migration issue"""
    print("🔧 FIXING MIGRATION ISSUE")
    print("=" * 40)
    
    try:
        # Step 1: Fix the data directly in the database
        print("1. Cleaning up existing product data...")
        
        with connection.cursor() as cursor:
            # Check if products table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='products_product';
            """)
            
            if cursor.fetchone():
                # Update empty string categories to NULL
                cursor.execute("""
                    UPDATE products_product 
                    SET category = NULL 
                    WHERE category = '' OR category = 'None' OR category = 'null';
                """)
                
                updated_rows = cursor.rowcount
                print(f"✅ Updated {updated_rows} products with invalid category values")
                
                # Check for any remaining non-NULL category values
                cursor.execute("""
                    SELECT DISTINCT category 
                    FROM products_product 
                    WHERE category IS NOT NULL;
                """)
                
                remaining = cursor.fetchall()
                if remaining:
                    print(f"⚠️  Found {len(remaining)} products with non-NULL categories")
                    # Set all to NULL since we're adding new foreign key structure
                    cursor.execute("""
                        UPDATE products_product 
                        SET category = NULL;
                    """)
                    print("✅ Set all categories to NULL for clean migration")
        
        # Step 2: Reset migration state
        print("\n2. Resetting migration state...")
        
        with connection.cursor() as cursor:
            # Check current migration state
            cursor.execute("""
                SELECT name FROM django_migrations 
                WHERE app = 'products' 
                ORDER BY name;
            """)
            
            migrations = cursor.fetchall()
            print("Current migrations:")
            for (name,) in migrations:
                print(f"  - {name}")
            
            # Remove the problematic migration if it exists
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE app = 'products' 
                AND name = '0004_product_color_product_description_product_dimensions_and_more';
            """)
            
            if cursor.rowcount > 0:
                print("✅ Removed problematic migration from database")
        
        # Step 3: Delete the problematic migration file
        print("\n3. Cleaning up migration files...")
        
        migration_file = "products/migrations/0004_product_color_product_description_product_dimensions_and_more.py"
        if os.path.exists(migration_file):
            os.remove(migration_file)
            print("✅ Removed problematic migration file")
        
        # Step 4: Create new migrations
        print("\n4. Creating new migrations...")
        
        execute_from_command_line(['manage.py', 'makemigrations', 'products', '--verbosity=2'])
        
        # Step 5: Run migrations
        print("\n5. Running migrations...")
        
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        
        print("\n✅ MIGRATION FIX COMPLETED SUCCESSFULLY!")
        print("=" * 40)
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("=" * 40)
        return False

def show_final_status():
    """Show the final migration status"""
    print("\n📊 Final Migration Status:")
    print("=" * 25)
    
    try:
        execute_from_command_line(['manage.py', 'showmigrations', 'products'])
        
        # Show product count
        from products.models import Product
        count = Product.objects.count()
        print(f"\n📦 Total products in database: {count}")
        
    except Exception as e:
        print(f"Error checking status: {e}")

if __name__ == "__main__":
    if fix_migration_issue():
        show_final_status()
        print("\n🎉 You can now use the import system!")
    else:
        print("\n❌ Migration fix failed. Please check the errors above.")
        sys.exit(1)
