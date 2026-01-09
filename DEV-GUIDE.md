# 🚀 Buy2Rent Development Guide

## Quick Start - See Changes INSTANTLY

### Option 1: Local Development (Recommended for Development)

**Start local dev servers with live reload:**
```bash
cd /root/buy2rent
./start-local-dev.sh
```

This will:
- ✨ **Frontend**: Changes appear INSTANTLY (Hot Module Replacement)
- ✨ **Backend**: Auto-reloads when you save Python files
- 🌐 Frontend runs on: http://localhost:8080
- 🔧 Backend runs on: http://localhost:8000

**To stop:** Press `Ctrl+C`

---

### Option 2: Production Deployment (Only when ready to deploy)

**Update production servers:**
```bash
cd /root/buy2rent
./update-deployment.sh
```

⚠️ **Warning**: This rebuilds everything and restarts production servers. Only use when deploying to production!

---

## How Live Reload Works

### Frontend (Vite + React)
- **Hot Module Replacement (HMR)** - Changes appear in browser WITHOUT refresh
- Edit any `.tsx`, `.ts`, `.css` file
- Save the file
- Browser updates INSTANTLY (usually < 1 second)
- No manual refresh needed!

### Backend (Django)
- **Auto-reload** - Django detects Python file changes
- Edit any `.py` file
- Save the file
- Server restarts automatically (2-3 seconds)
- API endpoints update immediately

---

## Development Workflow

### 1. Start Development Servers
```bash
./start-local-dev.sh
```

### 2. Open Your Browser
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000/api/docs/

### 3. Make Changes
- Edit files in `frontend/src/` or `backend/`
- Save the file
- See changes INSTANTLY in browser

### 4. View Logs (if needed)
```bash
# Backend logs
tail -f logs/backend-dev.log

# Frontend logs
tail -f logs/frontend-dev.log
```

---

## Port Configuration

| Service | Development | Production |
|---------|------------|------------|
| Frontend | localhost:8080 | procurement.buy2rent.eu |
| Backend | localhost:8000 | 194.163.180.84:8000 |

**Note**: Development and production run on different ports, so you can run both simultaneously!

---

## Common Issues

### "Port already in use"
If you see port errors:
```bash
# Kill process on port 8080 (frontend)
lsof -ti:8080 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

### Changes not appearing?
1. Check if dev server is running: `ps aux | grep "runserver\|vite"`
2. Check logs: `tail -f logs/frontend-dev.log`
3. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Backend not auto-reloading?
- Make sure you're editing `.py` files in `backend/`
- Django only reloads on Python file changes
- For `.env` changes, restart the server manually

---

## Environment Files

### Development
- `frontend/.env.local` - Local development (localhost)
- Points to: http://localhost:8000

### Production
- `frontend/.env` - Production deployment
- Points to: http://194.163.180.84:8000

**Vite automatically uses `.env.local` when running `npm run dev`**

---

## Best Practices

### ✅ DO
- Use `./start-local-dev.sh` for development
- Make small changes and test frequently
- Keep dev servers running while coding
- Use browser DevTools for debugging

### ❌ DON'T
- Don't run `update-deployment.sh` for every change
- Don't edit production files directly
- Don't commit `.env.local` to git
- Don't run production and dev on same ports

---

## Deployment Checklist

Before running `./update-deployment.sh`:

- [ ] Test all changes in local development
- [ ] Commit changes to git
- [ ] Update version numbers if needed
- [ ] Check no console.log statements in production code
- [ ] Verify .env files have correct production values
- [ ] Run `npm run build` locally to test build
- [ ] Backup database if making schema changes

---

## Useful Commands

```bash
# Start local development
./start-local-dev.sh

# Deploy to production
./update-deployment.sh

# Check production status
pm2 status

# View production logs
pm2 logs

# Restart production only
pm2 restart buy2rent-frontend
pm2 restart buy2rent-backend

# Stop local dev servers
# Press Ctrl+C in the terminal running start-local-dev.sh
```

---

## Need Help?

- Frontend not loading? Check `logs/frontend-dev.log`
- Backend errors? Check `logs/backend-dev.log`
- API not working? Visit http://localhost:8000/api/docs/
- Database issues? Run `python manage.py migrate`

---

**Happy Coding! 🎉**
