#!/bin/bash

# Production Setup Script for procurement.buy2rent.eu
# This script automates the production deployment setup

set -e  # Exit on error

DOMAIN="procurement.buy2rent.eu"
VPS_IP="194.163.180.84"
PROJECT_DIR="/root/buy2rent"

echo "=========================================="
echo "Production Setup for Buy2Rent"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Check DNS
echo "Step 1: Checking DNS configuration..."
DNS_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
if [ "$DNS_IP" != "$VPS_IP" ]; then
    echo "⚠️  WARNING: DNS not configured correctly!"
    echo "   Expected: $VPS_IP"
    echo "   Got: $DNS_IP"
    echo ""
    echo "Please configure your DNS A record:"
    echo "   Type: A"
    echo "   Name: procurement"
    echo "   Value: $VPS_IP"
    echo ""
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
else
    echo "✅ DNS configured correctly"
fi
echo ""

# Step 2: Install Nginx
echo "Step 2: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt update
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi
echo ""

# Step 3: Install Certbot
echo "Step 3: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi
echo ""

# Step 4: Install PM2
echo "Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi
echo ""

# Step 5: Install Gunicorn
echo "Step 5: Installing Gunicorn..."
cd $PROJECT_DIR/backend
if [ -d "myenv" ]; then
    source myenv/bin/activate
    pip install gunicorn
    echo "✅ Gunicorn installed"
else
    echo "⚠️  Virtual environment not found, installing globally"
    pip3 install gunicorn
fi
echo ""

# Step 6: Configure Nginx
echo "Step 6: Configuring Nginx..."
cat > /etc/nginx/sites-available/buy2rent << 'NGINX_EOF'
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:5173;
}

server {
    listen 80;
    server_name procurement.buy2rent.eu;
    
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
    
    location /auth/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /admin/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /root/buy2rent/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        alias /root/buy2rent/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    client_max_body_size 100M;
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/buy2rent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx
echo "✅ Nginx configured"
echo ""

# Step 7: Update Backend Configuration
echo "Step 7: Updating backend configuration..."
cd $PROJECT_DIR/backend

# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

cat > .env << ENV_EOF
SECRET_KEY=$SECRET_KEY
DEBUG=False
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=$DOMAIN,$VPS_IP,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://$DOMAIN,http://$DOMAIN,http://$VPS_IP:5173
ENV_EOF

echo "✅ Backend configured"
echo ""

# Step 8: Update Frontend Configuration
echo "Step 8: Updating frontend configuration..."
cd $PROJECT_DIR/frontend

cat > .env.production << FRONTEND_EOF
VITE_API_URL=https://$DOMAIN/api
VITE_AUTH_URL=https://$DOMAIN/auth
FRONTEND_EOF

echo "Building frontend..."
npm run build
echo "✅ Frontend configured and built"
echo ""

# Step 9: Collect Static Files
echo "Step 9: Collecting Django static files..."
cd $PROJECT_DIR/backend
python manage.py collectstatic --noinput
echo "✅ Static files collected"
echo ""

# Step 10: Create PM2 Ecosystem
echo "Step 10: Creating PM2 configuration..."
mkdir -p $PROJECT_DIR/logs

cat > $PROJECT_DIR/ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'buy2rent-backend',
      cwd: '/root/buy2rent/backend',
      script: '/root/buy2rent/backend/myenv/bin/gunicorn',
      args: 'config.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 120',
      interpreter: 'none',
      env: {
        DJANGO_SETTINGS_MODULE: 'config.settings',
        PYTHONPATH: '/root/buy2rent/backend'
      },
      error_file: '/root/buy2rent/logs/backend-error.log',
      out_file: '/root/buy2rent/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'buy2rent-frontend',
      cwd: '/root/buy2rent/frontend',
      script: 'serve',
      args: '-s dist -l 5173',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/buy2rent/logs/frontend-error.log',
      out_file: '/root/buy2rent/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
PM2_EOF

echo "✅ PM2 configuration created"
echo ""

# Step 11: Start Applications
echo "Step 11: Starting applications with PM2..."
cd $PROJECT_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "✅ Applications started"
echo ""

# Step 12: Setup PM2 Startup
echo "Step 12: Setting up PM2 auto-start..."
pm2 startup systemd -u root --hp /root
echo "✅ PM2 auto-start configured"
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Install SSL certificate:"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "2. After SSL is installed, your site will be available at:"
echo "   https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs                - View logs"
echo "   pm2 restart all         - Restart applications"
echo "   sudo systemctl status nginx - Check Nginx status"
echo ""
echo "=========================================="
