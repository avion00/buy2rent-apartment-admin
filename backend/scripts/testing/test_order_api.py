#!/usr/bin/env python
"""
Test script for Order API endpoints
"""
import requests
import json
from datetime import datetime, date

# Base URL
BASE_URL = "http://localhost:8000"

# Test credentials (you'll need to update these)
LOGIN_URL = f"{BASE_URL}/auth/login/"
ORDERS_URL = f"{BASE_URL}/api/orders/"

def get_auth_token():
    """Get authentication token"""
    credentials = {
        "email": "admin@example.com",  # Update with actual credentials
        "password": "admin123"  # Update with actual password
    }
    
    try:
        response = requests.post(LOGIN_URL, json=credentials)
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"Login failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_orders_api(token=None):
    """Test Order API endpoints"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    print("\n" + "="*60)
    print("TESTING ORDER API ENDPOINTS")
    print("="*60)
    
    # 1. Test GET all orders
    print("\n1. Testing GET /api/orders/")
    print("-" * 40)
    try:
        response = requests.get(ORDERS_URL, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response structure:")
            if isinstance(data, dict):
                print(f"  - Keys: {list(data.keys())}")
                if 'results' in data:
                    print(f"  - Total count: {data.get('count', 'N/A')}")
                    print(f"  - Results count: {len(data['results'])}")
                    if data['results']:
                        print(f"\n  First order structure:")
                        first_order = data['results'][0]
                        for key in first_order.keys():
                            value = first_order[key]
                            if isinstance(value, list):
                                print(f"    - {key}: [{len(value)} items]")
                            else:
                                print(f"    - {key}: {type(value).__name__}")
            elif isinstance(data, list):
                print(f"  - List with {len(data)} orders")
                if data:
                    print(f"\n  First order structure:")
                    first_order = data[0]
                    for key in first_order.keys():
                        value = first_order[key]
                        if isinstance(value, list):
                            print(f"    - {key}: [{len(value)} items]")
                        else:
                            print(f"    - {key}: {type(value).__name__}")
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    
    # 2. Test filter by apartment
    print("\n2. Testing GET /api/orders/?apartment=<id>")
    print("-" * 40)
    try:
        # We'll need a valid apartment ID - let's get one first
        apartments_response = requests.get(f"{BASE_URL}/api/apartments/", headers=headers)
        if apartments_response.status_code == 200:
            apartments = apartments_response.json()
            if apartments and (isinstance(apartments, list) and len(apartments) > 0 or 
                              isinstance(apartments, dict) and apartments.get('results')):
                apartment_id = (apartments[0]['id'] if isinstance(apartments, list) 
                              else apartments['results'][0]['id'])
                
                response = requests.get(f"{ORDERS_URL}?apartment={apartment_id}", headers=headers)
                print(f"Status Code: {response.status_code}")
                if response.status_code == 200:
                    print("✓ Apartment filter working")
        else:
            print("Could not test apartment filter - no apartments available")
    except Exception as e:
        print(f"Error: {e}")
    
    # 3. Test filter by vendor
    print("\n3. Testing GET /api/orders/?vendor=<id>")
    print("-" * 40)
    try:
        vendors_response = requests.get(f"{BASE_URL}/api/vendors/", headers=headers)
        if vendors_response.status_code == 200:
            vendors = vendors_response.json()
            if vendors and (isinstance(vendors, list) and len(vendors) > 0 or 
                           isinstance(vendors, dict) and vendors.get('results')):
                vendor_id = (vendors[0]['id'] if isinstance(vendors, list) 
                           else vendors['results'][0]['id'])
                
                response = requests.get(f"{ORDERS_URL}?vendor={vendor_id}", headers=headers)
                print(f"Status Code: {response.status_code}")
                if response.status_code == 200:
                    print("✓ Vendor filter working")
        else:
            print("Could not test vendor filter - no vendors available")
    except Exception as e:
        print(f"Error: {e}")
    
    # 4. Test custom endpoints
    print("\n4. Testing Custom Endpoints")
    print("-" * 40)
    
    # Test statistics endpoint
    try:
        response = requests.get(f"{ORDERS_URL}statistics/", headers=headers)
        print(f"  /statistics/ - Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"    Statistics keys: {list(stats.keys())}")
    except Exception as e:
        print(f"  /statistics/ - Error: {e}")
    
    # Test by_vendor endpoint
    try:
        response = requests.get(f"{ORDERS_URL}by_vendor/", headers=headers)
        print(f"  /by_vendor/ - Status: {response.status_code}")
        if response.status_code == 400:
            print("    ✓ Correctly requires vendor_id parameter")
    except Exception as e:
        print(f"  /by_vendor/ - Error: {e}")
    
    # Test by_apartment endpoint
    try:
        response = requests.get(f"{ORDERS_URL}by_apartment/", headers=headers)
        print(f"  /by_apartment/ - Status: {response.status_code}")
        if response.status_code == 400:
            print("    ✓ Correctly requires apartment_id parameter")
    except Exception as e:
        print(f"  /by_apartment/ - Error: {e}")
    
    # 5. Test search functionality
    print("\n5. Testing Search")
    print("-" * 40)
    try:
        response = requests.get(f"{ORDERS_URL}?search=PO", headers=headers)
        print(f"Search by 'PO' - Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Search functionality working")
    except Exception as e:
        print(f"Error: {e}")
    
    # 6. Test ordering
    print("\n6. Testing Ordering")
    print("-" * 40)
    try:
        response = requests.get(f"{ORDERS_URL}?ordering=-placed_on", headers=headers)
        print(f"Order by placed_on (desc) - Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Ordering functionality working")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*60)
    print("API FIELD MAPPING (Frontend -> Backend)")
    print("="*60)
    print("""
    Frontend Field     | Backend Field      | Type
    -------------------|-------------------|------------------
    po_number         | po_number         | string
    apartment         | apartment_name    | string (read-only)
    vendor            | vendor_name       | string (read-only)
    items_count       | items_count       | number
    total             | total             | decimal
    confirmation      | tracking_number   | string (repurpose)
    tracking          | tracking_number   | string
    status            | status            | string (choices)
    placed_on         | placed_on         | date
    -                 | expected_delivery | date
    -                 | actual_delivery   | date
    -                 | notes             | text
    -                 | shipping_address  | text
    -                 | items             | array (nested)
    
    Status Values:
    - Backend: draft, confirmed, in_transit, delivered, cancelled, returned
    - Frontend: Draft, Sent, Confirmed, Received
    
    Note: Frontend 'Sent' maps to backend 'confirmed'
          Frontend 'Received' maps to backend 'delivered'
    """)

if __name__ == "__main__":
    print("Starting Order API Test...")
    print("Make sure the Django server is running on http://localhost:8000")
    
    # Try to get auth token
    token = get_auth_token()
    if not token:
        print("\nTesting without authentication (may have limited access)")
    
    # Run tests
    test_orders_api(token)
