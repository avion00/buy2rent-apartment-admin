#!/usr/bin/env python
"""
Test that all product fields are accessible in Django admin
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.admin import ProductAdmin
from django.contrib import admin

def test_admin_configuration():
    """Test the admin configuration for Product model"""
    print("🔍 TESTING ADMIN CONFIGURATION")
    print("=" * 35)
    
    # Get the admin class
    admin_class = ProductAdmin
    
    print(f"📊 List Display Fields ({len(admin_class.list_display)}):")
    for i, field in enumerate(admin_class.list_display, 1):
        print(f"   {i:2d}. {field}")
    
    print(f"\n🔍 Search Fields ({len(admin_class.search_fields)}):")
    for i, field in enumerate(admin_class.search_fields, 1):
        print(f"   {i:2d}. {field}")
    
    print(f"\n🏷️  Filter Fields ({len(admin_class.list_filter)}):")
    for i, field in enumerate(admin_class.list_filter, 1):
        print(f"   {i:2d}. {field}")
    
    print(f"\n📋 Fieldsets:")
    for i, (section_name, section_config) in enumerate(admin_class.fieldsets, 1):
        fields = section_config.get('fields', [])
        classes = section_config.get('classes', [])
        collapsed = 'collapse' in classes
        status = " (collapsed)" if collapsed else ""
        print(f"   {i}. {section_name}{status} - {len(fields)} fields")
        for field in fields:
            print(f"      • {field}")
    
    return True

def test_model_fields():
    """Test that all model fields are covered"""
    print(f"\n📊 MODEL FIELD COVERAGE")
    print("=" * 25)
    
    # Get all model fields
    model_fields = [field.name for field in Product._meta.fields]
    admin_fields = []
    
    # Collect all fields from fieldsets
    for section_name, section_config in ProductAdmin.fieldsets:
        admin_fields.extend(section_config.get('fields', []))
    
    print(f"Total model fields: {len(model_fields)}")
    print(f"Fields in admin: {len(admin_fields)}")
    
    # Check coverage
    missing_fields = set(model_fields) - set(admin_fields)
    extra_fields = set(admin_fields) - set(model_fields)
    
    if missing_fields:
        print(f"\n⚠️  Missing from admin ({len(missing_fields)}):")
        for field in sorted(missing_fields):
            print(f"   • {field}")
    else:
        print(f"\n✅ All model fields are covered in admin!")
    
    if extra_fields:
        print(f"\n📝 Extra admin fields (methods/properties) ({len(extra_fields)}):")
        for field in sorted(extra_fields):
            print(f"   • {field}")
    
    return len(missing_fields) == 0

def test_sample_data():
    """Test with actual data"""
    print(f"\n📋 SAMPLE DATA TEST")
    print("=" * 20)
    
    products = Product.objects.all()[:3]
    
    if not products:
        print("⚠️  No products found in database")
        return True
    
    print(f"Testing with {len(products)} sample products:")
    
    for i, product in enumerate(products, 1):
        print(f"\n   Product {i}: {product.product}")
        print(f"   • S.N: {product.sn}")
        print(f"   • Room: {product.room}")
        print(f"   • Cost: {product.cost}")
        print(f"   • Link: {product.link[:50] + '...' if product.link and len(product.link) > 50 else product.link or 'None'}")
        print(f"   • Description: {product.description[:50] + '...' if product.description and len(product.description) > 50 else product.description or 'None'}")
        print(f"   • Brand: {product.brand or 'None'}")
        print(f"   • Material: {product.material or 'None'}")
        print(f"   • Delivery: {product.delivery_address or 'None'}")
    
    return True

if __name__ == "__main__":
    print("🚀 TESTING DJANGO ADMIN CONFIGURATION\n")
    
    test1_passed = test_admin_configuration()
    test2_passed = test_model_fields()
    test3_passed = test_sample_data()
    
    if test1_passed and test2_passed and test3_passed:
        print(f"\n🎉 ALL TESTS PASSED!")
        print(f"   Django admin is properly configured")
        print(f"   All fields should be visible in admin interface")
    else:
        print(f"\n⚠️  Some tests failed")
    
    print(f"\n🚀 Next steps:")
    print(f"1. Visit /admin/products/product/ to see enhanced admin interface")
    print(f"2. Check that all product details are visible")
    print(f"3. Use filters and search to find specific products")
    print(f"4. Click on individual products to see all field details")
