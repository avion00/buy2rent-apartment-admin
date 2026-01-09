#!/usr/bin/env python
"""
Simple API test script to verify all endpoints are working
"""

import os
import sys
import django
import requests
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def test_api_endpoints():
    """Test API endpoints"""
    base_url = 'http://localhost:8000'
    
    endpoints_to_test = [
        '/',  # API overview
        '/api/',  # DRF browsable API
        '/api/docs/',  # Swagger UI
        '/api/redoc/',  # ReDoc
        '/api/schema/',  # OpenAPI schema
        '/admin/',  # Django admin
        '/auth/check/',  # Auth check
        '/api/clients/',  # Clients API
        '/api/apartments/',  # Apartments API
        '/api/vendors/',  # Vendors API
        '/api/products/',  # Products API
        '/api/deliveries/',  # Deliveries API
        '/api/payments/',  # Payments API
        '/api/issues/',  # Issues API
        '/api/activities/',  # Activities API
    ]
    
    print("Testing API endpoints...")
    print("=" * 50)
    
    for endpoint in endpoints_to_test:
        url = f"{base_url}{endpoint}"
        try:
            response = requests.get(url, timeout=5)
            status = "✅ OK" if response.status_code == 200 else f"❌ {response.status_code}"
            print(f"{status} {url}")
        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR {url} (Server not running?)")
        except Exception as e:
            print(f"❌ ERROR {url} - {str(e)}")
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("\n🚀 To start testing in Swagger UI:")
    print("1. Make sure Django server is running: python manage.py runserver")
    print("2. Open: http://localhost:8000/api/docs/")
    print("3. Use the 'Try it out' buttons to test each endpoint")

def main():
    """Main function"""
    print("🧪 Buy2Rent API Test Script")
    print("=" * 50)
    
    setup_django()
    
    # Check if server is running
    try:
        response = requests.get('http://localhost:8000/', timeout=2)
        print("✅ Django server is running")
        test_api_endpoints()
    except requests.exceptions.ConnectionError:
        print("❌ Django server is not running")
        print("\n📋 To start the server:")
        print("1. Run: python manage.py runserver")
        print("2. Then run this test script again")
        return
    
    print("\n📚 API Documentation URLs:")
    print("- Swagger UI: http://localhost:8000/api/docs/")
    print("- ReDoc: http://localhost:8000/api/redoc/")
    print("- Browsable API: http://localhost:8000/api/")
    print("- Admin: http://localhost:8000/admin/")

if __name__ == '__main__':
    main()
