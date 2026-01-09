# Production Deployment Guide - procurement.buy2rent.eu

This guide will help you deploy your Buy2Rent application with:
- ✅ Custom domain: `procurement.buy2rent.eu`
- ✅ HTTPS/SSL encryption
- ✅ Nginx reverse proxy
- ✅ Production-ready setup

---

## Prerequisites

1. **Domain DNS configured**: Point `procurement.buy2rent.eu` to your VPS IP `194.163.180.84`
2. **VPS access**: SSH access to your server
3. **Ports open**: 80 (HTTP) and 443 (HTTPS)

---

## Step 1: Configure DNS (Do This First!)

Before proceeding, you need to configure your domain's DNS records:

### DNS Configuration
Go to your domain registrar (where you bought `buy2rent.eu`) and add an A record:

```
Type: A
Name: procurement
Value: 194.163.180.84
TTL: 3600 (or Auto)
```

**Verify DNS propagation:**
```bash
# Wait 5-10 minutes, then check:
nslookup procurement.buy2rent.eu
# Should return: 194.163.180.84
```

---

## Step 2: Install Nginx

```bash
# Update system
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Step 3: Install Certbot for SSL

```bash
# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 4: Configure Nginx (Before SSL)

Create Nginx configuration for your domain:

```bash
sudo nano /etc/nginx/sites-available/buy2rent
```

**Paste this configuration:**

```nginx
# Backend API server
upstream backend {
    server 127.0.0.1:8000;
}

# Frontend server
upstream frontend {
    server 127.0.0.1:5173;
}

# Redirect HTTP to HTTPS (will be configured after SSL)
server {
    listen 80;
    server_name procurement.buy2rent.eu;
    
    # Temporary: serve directly (before SSL)
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
    
    # API endpoints
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
    
    # Auth endpoints
    location /auth/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /root/buy2rent/backend/static/;
    }
    
    # Media files
    location /media/ {
        alias /root/buy2rent/backend/media/;
    }
}
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/buy2rent /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 5: Update Backend Configuration

```bash
cd /root/buy2rent/backend
nano .env
```

**Update with your domain:**
```env
SECRET_KEY=your-super-secret-production-key-change-this
DEBUG=False
DATABASE_URL=sqlite:///db.sqlite3

# Add your domain to ALLOWED_HOSTS
ALLOWED_HOSTS=procurement.buy2rent.eu,194.163.180.84,localhost,127.0.0.1

# Add your domain to CORS
CORS_ALLOWED_ORIGINS=https://procurement.buy2rent.eu,http://procurement.buy2rent.eu,http://194.163.180.84:5173
```

---

## Step 6: Update Frontend Configuration

```bash
cd /root/buy2rent/frontend
nano .env.production
```

**Update with your domain:**
```env
VITE_API_URL=https://procurement.buy2rent.eu/api
VITE_AUTH_URL=https://procurement.buy2rent.eu/auth
```

**Rebuild frontend:**
```bash
npm run build
```

---

## Step 7: Install SSL Certificate

**IMPORTANT:** Only run this after DNS is configured and pointing to your server!

```bash
# Obtain SSL certificate
sudo certbot --nginx -d procurement.buy2rent.eu

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain SSL certificate from Let's Encrypt
- Update your Nginx configuration
- Set up automatic renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Step 8: Install and Configure Gunicorn (Production WSGI Server)

```bash
cd /root/buy2rent/backend

# Activate virtual environment if you have one
source myenv/bin/activate

# Install Gunicorn
pip install gunicorn

# Test Gunicorn
gunicorn config.wsgi:application --bind 127.0.0.1:8000
```

Press `Ctrl+C` to stop the test.

---

## Step 9: Set Up Process Manager (PM2)

Install PM2 to keep your application running:

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cd /root/buy2rent
nano ecosystem.config.js
```

**Paste this configuration:**

```javascript
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
```

**Create logs directory:**
```bash
mkdir -p /root/buy2rent/logs
```

**Start applications with PM2:**
```bash
cd /root/buy2rent

# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs
```

---

## Step 10: Collect Django Static Files

```bash
cd /root/buy2rent/backend

# Collect static files
python manage.py collectstatic --noinput
```

---

## Step 11: Final Nginx Configuration (After SSL)

After Certbot installs SSL, your Nginx config will be automatically updated. Verify it:

```bash
sudo nano /etc/nginx/sites-available/buy2rent
```

It should now have HTTPS configuration. If not, here's the complete HTTPS version:

```nginx
# Backend API server
upstream backend {
    server 127.0.0.1:8000;
}

# Frontend server
upstream frontend {
    server 127.0.0.1:5173;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name procurement.buy2rent.eu;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name procurement.buy2rent.eu;
    
    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/procurement.buy2rent.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/procurement.buy2rent.eu/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
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
    
    # API endpoints
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
    
    # Auth endpoints
    location /auth/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /root/buy2rent/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /root/buy2rent/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # Increase max upload size
    client_max_body_size 100M;
}
```

**Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 12: Verify Deployment

**Check PM2 status:**
```bash
pm2 status
pm2 logs
```

**Check Nginx:**
```bash
sudo systemctl status nginx
```

**Test your application:**
```bash
# Test backend
curl https://procurement.buy2rent.eu/api/

# Test frontend
curl https://procurement.buy2rent.eu/
```

**Access in browser:**
```
https://procurement.buy2rent.eu
```

---

## Useful Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 logs                      # View logs
pm2 logs buy2rent-backend     # View backend logs
pm2 logs buy2rent-frontend    # View frontend logs
pm2 restart all               # Restart all apps
pm2 stop all                  # Stop all apps
pm2 delete all                # Remove all apps
pm2 save                      # Save current config
```

### Nginx Management
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl reload nginx   # Reload config
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### SSL Certificate Renewal
```bash
sudo certbot renew            # Renew certificates
sudo certbot certificates     # List certificates
```

### Django Management
```bash
cd /root/buy2rent/backend
python manage.py collectstatic --noinput  # Collect static files
python manage.py migrate                  # Run migrations
python manage.py createsuperuser          # Create admin user
```

---

## Troubleshooting

### Issue: 502 Bad Gateway

**Check if backend is running:**
```bash
pm2 status
pm2 logs buy2rent-backend
```

**Check if Gunicorn is listening:**
```bash
netstat -tlnp | grep 8000
```

### Issue: SSL Certificate Error

**Check certificate:**
```bash
sudo certbot certificates
```

**Renew certificate:**
```bash
sudo certbot renew --force-renewal
```

### Issue: Frontend not loading

**Check if frontend is running:**
```bash
pm2 logs buy2rent-frontend
```

**Rebuild frontend:**
```bash
cd /root/buy2rent/frontend
npm run build
pm2 restart buy2rent-frontend
```

### Issue: CORS errors

**Update backend .env:**
```bash
cd /root/buy2rent/backend
nano .env
# Add: CORS_ALLOWED_ORIGINS=https://procurement.buy2rent.eu
```

**Restart backend:**
```bash
pm2 restart buy2rent-backend
```

---

## Security Checklist

- ✅ SSL/HTTPS enabled
- ✅ DEBUG=False in production
- ✅ Strong SECRET_KEY
- ✅ Firewall configured (ports 80, 443 only)
- ✅ Regular backups of database
- ✅ Keep system updated: `sudo apt update && sudo apt upgrade`
- ✅ Monitor logs regularly
- ✅ Set up fail2ban for SSH protection

---

## Backup Strategy

**Database backup:**
```bash
# Create backup script
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup database
cp /root/buy2rent/backend/db.sqlite3 $BACKUP_DIR/db_$DATE.sqlite3

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /root/buy2rent/backend/media/

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sqlite3" -mtime +7 -delete
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup.sh
```

---

## Summary

Your application is now deployed at:
**https://procurement.buy2rent.eu**

- ✅ HTTPS/SSL encryption
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Auto-restart on failure
- ✅ Auto-start on system boot
- ✅ Production-ready configuration

Good luck! 🚀
