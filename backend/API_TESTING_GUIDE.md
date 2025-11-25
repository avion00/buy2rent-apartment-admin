# API Testing Guide - Buy2Rent Backend

## 🚀 Quick Start

### 1. Setup & Run Server
```bash
# Install dependencies
pip install -r requirements.txt

# Setup database and seed data
python setup.py

# Start development server
python manage.py runserver
```

### 2. Access Swagger UI
Open your browser and go to: **http://localhost:8000/api/docs/**

## 📋 Testing Checklist

### Authentication Endpoints
- [ ] `POST /auth/login/` - Login with credentials
- [ ] `GET /auth/check/` - Check authentication status  
- [ ] `GET /auth/profile/` - Get user profile
- [ ] `POST /auth/logout/` - Logout user
- [ ] `POST /auth/signup/` - Register new user

### Core Entity Endpoints
- [ ] `GET /api/clients/` - List all clients
- [ ] `POST /api/clients/` - Create new client
- [ ] `GET /api/clients/{id}/` - Get specific client
- [ ] `PUT /api/clients/{id}/` - Update client
- [ ] `DELETE /api/clients/{id}/` - Delete client

- [ ] `GET /api/apartments/` - List all apartments
- [ ] `POST /api/apartments/` - Create new apartment
- [ ] `GET /api/apartments/{id}/` - Get specific apartment
- [ ] `PUT /api/apartments/{id}/` - Update apartment
- [ ] `DELETE /api/apartments/{id}/` - Delete apartment

- [ ] `GET /api/vendors/` - List all vendors
- [ ] `POST /api/vendors/` - Create new vendor
- [ ] `GET /api/vendors/{id}/` - Get specific vendor
- [ ] `PUT /api/vendors/{id}/` - Update vendor
- [ ] `DELETE /api/vendors/{id}/` - Delete vendor

- [ ] `GET /api/products/` - List all products
- [ ] `POST /api/products/` - Create new product
- [ ] `GET /api/products/{id}/` - Get specific product
- [ ] `PUT /api/products/{id}/` - Update product
- [ ] `DELETE /api/products/{id}/` - Delete product

### Supporting Endpoints
- [ ] `GET /api/deliveries/` - List deliveries
- [ ] `GET /api/payments/` - List payments
- [ ] `GET /api/issues/` - List issues
- [ ] `GET /api/activities/` - List activities

## 🧪 Step-by-Step Testing

### Step 1: Authentication
1. Go to **http://localhost:8000/api/docs/**
2. Find the **Authentication** section
3. Test `POST /auth/login/`:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Verify you get a successful response with user data

### Step 2: Test Client Management
1. Find the **Clients** section
2. Test `GET /api/clients/` to see existing clients
3. Test `POST /api/clients/` with sample data:
   ```json
   {
     "name": "Test Client",
     "email": "test@example.com",
     "phone": "+36 20 123 4567",
     "account_status": "Active",
     "type": "Investor",
     "notes": "Test client for API testing"
   }
   ```
4. Test `GET /api/clients/{id}/` with the created client ID
5. Test `PUT /api/clients/{id}/` to update the client
6. Test filtering: `GET /api/clients/?account_status=Active`
7. Test search: `GET /api/clients/?search=Test`

### Step 3: Test Apartment Management
1. Find the **Apartments** section
2. Test `GET /api/apartments/` to see existing apartments
3. Test `POST /api/apartments/` with sample data:
   ```json
   {
     "name": "Test Apartment",
     "type": "furnishing",
     "client": 1,
     "address": "Test Address, Budapest",
     "status": "Planning",
     "designer": "Test Designer",
     "start_date": "2025-01-01",
     "due_date": "2025-03-01",
     "progress": 0,
     "notes": "Test apartment"
   }
   ```

### Step 4: Test Product Management
1. Test `GET /api/products/` to see existing products
2. Test `POST /api/products/` with sample data:
   ```json
   {
     "apartment": 1,
     "product": "Test Product",
     "vendor": 1,
     "vendor_link": "https://example.com",
     "sku": "TEST-001",
     "unit_price": "99999",
     "qty": 1,
     "availability": "In Stock",
     "status": "Design Approved",
     "category": "Test Category",
     "room": "Test Room"
   }
   ```

### Step 5: Test Filtering and Search
1. Test filtering products by apartment: `GET /api/products/?apartment=1`
2. Test filtering by status: `GET /api/products/?status=Ordered`
3. Test search: `GET /api/products/?search=sofa`
4. Test ordering: `GET /api/products/?ordering=-created_at`

### Step 6: Test Pagination
1. Check if pagination works: `GET /api/products/?page=1`
2. Verify pagination info in response

## 🔍 What to Look For

### Successful Responses
- ✅ Status codes: 200 (GET), 201 (POST), 204 (DELETE)
- ✅ Proper JSON structure
- ✅ All expected fields present
- ✅ Relationships working (client data in apartments)
- ✅ Filtering and search working
- ✅ Pagination working

### Error Handling
- ✅ 400 for validation errors
- ✅ 401 for authentication required
- ✅ 404 for not found
- ✅ Proper error messages

### Data Validation
- ✅ Required fields validation
- ✅ Email format validation
- ✅ Date format validation
- ✅ Choice field validation

## 🐛 Common Issues & Solutions

### Issue: 403 Forbidden
**Solution**: Make sure you're authenticated. Use the login endpoint first.

### Issue: 400 Bad Request
**Solution**: Check the request body format and required fields.

### Issue: 500 Internal Server Error
**Solution**: Check Django logs in the terminal for detailed error information.

### Issue: CORS Errors
**Solution**: The backend is configured for `localhost:5173`. Update `CORS_ALLOWED_ORIGINS` in settings if needed.

## 📊 Sample Test Data

### Client Data
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+36 20 123 4567",
  "account_status": "Active",
  "type": "Investor",
  "notes": "Test client"
}
```

### Apartment Data
```json
{
  "name": "Test Apartment • A/1",
  "type": "furnishing",
  "client": 1,
  "address": "Test Street 1, Budapest",
  "status": "Planning",
  "designer": "Test Designer",
  "start_date": "2025-01-01",
  "due_date": "2025-03-01",
  "progress": 25
}
```

### Vendor Data
```json
{
  "name": "Test Vendor",
  "company_name": "Test Company Ltd.",
  "contact_person": "Contact Person",
  "email": "contact@testvendor.com",
  "phone": "+36 1 234 5678",
  "website": "https://testvendor.com",
  "notes": "Test vendor for API testing"
}
```

## 🎯 Success Criteria

Your API testing is successful when:
- [ ] All authentication endpoints work
- [ ] All CRUD operations work for core entities
- [ ] Filtering and search work properly
- [ ] Relationships between entities work (e.g., apartments show client data)
- [ ] Error handling works correctly
- [ ] Data validation works as expected
- [ ] No 500 errors occur during normal operations

## 🔗 Documentation Links

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Browsable API**: http://localhost:8000/api/
- **Admin Interface**: http://localhost:8000/admin/
