#!/usr/bin/env python
"""
Test apartment creation with the fixed API
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apartments.models import Apartment
from clients.models import Client
from datetime import date, timedelta

def test_apartment_creation():
    """Test creating an apartment with the same logic as the API"""
    print("🧪 TESTING APARTMENT CREATION")
    print("=" * 35)
    
    try:
        # Test data similar to what API receives
        apartment_name = "Test Apartment"
        apartment_type = "furnishing"
        owner_name = "Test Client"
        status = "Planning"
        designer = "Test Designer"
        address = "Test Address"
        
        print(f"Creating apartment: {apartment_name}")
        
        # Create apartment data (same logic as API)
        apartment_data = {
            'name': apartment_name,
            'type': apartment_type,
            'status': status,
            'designer': designer,
            'address': address,
        }
        
        # Handle client/owner
        if owner_name:
            client, created = Client.objects.get_or_create(
                name=owner_name,
                defaults={'email': '', 'phone': ''}
            )
            apartment_data['client'] = client
            print(f"✅ Client: {client.name} ({'created' if created else 'existing'})")
        else:
            # Create a default client if none provided
            client, created = Client.objects.get_or_create(
                name='Default Client',
                defaults={'email': '', 'phone': ''}
            )
            apartment_data['client'] = client
            print(f"✅ Default client: {client.name}")
        
        # Handle dates
        apartment_data['start_date'] = date.today()
        apartment_data['due_date'] = date.today() + timedelta(days=90)
        
        print(f"✅ Dates: {apartment_data['start_date']} to {apartment_data['due_date']}")
        
        # Create apartment
        apartment = Apartment.objects.create(**apartment_data)
        
        print(f"✅ Apartment created successfully!")
        print(f"   • ID: {apartment.id}")
        print(f"   • Name: {apartment.name}")
        print(f"   • Type: {apartment.type}")
        print(f"   • Client: {apartment.client.name}")
        print(f"   • Address: {apartment.address}")
        print(f"   • Status: {apartment.status}")
        print(f"   • Designer: {apartment.designer}")
        
        # Test the owner property
        print(f"   • Owner (property): {apartment.owner}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating apartment: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_test_data():
    """Clean up test data"""
    try:
        # Delete test apartments
        test_apartments = Apartment.objects.filter(name="Test Apartment")
        count = test_apartments.count()
        test_apartments.delete()
        print(f"🧹 Cleaned up {count} test apartments")
        
        # Optionally clean up test clients
        test_clients = Client.objects.filter(name="Test Client")
        count = test_clients.count()
        if count > 0:
            test_clients.delete()
            print(f"🧹 Cleaned up {count} test clients")
            
    except Exception as e:
        print(f"⚠️  Cleanup error: {e}")

if __name__ == "__main__":
    print("🚀 APARTMENT CREATION TEST\n")
    
    # Clean up any existing test data
    cleanup_test_data()
    
    # Test apartment creation
    success = test_apartment_creation()
    
    if success:
        print(f"\n🎉 TEST PASSED!")
        print(f"   The apartment creation logic should work in the API now.")
        print(f"   You can now test the frontend import dialog.")
    else:
        print(f"\n❌ TEST FAILED!")
        print(f"   There are still issues with apartment creation.")
    
    # Clean up test data
    print(f"\n🧹 Cleaning up...")
    cleanup_test_data()
    
    print(f"\n✅ Test complete!")
