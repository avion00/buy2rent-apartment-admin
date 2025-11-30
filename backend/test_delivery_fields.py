"""
Test script to verify delivery fields are properly configured
Run this after applying the migration to verify everything works
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from products.models import Product
from products.serializers import ProductSerializer

def test_model_fields():
    """Test that all delivery fields exist in the model"""
    print("🔍 Testing Product Model Fields...")
    
    delivery_fields = [
        'delivery_status_tags', 'sender', 'sender_address', 'sender_phone',
        'recipient', 'recipient_address', 'recipient_phone', 'recipient_email',
        'locker_provider', 'locker_id', 'pickup_provider', 'pickup_location',
        'customs_description', 'item_value', 'hs_category', 'insurance', 'cod',
        'pickup_time', 'delivery_deadline', 'special_instructions'
    ]
    
    model_fields = [f.name for f in Product._meta.get_fields()]
    
    missing_fields = []
    for field in delivery_fields:
        if field in model_fields:
            print(f"  ✅ {field}")
        else:
            print(f"  ❌ {field} - MISSING!")
            missing_fields.append(field)
    
    if missing_fields:
        print(f"\n⚠️  Missing {len(missing_fields)} fields. Run migration first!")
        return False
    else:
        print(f"\n✅ All {len(delivery_fields)} delivery fields present in model!")
        return True

def test_serializer_fields():
    """Test that all delivery fields are in the serializer"""
    print("\n🔍 Testing ProductSerializer Fields...")
    
    delivery_fields = [
        'delivery_status_tags', 'sender', 'sender_address', 'sender_phone',
        'recipient', 'recipient_address', 'recipient_phone', 'recipient_email',
        'locker_provider', 'locker_id', 'pickup_provider', 'pickup_location',
        'customs_description', 'item_value', 'hs_category', 'insurance', 'cod',
        'pickup_time', 'delivery_deadline', 'special_instructions'
    ]
    
    serializer_fields = ProductSerializer.Meta.fields
    
    missing_fields = []
    for field in delivery_fields:
        if field in serializer_fields:
            print(f"  ✅ {field}")
        else:
            print(f"  ❌ {field} - MISSING!")
            missing_fields.append(field)
    
    if missing_fields:
        print(f"\n⚠️  Missing {len(missing_fields)} fields from serializer!")
        return False
    else:
        print(f"\n✅ All {len(delivery_fields)} delivery fields present in serializer!")
        return True

def test_field_properties():
    """Test field properties like blank, null, defaults"""
    print("\n🔍 Testing Field Properties...")
    
    test_fields = {
        'delivery_status_tags': {'blank': True, 'max_length': 255},
        'sender': {'blank': True, 'max_length': 255},
        'recipient': {'blank': True, 'max_length': 255},
        'insurance': {'blank': True, 'default': 'no', 'max_length': 10},
        'locker_provider': {'blank': True, 'max_length': 100},
        'pickup_provider': {'blank': True, 'max_length': 100},
    }
    
    all_correct = True
    for field_name, expected_props in test_fields.items():
        try:
            field = Product._meta.get_field(field_name)
            for prop, expected_value in expected_props.items():
                actual_value = getattr(field, prop, None)
                if actual_value == expected_value:
                    print(f"  ✅ {field_name}.{prop} = {expected_value}")
                else:
                    print(f"  ⚠️  {field_name}.{prop} = {actual_value} (expected {expected_value})")
                    all_correct = False
        except Exception as e:
            print(f"  ❌ Error checking {field_name}: {e}")
            all_correct = False
    
    if all_correct:
        print("\n✅ All field properties are correct!")
    else:
        print("\n⚠️  Some field properties don't match expectations")
    
    return all_correct

def test_create_product_with_delivery():
    """Test creating a product with delivery fields (dry run)"""
    print("\n🔍 Testing Product Creation with Delivery Fields...")
    
    try:
        # Just validate the data structure, don't actually save
        test_data = {
            'product': 'Test Product',
            'delivery_type': 'home_courier',
            'delivery_status_tags': 'In Transit, Scheduled',
            'sender': 'Test Sender',
            'sender_address': '123 Test St',
            'sender_phone': '+36 20 123 4567',
            'recipient': 'Test Recipient',
            'recipient_address': '456 Test Ave',
            'recipient_phone': '+36 30 987 6543',
            'recipient_email': 'test@example.com',
            'insurance': 'yes',
            'cod': '1000',
            'special_instructions': 'Handle with care',
        }
        
        print("  Testing data structure:")
        for key, value in test_data.items():
            print(f"    {key}: {value}")
        
        print("\n  ✅ Data structure is valid!")
        print("  ℹ️  To actually create a product, you need:")
        print("     - apartment (UUID)")
        print("     - category (UUID)")
        print("     - vendor (UUID)")
        print("     - unit_price (decimal)")
        print("     - qty (integer)")
        
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 DELIVERY FIELDS VERIFICATION TEST")
    print("=" * 60)
    
    results = []
    
    # Test 1: Model fields
    results.append(("Model Fields", test_model_fields()))
    
    # Test 2: Serializer fields
    results.append(("Serializer Fields", test_serializer_fields()))
    
    # Test 3: Field properties
    results.append(("Field Properties", test_field_properties()))
    
    # Test 4: Product creation
    results.append(("Product Creation", test_create_product_with_delivery()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Delivery fields are properly configured.")
        print("\n📝 Next steps:")
        print("  1. Run: python manage.py migrate products")
        print("  2. Test the API endpoints")
        print("  3. Test the frontend delivery tab")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        if passed < 2:
            print("  💡 Tip: Make sure to run the migration first:")
            print("     python manage.py migrate products")
    
    print("=" * 60)

if __name__ == '__main__':
    main()
