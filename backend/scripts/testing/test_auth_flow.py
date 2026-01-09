#!/usr/bin/env python
"""
Test complete authentication flow to ensure security
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

def test_protected_endpoints():
    """Test that protected endpoints require authentication"""
    print("🛡️ Testing Protected API Endpoints")
    print("=" * 50)
    
    endpoints = [
        {'url': 'http://localhost:8000/auth/profile/', 'name': 'User Profile'},
        {'url': 'http://localhost:8000/api/apartments/', 'name': 'Apartments'},
        {'url': 'http://localhost:8000/api/products/', 'name': 'Products'},
        {'url': 'http://localhost:8000/api/clients/', 'name': 'Clients'},
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint['url'], timeout=5)
            
            if response.status_code == 401:
                print(f"✅ {endpoint['name']}: SECURE (401 Unauthorized)")
            elif response.status_code == 403:
                print(f"✅ {endpoint['name']}: SECURE (403 Forbidden)")
            elif response.status_code == 200:
                print(f"❌ {endpoint['name']}: VULNERABLE (200 OK without auth)")
                try:
                    data = response.json()
                    print(f"   Data exposed: {json.dumps(data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"⚠️  {endpoint['name']}: Unexpected status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint['name']}: Cannot connect (is Django server running?)")
        except Exception as e:
            print(f"❌ {endpoint['name']}: Error - {e}")

def test_authentication_flow():
    """Test complete authentication flow"""
    print("\n🔐 Testing Authentication Flow")
    print("=" * 50)
    
    # Generate unique test data
    import random
    import string
    random_suffix = ''.join(random.choices(string.digits, k=6))
    
    test_user = {
        "email": f"testuser{random_suffix}@example.com",
        "username": f"testuser{random_suffix}",
        "first_name": "Test",
        "last_name": "User",
        "phone": f"+123456{random_suffix}",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!"
    }
    
    try:
        # Step 1: Register user
        print("📝 Step 1: Registering test user...")
        register_response = requests.post(
            'http://localhost:8000/auth/register/',
            json=test_user,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if register_response.status_code == 201:
            print("✅ Registration successful")
            register_data = register_response.json()
            
            # Extract tokens
            if 'tokens' in register_data:
                access_token = register_data['tokens']['access']
                refresh_token = register_data['tokens']['refresh']
                print("✅ JWT tokens received")
            else:
                print("❌ No tokens in registration response")
                return
                
        else:
            print(f"❌ Registration failed: {register_response.status_code}")
            print(f"   Response: {register_response.text}")
            return
        
        # Step 2: Test protected endpoint with token
        print("\n🔑 Step 2: Testing protected endpoint with token...")
        profile_response = requests.get(
            'http://localhost:8000/auth/profile/',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            timeout=5
        )
        
        if profile_response.status_code == 200:
            print("✅ Profile endpoint accessible with token")
            profile_data = profile_response.json()
            print(f"   User: {profile_data.get('first_name')} {profile_data.get('last_name')} ({profile_data.get('email')})")
        else:
            print(f"❌ Profile endpoint failed: {profile_response.status_code}")
        
        # Step 3: Test login
        print("\n🚪 Step 3: Testing login...")
        login_response = requests.post(
            'http://localhost:8000/auth/login/',
            json={
                'email': test_user['email'],
                'password': test_user['password']
            },
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            login_data = login_response.json()
            new_access_token = login_data.get('access')
            if new_access_token:
                print("✅ New access token received")
            else:
                print("❌ No access token in login response")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
        
        # Step 4: Test token refresh
        print("\n🔄 Step 4: Testing token refresh...")
        refresh_response = requests.post(
            'http://localhost:8000/auth/refresh/',
            json={'refresh': refresh_token},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if refresh_response.status_code == 200:
            print("✅ Token refresh successful")
            refresh_data = refresh_response.json()
            if 'access' in refresh_data:
                print("✅ New access token from refresh")
            else:
                print("❌ No access token in refresh response")
        else:
            print(f"❌ Token refresh failed: {refresh_response.status_code}")
        
        print("\n🎉 Authentication flow test completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure Django server is running:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"❌ Authentication flow test failed: {e}")

def check_django_security_settings():
    """Check Django security settings"""
    print("\n⚙️ Django Security Settings")
    print("=" * 50)
    
    try:
        from django.conf import settings
        
        # Check authentication settings
        auth_classes = getattr(settings, 'REST_FRAMEWORK', {}).get('DEFAULT_AUTHENTICATION_CLASSES', [])
        perm_classes = getattr(settings, 'REST_FRAMEWORK', {}).get('DEFAULT_PERMISSION_CLASSES', [])
        
        print(f"Authentication Classes: {auth_classes}")
        print(f"Permission Classes: {perm_classes}")
        
        if 'rest_framework_simplejwt.authentication.JWTAuthentication' in auth_classes:
            print("✅ JWT Authentication enabled")
        else:
            print("❌ JWT Authentication not found")
        
        if 'rest_framework.permissions.IsAuthenticated' in perm_classes:
            print("✅ Default permission requires authentication")
        else:
            print("⚠️ Default permission does not require authentication")
        
        # Check CORS settings
        cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        cors_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
        
        print(f"CORS Allowed Origins: {cors_origins}")
        print(f"CORS Allow All Origins: {cors_all}")
        
        if cors_all and settings.DEBUG:
            print("✅ CORS allows all origins (OK for development)")
        elif cors_origins:
            print("✅ CORS properly configured")
        else:
            print("❌ CORS not configured")
            
    except Exception as e:
        print(f"❌ Security settings check failed: {e}")

def main():
    """Main function"""
    print("🔒 Authentication Security Test")
    print("=" * 60)
    
    setup_django()
    
    # Check Django settings
    check_django_security_settings()
    
    # Test protected endpoints without auth
    test_protected_endpoints()
    
    # Test complete auth flow
    test_authentication_flow()
    
    print("\n" + "=" * 60)
    print("🎯 SECURITY SUMMARY")
    print("=" * 60)
    print("✅ = Secure/Working")
    print("❌ = Vulnerable/Broken") 
    print("⚠️ = Needs attention")
    print("\n📝 Next steps:")
    print("1. Open test_auth_security.html in browser")
    print("2. Clear browser storage and test frontend routes")
    print("3. Verify /overview redirects to /login when not authenticated")
    print("4. Test complete login → dashboard → logout flow")

if __name__ == '__main__':
    main()
