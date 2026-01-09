# 🔥 Hot Reload Development Guide

## Problem Solved
You no longer need to run the full `update-deployment.sh` script which rebuilds everything and takes too much time. Now you can see changes instantly!

---

## 🚀 Quick Start - Three Simple Commands

### 1. **Development Mode with Hot Reload** (Recommended for coding)
```bash
bash quick-reload.sh
```
**What it does:**
- Stops production servers
- Starts development servers with **instant hot reload**
- Frontend: Changes appear **instantly** (HMR - Hot Module Replacement)
- Backend: Auto-restarts on Python file changes (2-3 seconds)

**When to use:** When you're actively developing and want to see changes immediately without any manual refresh or rebuild.

---

### 2. **Quick Restart** (Fast restart without rebuild)
```bash
bash quick-update.sh
```
**What it does:**
- Quickly restarts current servers (dev or production)
- No rebuild, no npm install, no migrations
- Takes only **5-10 seconds**

**When to use:** When you've made small changes and just need a quick restart.

---

### 3. **Back to Production Mode**
```bash
bash back-to-production.sh
```
**What it does:**
- Stops development servers
- Starts production servers (optimized build)

**When to use:** When you're done developing and want to switch back to production mode.

---

## 📊 Comparison Table

| Script | Time | Rebuilds? | Hot Reload? | Use Case |
|--------|------|-----------|-------------|----------|
| `quick-reload.sh` | 10s | ❌ No | ✅ Yes | Active development |
| `quick-update.sh` | 5s | ❌ No | ❌ No | Quick restart |
| `back-to-production.sh` | 10s | ❌ No | ❌ No | Switch to production |
| `update-deployment.sh` | 5-10min | ✅ Yes | ❌ No | Full deployment with new dependencies |

---

## 💡 Recommended Workflow

### Daily Development
1. **Start your day:**
   ```bash
   bash quick-reload.sh
   ```

2. **Code normally** - Changes appear automatically:
   - Edit React components → Browser updates instantly
   - Edit Python files → Backend restarts in 2-3 seconds
   - Edit CSS/Tailwind → Instant update

3. **View logs if needed:**
   ```bash
   pm2 logs buy2rent-frontend-dev
   pm2 logs buy2rent-backend-dev
   ```

4. **End of day:**
   ```bash
   bash back-to-production.sh
   ```

### When to Use Full Deployment
Only use `bash update-deployment.sh` when:
- ✅ You added new npm packages
- ✅ You added new Python packages
- ✅ You have database migrations
- ✅ You need to rebuild the production bundle

---

## 🔍 How It Works

### Development Mode (`quick-reload.sh`)
- **Frontend:** Runs Vite dev server with HMR
  - Port: 8080
  - Hot Module Replacement enabled
  - Changes reflect instantly in browser
  
- **Backend:** Runs Django development server
  - Port: 8000
  - Auto-reloads on .py file changes
  - PM2 watch mode monitors file changes

### Production Mode (`back-to-production.sh`)
- **Frontend:** Serves pre-built static files
  - Uses production build from `dist/`
  - Optimized and minified
  
- **Backend:** Runs Gunicorn WSGI server
  - Multiple workers
  - Production-ready

---

## 📝 Monitoring

### Check Server Status
```bash
pm2 status
```

### View Logs
```bash
# Development mode
pm2 logs buy2rent-frontend-dev
pm2 logs buy2rent-backend-dev

# Production mode
pm2 logs buy2rent-frontend
pm2 logs buy2rent-backend

# All logs
pm2 logs
```

### Stop All Servers
```bash
pm2 stop all
```

### Restart All Servers
```bash
pm2 restart all
```

---

## 🌐 Access URLs

Your application is accessible at:
- **Frontend:** https://procurement.buy2rent.eu
- **Backend API:** https://procurement.buy2rent.eu/api/
- **Admin Panel:** https://procurement.buy2rent.eu/admin/

*Note: URLs remain the same in both dev and production modes. Nginx handles the routing.*

---

## ⚡ Performance Tips

1. **Use development mode only when coding**
   - Development servers use more resources
   - Switch to production when not actively developing

2. **Monitor resource usage**
   ```bash
   pm2 monit
   ```

3. **Clear logs periodically**
   ```bash
   pm2 flush
   ```

---

## 🐛 Troubleshooting

### Frontend not updating?
```bash
# Check if dev server is running
pm2 status

# Restart frontend
pm2 restart buy2rent-frontend-dev

# Check logs
pm2 logs buy2rent-frontend-dev
```

### Backend not reloading?
```bash
# Check if watch mode is active
pm2 status

# Restart backend
pm2 restart buy2rent-backend-dev

# Check logs
pm2 logs buy2rent-backend-dev
```

### Need to add new packages?
```bash
# Stop dev mode
bash back-to-production.sh

# Run full deployment
bash update-deployment.sh
```

---

## 📚 Additional Resources

- **PM2 Documentation:** https://pm2.keymetrics.io/
- **Vite HMR:** https://vitejs.dev/guide/features.html#hot-module-replacement
- **Django Auto-reload:** https://docs.djangoproject.com/en/stable/ref/django-admin/#runserver

---

## 🎯 Summary

**Before (Old Way):**
- Edit code → Run `bash update-deployment.sh` → Wait 5-10 minutes → See changes

**After (New Way):**
- Run `bash quick-reload.sh` once → Edit code → See changes **instantly**

**That's it! Happy coding! 🚀**
