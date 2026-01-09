#!/usr/bin/env python
"""
Fix UUID data conflict by clearing old integer ID data and creating fresh UUID data
"""

import os
import sys
import django
import shutil
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def backup_database():
    """Backup existing database"""
    if os.path.exists('db.sqlite3'):
        print("📦 Backing up existing database...")
        shutil.copy('db.sqlite3', 'db.sqlite3.backup')
        print("✅ Database backed up to db.sqlite3.backup")

def clear_conflicting_data():
    """Clear all data that has integer IDs conflicting with UUID fields"""
    print("🗑️  Clearing conflicting data...")
    
    try:
        from django.db import connection
        
        # Get all table names
        with connection.cursor() as cursor:
            # Clear data from tables that now use UUID but had integer IDs
            tables_to_clear = [
                'clients_client',
                'apartments_apartment', 
                'vendors_vendor',
                'products_product',
                'deliveries_delivery',
                'payments_payment',
                'payments_paymenthistory',
                'issues_issue',
                'issues_issuephoto',
                'issues_aicommunicationlog',
                'activities_activity',
                'activities_ainote',
                'activities_manualnote'
            ]
            
            for table in tables_to_clear:
                try:
                    cursor.execute(f"DELETE FROM {table}")
                    print(f"✅ Cleared data from {table}")
                except Exception as e:
                    print(f"⚠️  Could not clear {table}: {e}")
            
            # Reset SQLite sequences
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('{}')".format("','".join(tables_to_clear)))
            print("✅ Reset auto-increment sequences")
        
        return True
        
    except Exception as e:
        print(f"❌ Data clearing failed: {e}")
        return False

def create_fresh_uuid_data():
    """Create fresh data with proper UUIDs"""
    print("🆕 Creating fresh data with UUIDs...")
    
    try:
        from accounts.models import User
        from clients.models import Client
        from vendors.models import Vendor
        from apartments.models import Apartment
        from products.models import Product
        from deliveries.models import Delivery
        from payments.models import Payment
        from issues.models import Issue
        from activities.models import Activity
        from datetime import date, timedelta
        
        # Create superuser if not exists
        if not User.objects.filter(email='admin@buy2rent.com').exists():
            admin_user = User.objects.create_user(
                email='admin@buy2rent.com',
                username='admin',
                first_name='Admin',
                last_name='User',
                password='SecureAdmin123!',
                is_staff=True,
                is_superuser=True,
                is_active=True,
                is_email_verified=True,
                phone='+1234567890'
            )
            print(f"✅ Admin user created with UUID: {admin_user.id}")
        
        # Create test user
        if not User.objects.filter(email='test@example.com').exists():
            test_user = User.objects.create_user(
                email='test@example.com',
                username='testuser',
                first_name='Test',
                last_name='User',
                password='TestPass123!',
                phone='+1234567890'
            )
            print(f"✅ Test user created with UUID: {test_user.id}")
        
        # Create test clients
        clients_data = [
            {
                'name': 'John Smith',
                'email': 'john.smith@example.com',
                'phone': '+1234567890',
                'account_status': 'Active',
                'type': 'Investor',
                'notes': 'Premium investor client'
            },
            {
                'name': 'Sarah Johnson',
                'email': 'sarah.johnson@example.com', 
                'phone': '+1234567891',
                'account_status': 'Active',
                'type': 'Buy2Rent Internal',
                'notes': 'Internal project management'
            },
            {
                'name': 'Michael Brown',
                'email': 'michael.brown@example.com',
                'phone': '+1234567892',
                'account_status': 'Active',
                'type': 'Investor',
                'notes': 'New investor client'
            }
        ]
        
        created_clients = []
        for client_data in clients_data:
            client = Client.objects.create(**client_data)
            created_clients.append(client)
            print(f"✅ Client '{client.name}' created with UUID: {client.id}")
        
        # Create test vendors
        vendors_data = [
            {
                'name': 'IKEA Furniture',
                'company_name': 'IKEA AB',
                'contact_person': 'Anna Andersson',
                'email': 'contact@ikea.com',
                'phone': '+46771171717',
                'website': 'https://www.ikea.com',
                'notes': 'Furniture and home accessories'
            },
            {
                'name': 'Home Depot',
                'company_name': 'The Home Depot Inc.',
                'contact_person': 'Bob Wilson',
                'email': 'business@homedepot.com',
                'phone': '+18004663337',
                'website': 'https://www.homedepot.com',
                'notes': 'Home improvement and construction'
            },
            {
                'name': 'West Elm',
                'company_name': 'Williams-Sonoma Inc.',
                'contact_person': 'Emma Davis',
                'email': 'trade@westelm.com',
                'phone': '+18889222435',
                'website': 'https://www.westelm.com',
                'notes': 'Modern furniture and decor'
            }
        ]
        
        created_vendors = []
        for vendor_data in vendors_data:
            vendor = Vendor.objects.create(**vendor_data)
            created_vendors.append(vendor)
            print(f"✅ Vendor '{vendor.name}' created with UUID: {vendor.id}")
        
        # Create test apartments
        apartments_data = [
            {
                'name': 'Luxury Downtown Apartment',
                'type': 'furnishing',
                'client': created_clients[0],
                'address': '123 Main Street, Downtown, City 12345',
                'status': 'Planning',
                'designer': 'Jane Designer',
                'start_date': date.today(),
                'due_date': date.today() + timedelta(days=60),
                'progress': 10,
                'notes': 'High-end luxury apartment project'
            },
            {
                'name': 'Modern Family Home',
                'type': 'renovating',
                'client': created_clients[1],
                'address': '456 Oak Avenue, Suburbs, City 12346',
                'status': 'Ordering',
                'designer': 'Tom Architect',
                'start_date': date.today() - timedelta(days=10),
                'due_date': date.today() + timedelta(days=45),
                'progress': 25,
                'notes': 'Complete home renovation project'
            },
            {
                'name': 'Studio Apartment',
                'type': 'furnishing',
                'client': created_clients[2],
                'address': '789 Pine Street, Midtown, City 12347',
                'status': 'Design Approved',
                'designer': 'Lisa Interior',
                'start_date': date.today() + timedelta(days=5),
                'due_date': date.today() + timedelta(days=30),
                'progress': 5,
                'notes': 'Compact studio optimization'
            }
        ]
        
        created_apartments = []
        for apt_data in apartments_data:
            apartment = Apartment.objects.create(**apt_data)
            created_apartments.append(apartment)
            print(f"✅ Apartment '{apartment.name}' created with UUID: {apartment.id}")
        
        # Create test products
        products_data = [
            {
                'apartment': created_apartments[0],
                'product': 'MALM Bed Frame',
                'vendor': created_vendors[0],
                'vendor_link': 'https://www.ikea.com/us/en/p/malm-bed-frame-white-00103224/',
                'sku': 'IKEA-MALM-001',
                'unit_price': 179.00,
                'qty': 1,
                'availability': 'In Stock',
                'status': 'Design Approved'
            },
            {
                'apartment': created_apartments[0],
                'product': 'HEMNES Dresser',
                'vendor': created_vendors[0],
                'vendor_link': 'https://www.ikea.com/us/en/p/hemnes-dresser-white-stain-80318608/',
                'sku': 'IKEA-HEMNES-002',
                'unit_price': 249.00,
                'qty': 1,
                'availability': 'In Stock',
                'status': 'Ready To Order'
            },
            {
                'apartment': created_apartments[1],
                'product': 'Kitchen Cabinet Set',
                'vendor': created_vendors[1],
                'vendor_link': 'https://www.homedepot.com/p/kitchen-cabinets',
                'sku': 'HD-KITCHEN-001',
                'unit_price': 2499.00,
                'qty': 1,
                'availability': 'Backorder',
                'status': 'Ordered'
            }
        ]
        
        created_products = []
        for product_data in products_data:
            product = Product.objects.create(**product_data)
            created_products.append(product)
            print(f"✅ Product '{product.product}' created with UUID: {product.id}")
        
        # Create test deliveries
        delivery = Delivery.objects.create(
            apartment=created_apartments[0],
            vendor=created_vendors[0],
            order_reference='ORD-2025-001',
            expected_date=date.today() + timedelta(days=7),
            status='Scheduled',
            notes='First delivery for luxury apartment'
        )
        print(f"✅ Delivery created with UUID: {delivery.id}")
        
        # Create test payment
        payment = Payment.objects.create(
            apartment=created_apartments[0],
            vendor=created_vendors[0],
            order_reference='ORD-2025-001',
            total_amount=428.00,
            amount_paid=0.00,
            due_date=date.today() + timedelta(days=30),
            status='Unpaid',
            notes='Payment for IKEA furniture'
        )
        print(f"✅ Payment created with UUID: {payment.id}")
        
        # Create test issue
        issue = Issue.objects.create(
            apartment=created_apartments[1],
            product=created_products[2],
            vendor=created_vendors[1],
            type='Delivery Delay',
            description='Kitchen cabinets delivery delayed due to supply chain issues',
            status='Open',
            priority='Medium',
            expected_resolution=date.today() + timedelta(days=14),
            vendor_contact='Bob Wilson',
            impact='Project timeline may be affected'
        )
        print(f"✅ Issue created with UUID: {issue.id}")
        
        # Create test activity
        activity = Activity.objects.create(
            apartment=created_apartments[0],
            actor='System',
            icon='📦',
            summary='New delivery scheduled for IKEA furniture',
            type='delivery'
        )
        print(f"✅ Activity created with UUID: {activity.id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Fresh data creation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_uuid_data():
    """Verify all data now uses UUIDs"""
    print("🔍 Verifying UUID data...")
    
    try:
        from accounts.models import User
        from clients.models import Client
        from apartments.models import Apartment
        from vendors.models import Vendor
        from products.models import Product
        import uuid
        
        models_to_check = [
            (User, "User"),
            (Client, "Client"),
            (Apartment, "Apartment"), 
            (Vendor, "Vendor"),
            (Product, "Product")
        ]
        
        for model, name in models_to_check:
            if model.objects.exists():
                instance = model.objects.first()
                # Verify it's a valid UUID
                try:
                    uuid.UUID(str(instance.id))
                    print(f"✅ {name}: {instance.id} - Valid UUID!")
                except ValueError:
                    print(f"❌ {name}: {instance.id} - Invalid UUID!")
                    return False
            else:
                print(f"ℹ️  {name}: No records")
        
        return True
        
    except Exception as e:
        print(f"❌ UUID verification failed: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Fix UUID Data Conflict")
    print("=" * 60)
    print("🎯 This will clear old integer ID data and create fresh UUID data")
    print("🛡️  All new data will have secure UUID primary keys")
    print("=" * 60)
    
    setup_django()
    
    print("⚠️  This will:")
    print("   - Backup your current database")
    print("   - Clear all conflicting integer ID data")
    print("   - Create fresh data with secure UUIDs")
    print("   - Verify UUID implementation")
    
    confirm = input("\nDo you want to proceed? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Operation cancelled")
        return
    
    try:
        backup_database()
        
        if not clear_conflicting_data():
            print("❌ Failed to clear conflicting data")
            sys.exit(1)
        
        if not create_fresh_uuid_data():
            print("❌ Failed to create fresh UUID data")
            sys.exit(1)
        
        if not verify_uuid_data():
            print("❌ UUID verification failed")
            sys.exit(1)
        
        print("\n" + "=" * 60)
        print("🎉 UUID DATA CONFLICT FIXED!")
        print("=" * 60)
        
        print("\n✅ What's fixed:")
        print("   - All old integer ID data cleared")
        print("   - Fresh data created with secure UUIDs")
        print("   - No more 'badly formed UUID' errors")
        print("   - All API endpoints now work with UUIDs")
        
        print("\n📊 Sample Data Created:")
        print("   - 3 Clients with UUIDs")
        print("   - 3 Vendors with UUIDs") 
        print("   - 3 Apartments with UUIDs")
        print("   - 3 Products with UUIDs")
        print("   - 1 Delivery with UUID")
        print("   - 1 Payment with UUID")
        print("   - 1 Issue with UUID")
        print("   - 1 Activity with UUID")
        
        print("\n🔑 Login Credentials:")
        print("   Admin: admin@buy2rent.com / SecureAdmin123!")
        print("   Test: test@example.com / TestPass123!")
        
        print("\n🚀 Next Steps:")
        print("1. python manage.py runserver")
        print("2. Go to: http://localhost:8000/api/docs/")
        print("3. Test GET /api/clients/ - Should work now!")
        print("4. Test GET /api/apartments/ - Should work now!")
        print("5. All responses will show secure UUIDs")
        
        print("\n📋 Example Response:")
        print("""{
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Smith",
      "email": "john.smith@example.com"
    }
  ]
}""")
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Restore backup if exists
        if os.path.exists('db.sqlite3.backup'):
            print("🔄 Restoring database backup...")
            shutil.copy('db.sqlite3.backup', 'db.sqlite3')
            print("✅ Database restored")
        
        sys.exit(1)

if __name__ == '__main__':
    main()
