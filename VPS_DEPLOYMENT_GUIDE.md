# VPS Deployment Guide - Buy2Rent Application

## Problem Identified
Your application was loading indefinitely because:
1. ❌ Frontend API URLs were hardcoded to `http://localhost:8000`
2. ❌ Django ALLOWED_HOSTS only allowed `localhost`
3. ❌ Django CORS settings only allowed `localhost` origins
4. ❌ No environment-based configuration for production

## Solution Applied
✅ Created centralized API configuration for frontend
✅ Made Django settings configurable via environment variables
✅ Created production environment files
✅ Updated all API service files to use dynamic URLs

---

## Step-by-Step Deployment Instructions

### 1. Get Your VPS IP Address
```bash
# On your VPS, run:
curl ifconfig.me
# Or:
hostname -I
```
**Example:** `123.45.67.89`

---

### 2. Configure Backend for Production

#### A. Edit Backend Environment File
```bash
cd /root/buy2rent/backend
nano .env.production
```

**Update these values:**
```env
SECRET_KEY=your-super-secret-production-key-change-this-now
DEBUG=False
DATABASE_URL=sqlite:///db.sqlite3

# Replace YOUR_VPS_IP with your actual IP (e.g., 123.45.67.89)
ALLOWED_HOSTS=YOUR_VPS_IP,localhost,127.0.0.1

# Replace YOUR_VPS_IP with your actual IP
CORS_ALLOWED_ORIGINS=http://YOUR_VPS_IP:5173,http://YOUR_VPS_IP:8080
```

**Example with real IP:**
```env
ALLOWED_HOSTS=123.45.67.89,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://123.45.67.89:5173,http://123.45.67.89:8080
```

#### B. Copy Production Environment
```bash
cp .env.production .env
```

---

### 3. Configure Frontend for Production

#### A. Edit Frontend Environment File
```bash
cd /root/buy2rent/frontend
nano .env.production
```

**Update these values:**
```env
# Replace YOUR_VPS_IP with your actual IP (e.g., 123.45.67.89)
VITE_API_URL=http://YOUR_VPS_IP:8000/api
VITE_AUTH_URL=http://YOUR_VPS_IP:8000/auth
```

**Example with real IP:**
```env
VITE_API_URL=http://123.45.67.89:8000/api
VITE_AUTH_URL=http://123.45.67.89:8000/auth
```

#### B. Copy Production Environment
```bash
cp .env.production .env
```

---

### 4. Rebuild Frontend with Production Config

```bash
cd /root/buy2rent/frontend

# Install dependencies if not already done
npm install

# Build for production
npm run build
```

This creates an optimized production build in the `dist/` folder.

---

### 5. Start Backend Server

```bash
cd /root/buy2rent/backend

# Make sure you're using the production .env file
python manage.py runserver 0.0.0.0:8000
```

**Important:** Use `0.0.0.0:8000` instead of `localhost:8000` to allow external connections!

---

### 6. Serve Frontend

#### Option A: Using Vite Preview (Quick Test)
```bash
cd /root/buy2rent/frontend
npm run preview -- --host 0.0.0.0 --port 5173
```

Note: Vite preview uses `--host`, but `serve` uses `-p` for port.

#### Option B: Using a Production Server (Recommended)

**Install serve:**
```bash
npm install -g serve
```

**Serve the built files:**
```bash
cd /root/buy2rent/frontend
serve -s dist -l 5173 --host 0.0.0.0
```

---

### 7. Configure Firewall

Make sure your VPS firewall allows traffic on these ports:

```bash
# For Ubuntu/Debian with UFW
sudo ufw allow 8000/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 8080/tcp
sudo ufw status

# For CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

---

### 8. Access Your Application

Open your browser and go to:
```
http://YOUR_VPS_IP:5173
```

**Example:**
```
http://123.45.67.89:5173
```

---

## Troubleshooting

### Issue: Still Loading Forever

**Check 1: Backend is Running**
```bash
curl http://localhost:8000/api/
```
Should return JSON response.

**Check 2: Frontend Can Reach Backend**
```bash
# From your local machine
curl http://YOUR_VPS_IP:8000/api/
```

**Check 3: Check Browser Console**
- Open browser DevTools (F12)
- Go to Console tab
- Look for errors like "Failed to fetch" or CORS errors

**Check 4: Verify Environment Variables**
```bash
# Frontend - check the console log when page loads
# It should show: "API Configuration: { API_BASE_URL: 'http://YOUR_IP:8000/api', ... }"
```

---

### Issue: CORS Errors

If you see CORS errors in browser console:

1. **Verify backend .env file:**
```bash
cd /root/buy2rent/backend
cat .env | grep CORS
```

2. **Restart backend server** after changing .env

3. **Check Django is using the right settings:**
```bash
cd /root/buy2rent/backend
python manage.py shell
>>> from django.conf import settings
>>> print(settings.ALLOWED_HOSTS)
>>> print(settings.CORS_ALLOWED_ORIGINS)
```

---

### Issue: Connection Refused

**Check if services are listening on all interfaces:**
```bash
# Check what's listening
netstat -tlnp | grep -E '8000|5173'

# Should show 0.0.0.0:8000 NOT 127.0.0.1:8000
```

**Fix:** Always use `0.0.0.0` when starting servers:
- Backend: `python manage.py runserver 0.0.0.0:8000`
- Frontend: `serve -s dist --host 0.0.0.0`

---

## Production Deployment (Long-term)

For production, use proper process managers and web servers:

### Backend with Gunicorn + Nginx

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
cd /root/buy2rent/backend
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Frontend with Nginx

```bash
# Install Nginx
sudo apt install nginx

# Copy built files
sudo cp -r /root/buy2rent/frontend/dist/* /var/www/buy2rent/

# Configure Nginx (create /etc/nginx/sites-available/buy2rent)
```

### Use Process Manager (PM2 or systemd)

Keep services running after terminal closes:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd /root/buy2rent/backend
pm2 start "gunicorn config.wsgi:application --bind 0.0.0.0:8000" --name buy2rent-backend

# Start frontend (if using serve)
cd /root/buy2rent/frontend
pm2 start "serve -s dist -l 5173 --host 0.0.0.0" --name buy2rent-frontend

# Save PM2 config
pm2 save
pm2 startup
```

---

## Quick Reference

### File Locations
- Backend config: `/root/buy2rent/backend/.env`
- Frontend config: `/root/buy2rent/frontend/.env`
- Django settings: `/root/buy2rent/backend/config/settings.py`
- API config: `/root/buy2rent/frontend/src/config/api.ts`

### Important Commands
```bash
# Backend
cd /root/buy2rent/backend
python manage.py runserver 0.0.0.0:8000

# Frontend (development)
cd /root/buy2rent/frontend
npm run dev -- --host 0.0.0.0

# Frontend (production build)
cd /root/buy2rent/frontend
npm run build
serve -s dist -l 5173 --host 0.0.0.0
```

### Ports
- Backend API: `8000`
- Frontend: `5173` or `8080`

---

## Security Notes

⚠️ **IMPORTANT for Production:**

1. **Change SECRET_KEY** in backend `.env` to a random string
2. **Set DEBUG=False** in production
3. **Use HTTPS** with SSL certificates (Let's Encrypt)
4. **Use proper database** (PostgreSQL instead of SQLite)
5. **Set up proper authentication** for admin panel
6. **Use environment variables** for sensitive data
7. **Configure proper firewall rules**
8. **Regular backups** of database

---

## Summary of Changes Made

### Frontend Changes:
1. ✅ Created `/root/buy2rent/frontend/.env` files
2. ✅ Created `/root/buy2rent/frontend/src/config/api.ts`
3. ✅ Updated all 13 API service files to use centralized config:
   - clientApi.ts
   - apartmentApi.ts
   - productApi.ts
   - vendorApi.ts
   - orderApi.ts
   - deliveryApi.ts
   - paymentApi.ts
   - issueApi.ts
   - notificationApi.ts
   - searchApi.ts
   - authApi.ts
   - settingsApi.ts
   - dashboardApi.ts

### Backend Changes:
1. ✅ Created `/root/buy2rent/backend/.env.production`
2. ✅ Updated `config/settings.py` to use environment variables:
   - ALLOWED_HOSTS now configurable
   - CORS_ALLOWED_ORIGINS now configurable

---

## Next Steps

1. **Get your VPS IP address**
2. **Update both .env files** with your IP
3. **Rebuild frontend**: `npm run build`
4. **Start backend**: `python manage.py runserver 0.0.0.0:8000`
5. **Serve frontend**: `serve -s dist -p 5173`
6. **Open browser**: `http://YOUR_VPS_IP:5173`

Good luck! 🚀
