#!/bin/bash

# Fix Media Files Permissions
# Run this if images are not showing after deployment

echo "=========================================="
echo "Fixing Media File Permissions"
echo "=========================================="
echo ""

# Set proper permissions for media directory
echo "Setting permissions for media files..."
chmod -R 755 /root/buy2rent/backend/media

# Set permissions for parent directories so Nginx can access them
echo "Setting permissions for parent directories..."
chmod 755 /root
chmod 755 /root/buy2rent
chmod 755 /root/buy2rent/backend

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ Media file permissions fixed!"
echo ""
echo "Test an image URL:"
echo "  https://procurement.buy2rent.eu/media/[path-to-image]"
echo ""
