# 🧪 Authentication Testing Guide

## Quick Start

### 1. Start Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend: http://localhost:8000
Frontend: http://localhost:5173

## 🎯 Test Scenarios

### Test 1: Protected Route Redirect ✅

**Goal:** Verify unauthenticated users are redirected to login

**Steps:**
1. Open browser in incognito/private mode
2. Go to: http://localhost:5173/overview
3. **Expected:** Redirected to http://localhost:5173/login
4. **Verify:** Cannot access /overview without login

**Pass Criteria:** ✅ Redirected to /login

---

### Test 2: Login & Access Protected Pages ✅

**Goal:** Verify login works and grants access to protected pages

**Steps:**
1. Go to: http://localhost:5173/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click "Sign in"
4. **Expected:** Redirected to /overview
5. Try accessing other pages:
   - /clients
   - /apartments
   - /products
6. **Expected:** All pages load successfully

**Pass Criteria:** 
- ✅ Login successful
- ✅ Redirected to /overview
- ✅ Can access all protected pages

---

### Test 3: Token Storage ✅

**Goal:** Verify tokens are stored correctly

**Steps:**
1. Login to the app
2. Press F12 to open DevTools
3. Go to: Application > Local Storage > http://localhost:5173
4. **Expected:** See two items:
   - `access_token` - Long JWT string
   - `refresh_token` - Long JWT string
5. Copy the access_token value
6. Go to: https://jwt.io
7. Paste the token
8. **Expected:** See decoded token with:
   - `user_id`
   - `email`
   - `exp` (expiration time)

**Pass Criteria:**
- ✅ Both tokens present in localStorage
- ✅ Tokens are valid JWT format

---

### Test 4: Persistent Session ✅

**Goal:** Verify user stays logged in after browser restart

**Steps:**
1. Login to the app
2. Close browser completely (all windows)
3. Open browser again
4. Go to: http://localhost:5173/overview
5. **Expected:** Page loads without redirect to login
6. **Expected:** User is still authenticated

**Pass Criteria:**
- ✅ No redirect to login
- ✅ User data loaded
- ✅ Can access protected pages

---

### Test 5: Automatic Token Refresh ✅

**Goal:** Verify tokens refresh automatically when expired

**Steps:**
1. Login to the app
2. Open DevTools > Network tab
3. Clear network log
4. Navigate to: /clients
5. Note the access_token in localStorage
6. **Wait 5-10 minutes** (or manually expire token)
7. Navigate to: /apartments
8. **Expected in Network tab:**
   - Initial request returns 401
   - Automatic call to /auth/refresh/
   - Original request retried with new token
   - Request succeeds
9. Check localStorage
10. **Expected:** access_token value has changed

**Pass Criteria:**
- ✅ Token refreshed automatically
- ✅ No redirect to login
- ✅ Page loads successfully
- ✅ New access_token in localStorage

---

### Test 6: Expired Refresh Token ✅

**Goal:** Verify redirect to login when refresh token expires

**Steps:**
1. Login to the app
2. Open DevTools > Application > Local Storage
3. Delete the `refresh_token` entry
4. Navigate to a different page
5. **Expected:** Redirected to /login
6. **Expected:** Both tokens cleared from localStorage

**Pass Criteria:**
- ✅ Redirected to /login
- ✅ Tokens cleared
- ✅ Cannot access protected pages

---

### Test 7: Logout ✅

**Goal:** Verify logout clears session and redirects

**Steps:**
1. Login to the app
2. Click logout button (in header/navbar)
3. **Expected:** Redirected to /login
4. Check localStorage
5. **Expected:** Both tokens removed
6. Try to access: /overview
7. **Expected:** Redirected to /login

**Pass Criteria:**
- ✅ Redirected to /login after logout
- ✅ Tokens cleared from localStorage
- ✅ Cannot access protected pages

---

### Test 8: Concurrent Requests During Refresh ✅

**Goal:** Verify multiple requests are queued during token refresh

**Steps:**
1. Login to the app
2. Open DevTools > Network tab
3. Clear network log
4. Let access token expire (wait 5-10 mins)
5. Navigate to a page with multiple API calls (e.g., /overview)
6. **Expected in Network tab:**
   - Multiple requests return 401
   - Only ONE call to /auth/refresh/
   - All original requests retried after refresh
   - All requests succeed

**Pass Criteria:**
- ✅ Only one refresh call
- ✅ All requests eventually succeed
- ✅ No duplicate refresh calls

---

### Test 9: Invalid Credentials ✅

**Goal:** Verify error handling for wrong credentials

**Steps:**
1. Go to: /login
2. Enter wrong credentials:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
3. Click "Sign in"
4. **Expected:** Error message displayed
5. **Expected:** Stay on login page
6. Check localStorage
7. **Expected:** No tokens stored

**Pass Criteria:**
- ✅ Error message shown
- ✅ Stay on login page
- ✅ No tokens stored

---

### Test 10: Registration Flow ✅

**Goal:** Verify new user registration works

**Steps:**
1. Go to: /signup
2. Fill in form:
   - Name: `Test User`
   - Email: `newuser@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
3. Click "Create account"
4. **Expected:** Redirected to /overview
5. **Expected:** User automatically logged in
6. Check localStorage
7. **Expected:** Both tokens present

**Pass Criteria:**
- ✅ Registration successful
- ✅ Auto-login after registration
- ✅ Redirected to /overview
- ✅ Tokens stored

---

## 🔍 Debugging Tips

### Issue: Stuck on loading screen

**Check:**
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. CORS is configured in backend
4. Check browser console for errors

**Fix:**
```bash
# Restart backend
cd backend
python manage.py runserver

# Restart frontend
cd frontend
npm run dev
```

---

### Issue: 401 errors on all requests

**Check:**
1. Tokens in localStorage
2. Token format is correct
3. Backend authentication is working

**Fix:**
1. Clear localStorage
2. Logout and login again
3. Check backend logs

---

### Issue: Token refresh not working

**Check:**
1. refresh_token is present in localStorage
2. /auth/refresh/ endpoint is working
3. Check Network tab for refresh calls

**Fix:**
1. Clear localStorage
2. Login again
3. Check backend JWT settings

---

### Issue: Redirect loop

**Check:**
1. AuthContext is properly initialized
2. User state is set correctly
3. ProtectedRoute logic is correct

**Fix:**
1. Clear localStorage
2. Hard refresh (Ctrl+Shift+R)
3. Check console for errors

---

## 📊 Expected Results Summary

| Test | Expected Result | Pass/Fail |
|------|----------------|-----------|
| Protected Route Redirect | Redirect to /login | ⬜ |
| Login & Access | Access granted | ⬜ |
| Token Storage | Tokens in localStorage | ⬜ |
| Persistent Session | Stay logged in | ⬜ |
| Automatic Refresh | Token refreshed | ⬜ |
| Expired Refresh | Redirect to login | ⬜ |
| Logout | Tokens cleared | ⬜ |
| Concurrent Requests | All succeed | ⬜ |
| Invalid Credentials | Error shown | ⬜ |
| Registration | Auto-login | ⬜ |

---

## 🎯 Quick Verification Checklist

Before deploying to production:

- [ ] Protected routes redirect unauthenticated users
- [ ] Login works with valid credentials
- [ ] Tokens stored in localStorage
- [ ] User stays logged in after browser restart
- [ ] Tokens refresh automatically
- [ ] Expired refresh token redirects to login
- [ ] Logout clears tokens and redirects
- [ ] Concurrent requests handled correctly
- [ ] Invalid credentials show error
- [ ] Registration works and auto-logs in
- [ ] All API requests include auth token
- [ ] Error messages are user-friendly
- [ ] Loading states are smooth
- [ ] No console errors
- [ ] Backend logs show no errors

---

## 🚀 Production Checklist

Before going live:

- [ ] Use HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set secure token expiration times
- [ ] Enable token rotation
- [ ] Add rate limiting
- [ ] Monitor failed login attempts
- [ ] Implement account lockout
- [ ] Add CAPTCHA if needed
- [ ] Enable 2FA for admins
- [ ] Set up error monitoring
- [ ] Configure proper logging
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Load test authentication endpoints
- [ ] Security audit completed

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development / Staging / Production

Test 1: Protected Route Redirect - PASS / FAIL
Notes: ___________

Test 2: Login & Access - PASS / FAIL
Notes: ___________

Test 3: Token Storage - PASS / FAIL
Notes: ___________

Test 4: Persistent Session - PASS / FAIL
Notes: ___________

Test 5: Automatic Refresh - PASS / FAIL
Notes: ___________

Test 6: Expired Refresh - PASS / FAIL
Notes: ___________

Test 7: Logout - PASS / FAIL
Notes: ___________

Test 8: Concurrent Requests - PASS / FAIL
Notes: ___________

Test 9: Invalid Credentials - PASS / FAIL
Notes: ___________

Test 10: Registration - PASS / FAIL
Notes: ___________

Overall Status: PASS / FAIL
Issues Found: ___________
```

---

## ✅ All Tests Passing?

If all tests pass, your authentication system is **ready for production**! 🎉

The system provides:
- ✅ Secure authentication
- ✅ Automatic token refresh
- ✅ Persistent sessions
- ✅ Smooth user experience
- ✅ Proper error handling
- ✅ Protected routes

**Great job!** Your app is now secure and ready to use.
