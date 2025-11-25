#!/usr/bin/env python
"""
Quick fix for the migration issue without full reset
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def quick_fix_migration():
    """Quick fix for the migration issue"""
    print("🔧 QUICK MIGRATION FIX")
    print("=" * 25)
    
    try:
        # Step 1: Remove problematic migration files
        print("1. Removing problematic migration files...")
        
        migration_files_to_remove = [
            "products/migrations/0004_cleanup_category_data.py",
            "products/migrations/0004_product_color_product_description_product_dimensions_and_more.py"
        ]
        
        for file_path in migration_files_to_remove:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"  ✅ Removed {file_path}")
        
        # Step 2: Remove migration records from database
        print("\n2. Cleaning migration records...")
        
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE app = 'products' 
                AND (name LIKE '%0004%' OR name LIKE '%cleanup%');
            """)
            removed_count = cursor.rowcount
            print(f"✅ Removed {removed_count} problematic migration records")
        
        # Step 3: Check if we need to modify the existing table structure
        print("\n3. Checking table structure...")
        
        with connection.cursor() as cursor:
            # Check if category column exists and its constraints
            cursor.execute("PRAGMA table_info(products_product);")
            columns = cursor.fetchall()
            
            category_column = None
            for col in columns:
                if col[1] == 'category':
                    category_column = col
                    break
            
            if category_column:
                print(f"Category column exists: {category_column[1]} ({category_column[2]}) {'NOT NULL' if category_column[3] else 'NULL'}")
                
                # If category column has NOT NULL constraint, we need to modify it
                if category_column[3]:  # NOT NULL constraint exists
                    print("⚠️  Category column has NOT NULL constraint, need to modify...")
                    
                    # Create a new table without the NOT NULL constraint
                    cursor.execute("""
                        CREATE TABLE products_product_new AS 
                        SELECT * FROM products_product;
                    """)
                    
                    # Drop the old table
                    cursor.execute("DROP TABLE products_product;")
                    
                    # Recreate the table with proper structure (this is a simplified version)
                    cursor.execute("""
                        CREATE TABLE products_product (
                            id VARCHAR(32) PRIMARY KEY,
                            apartment_id VARCHAR(32) NOT NULL,
                            product VARCHAR(255) NOT NULL,
                            vendor_id VARCHAR(32),
                            vendor_link VARCHAR(200),
                            sku VARCHAR(100),
                            unit_price DECIMAL(10,2) DEFAULT 0,
                            qty INTEGER DEFAULT 1,
                            availability VARCHAR(20) DEFAULT 'In Stock',
                            status VARCHAR(30) DEFAULT 'Design Approved',
                            category VARCHAR(100),
                            room VARCHAR(100),
                            brand VARCHAR(100),
                            country_of_origin VARCHAR(100),
                            payment_status VARCHAR(20) DEFAULT 'Unpaid',
                            payment_due_date DATE,
                            payment_amount DECIMAL(10,2),
                            paid_amount DECIMAL(10,2) DEFAULT 0,
                            currency VARCHAR(10) DEFAULT 'HUF',
                            shipping_cost DECIMAL(10,2) DEFAULT 0,
                            discount DECIMAL(10,2) DEFAULT 0,
                            notes TEXT,
                            created_by VARCHAR(255),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (apartment_id) REFERENCES apartments_apartment(id),
                            FOREIGN KEY (vendor_id) REFERENCES vendors_vendor(id)
                        );
                    """)
                    
                    # Copy data back
                    cursor.execute("""
                        INSERT INTO products_product 
                        SELECT * FROM products_product_new;
                    """)
                    
                    # Drop the temporary table
                    cursor.execute("DROP TABLE products_product_new;")
                    
                    print("✅ Modified table structure to allow NULL category")
        
        print("\n✅ QUICK FIX COMPLETED!")
        print("Now you can run: python manage.py makemigrations products")
        print("Then run: python manage.py migrate")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if quick_fix_migration():
        print("\n🎯 Next steps:")
        print("1. python manage.py makemigrations products")
        print("2. python manage.py migrate")
        print("3. Test the import system")
    else:
        print("\n❌ Quick fix failed. You may need to use the complete reset.")
        print("Run: python complete_migration_reset.py")
