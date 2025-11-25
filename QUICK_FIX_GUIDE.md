# Quick Fix Guide for VendorView API Issue

## 🚨 **Current Problem**
The frontend is trying to access `/api/vendors/frontend_detail_by_name/?name=ddeb98cc-c0d5-4646-95a6-15dc768ee37f` but this endpoint expects a vendor **name**, not a **UUID**.

## 🔧 **Immediate Solution**

### Step 1: Run Backend Setup
```bash
cd backend

# Create sample vendors
python manage.py create_sample_vendors

# Apply any pending migrations
python manage.py makemigrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### Step 2: Test the Fixed Frontend
The VendorView component has been updated with a smart hook that:
- ✅ **Detects UUID vs Name**: Automatically determines if the URL parameter is a UUID or vendor name
- ✅ **Uses Correct Endpoint**: 
  - UUID → `/api/vendors/{id}/frontend_detail/`
  - Name → `/api/vendors/frontend_detail_by_name/?name={name}`

### Step 3: Test URLs

After running the setup, try these URLs:

**By UUID (if you have vendor IDs):**
```
http://localhost:5173/vendors/ddeb98cc-c0d5-4646-95a6-15dc768ee37f
```

**By Name (recommended):**
```
http://localhost:5173/vendors/ikea-hungary
http://localhost:5173/vendors/home-depot
http://localhost:5173/vendors/leroy-merlin
```

## 🔍 **Debug Information**

The VendorView component now includes debug logging. Check the browser console to see:
- URL parameter received
- Whether it's detected as UUID or name
- API response data
- Any errors

## 🛠️ **What Was Fixed**

### 1. **Smart Parameter Detection**
```typescript
// New hook in useVendorApi.ts
export function useVendorDetailSmart(param: string) {
  const isId = isUUID(param);
  
  // Use appropriate endpoint based on parameter type
  return isId ? 
    useVendorDetail(param) :      // UUID → /api/vendors/{id}/frontend_detail/
    useVendorDetailByName(param); // Name → /api/vendors/frontend_detail_by_name/
}
```

### 2. **Updated VendorView Component**
```typescript
// Now uses smart hook instead of name-only hook
const { data: vendor, isLoading, error } = useVendorDetailSmart(id || '');
```

### 3. **Backend Endpoints Ready**
- ✅ `/api/vendors/{id}/frontend_detail/` - For UUID access
- ✅ `/api/vendors/frontend_detail_by_name/?name={name}` - For name access
- ✅ All related endpoints (products, orders, issues, payments, statistics)

## 🎯 **Expected Results**

After the fix:
1. **UUID URLs work**: `ddeb98cc-c0d5-4646-95a6-15dc768ee37f` → Uses ID endpoint
2. **Name URLs work**: `ikea-hungary` → Uses name endpoint  
3. **No more 404 errors**
4. **Proper vendor data loading**
5. **All tabs (Overview, Products, Orders, Issues, Payments) display correctly**

## 🚀 **Next Steps**

1. **Run the backend setup commands above**
2. **Refresh your browser**
3. **Check browser console for debug info**
4. **Try both UUID and name-based URLs**

The issue should be completely resolved! 🎉
