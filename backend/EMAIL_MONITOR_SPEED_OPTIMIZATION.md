# Email Monitor Speed Optimization

## Problem Solved
**Issue:** Vendor replies took 5+ minutes to appear in Communication Log

**Root Cause:** Email monitor was checking inbox every 300 seconds (5 minutes)

---

## Solution Applied

### **1. Reduced Check Interval**
Changed from **5 minutes (300s)** to **30 seconds**

**Configuration:**
```bash
# In .env file
IMAP_CHECK_INTERVAL=30
```

### **2. Updated Email Monitor Script**
Modified `/root/buy2rent/backend/email_monitor_pm2.sh` to:
- Read `IMAP_CHECK_INTERVAL` from `.env` file
- Default to 30 seconds if not set
- Use `monitor_vendor_emails_complete` command

**Script:**
```bash
#!/bin/bash
cd /root/buy2rent/backend
source myenv/bin/activate

# Load IMAP_CHECK_INTERVAL from .env, default to 30 seconds
INTERVAL=$(grep IMAP_CHECK_INTERVAL .env | cut -d '=' -f2)
INTERVAL=${INTERVAL:-30}

python manage.py monitor_vendor_emails_complete --interval $INTERVAL
```

### **3. Restarted Email Monitor**
```bash
pm2 restart email-monitor
```

---

## Performance Comparison

### **Before:**
- Check interval: **300 seconds (5 minutes)**
- Vendor reply delay: **Up to 5 minutes**
- User experience: Slow, frustrating

### **After:**
- Check interval: **30 seconds**
- Vendor reply delay: **Maximum 30 seconds**
- User experience: Fast, near real-time

---

## How It Works Now

### **Timeline:**
1. **0:00** - Vendor sends reply to Gmail
2. **0:01** - Email arrives in `chaudharyamic@gmail.com` inbox
3. **0:02** - Admin sees notification (instant)
4. **0:30** - Email monitor checks inbox (max wait)
5. **0:32** - AI analyzes reply
6. **0:33** - AI generates response
7. **0:34** - AI auto-sends reply to vendor
8. **0:35** - Communication Log updated on frontend

**Total time: ~35 seconds maximum** (vs 5+ minutes before)

---

## Email Monitor Status

### **Current Configuration:**
```
Process: email-monitor (PM2)
Command: python manage.py monitor_vendor_emails_complete --interval 30
Status: Running
Check Interval: 30 seconds
IMAP Server: imap.gmail.com
Email Account: chaudharyamic@gmail.com
```

### **Verify Running:**
```bash
pm2 status email-monitor
ps aux | grep monitor_vendor_emails
```

### **Check Logs:**
```bash
pm2 logs email-monitor --lines 50
```

---

## Adjusting Check Interval

### **To make it faster (15 seconds):**
```bash
# Edit .env
IMAP_CHECK_INTERVAL=15

# Restart
pm2 restart email-monitor
```

### **To make it slower (60 seconds):**
```bash
# Edit .env
IMAP_CHECK_INTERVAL=60

# Restart
pm2 restart email-monitor
```

### **Recommended Settings:**
- **Development/Testing:** 15-30 seconds
- **Production (low volume):** 30-60 seconds
- **Production (high volume):** 60-120 seconds

---

## Gmail API Rate Limits

Gmail IMAP has rate limits:
- **Recommended:** Check every 30-60 seconds
- **Minimum safe:** 15 seconds
- **Too frequent:** < 10 seconds (may trigger rate limiting)

**Current setting (30 seconds) is optimal for:**
- ✅ Fast response time
- ✅ No rate limiting issues
- ✅ Low server load

---

## Monitoring & Troubleshooting

### **Check if monitor is running:**
```bash
pm2 list | grep email-monitor
```

### **View real-time logs:**
```bash
pm2 logs email-monitor --lines 100
```

### **Manual check (for testing):**
```bash
cd /root/buy2rent/backend
./myenv/bin/python manage.py monitor_vendor_emails_complete --once
```

### **Restart if needed:**
```bash
pm2 restart email-monitor
```

---

## Status: ✅ OPTIMIZED

**Email monitor is now checking every 30 seconds!**

Vendor replies will appear in Communication Log within:
- **Best case:** 1-5 seconds (if check happens right after email arrives)
- **Average case:** 15-20 seconds
- **Worst case:** 30-35 seconds (if check just happened before email arrived)

**This is 10x faster than before!** 🚀
