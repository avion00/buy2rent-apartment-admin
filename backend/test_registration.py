#!/usr/bin/env python
"""
Test registration endpoint without authentication
"""

import os
import sys
import django
import requests
import json

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def test_registration_endpoint():
    """Test registration endpoint"""
    print("🧪 Testing Registration Endpoint")
    print("=" * 40)
    
    # Generate unique test data
    import random
    import string
    random_suffix = ''.join(random.choices(string.digits, k=6))
    
    test_data = {
        "email": f"newuser{random_suffix}@example.com",
        "username": f"newuser{random_suffix}",
        "first_name": "New",
        "last_name": "User",
        "phone": f"+123456{random_suffix}",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!"
    }
    
    try:
        # Make request without authentication
        url = "http://localhost:8000/auth/register/"
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"📡 Making POST request to: {url}")
        print(f"📋 Data: {json.dumps(test_data, indent=2)}")
        
        response = requests.post(url, json=test_data, headers=headers)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📝 Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"📝 Response Body (text): {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return test_data["email"]  # Return email for login test
        elif response.status_code == 400:
            print("⚠️  Validation errors - check your data")
            return False
        elif response.status_code == 401:
            print("❌ Authentication required - this should NOT happen for registration")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure server is running")
        print("   Run: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_login_endpoint(email):
    """Test login endpoint"""
    print("\n🧪 Testing Login Endpoint")
    print("=" * 40)
    
    # Test data
    login_data = {
        "email": email,
        "password": "SecurePass123!"
    }
    
    try:
        url = "http://localhost:8000/auth/login/"
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"📡 Making POST request to: {url}")
        print(f"📋 Data: {json.dumps(login_data, indent=2)}")
        
        response = requests.post(url, json=login_data, headers=headers)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"📝 Response Body: {json.dumps(response_data, indent=2)}")
            
            if response.status_code == 200 and 'access' in response_data:
                print("✅ Login successful - JWT token received!")
                return response_data['access']
            else:
                print("❌ Login failed")
                return None
        except:
            print(f"📝 Response Body (text): {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None

def test_authenticated_endpoint(token):
    """Test an authenticated endpoint"""
    print("\n🧪 Testing Authenticated Endpoint")
    print("=" * 40)
    
    try:
        url = "http://localhost:8000/api/clients/"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"📡 Making GET request to: {url}")
        print(f"🔑 Using JWT token: {token[:50]}...")
        
        response = requests.get(url, headers=headers)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Authenticated request successful!")
            try:
                data = response.json()
                print(f"📊 Found {len(data.get('results', []))} clients")
            except:
                pass
            return True
        else:
            print(f"❌ Authenticated request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Authenticated test failed: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Registration & Authentication Test")
    print("=" * 50)
    
    setup_django()
    
    # Test registration (should work without auth)
    user_email = test_registration_endpoint()
    if user_email:
        print("\n🎉 Registration test passed!")
        
        # Test login
        token = test_login_endpoint(user_email)
        if token:
            print("\n🎉 Login test passed!")
            
            # Test authenticated endpoint
            if test_authenticated_endpoint(token):
                print("\n🎉 All tests passed!")
                print("\n✅ Summary:")
                print("   - Registration works without authentication ✅")
                print("   - Login returns JWT token ✅")
                print("   - JWT token works for authenticated endpoints ✅")
            else:
                print("\n⚠️  Authenticated endpoint test failed")
        else:
            print("\n⚠️  Login test failed")
    else:
        print("\n❌ Registration test failed")
        print("\n🔧 Possible fixes:")
        print("   1. Make sure server is running: python manage.py runserver")
        print("   2. Check if registration endpoint allows public access")
        print("   3. Verify database is set up correctly")

if __name__ == '__main__':
    main()
