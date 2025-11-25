# 🚀 Startup Instructions - Authentication Testing

## 🔧 Step 1: Start Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using venv)
# Windows:
venv\Scripts\activate
# Or if using conda/other:
# conda activate your_env_name

# Start Django server
python manage.py runserver
```

**Expected Output:**
```
✅ Django development server running at: http://127.0.0.1:8000/
✅ API endpoints available at: http://127.0.0.1:8000/auth/
```

## 🎨 Step 2: Start Frontend

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Start development server
npm run dev
```

**Expected Output:**
```
✅ Vite dev server running at: http://localhost:5173/
✅ Frontend connected to backend at: http://localhost:8000/
```

## 🧪 Step 3: Test Authentication

### Option A: Use Debug Tool (Recommended)
1. Open: `frontend/debug_auth.html` in your browser
2. Enter your credentials (amc8808@gmail.com)
3. Click "Test Login"
4. Check if user data loads correctly

### Option B: Test in Application
1. Go to: `http://localhost:5173/login`
2. Login with your credentials
3. Should redirect to: `http://localhost:5173/overview`
4. Check if profile dropdown shows your name/email

## 🔍 Step 4: Debug Profile Dropdown

### Expected Behavior:
- **Avatar**: Should show your initials (e.g., "AC" for Amic Chaw)
- **Name**: Should show "Amic Chaw" (not "MY ACCOUNT")
- **Email**: Should show "amc8808@gmail.com"
- **Username**: Should show "@amc09"
- **Menu Items**: Profile, Settings, Team, Log out should all be clickable

### If Profile Shows "MY ACCOUNT":
1. Open browser console (F12)
2. Look for debug logs:
   ```
   ✅ AuthContext: User data loaded: {first_name: "Amic", ...}
   🔍 Navbar User Debug: {user: {...}, hasUser: true, ...}
   ```
3. If no logs appear, there's an issue with user data loading

## 🚨 Common Issues & Solutions

### Issue 1: Profile shows "MY ACCOUNT" instead of user name
**Cause**: User data not loading properly
**Solution**: 
- Check browser console for errors
- Verify API response in Network tab
- Use debug_auth.html to test API directly

### Issue 2: Menu items not clickable
**Cause**: Missing routes or incorrect links
**Solution**:
- Verify `/settings` and `/users` routes exist in App.tsx
- Check for JavaScript errors in console

### Issue 3: CORS errors
**Cause**: Backend CORS not configured properly
**Solution**:
- Restart Django server
- Check CORS_ALLOWED_ORIGINS in settings.py

### Issue 4: 401 Unauthorized errors
**Cause**: Invalid or expired tokens
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Login again
- Check token format in Network tab

## 📊 Verification Checklist

### ✅ Backend Working:
- [ ] Django server starts without errors
- [ ] Can access: http://localhost:8000/admin/
- [ ] API docs available: http://localhost:8000/api/docs/

### ✅ Frontend Working:
- [ ] Vite server starts without errors
- [ ] Can access: http://localhost:5173/
- [ ] No console errors on page load

### ✅ Authentication Working:
- [ ] Login redirects to dashboard
- [ ] Profile dropdown shows real user data
- [ ] Logout works and redirects to login
- [ ] Protected routes require authentication

### ✅ Profile Dropdown Working:
- [ ] Shows user's real name (not "MY ACCOUNT")
- [ ] Shows correct email address
- [ ] Shows username with @ symbol
- [ ] All menu items are clickable
- [ ] Logout button works properly

## 🔧 Debug Commands

### Check User Data in Console:
```javascript
// In browser console
console.log('User:', localStorage.getItem('access_token'));
fetch('http://localhost:8000/auth/profile/', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('access_token')}
}).then(r => r.json()).then(console.log);
```

### Clear All Authentication:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 📞 Next Steps

1. **Start both servers** using commands above
2. **Test login flow** using your credentials
3. **Check profile dropdown** - should show your real name/email
4. **Test menu items** - all should be clickable
5. **Test logout** - should clear session and redirect

If any step fails, use the debug tools and check the console for error messages!
