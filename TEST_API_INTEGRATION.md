# Testing API Integration - Client Page

## Quick Start Guide

### 1. Start Backend Server
Open a terminal in the backend directory:
```bash
cd backend
# Activate virtual environment (if using one)
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On Linux/Mac

# Install dependencies if needed
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser if you haven't already
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
```

The backend will be available at: http://localhost:8000

### 2. Start Frontend Server
Open another terminal in the frontend directory:
```bash
cd frontend
# Install dependencies if needed
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5173

### 3. Test the Client Page Integration

1. **Navigate to Login Page**: http://localhost:5173/login
   - Use your superuser credentials or register a new account

2. **After Login, Go to Clients Page**: http://localhost:5173/clients
   
3. **Test Features**:
   - ✅ **Loading State**: You should see skeleton loaders while data is fetching
   - ✅ **Error Handling**: If backend is not running, you'll see an error message with retry button
   - ✅ **Search**: Type in the search box - it will filter clients from the API
   - ✅ **Filters**: Use Status and Type dropdowns to filter results
   - ✅ **Create Client**: Click "Add Client" button to create a new client
   - ✅ **Edit Client**: Click the edit icon on any client row
   - ✅ **Delete Client**: Click the trash icon (only works if client has no apartments)
   - ✅ **View Details**: Click the eye icon to see client details

### 4. API Endpoints Being Used

The Client page now uses these backend APIs:

- `GET /api/clients/` - List clients with filters
- `POST /api/clients/` - Create new client
- `PATCH /api/clients/{id}/` - Update client
- `DELETE /api/clients/{id}/` - Delete client
- `GET /api/clients/{id}/` - Get single client (for details)

### 5. Authentication Flow

The app handles authentication automatically:
- Stores JWT tokens in localStorage
- Adds Authorization header to all requests
- Refreshes tokens automatically when they expire
- Redirects to login if refresh fails

### 6. Troubleshooting

**CORS Issues**:
If you get CORS errors, make sure your backend `settings.py` has:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

**Authentication Issues**:
- Check if tokens are stored in localStorage (F12 > Application > Local Storage)
- Verify backend is running on port 8000
- Try logging out and logging in again

**No Data Showing**:
- Check backend console for errors
- Verify database has client data
- Check network tab in browser DevTools

## What's Been Implemented

### ✅ Client Page Features
1. **Full CRUD Operations** via REST API
2. **Real-time Search & Filtering** through API parameters
3. **Loading States** with skeleton components
4. **Error Handling** with retry functionality
5. **Optimistic Updates** for better UX
6. **Automatic Token Refresh** for seamless auth
7. **Toast Notifications** for all operations
8. **Type-safe API Integration** with TypeScript

### 📁 New Files Created
- `/frontend/src/services/clientApi.ts` - Client API service with fetch
- `/frontend/src/hooks/useClientApi.ts` - React Query hooks for client operations
- Updated `/frontend/src/pages/Clients.tsx` - Integrated with backend API

### 🔄 Data Flow
1. User interacts with UI
2. React Query hook is called
3. API service makes authenticated request
4. Backend processes request and returns data
5. React Query caches response
6. UI updates with new data
7. Toast shows success/error message

## Next Steps

After testing the Client page, we can integrate other pages:
1. **Apartments** - Similar pattern to Clients
2. **Vendors** - Has additional endpoints for statistics
3. **Products** - Includes Excel import functionality
4. **Orders, Payments, Deliveries** - Related entity management
5. **Issues** - Includes photo uploads

Each integration follows the same pattern:
1. Create API service file
2. Create React Query hooks
3. Update page component
4. Test all CRUD operations
