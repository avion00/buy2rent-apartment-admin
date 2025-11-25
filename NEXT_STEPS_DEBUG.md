# Next Steps: Debug Apartments Not Showing

## ✅ Confirmed: Apartment EXISTS in Database

From Django admin screenshot:
- **1 Apartment** found
- Name: **hero1**
- Type: **furnishing** ✓ (matches frontend filter)
- Client: sagar owner/client
- Status: Delivery

## 🔍 Debug Steps

### Step 1: Check Browser Console (MOST IMPORTANT)

I've added comprehensive debug logging. Please:

1. **Open your frontend** at `http://localhost:8080/apartments`
2. **Press F12** to open DevTools
3. **Go to Console tab**
4. **Refresh the page**
5. **Look for these log messages:**

```
🔍 Fetching apartments with params: {type: "furnishing"}
📦 Apartments API response: [...]
📊 Number of apartments: X
🏢 Apartments Page State: {...}
```

### What to Share:

**Copy and paste the ENTIRE console output** showing:
- The 🔍 fetching message
- The 📦 response message
- The 📊 count message
- The 🏢 page state message

This will tell us EXACTLY what's happening!

---

### Step 2: Check Network Tab

In DevTools:
1. Go to **Network** tab
2. Refresh the page
3. Look for request to `/api/apartments/?type=furnishing`
4. Click on it
5. Check the **Response** tab

**What should you see:**
```json
[
  {
    "id": "some-uuid",
    "name": "hero1",
    "type": "furnishing",
    "client": "client-uuid",
    "client_id": "client-uuid",
    "client_details": {...},
    "owner": "sagar owner/client",
    "address": "...",
    "status": "Delivery",
    "designer": "...",
    "start_date": "2025-11-10",
    "due_date": "2025-11-25",
    "progress": 0,
    "notes": "",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

**If you see empty array `[]`:**
- The API is working but returning no data
- Possible filter issue

**If you see error:**
- API might not be running
- Authentication issue
- CORS issue

---

## Possible Issues & Quick Fixes

### Issue 1: API Not Running
**Check:** Is Django backend running?
```bash
# Should be running on port 8000
cd backend
python manage.py runserver
```

**Test:** Visit `http://localhost:8000/api/apartments/` in browser
- Should show JSON data or login page

---

### Issue 2: Authentication Problem
**Symptom:** 401 Unauthorized in Network tab

**Fix:**
1. Make sure you're logged in to the frontend
2. Check localStorage has `access_token`:
   - In Console tab, type: `localStorage.getItem('access_token')`
   - Should return a token string
3. If no token, log out and log back in

---

### Issue 3: CORS Error
**Symptom:** Console shows CORS error

**Fix:** Check `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
```

---

### Issue 4: Wrong Port
**Check:** Frontend is calling the right backend URL

In Console, type:
```javascript
localStorage.getItem('api_base_url')
```

Should be: `http://localhost:8000`

---

### Issue 5: Client Not Found
**Symptom:** Apartment loads but shows "Unknown Client"

**Cause:** The client UUID in apartment doesn't match any client in database

**Fix:** Check Django admin:
1. Go to Clients
2. Find "sagar owner/client"
3. Copy the UUID
4. Go to Apartments → hero1
5. Make sure Client field matches that UUID

---

## Quick Test: Direct API Call

Open a new browser tab and visit:
```
http://localhost:8000/api/apartments/?type=furnishing
```

**If you see JSON data:** Backend is working, issue is in frontend
**If you see login page:** You need to authenticate
**If you see error:** Backend has an issue

---

## What I Need From You

Please share:

1. ✅ **Console logs** (the 🔍 📦 📊 🏢 messages)
2. ✅ **Network tab response** for `/api/apartments/`
3. ✅ **Any error messages** in red in console
4. ✅ **Screenshot** of the Network tab showing the request

With this information, I can pinpoint the exact issue!

---

## Expected Result

Once fixed, you should see:
- Apartment "hero1" in the list
- Type: Furnishing badge
- Owner: sagar owner/client
- Status: Delivery badge
- Progress: 0%
- Start/Due dates

The apartment is definitely in the database - we just need to figure out why the frontend isn't displaying it! 🚀
