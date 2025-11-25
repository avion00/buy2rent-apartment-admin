#!/usr/bin/env python
"""
Complete setup script for the product import system
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
from apartments.models import Apartment
from clients.models import Client
from products.models import Product
from products.category_models import ProductCategory, ImportSession

User = get_user_model()

def setup_import_system():
    """Complete setup for the import system"""
    print("🚀 Setting up Product Import System")
    print("=" * 50)
    
    # 1. Install required packages
    print("1. Installing required packages...")
    os.system("pip install pandas openpyxl xlrd")
    
    # 2. Create and run migrations
    print("2. Creating and running migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'products'])
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed")
    except Exception as e:
        print(f"❌ Migration error: {e}")
    
    # 3. Create sample data if needed
    print("3. Setting up sample data...")
    try:
        # Create a client if none exists
        if not Client.objects.exists():
            client = Client.objects.create(
                name="Sample Client",
                email="client@example.com",
                phone="+1234567890",
                address="123 Sample Street"
            )
            print(f"✅ Created sample client: {client.name}")
        else:
            client = Client.objects.first()
            print(f"✅ Using existing client: {client.name}")
        
        # Create an apartment if none exists
        if not Apartment.objects.exists():
            apartment = Apartment.objects.create(
                name="Sample Apartment",
                type="furnishing",
                client=client,
                address="456 Sample Avenue",
                status="Planning",
                start_date="2024-01-01",
                due_date="2024-12-31"
            )
            print(f"✅ Created sample apartment: {apartment.name}")
        else:
            apartment = Apartment.objects.first()
            print(f"✅ Using existing apartment: {apartment.name}")
            
    except Exception as e:
        print(f"❌ Sample data error: {e}")
    
    # 4. Test the import system
    print("4. Testing import system...")
    try:
        from products.import_service import ProductImportService
        service = ProductImportService()
        print("✅ Import service initialized successfully")
    except Exception as e:
        print(f"❌ Import service error: {e}")
    
    # 5. Show API endpoints
    print("\n📡 Available API Endpoints:")
    print("=" * 30)
    print("POST /api/products/import/")
    print("  - Upload Excel/CSV files for import")
    print("  - Body: multipart/form-data with 'file' and 'apartment_id'")
    print()
    print("GET /api/products/import/template/")
    print("  - Download Excel template for imports")
    print()
    print("GET /api/products/categories/<apartment_id>/")
    print("  - List product categories for an apartment")
    print()
    print("GET /api/products/categories/<category_id>/products/")
    print("  - Get products by category")
    print()
    print("GET /api/products/import-sessions/<apartment_id>/")
    print("  - List import sessions for an apartment")
    print()
    print("DELETE /api/products/import-sessions/<session_id>/delete/")
    print("  - Delete an import session and its products")
    
    # 6. Show database models
    print("\n🗄️ Database Models:")
    print("=" * 20)
    print("✅ Product - Enhanced with new fields:")
    print("   - category (ForeignKey to ProductCategory)")
    print("   - import_session (ForeignKey to ImportSession)")
    print("   - description, dimensions, weight, material, color, model_number")
    print("   - image_file, thumbnail_url, gallery_images")
    print("   - import_row_number, import_data")
    print()
    print("✅ ProductCategory - New model:")
    print("   - Represents Excel sheets as categories")
    print("   - Links to apartment and tracks import info")
    print()
    print("✅ ImportSession - New model:")
    print("   - Tracks each import operation")
    print("   - Stores results and error logs")
    
    # 7. Show file structure
    print("\n📁 File Structure:")
    print("=" * 17)
    print("backend/products/")
    print("├── category_models.py      # ProductCategory, ImportSession models")
    print("├── import_service.py       # Excel/CSV processing logic")
    print("├── import_views.py         # API endpoints for import")
    print("├── import_urls.py          # URL patterns for import")
    print("├── serializers.py          # Updated with new serializers")
    print("├── admin.py                # Updated admin interface")
    print("└── models.py               # Enhanced Product model")
    
    print("\n🎉 Product Import System Setup Complete!")
    print("=" * 45)
    print("Next steps:")
    print("1. Start your Django server: python manage.py runserver")
    print("2. Test the import API with your Excel files")
    print("3. Check the Django admin for imported data")
    print("4. Use the frontend import dialog to upload files")

def show_sample_usage():
    """Show sample usage examples"""
    print("\n📋 Sample Usage:")
    print("=" * 15)
    
    print("1. Import via API (curl example):")
    print("""
curl -X POST http://localhost:8000/api/products/import/ \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@apartment-name-demo.xlsx" \\
  -F "apartment_id=YOUR_APARTMENT_UUID"
    """)
    
    print("2. Download template:")
    print("""
curl -X GET http://localhost:8000/api/products/import/template/ \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o template.xlsx
    """)
    
    print("3. List categories:")
    print("""
curl -X GET http://localhost:8000/api/products/categories/YOUR_APARTMENT_UUID/ \\
  -H "Authorization: Bearer YOUR_TOKEN"
    """)

if __name__ == "__main__":
    setup_import_system()
    show_sample_usage()
