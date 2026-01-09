# Deployment Update Guide

This guide explains how to update your deployed Buy2Rent application when you make changes to the code.

## Quick Update Commands

### Update Everything (Frontend + Backend)
```bash
cd /root/buy2rent
bash update-deployment.sh
```

### Update Only Frontend
```bash
cd /root/buy2rent
bash update-frontend.sh
```

### Update Only Backend
```bash
cd /root/buy2rent
bash update-backend.sh
```

---

## Manual Update Process

### 1. Update Frontend

When you make changes to React code:

```bash
# Navigate to frontend directory
cd /root/buy2rent/frontend

# Pull latest code (if using git)
git pull origin main

# Install any new dependencies
npm install

# Build the production bundle
npm run build

# Restart the frontend service
pm2 restart buy2rent-frontend

# Check status
pm2 logs buy2rent-frontend --lines 50
```

### 2. Update Backend

When you make changes to Django code:

```bash
# Navigate to backend directory
cd /root/buy2rent/backend

# Pull latest code (if using git)
git pull origin main

# Activate virtual environment
source myenv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Run database migrations (if any)
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart the backend service
pm2 restart buy2rent-backend

# Check status
pm2 logs buy2rent-backend --lines 50
```

### 3. Update Both

```bash
# Update frontend
cd /root/buy2rent/frontend
git pull origin main
npm install
npm run build
pm2 restart buy2rent-frontend

# Update backend
cd /root/buy2rent/backend
source myenv/bin/activate
git pull origin main
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
pm2 restart buy2rent-backend

# Save PM2 configuration
pm2 save

# Check everything is running
pm2 status
```

---

## Common Update Scenarios

### Scenario 1: UI Changes Only (React Components, Styles)
```bash
cd /root/buy2rent/frontend
npm run build
pm2 restart buy2rent-frontend
```

### Scenario 2: API Changes Only (Django Views, Models)
```bash
cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py migrate  # if models changed
pm2 restart buy2rent-backend
```

### Scenario 3: Database Schema Changes
```bash
cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py makemigrations  # if you created migrations locally
python manage.py migrate
pm2 restart buy2rent-backend
```

### Scenario 4: New Dependencies Added
```bash
# Frontend
cd /root/buy2rent/frontend
npm install
npm run build
pm2 restart buy2rent-frontend

# Backend
cd /root/buy2rent/backend
source myenv/bin/activate
pip install -r requirements.txt
pm2 restart buy2rent-backend
```

### Scenario 5: Environment Variables Changed
```bash
# Update .env files
nano /root/buy2rent/backend/.env
nano /root/buy2rent/frontend/.env.production

# Rebuild frontend (env vars are bundled at build time)
cd /root/buy2rent/frontend
npm run build

# Restart both services
pm2 restart all
```

---

## Using Git for Updates

### Initial Setup (if not done)
```bash
cd /root/buy2rent
git init
git remote add origin YOUR_REPOSITORY_URL
```

### Regular Updates
```bash
cd /root/buy2rent

# Pull latest changes
git pull origin main

# Update frontend
cd frontend
npm install
npm run build
pm2 restart buy2rent-frontend

# Update backend
cd ../backend
source myenv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
pm2 restart buy2rent-backend

# Save PM2 state
pm2 save
```

---

## Rollback (If Something Goes Wrong)

### Quick Rollback
```bash
# Rollback to previous git commit
git reset --hard HEAD~1

# Rebuild and restart
cd frontend
npm run build
cd ../backend
source myenv/bin/activate
python manage.py migrate
pm2 restart all
```

### Restore from Backup
```bash
# If you have backups
cp -r /path/to/backup/frontend/dist /root/buy2rent/frontend/
pm2 restart buy2rent-frontend
```

---

## Monitoring After Updates

### Check Application Status
```bash
pm2 status
pm2 logs --lines 100
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo nginx -t  # test configuration
```

### Check Application in Browser
```
https://procurement.buy2rent.eu
```

### View Real-time Logs
```bash
# Frontend logs
pm2 logs buy2rent-frontend

# Backend logs
pm2 logs buy2rent-backend

# Both
pm2 logs
```

---

## Best Practices

1. **Always test locally first** before deploying to production
2. **Backup your database** before major updates:
   ```bash
   cd /root/buy2rent/backend
   source myenv/bin/activate
   python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json
   ```
3. **Use git tags** for version tracking:
   ```bash
   git tag -a v1.0.1 -m "Version 1.0.1"
   git push origin v1.0.1
   ```
4. **Monitor logs** after deployment for any errors
5. **Keep dependencies updated** regularly for security
6. **Test the site** after every deployment

---

## Automated Updates with CI/CD (Advanced)

For automatic deployments, you can set up GitHub Actions or similar:

1. Push code to GitHub
2. GitHub Actions runs tests
3. If tests pass, automatically deploy to VPS
4. Restart services

Example workflow file would be in `.github/workflows/deploy.yml`

---

## Troubleshooting Updates

### Frontend not updating?
```bash
# Clear build cache
cd /root/buy2rent/frontend
rm -rf dist node_modules/.cache
npm run build
pm2 restart buy2rent-frontend
```

### Backend not reflecting changes?
```bash
# Restart with fresh Python cache
cd /root/buy2rent/backend
find . -type d -name __pycache__ -exec rm -r {} +
pm2 restart buy2rent-backend
```

### Database migration errors?
```bash
cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py showmigrations  # see migration status
python manage.py migrate --fake-initial  # if needed
```

### PM2 not restarting?
```bash
pm2 delete all
pm2 start /root/buy2rent/ecosystem.config.js
pm2 save
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Update frontend | `cd frontend && npm run build && pm2 restart buy2rent-frontend` |
| Update backend | `cd backend && source myenv/bin/activate && pm2 restart buy2rent-backend` |
| View logs | `pm2 logs` |
| Check status | `pm2 status` |
| Restart all | `pm2 restart all` |
| Save PM2 config | `pm2 save` |
| Test Nginx | `sudo nginx -t` |
| Reload Nginx | `sudo systemctl reload nginx` |

---

## Support

If you encounter issues during updates:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify services are running: `pm2 status`
4. Test Nginx config: `sudo nginx -t`
