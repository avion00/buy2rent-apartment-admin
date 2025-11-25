#!/usr/bin/env python
"""
Check if Django server is running and on what port
"""
import requests
import socket

def check_port(host, port):
    """Check if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def check_django_server():
    print("🔍 CHECKING DJANGO SERVER STATUS")
    print("=" * 40)
    
    # Common Django ports
    ports_to_check = [8000, 8080, 3000, 5000, 8001]
    
    for port in ports_to_check:
        if check_port('localhost', port):
            print(f"✅ Port {port} is open")
            
            # Try to access Django API
            try:
                response = requests.get(f'http://localhost:{port}/api/', timeout=5)
                if response.status_code == 200:
                    print(f"   🎉 Django API accessible at http://localhost:{port}/api/")
                    
                    # Test products endpoint
                    try:
                        products_response = requests.get(f'http://localhost:{port}/api/products/', timeout=5)
                        if products_response.status_code == 200:
                            data = products_response.json()
                            print(f"   📦 Products API: {len(data)} products found")
                            
                            # Check first product with image
                            for product in data[:3]:
                                if product.get('imageUrl') or product.get('product_image'):
                                    print(f"   🖼️  Sample image URL: {product.get('imageUrl', 'None')}")
                                    break
                        else:
                            print(f"   ⚠️  Products API returned: {products_response.status_code}")
                    except Exception as e:
                        print(f"   ❌ Products API error: {str(e)}")
                        
                else:
                    print(f"   ❌ HTTP {response.status_code} at port {port}")
            except Exception as e:
                print(f"   ❌ Connection error on port {port}: {str(e)}")
        else:
            print(f"❌ Port {port} is closed")
    
    print("\n💡 If no Django server found:")
    print("   Run: python manage.py runserver")
    print("   Or: python manage.py runserver 0.0.0.0:8000")

if __name__ == "__main__":
    check_django_server()
