#!/usr/bin/env python
"""
Test the new combined apartment creation and product import endpoint
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from apartments.models import Apartment

def test_combined_endpoint():
    """Test that the new endpoint is properly configured"""
    print("🧪 TESTING COMBINED IMPORT ENDPOINT")
    print("=" * 40)
    
    # Check if the endpoint exists
    from products.views import ProductViewSet
    
    # Check if the new method exists
    if hasattr(ProductViewSet, 'create_apartment_and_import'):
        print("✅ create_apartment_and_import method exists")
        
        # Check method signature
        import inspect
        method = getattr(ProductViewSet, 'create_apartment_and_import')
        signature = inspect.signature(method)
        print(f"✅ Method signature: {signature}")
        
        # Check if it's properly decorated as an action
        if hasattr(method, 'mapping'):
            print("✅ Method is properly decorated as DRF action")
        else:
            print("❌ Method missing DRF action decorator")
            
    else:
        print("❌ create_apartment_and_import method not found")
        return False
    
    # Check current data state
    apartment_count = Apartment.objects.count()
    product_count = Product.objects.count()
    
    print(f"\n📊 Current Database State:")
    print(f"   • Apartments: {apartment_count}")
    print(f"   • Products: {product_count}")
    
    # Show available API endpoints
    print(f"\n🌐 Available API Endpoints:")
    print(f"   • POST /api/products/create_apartment_and_import/ - NEW!")
    print(f"   • POST /api/products/import_excel/ - Existing")
    print(f"   • GET  /api/products/import_template/ - Template download")
    
    print(f"\n✅ Ready to test!")
    print(f"   👉 Use the frontend dialog to test the combined import")
    print(f"   👉 Or test via API: POST /api/products/create_apartment_and_import/")
    print(f"   👉 Required fields: apartment_name, file")
    print(f"   👉 Optional fields: apartment_type, owner, status, designer, start_date, due_date, address")
    
    return True

if __name__ == "__main__":
    test_combined_endpoint()
