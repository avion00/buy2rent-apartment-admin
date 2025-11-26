"""
Test script for Client API enhancements
Tests the new endpoints: apartments, products, statistics, and details
"""

import requests
import json
from pprint import pprint

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# You need to get a valid token first by logging in
# Replace with your actual token
ACCESS_TOKEN = "your_access_token_here"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}


def test_list_clients():
    """Test listing all clients"""
    print("\n" + "="*80)
    print("TEST 1: List All Clients")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total Clients: {data.get('count', 0)}")
        if data.get('results'):
            print(f"First Client: {data['results'][0]['name']}")
            return data['results'][0]['id']  # Return first client ID for testing
    else:
        print(f"Error: {response.text}")
    
    return None


def test_client_apartments(client_id):
    """Test getting client apartments"""
    print("\n" + "="*80)
    print(f"TEST 2: Get Client Apartments (ID: {client_id})")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/{client_id}/apartments/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Apartment Count: {data.get('count', 0)}")
        print("\nApartments:")
        for apt in data.get('apartments', []):
            print(f"  - {apt['name']} ({apt['type']}) - Status: {apt['status']}")
    else:
        print(f"Error: {response.text}")


def test_client_products(client_id):
    """Test getting client products"""
    print("\n" + "="*80)
    print(f"TEST 3: Get Client Products (ID: {client_id})")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/{client_id}/products/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Product Count: {data.get('count', 0)}")
        print(f"Total Value: {data.get('total_value', 0):,.2f} Ft")
        
        if data.get('products'):
            print("\nSample Products (first 5):")
            for product in data['products'][:5]:
                print(f"  - {product['product']} - {product['total_amount']:,.2f} Ft - Status: {product['status']}")
    else:
        print(f"Error: {response.text}")


def test_client_statistics(client_id):
    """Test getting client statistics"""
    print("\n" + "="*80)
    print(f"TEST 4: Get Client Statistics (ID: {client_id})")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/{client_id}/statistics/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        print("\nApartment Statistics:")
        apt_stats = data.get('apartments', {})
        print(f"  Total: {apt_stats.get('total', 0)}")
        print(f"  By Status: {apt_stats.get('by_status', {})}")
        print(f"  By Type: {apt_stats.get('by_type', {})}")
        
        print("\nProduct Statistics:")
        prod_stats = data.get('products', {})
        print(f"  Total: {prod_stats.get('total', 0)}")
        print(f"  Total Value: {prod_stats.get('total_value', 0):,.2f} Ft")
        print(f"  By Status: {prod_stats.get('by_status', {})}")
        
        print("\nFinancial Statistics:")
        fin_stats = data.get('financial', {})
        print(f"  Total Spent: {fin_stats.get('total_spent', 0):,.2f} Ft")
        print(f"  Total Paid: {fin_stats.get('total_paid', 0):,.2f} Ft")
        print(f"  Outstanding: {fin_stats.get('outstanding', 0):,.2f} Ft")
    else:
        print(f"Error: {response.text}")


def test_client_details(client_id):
    """Test getting complete client details"""
    print("\n" + "="*80)
    print(f"TEST 5: Get Complete Client Details (ID: {client_id})")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/{client_id}/details/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"\nClient Information:")
        print(f"  Name: {data.get('name')}")
        print(f"  Email: {data.get('email')}")
        print(f"  Phone: {data.get('phone')}")
        print(f"  Status: {data.get('account_status')}")
        print(f"  Type: {data.get('type')}")
        
        print(f"\nApartments: {data.get('apartments', {}).get('count', 0)}")
        print(f"Products: {data.get('products', {}).get('count', 0)}")
        print(f"Total Value: {data.get('products', {}).get('total_value', 0):,.2f} Ft")
        
        print("\nStatistics Summary:")
        stats = data.get('statistics', {})
        print(f"  Apartments: {stats.get('apartments', {}).get('total', 0)}")
        print(f"  Products: {stats.get('products', {}).get('total', 0)}")
        print(f"  Outstanding Balance: {stats.get('financial', {}).get('outstanding', 0):,.2f} Ft")
    else:
        print(f"Error: {response.text}")


def test_client_retrieve(client_id):
    """Test standard retrieve endpoint (should now return detailed data)"""
    print("\n" + "="*80)
    print(f"TEST 6: Standard Retrieve Endpoint (ID: {client_id})")
    print("="*80)
    
    response = requests.get(f"{API_URL}/clients/{client_id}/", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Client: {data.get('name')}")
        print(f"Has apartments data: {'apartments' in data}")
        print(f"Has products data: {'products' in data}")
        print(f"Has statistics data: {'statistics' in data}")
    else:
        print(f"Error: {response.text}")


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("CLIENT API ENHANCEMENT TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    
    # Check if token is set
    if ACCESS_TOKEN == "your_access_token_here":
        print("\n⚠️  WARNING: Please set a valid ACCESS_TOKEN in the script!")
        print("\nTo get a token:")
        print("1. Login via POST /auth/login/ with your credentials")
        print("2. Copy the 'access' token from the response")
        print("3. Update the ACCESS_TOKEN variable in this script")
        return
    
    # Test 1: List clients and get first client ID
    client_id = test_list_clients()
    
    if not client_id:
        print("\n❌ No clients found. Please create a client first.")
        return
    
    # Test 2-6: Test all new endpoints
    test_client_apartments(client_id)
    test_client_products(client_id)
    test_client_statistics(client_id)
    test_client_details(client_id)
    test_client_retrieve(client_id)
    
    print("\n" + "="*80)
    print("✅ ALL TESTS COMPLETED")
    print("="*80)
    print("\nNext Steps:")
    print("1. Check Swagger UI at http://localhost:8000/api/docs/")
    print("2. Test the endpoints in Swagger UI")
    print("3. Integrate these endpoints in the frontend")


if __name__ == "__main__":
    main()
