#!/bin/bash

# VPS Deployment Script for Buy2Rent Application
# This script helps you configure and deploy the application on your VPS

echo "=========================================="
echo "Buy2Rent VPS Deployment Configuration"
echo "=========================================="
echo ""

# Get VPS IP address
echo "Step 1: Detecting VPS IP address..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "Detected IP: $VPS_IP"
echo ""

read -p "Is this IP correct? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    read -p "Enter your VPS IP address: " VPS_IP
fi

echo ""
echo "Using IP: $VPS_IP"
echo ""

# Configure Backend
echo "Step 2: Configuring Backend..."
cd /root/buy2rent/backend

# Generate a random secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

cat > .env << EOF
SECRET_KEY=$SECRET_KEY
DEBUG=False
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=$VPS_IP,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://$VPS_IP:5173,http://$VPS_IP:8080,http://localhost:5173,http://localhost:8080
EOF

echo "✅ Backend configured (.env created)"
echo ""

# Configure Frontend
echo "Step 3: Configuring Frontend..."
cd /root/buy2rent/frontend

cat > .env << EOF
VITE_API_URL=http://$VPS_IP:8000/api
VITE_AUTH_URL=http://$VPS_IP:8000/auth
EOF

echo "✅ Frontend configured (.env created)"
echo ""

# Build Frontend
echo "Step 4: Building Frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
echo ""

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "Step 5: Installing 'serve' package..."
    npm install -g serve
    echo "✅ 'serve' installed"
else
    echo "Step 5: 'serve' already installed"
fi
echo ""

echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "To start your application:"
echo ""
echo "1. Start Backend (in one terminal):"
echo "   cd /root/buy2rent/backend"
echo "   python manage.py runserver 0.0.0.0:8000"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd /root/buy2rent/frontend"
echo "   serve -s dist -p 5173"
echo ""
echo "3. Access your application:"
echo "   http://$VPS_IP:5173"
echo ""
echo "For production deployment with PM2:"
echo "   bash /root/buy2rent/start-production.sh"
echo ""
echo "=========================================="
