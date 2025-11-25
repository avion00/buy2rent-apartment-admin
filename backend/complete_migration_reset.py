#!/usr/bin/env python
"""
Complete migration reset and fix for the products app
"""
import os
import sys
import django
import shutil

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def reset_products_migrations():
    """Complete reset of products migrations"""
    print("🔄 COMPLETE MIGRATION RESET")
    print("=" * 40)
    
    try:
        # Step 1: Check current state
        print("1. Checking current state...")
        
        with connection.cursor() as cursor:
            # Check if products table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='products_product';
            """)
            
            table_exists = cursor.fetchone() is not None
            print(f"Products table exists: {table_exists}")
            
            if table_exists:
                # Get product count
                cursor.execute("SELECT COUNT(*) FROM products_product;")
                count = cursor.fetchone()[0]
                print(f"Current products count: {count}")
                
                # Check table schema
                cursor.execute("PRAGMA table_info(products_product);")
                columns = cursor.fetchall()
                print("Current columns:")
                for col in columns:
                    print(f"  - {col[1]} ({col[2]}) {'NOT NULL' if col[3] else 'NULL'}")
        
        # Step 2: Backup existing products data
        print("\n2. Backing up existing products...")
        
        backup_data = []
        if table_exists:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, apartment_id, product, vendor_id, vendor_link, sku, 
                           unit_price, qty, availability, status, eta, ordered_on,
                           expected_delivery_date, actual_delivery_date, room, brand,
                           country_of_origin, payment_status, payment_due_date,
                           payment_amount, paid_amount, currency, shipping_cost,
                           discount, notes, created_by, created_at, updated_at
                    FROM products_product;
                """)
                backup_data = cursor.fetchall()
                print(f"✅ Backed up {len(backup_data)} products")
        
        # Step 3: Remove all products migrations from database
        print("\n3. Removing migration records...")
        
        with connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE app = 'products';
            """)
            removed_count = cursor.rowcount
            print(f"✅ Removed {removed_count} migration records")
        
        # Step 4: Drop products table if it exists
        print("\n4. Dropping existing products table...")
        
        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS products_product;")
            print("✅ Dropped products table")
        
        # Step 5: Clean up migration files
        print("\n5. Cleaning up migration files...")
        
        migrations_dir = "products/migrations"
        migration_files = []
        
        if os.path.exists(migrations_dir):
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file != '__init__.py':
                    migration_files.append(file)
                    file_path = os.path.join(migrations_dir, file)
                    os.remove(file_path)
                    print(f"  - Removed {file}")
        
        print(f"✅ Removed {len(migration_files)} migration files")
        
        # Step 6: Create fresh migrations
        print("\n6. Creating fresh migrations...")
        
        execute_from_command_line(['manage.py', 'makemigrations', 'products', '--verbosity=2'])
        
        # Step 7: Run migrations
        print("\n7. Running fresh migrations...")
        
        execute_from_command_line(['manage.py', 'migrate', 'products', '--verbosity=2'])
        
        # Step 8: Restore data if we had any
        if backup_data:
            print(f"\n8. Restoring {len(backup_data)} products...")
            
            from products.models import Product
            from apartments.models import Apartment
            from vendors.models import Vendor
            
            restored_count = 0
            for row in backup_data:
                try:
                    # Get the apartment and vendor objects
                    apartment = Apartment.objects.get(id=row[1])
                    vendor = None
                    if row[3]:  # vendor_id
                        try:
                            vendor = Vendor.objects.get(id=row[3])
                        except Vendor.DoesNotExist:
                            pass
                    
                    # Create product with basic fields only
                    Product.objects.create(
                        id=row[0],
                        apartment=apartment,
                        product=row[2] or 'Imported Product',
                        vendor=vendor,
                        vendor_link=row[4] or '',
                        sku=row[5] or '',
                        unit_price=row[6] or 0,
                        qty=row[7] or 1,
                        availability=row[8] or 'In Stock',
                        status=row[9] or 'Design Approved',
                        room=row[14] or '',
                        brand=row[15] or '',
                        country_of_origin=row[16] or '',
                        payment_status=row[17] or 'Unpaid',
                        paid_amount=row[20] or 0,
                        currency=row[21] or 'HUF',
                        shipping_cost=row[22] or 0,
                        discount=row[23] or 0,
                        notes=row[24] or '',
                        created_by=row[25] or 'system',
                    )
                    restored_count += 1
                    
                except Exception as e:
                    print(f"  ⚠️  Failed to restore product {row[0]}: {e}")
            
            print(f"✅ Restored {restored_count} products")
        
        print("\n✅ MIGRATION RESET COMPLETED SUCCESSFULLY!")
        print("=" * 40)
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 40)
        return False

def show_final_status():
    """Show the final status"""
    print("\n📊 Final Status:")
    print("=" * 15)
    
    try:
        # Show migrations
        execute_from_command_line(['manage.py', 'showmigrations', 'products'])
        
        # Show product count
        from products.models import Product
        count = Product.objects.count()
        print(f"\n📦 Total products: {count}")
        
        # Show new model fields
        print("\n🆕 New Product Model Fields:")
        from products.models import Product
        for field in Product._meta.fields:
            print(f"  - {field.name}: {field.__class__.__name__}")
        
    except Exception as e:
        print(f"Error checking status: {e}")

if __name__ == "__main__":
    print("⚠️  WARNING: This will reset all products migrations and recreate the table.")
    print("Existing products will be backed up and restored with basic fields only.")
    
    confirm = input("\nDo you want to continue? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        sys.exit(0)
    
    if reset_products_migrations():
        show_final_status()
        print("\n🎉 You can now use the enhanced import system!")
        print("\nNew features available:")
        print("- Product categories from Excel sheets")
        print("- Enhanced product fields (dimensions, material, color, etc.)")
        print("- Import session tracking")
        print("- Image handling")
    else:
        print("\n❌ Migration reset failed. Please check the errors above.")
        sys.exit(1)
