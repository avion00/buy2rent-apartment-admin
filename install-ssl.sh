#!/bin/bash

# SSL Installation Script
# Run this AFTER DNS is configured and pointing to your server

DOMAIN="procurement.buy2rent.eu"

echo "=========================================="
echo "SSL Certificate Installation"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Check DNS
echo "Checking DNS configuration..."
DNS_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
VPS_IP_V4=$(curl -4 -s ifconfig.me 2>/dev/null || echo "")
VPS_IP_V6=$(curl -6 -s ifconfig.me 2>/dev/null || echo "")

# Check if DNS matches either IPv4 or IPv6
if [ "$DNS_IP" != "$VPS_IP_V4" ] && [ "$DNS_IP" != "$VPS_IP_V6" ]; then
    echo "❌ ERROR: DNS not pointing to this server!"
    echo "   Domain resolves to: $DNS_IP"
    echo "   This server IPv4: $VPS_IP_V4"
    echo "   This server IPv6: $VPS_IP_V6"
    echo ""
    echo "Please wait for DNS propagation (5-30 minutes) and try again."
    exit 1
fi

echo "✅ DNS configured correctly"
echo ""

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "❌ ERROR: Nginx is not running"
    echo "   Start it with: sudo systemctl start nginx"
    exit 1
fi

echo "✅ Nginx is running"
echo ""

# Install SSL certificate
echo "Installing SSL certificate..."
echo "You will be asked for:"
echo "  - Your email address"
echo "  - Agreement to terms of service"
echo "  - Whether to redirect HTTP to HTTPS (choose Yes)"
echo ""

read -p "Press Enter to continue..."

certbot --nginx -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ SSL Certificate Installed Successfully!"
    echo "=========================================="
    echo ""
    echo "Your site is now available at:"
    echo "   https://$DOMAIN"
    echo ""
    echo "Certificate will auto-renew. Test renewal with:"
    echo "   sudo certbot renew --dry-run"
    echo ""
else
    echo ""
    echo "❌ SSL installation failed"
    echo "Common issues:"
    echo "  - DNS not propagated yet (wait longer)"
    echo "  - Port 80 not accessible"
    echo "  - Domain already has certificate"
    echo ""
    echo "Check logs: sudo tail -f /var/log/letsencrypt/letsencrypt.log"
fi
