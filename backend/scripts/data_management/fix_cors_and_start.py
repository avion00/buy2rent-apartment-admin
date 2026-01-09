#!/usr/bin/env python
"""
Fix CORS issues and start Django server
"""

import os
import sys
import subprocess
import time

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
def check_cors_package():
    """Check if django-cors-headers is installed"""
    try:
        import corsheaders
        print("✅ django-cors-headers is installed")
        return True
    except ImportError:
        print("❌ django-cors-headers is not installed")
        return False

def install_cors_package():
    """Install django-cors-headers"""
    print("📦 Installing django-cors-headers...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'django-cors-headers'], check=True)
        print("✅ django-cors-headers installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install django-cors-headers")
        return False

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running migrations...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✅ Migrations completed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Migrations failed")
        return False

def start_server():
    """Start Django development server"""
    print("🚀 Starting Django development server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📋 API endpoints:")
    print("   - Login: http://localhost:8000/auth/login/")
    print("   - Register: http://localhost:8000/auth/register/")
    print("   - Profile: http://localhost:8000/auth/profile/")
    print("   - API Docs: http://localhost:8000/api/docs/")
    print("\n🔧 CORS is configured for:")
    print("   - http://localhost:5173 (Vite)")
    print("   - http://localhost:3000 (React)")
    print("   - http://127.0.0.1:5173")
    print("   - http://127.0.0.1:3000")
    print("\n⚠️  Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")

def main():
    """Main function"""
    print("🔧 Django CORS Fix & Server Startup")
    print("=" * 50)
    
    setup_django()
    
    # Check and install CORS package if needed
    if not check_cors_package():
        if not install_cors_package():
            print("❌ Cannot proceed without django-cors-headers")
            return
    
    # Run migrations
    if not run_migrations():
        print("⚠️  Migrations failed, but continuing...")
    
    # Start server
    start_server()

if __name__ == '__main__':
    main()
