#!/bin/bash

# Production Start Script using PM2
# This keeps your application running even after you close the terminal

echo "=========================================="
echo "Starting Buy2Rent in Production Mode"
echo "=========================================="
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
fi

# Stop existing processes if any
echo "Stopping any existing processes..."
pm2 delete buy2rent-backend 2>/dev/null
pm2 delete buy2rent-frontend 2>/dev/null

# Start Backend
echo ""
echo "Starting Backend..."
cd /root/buy2rent/backend
pm2 start "python manage.py runserver 0.0.0.0:8000" --name buy2rent-backend
echo "✅ Backend started"

# Start Frontend
echo ""
echo "Starting Frontend..."
cd /root/buy2rent/frontend
pm2 start "serve -s dist -p 5173" --name buy2rent-frontend
echo "✅ Frontend started"

# Save PM2 configuration
echo ""
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo ""
echo "Setting up PM2 to start on system boot..."
pm2 startup | tail -n 1 | bash

echo ""
echo "=========================================="
echo "✅ Application Started Successfully!"
echo "=========================================="
echo ""
echo "Your application is now running at:"
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "   http://$VPS_IP:5173"
echo ""
echo "Useful PM2 commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart both services"
echo "   pm2 stop all        - Stop both services"
echo "   pm2 delete all      - Remove all processes"
echo ""
echo "=========================================="
