# Apartments Not Showing - Debug Guide

## Problem
Frontend shows "All Apartments (0)" even though Django admin shows products exist.

## Key Issue
**Products ≠ Apartments**

Looking at your Django admin screenshot, you're viewing **Products** (which belong to apartments), but the frontend Apartments page is trying to fetch **Apartment** records, which might not exist in the database.

---

## Diagnosis Steps

### Step 1: Check if Apartments Exist in Database

Run this command in your backend terminal:

```bash
cd e:/meir/buy2rent-apartment-admin/backend
python check_apartments.py
```

This will show you:
- How many Client records exist
- How many Apartment records exist
- Details of each apartment

**Expected Output:**
```
✓ Total Clients: X
✓ Total Apartments: X
```

**If you see "Total Apartments: 0"** → This is your problem!

---

### Step 2: Check Browser Console

Open your frontend in the browser:
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Refresh the page
4. Look for these log messages:

```
🔍 Fetching apartments with params: {type: "furnishing"}
📦 Apartments API response: [...]
📊 Number of apartments: X
```

**What to check:**
- Is the API being called?
- What does the response contain?
- Is it an empty array `[]`?

---

### Step 3: Check Network Tab

In DevTools:
1. Go to **Network** tab
2. Refresh the page
3. Look for request to `/api/apartments/`
4. Click on it and check:
   - **Status**: Should be 200
   - **Response**: What data is returned?

**Example good response:**
```json
[
  {
    "id": "uuid-here",
    "name": "hero1",
    "type": "furnishing",
    "client": "client-uuid",
    "address": "...",
    ...
  }
]
```

**If response is `[]`** → No apartments in database

---

## Common Causes & Solutions

### Cause 1: No Apartment Records in Database ⚠️

**Symptom:** Database has Products but no Apartments

**Why:** Products are imported from Excel and linked to apartments by name (e.g., "hero1"), but the Apartment record itself was never created.

**Solution:** Create apartments manually or via script

#### Option A: Create via Django Admin
1. Go to `http://localhost:8000/admin/`
2. Click "Apartments" → "Add Apartment"
3. Fill in:
   - Name: hero1
   - Type: Furnishing or Renovating
   - Client: Select a client
   - Address, dates, etc.
4. Save

#### Option B: Create via Frontend
1. Go to `http://localhost:8080/apartments`
2. Click "Add Apartment" button
3. Fill in the form
4. Submit

#### Option C: Create via Python Script

Create `backend/create_sample_apartments.py`:

```python
#!/usr/bin/env python
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apartments.models import Apartment
from clients.models import Client

# Get or create a client
client, created = Client.objects.get_or_create(
    name="Default Client",
    defaults={
        'email': 'client@example.com',
        'phone': '+1234567890',
        'account_status': 'Active',
        'type': 'Investor'
    }
)

# Create apartment for hero1
apt1, created = Apartment.objects.get_or_create(
    name="hero1",
    defaults={
        'type': 'furnishing',
        'client': client,
        'address': 'Budapest, Hungary',
        'status': 'Planning',
        'designer': 'Barbara Kovács',
        'start_date': date.today(),
        'due_date': date.today() + timedelta(days=90),
        'progress': 0,
        'notes': 'Created automatically'
    }
)

if created:
    print(f"✓ Created apartment: {apt1.name}")
else:
    print(f"✓ Apartment already exists: {apt1.name}")

print(f"\nTotal apartments: {Apartment.objects.count()}")
```

Run it:
```bash
python backend/create_sample_apartments.py
```

---

### Cause 2: Type Filter Mismatch

**Symptom:** Apartments exist but have different `type` than filter

**Check:** The frontend filters by `type: 'furnishing'` by default. If your apartments have `type: 'renovating'`, they won't show.

**Solution:** Click the "Renovating" tab in the frontend

---

### Cause 3: API Not Running

**Symptom:** Network tab shows failed requests or CORS errors

**Solution:** 
1. Make sure Django backend is running:
   ```bash
   cd backend
   python manage.py runserver
   ```
2. Check it's accessible at `http://localhost:8000/api/apartments/`

---

### Cause 4: Authentication Issues

**Symptom:** API returns 401 Unauthorized

**Solution:**
1. Make sure you're logged in
2. Check localStorage has `access_token`
3. Try logging out and back in

---

## Quick Fix Summary

**Most Likely Issue:** No Apartment records in database, only Product records.

**Quick Fix:**
1. Run `python check_apartments.py` to confirm
2. If 0 apartments, create them via Django admin or frontend
3. Refresh frontend page

---

## After Fix

Once apartments are created, you should see:
- Apartment list populated
- Each apartment showing name, owner, address, status
- Ability to click and view details
- Products linked to apartments visible in apartment detail view

---

## Still Not Working?

1. **Check browser console** for the debug logs (🔍 📦 📊)
2. **Check Network tab** for API response
3. **Share the console output** and I can help further
4. **Check if backend is running** on port 8000
5. **Verify database file** exists and has data

The debug logs I added will show exactly what the API is returning!
