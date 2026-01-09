#!/usr/bin/env python3
"""
Script to fix existing orders by linking OrderItems to Products.
This ensures that order_status_info appears correctly in the ApartmentView.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import OrderItem
from products.models import Product

def fix_order_product_links():
    """Link OrderItems to Products where the link is missing"""
    
    # Get all order items without a product link
    unlinked_items = OrderItem.objects.filter(product__isnull=True)
    
    print(f"Found {unlinked_items.count()} order items without product links")
    
    fixed_count = 0
    failed_count = 0
    
    for item in unlinked_items:
        try:
            # Try to find matching product by name and apartment
            product = Product.objects.filter(
                product__iexact=item.product_name,
                apartment=item.order.apartment
            ).first()
            
            if not product and item.sku:
                # Try matching by SKU
                product = Product.objects.filter(
                    sku__iexact=item.sku,
                    apartment=item.order.apartment
                ).first()
            
            if product:
                item.product = product
                # Store product image URL
                if product.product_image:
                    item.product_image_url = product.product_image
                item.save()
                fixed_count += 1
                print(f"✓ Linked '{item.product_name}' to product {product.id}")
            else:
                failed_count += 1
                print(f"✗ Could not find product for '{item.product_name}' in apartment {item.order.apartment.name}")
        
        except Exception as e:
            failed_count += 1
            print(f"✗ Error linking '{item.product_name}': {e}")
    
    print(f"\n=== Summary ===")
    print(f"Fixed: {fixed_count}")
    print(f"Failed: {failed_count}")
    print(f"Total: {unlinked_items.count()}")
    
    # Show current status
    total_items = OrderItem.objects.count()
    linked_items = OrderItem.objects.filter(product__isnull=False).count()
    print(f"\n=== Current Status ===")
    print(f"Total OrderItems: {total_items}")
    print(f"Linked to Products: {linked_items}")
    print(f"Unlinked: {total_items - linked_items}")

if __name__ == '__main__':
    fix_order_product_links()
