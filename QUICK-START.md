# 🚀 Quick Start - Development with Live Preview

## Your Requirement: Site Deployed + Live Changes

You want:
- ✅ Website stays deployed and accessible
- ✅ See frontend changes INSTANTLY while coding
- ✅ No need to run deployment script every time

## Solution: Hybrid Development Mode

**Frontend**: Runs locally with live reload (instant changes)  
**Backend**: Uses production server (already deployed)

---

## How to Start

### 1. Start Frontend Development Server

```bash
cd /root/buy2rent
./start-frontend-dev.sh
```

### 2. Open Browser

- **Development**: http://localhost:8080 (for coding with live reload)
- **Production**: https://procurement.buy2rent.eu (stays online)

### 3. Make Changes

- Edit any file in `frontend/src/`
- Save the file
- **Changes appear INSTANTLY** in browser at localhost:8080
- No refresh needed!

### 4. Stop Development Server

Press `Ctrl+C` in the terminal

---

## How It Works

```
┌─────────────────────────────────────────┐
│  YOUR WORKFLOW                          │
├─────────────────────────────────────────┤
│                                         │
│  1. Edit frontend/src/components/...   │
│  2. Save file                           │
│  3. Browser updates INSTANTLY (<1 sec)  │
│  4. Keep coding!                        │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  WHAT'S RUNNING                         │
├─────────────────────────────────────────┤
│                                         │
│  Frontend Dev:  localhost:8080          │
│  ↓ connects to ↓                        │
│  Backend API:   194.163.180.84:8000     │
│                                         │
│  Production:    procurement.buy2rent.eu │
│  (stays online, unaffected)             │
│                                         │
└─────────────────────────────────────────┘
```

---

## When to Update Backend

If you need to change backend code:

```bash
cd /root/buy2rent
./update-backend.sh
```

This updates only the backend without rebuilding frontend.

---

## When to Deploy Everything

Only when you're ready to deploy frontend changes to production:

```bash
cd /root/buy2rent
./update-deployment.sh
```

⚠️ This rebuilds everything and takes 2-3 minutes.

---

## Troubleshooting

### "Network Error" in browser?

**Check if production backend is running:**
```bash
pm2 status
```

Should show `buy2rent-backend` as `online`.

**If backend is stopped:**
```bash
pm2 restart buy2rent-backend
```

### Changes not appearing?

1. Make sure dev server is running: `./start-frontend-dev.sh`
2. Check you're viewing: http://localhost:8080 (not production URL)
3. Hard refresh: `Ctrl+Shift+R`

### Port 8080 already in use?

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Then restart
./start-frontend-dev.sh
```

---

## Summary

| Task | Command |
|------|---------|
| **Start dev with live reload** | `./start-frontend-dev.sh` |
| **Update backend only** | `./update-backend.sh` |
| **Deploy everything** | `./update-deployment.sh` |
| **Check production status** | `pm2 status` |
| **View production logs** | `pm2 logs` |

---

**You're all set!** Run `./start-frontend-dev.sh` and start coding with instant live preview! 🎉
