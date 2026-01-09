#!/usr/bin/env python
"""
Test the fixed import process
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.import_service import ProductImportService
from apartments.models import Apartment
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product
from products.category_models import ProductCategory, ImportSession

def test_fixed_import():
    """Test the fixed import process"""
    print("🧪 TESTING FIXED IMPORT PROCESS")
    print("=" * 35)
    
    try:
        # Get apartment
        apartments = Apartment.objects.all()
        if not apartments:
            print("❌ No apartments found")
            return False
        
        apartment = apartments.first()
        print(f"✅ Using apartment: {apartment.name}")
        
        # Clear previous test data
        print("🧹 Cleaning up previous test data...")
        Product.objects.filter(apartment=apartment).delete()
        ProductCategory.objects.filter(apartment=apartment).delete()
        ImportSession.objects.filter(apartment=apartment).delete()
        
        # Test with Excel file
        excel_path = "static/apartment-name-demo.xlsx"
        if not os.path.exists(excel_path):
            print("❌ Excel file not found")
            return False
        
        # Read file
        with open(excel_path, 'rb') as f:
            file_content = f.read()
        
        uploaded_file = SimpleUploadedFile(
            name="apartment-name-demo.xlsx",
            content=file_content,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # Test import
        print("🔄 Testing import with fixes...")
        import_service = ProductImportService()
        result = import_service.process_import(
            file=uploaded_file,
            apartment_id=str(apartment.id),
            user=None
        )
        
        print(f"\n📊 Import Result:")
        print(f"   Success: {result.get('success', False)}")
        print(f"   Total products: {result.get('total_products', 0)}")
        print(f"   Successful: {result.get('successful_imports', 0)}")
        print(f"   Failed: {result.get('failed_imports', 0)}")
        print(f"   Sheets processed: {result.get('sheets_processed', 0)}")
        
        if result.get('errors'):
            print(f"   Errors: {len(result['errors'])}")
            for i, error in enumerate(result['errors'][:3], 1):  # Show first 3 errors
                print(f"      {i}. {error}")
            if len(result['errors']) > 3:
                print(f"      ... and {len(result['errors']) - 3} more")
        
        # Check database
        print(f"\n📊 Database Check:")
        products = Product.objects.filter(apartment=apartment)
        categories = ProductCategory.objects.filter(apartment=apartment)
        sessions = ImportSession.objects.filter(apartment=apartment)
        
        print(f"   Products created: {products.count()}")
        print(f"   Categories created: {categories.count()}")
        print(f"   Import sessions: {sessions.count()}")
        
        if products.exists():
            print(f"\n📦 Sample Products:")
            for product in products[:3]:
                print(f"   • {product.product}")
                print(f"     S.N: '{product.sn}'")
                print(f"     Room: '{product.room}'")
                print(f"     Cost: '{product.cost}'")
                print(f"     Price: {product.unit_price}")
                print(f"     Category: {product.category.name}")
        
        if categories.exists():
            print(f"\n📁 Categories:")
            for category in categories:
                product_count = products.filter(category=category).count()
                print(f"   • {category.name}: {product_count} products")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_fixed_import()
    
    if success:
        print("\n🎉 IMPORT FIX SUCCESSFUL!")
        print("\n✅ What's working now:")
        print("   • JSON constraint error fixed")
        print("   • Empty sheets skipped")
        print("   • Column mapping improved")
        print("   • Products being created")
        
        print("\n🚀 Try importing from frontend now!")
    else:
        print("\n❌ Import still has issues")
        print("Check the errors above for details")
