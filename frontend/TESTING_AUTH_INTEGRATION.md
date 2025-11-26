# Testing Authentication Integration

## 🚀 Quick Start Guide

### Step 1: Start Backend Server

```bash
cd backend
python manage.py runserver
```

Backend will run on: **http://localhost:8000**

### Step 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🧪 Test Scenarios

### Test 1: User Registration (Signup)

1. **Navigate to Signup Page**
   ```
   http://localhost:5173/signup
   ```

2. **Fill in the form:**
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `Test123456` (must meet requirements)
   - Confirm Password: `Test123456`

3. **Click "Create account"**

4. **Expected Result:**
   - ✅ Success toast: "Account created!"
   - ✅ Redirected to `/overview`
   - ✅ User logged in automatically
   - ✅ Tokens stored in localStorage

5. **Verify in Browser DevTools:**
   - Press `F12`
   - Go to `Application` > `Local Storage` > `http://localhost:5173`
   - Check for:
     - `access_token` - JWT access token
     - `refresh_token` - JWT refresh token

6. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/register/ 201
     ```

---

### Test 2: User Login

1. **Navigate to Login Page**
   ```
   http://localhost:5173/login
   ```

2. **Fill in the form:**
   - Email: `john@example.com`
   - Password: `Test123456`

3. **Click "Sign in"**

4. **Expected Result:**
   - ✅ Success toast: "Welcome back!"
   - ✅ Redirected to `/overview`
   - ✅ User logged in
   - ✅ Tokens stored in localStorage

5. **Verify User Data:**
   - Open browser console
   - Check if user data is loaded
   - User name should appear in header/navbar

6. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/login/ 200
     ```

---

### Test 3: Invalid Login

1. **Navigate to Login Page**

2. **Enter wrong credentials:**
   - Email: `wrong@example.com`
   - Password: `wrongpassword`

3. **Click "Sign in"**

4. **Expected Result:**
   - ✅ Error toast: "Login failed"
   - ✅ Error message displayed
   - ✅ User stays on login page
   - ✅ No tokens stored

5. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/login/ 401
     ```

---

### Test 4: Password Reset

1. **Navigate to Forgot Password Page**
   ```
   http://localhost:5173/forgot-password
   ```

2. **Enter email:**
   - Email: `john@example.com`

3. **Click "Send reset instructions"**

4. **Expected Result:**
   - ✅ Success toast: "Email sent!"
   - ✅ Success screen shown
   - ✅ Email address displayed

5. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/password-reset/ 200
     ```
   - Check for password reset email (if email configured)

---

### Test 5: Logout

1. **Make sure you're logged in**

2. **Click logout button** (in header/navbar)

3. **Expected Result:**
   - ✅ Tokens cleared from localStorage
   - ✅ Redirected to `/login`
   - ✅ User data cleared

4. **Verify in Browser DevTools:**
   - Check `Local Storage`
   - `access_token` and `refresh_token` should be gone

5. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/logout/ 200
     ```

---

### Test 6: Protected Routes

1. **Logout if logged in**

2. **Try to access protected route directly:**
   ```
   http://localhost:5173/overview
   http://localhost:5173/clients
   http://localhost:5173/apartments
   ```

3. **Expected Result:**
   - ✅ Redirected to `/login`
   - ✅ Cannot access protected pages without login

4. **Login and try again:**
   - ✅ Can access protected pages
   - ✅ Pages load correctly

---

### Test 7: Token Refresh

1. **Login to the app**

2. **Wait for access token to expire** (or manually expire it)
   - Access tokens typically expire in 5-15 minutes

3. **Make an API request** (navigate to clients page, etc.)

4. **Expected Result:**
   - ✅ Token automatically refreshed
   - ✅ Request succeeds with new token
   - ✅ No interruption to user experience
   - ✅ New access_token in localStorage

5. **Verify in Backend:**
   - Check Django console for:
     ```
     POST /auth/refresh/ 200
     GET /api/clients/ 200
     ```

---

### Test 8: Client API with Authentication

1. **Login to the app**

2. **Navigate to Clients page:**
   ```
   http://localhost:5173/clients
   ```

3. **Expected Result:**
   - ✅ Clients list loads from backend
   - ✅ Authorization header sent with request
   - ✅ Data displayed correctly

4. **Try CRUD operations:**
   - Create a new client
   - Edit a client
   - Delete a client
   - View client details

5. **Verify in Backend:**
   - Check Django console for:
     ```
     GET /api/clients/ 200
     POST /api/clients/ 201
     PATCH /api/clients/{id}/ 200
     DELETE /api/clients/{id}/ 204
     ```

6. **Verify Authorization:**
   - Open Network tab in DevTools
   - Check request headers
   - Should include: `Authorization: Bearer <token>`

---

## 🔍 Debugging Tips

### Issue: Login fails with CORS error

**Solution:**
Check backend `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Issue: 401 Unauthorized on API requests

**Solution:**
1. Check if tokens are in localStorage
2. Check if Authorization header is sent
3. Verify token is valid (not expired)
4. Try logging out and logging in again

### Issue: Token refresh not working

**Solution:**
1. Check if refresh_token is in localStorage
2. Check backend `/auth/refresh/` endpoint
3. Verify refresh token is valid
4. Check axios interceptor is configured correctly

### Issue: User data not loading

**Solution:**
1. Check `/auth/profile/` endpoint in backend
2. Verify access_token is valid
3. Check AuthContext is properly initialized
4. Check browser console for errors

### Issue: Redirect loop after login

**Solution:**
1. Check protected route logic
2. Verify user state is set correctly
3. Check navigation logic in Login component
4. Clear localStorage and try again

---

## 📊 Verification Checklist

### Backend Verification:
- [ ] Django server running on port 8000
- [ ] `/auth/login/` endpoint working
- [ ] `/auth/register/` endpoint working
- [ ] `/auth/logout/` endpoint working
- [ ] `/auth/refresh/` endpoint working
- [ ] `/auth/profile/` endpoint working
- [ ] `/auth/password-reset/` endpoint working
- [ ] CORS configured correctly
- [ ] JWT authentication working

### Frontend Verification:
- [ ] React app running on port 5173
- [ ] Login page loads
- [ ] Signup page loads
- [ ] Forgot password page loads
- [ ] AuthContext initialized
- [ ] Tokens stored in localStorage
- [ ] Authorization header sent with requests
- [ ] Token refresh working
- [ ] Protected routes working
- [ ] User data displayed correctly

### Integration Verification:
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can logout successfully
- [ ] Can reset password
- [ ] Can access protected routes when logged in
- [ ] Cannot access protected routes when logged out
- [ ] Tokens refresh automatically
- [ ] Client API works with authentication
- [ ] Error messages display correctly
- [ ] Success messages display correctly

---

## 🎯 Test Results Template

Use this template to document your test results:

```
Test Date: ___________
Tester: ___________

✅ Test 1: User Registration - PASS/FAIL
   Notes: ___________

✅ Test 2: User Login - PASS/FAIL
   Notes: ___________

✅ Test 3: Invalid Login - PASS/FAIL
   Notes: ___________

✅ Test 4: Password Reset - PASS/FAIL
   Notes: ___________

✅ Test 5: Logout - PASS/FAIL
   Notes: ___________

✅ Test 6: Protected Routes - PASS/FAIL
   Notes: ___________

✅ Test 7: Token Refresh - PASS/FAIL
   Notes: ___________

✅ Test 8: Client API with Auth - PASS/FAIL
   Notes: ___________

Overall Status: PASS/FAIL
Issues Found: ___________
```

---

## 🚀 Ready for Production

Before deploying to production:

1. [ ] All tests passing
2. [ ] Error handling tested
3. [ ] Token refresh tested
4. [ ] Protected routes tested
5. [ ] CORS configured for production domain
6. [ ] Environment variables set
7. [ ] HTTPS enabled
8. [ ] Secure token storage reviewed
9. [ ] Session management tested
10. [ ] Password reset flow tested

---

## 📝 Notes

- Access tokens typically expire in 5-15 minutes
- Refresh tokens typically expire in 7-30 days
- Tokens are stored in localStorage (not secure for sensitive data)
- Consider using httpOnly cookies for production
- Always use HTTPS in production
- Implement rate limiting for auth endpoints
- Add CAPTCHA for signup/login if needed
- Monitor failed login attempts
- Implement account lockout after multiple failures
- Add email verification for new accounts
