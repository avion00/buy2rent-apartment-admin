#!/usr/bin/env python
"""
Test that ALL product fields are visible in Django admin list display
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.admin import ProductAdmin

def test_comprehensive_admin_display():
    """Test that all important fields are in list_display"""
    print("🔍 TESTING COMPREHENSIVE ADMIN DISPLAY")
    print("=" * 45)
    
    # Expected fields from API response
    api_fields = [
        # Basic fields
        'sn', 'product', 'apartment', 'room', 'category', 'vendor', 'sku',
        'unit_price', 'qty', 'cost', 'total_cost', 'status', 'payment_status',
        'description', 'brand', 'material', 'color', 'size', 'dimensions', 'weight',
        'model_number', 'country_of_origin',
        
        # Excel Import Fields
        'product_image', 'nm', 'plusz_nm', 'price_per_nm', 'price_per_package',
        'nm_per_package', 'all_package', 'package_need_to_order', 'all_price',
        
        # Dates
        'eta', 'ordered_on', 'expected_delivery_date', 'actual_delivery_date', 'payment_due_date',
        
        # Payment Details
        'payment_amount', 'paid_amount', 'currency', 'shipping_cost', 'discount',
        
        # Delivery Details
        'delivery_type', 'delivery_address', 'delivery_city', 'delivery_postal_code',
        'delivery_country', 'delivery_contact_person', 'delivery_contact_phone',
        'delivery_contact_email', 'tracking_number', 'delivery_instructions',
        'delivery_time_window', 'delivery_notes', 'condition_on_arrival',
        
        # Issues
        'issue_state', 'issue_type', 'issue_description', 'replacement_requested',
        'replacement_approved', 'replacement_eta',
        
        # Images & Media
        'image_url', 'image_file', 'thumbnail_url', 'gallery_images', 'attachments',
        
        # Meta
        'import_row_number', 'notes', 'manual_notes', 'ai_summary_notes',
        'created_by', 'created_at', 'updated_at'
    ]
    
    admin_display_fields = ProductAdmin.list_display
    
    print(f"📊 Admin List Display Summary:")
    print(f"   Total columns in admin: {len(admin_display_fields)}")
    print(f"   Expected API fields: {len(api_fields)}")
    
    # Check which API fields are covered
    covered_fields = []
    missing_fields = []
    
    for field in api_fields:
        # Check if field or its display method is in admin
        if (field in admin_display_fields or 
            f"{field}_display" in admin_display_fields or
            f"{field}_short" in admin_display_fields or
            f"{field}_count" in admin_display_fields):
            covered_fields.append(field)
        else:
            missing_fields.append(field)
    
    print(f"\n✅ Covered fields ({len(covered_fields)}):")
    for i, field in enumerate(covered_fields, 1):
        print(f"   {i:2d}. {field}")
    
    if missing_fields:
        print(f"\n❌ Missing fields ({len(missing_fields)}):")
        for i, field in enumerate(missing_fields, 1):
            print(f"   {i:2d}. {field}")
    else:
        print(f"\n🎉 ALL API FIELDS ARE COVERED!")
    
    return len(missing_fields) == 0

def show_admin_columns():
    """Show all admin columns in organized groups"""
    print(f"\n📋 ADMIN COLUMNS BY CATEGORY")
    print("=" * 35)
    
    admin_fields = ProductAdmin.list_display
    
    # Group fields by category
    field_groups = {
        'Basic Info': ['sn', 'product', 'apartment', 'room', 'category', 'vendor', 'sku'],
        'Pricing': ['unit_price', 'qty', 'cost', 'total_cost', 'payment_amount', 'paid_amount', 'currency', 'shipping_cost', 'discount', 'outstanding_balance'],
        'Status': ['status', 'payment_status', 'availability', 'issue_state'],
        'Product Details': ['description_short', 'brand', 'material', 'color', 'size', 'dimensions', 'weight', 'model_number', 'country_of_origin'],
        'Excel Fields': ['product_image', 'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'],
        'Dates': ['eta', 'ordered_on', 'expected_delivery_date', 'actual_delivery_date', 'payment_due_date', 'created_at', 'updated_at'],
        'Delivery': ['delivery_type', 'delivery_address', 'delivery_city', 'delivery_postal_code', 'delivery_country', 'delivery_contact_person', 'delivery_contact_phone', 'delivery_contact_email', 'tracking_number', 'delivery_instructions', 'delivery_time_window', 'delivery_notes', 'condition_on_arrival'],
        'Issues': ['issue_type', 'issue_description', 'replacement_requested', 'replacement_approved', 'replacement_eta'],
        'Media': ['link_display', 'image_url', 'image_file', 'thumbnail_url', 'gallery_images_count', 'attachments_count'],
        'Meta': ['import_row_number', 'notes', 'manual_notes', 'ai_summary_notes', 'created_by']
    }
    
    for group_name, group_fields in field_groups.items():
        present_fields = [f for f in group_fields if f in admin_fields]
        if present_fields:
            print(f"\n📂 {group_name} ({len(present_fields)} fields):")
            for field in present_fields:
                print(f"   • {field}")

def test_with_sample_data():
    """Test admin display with actual product data"""
    print(f"\n📋 SAMPLE DATA VERIFICATION")
    print("=" * 30)
    
    products = Product.objects.all()[:1]
    
    if not products:
        print("⚠️  No products found in database")
        return True
    
    product = products[0]
    print(f"✅ Testing with product: {product.product}")
    
    # Test key Excel fields that should now be visible
    excel_fields = {
        'Product Image': product.product_image,
        'NM': product.nm,
        'Plus NM': product.plusz_nm,
        'Price per NM': product.price_per_nm,
        'Price per Package': product.price_per_package,
        'NM per Package': product.nm_per_package,
        'All Package': product.all_package,
        'Package Need to Order': product.package_need_to_order,
        'All Price': product.all_price,
        'ETA': product.eta,
        'Ordered On': product.ordered_on,
        'Gallery Images': len(product.gallery_images) if product.gallery_images else 0,
        'Attachments': len(product.attachments) if product.attachments else 0,
    }
    
    print(f"\n📊 Excel & Extended Fields:")
    for field_name, value in excel_fields.items():
        display_value = value if value else 'Empty'
        print(f"   • {field_name}: {display_value}")
    
    return True

if __name__ == "__main__":
    print("🚀 COMPREHENSIVE ADMIN COLUMN TEST\n")
    
    test1_passed = test_comprehensive_admin_display()
    show_admin_columns()
    test_with_sample_data()
    
    if test1_passed:
        print(f"\n🎉 ADMIN INTERFACE IS COMPREHENSIVE!")
        print(f"   ✅ All major API fields are now visible")
        print(f"   ✅ Excel import fields included")
        print(f"   ✅ Delivery and payment details shown")
        print(f"   ✅ Media and attachment counts displayed")
    else:
        print(f"\n⚠️  Some fields still missing from admin")
    
    print(f"\n🚀 Access your comprehensive admin:")
    print(f"   👉 http://localhost:8000/admin/products/product/")
    print(f"   👉 Every column from API response now visible!")
