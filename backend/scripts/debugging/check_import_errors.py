#!/usr/bin/env python
"""
Check import session errors
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.category_models import ImportSession
from products.models import Product

def check_import_errors():
    """Check what went wrong with the import"""
    print("🔍 CHECKING IMPORT ERRORS")
    print("=" * 25)
    
    try:
        # Get all import sessions
        sessions = ImportSession.objects.all().order_by('-started_at')
        
        print(f"📊 Total import sessions: {sessions.count()}")
        
        for session in sessions:
            print(f"\n📄 Session: {session.file_name}")
            print(f"   📅 Started: {session.started_at}")
            print(f"   📊 Status: {session.status}")
            print(f"   📈 Products: {session.successful_imports}/{session.total_products}")
            print(f"   📋 Sheets: {session.total_sheets}")
            
            # Show error log
            if session.error_log:
                print(f"   ❌ Errors:")
                if isinstance(session.error_log, list):
                    for i, error in enumerate(session.error_log, 1):
                        print(f"      {i}. {error}")
                else:
                    print(f"      {session.error_log}")
            else:
                print(f"   ℹ️  No error log")
        
        # Check products created during import
        print(f"\n📦 PRODUCTS ANALYSIS")
        print("=" * 20)
        
        products = Product.objects.all().order_by('-created_at')
        print(f"Total products: {products.count()}")
        
        for product in products[:3]:  # Show first 3
            print(f"\n📦 Product: {product.product}")
            print(f"   🏠 Apartment: {product.apartment.name}")
            print(f"   📁 Category: {product.category.name if product.category else 'None'}")
            print(f"   🔢 S.N: '{product.sn}' (empty: {not product.sn})")
            print(f"   🏠 Room: '{product.room}' (empty: {not product.room})")
            print(f"   💰 Cost: '{product.cost}' (empty: {not product.cost})")
            print(f"   💰 Unit Price: {product.unit_price}")
            print(f"   📊 Qty: {product.qty}")
            print(f"   📅 Created: {product.created_at}")
            
            # Check import data
            if hasattr(product, 'import_data') and product.import_data:
                print(f"   📋 Import Data Keys: {list(product.import_data.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking imports: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_import_errors()
