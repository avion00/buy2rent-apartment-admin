# Quick Test Guide - Client API Enhancement

## 🚀 Start the Backend

```bash
cd backend
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

## 📖 Access Swagger UI

Open your browser and navigate to:

**http://localhost:8000/api/docs/**

## 🔍 Test the New Endpoints

### Step 1: Get Authentication Token

1. In Swagger UI, find **"Authentication"** section
2. Click on **POST /auth/login/**
3. Click **"Try it out"**
4. Enter your credentials:
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```
5. Click **"Execute"**
6. Copy the `access` token from the response

### Step 2: Authorize in Swagger

1. Click the **"Authorize"** button at the top right
2. Enter: `Bearer YOUR_ACCESS_TOKEN`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Client Endpoints

#### 3.1 List All Clients
- Find **GET /api/clients/**
- Click **"Try it out"**
- Click **"Execute"**
- Copy a client `id` from the response

#### 3.2 Get Client Apartments
- Find **GET /api/clients/{id}/apartments/**
- Click **"Try it out"**
- Paste the client ID
- Click **"Execute"**
- See the apartments list with count

#### 3.3 Get Client Products
- Find **GET /api/clients/{id}/products/**
- Click **"Try it out"**
- Paste the client ID
- Click **"Execute"**
- See products list with total value

#### 3.4 Get Client Statistics
- Find **GET /api/clients/{id}/statistics/**
- Click **"Try it out"**
- Paste the client ID
- Click **"Execute"**
- See comprehensive statistics

#### 3.5 Get Complete Client Details
- Find **GET /api/clients/{id}/details/**
- Click **"Try it out"**
- Paste the client ID
- Click **"Execute"**
- See everything in one response

## 📊 Expected Responses

### Apartments Response
```json
{
  "count": 2,
  "apartments": [
    {
      "id": "uuid",
      "name": "Downtown Apartment",
      "type": "furnishing",
      "status": "In Progress",
      ...
    }
  ]
}
```

### Products Response
```json
{
  "count": 25,
  "total_value": 1250000.50,
  "products": [
    {
      "id": "uuid",
      "product": "Sofa Set",
      "total_amount": 50000.00,
      "status": "Delivered",
      ...
    }
  ]
}
```

### Statistics Response
```json
{
  "apartments": {
    "total": 2,
    "by_status": {"In Progress": 1, "Completed": 1},
    "by_type": {"furnishing": 2}
  },
  "products": {
    "total": 25,
    "total_value": 1250000.50,
    "by_status": {"Delivered": 15, "Ordered": 10}
  },
  "financial": {
    "total_spent": 1250000.50,
    "total_paid": 1000000.00,
    "outstanding": 250000.50
  }
}
```

### Complete Details Response
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+36 20 123 4567",
  "account_status": "Active",
  "type": "Individual",
  "apartments": {
    "count": 2,
    "data": [...]
  },
  "products": {
    "count": 25,
    "total_value": 1250000.50,
    "data": [...]
  },
  "statistics": {
    "apartments": {...},
    "products": {...},
    "financial": {...}
  }
}
```

## 🧪 Using cURL (Alternative)

### Get Token
```bash
curl -X POST "http://localhost:8000/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### Test Endpoints
```bash
# Replace YOUR_TOKEN and CLIENT_ID

# Get apartments
curl -X GET "http://localhost:8000/api/clients/CLIENT_ID/apartments/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get products
curl -X GET "http://localhost:8000/api/clients/CLIENT_ID/products/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics
curl -X GET "http://localhost:8000/api/clients/CLIENT_ID/statistics/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get complete details
curl -X GET "http://localhost:8000/api/clients/CLIENT_ID/details/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ Verification Checklist

- [ ] Backend server is running
- [ ] Swagger UI is accessible
- [ ] Can login and get token
- [ ] Can list clients
- [ ] Can get client apartments
- [ ] Can get client products
- [ ] Can get client statistics
- [ ] Can get complete client details
- [ ] All responses have correct structure
- [ ] No errors in server console

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Make sure you've authorized in Swagger UI with a valid token

### Issue: 404 Not Found
**Solution**: Check that you're using a valid client UUID

### Issue: 500 Internal Server Error
**Solution**: Check the Django console for error details

### Issue: Empty data
**Solution**: Make sure you have:
- Created at least one client
- Created at least one apartment for that client
- Created at least one product for that apartment

## 📝 Quick Commands

### Create Test Data (if needed)
```bash
cd backend
python manage.py shell

# In Python shell:
from clients.models import Client
from apartments.models import Apartment
from products.models import Product

# Create a test client
client = Client.objects.create(
    name="Test Client",
    email="test@example.com",
    phone="+36 20 123 4567",
    account_status="Active",
    type="Individual"
)

print(f"Created client: {client.id}")
```

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Swagger UI shows all 4 new endpoints under "Clients"
2. ✅ Each endpoint returns data without errors
3. ✅ Statistics show correct counts and calculations
4. ✅ Complete details endpoint returns nested data
5. ✅ Response times are reasonable (<200ms)

## 📚 Documentation Links

- Full API Documentation: `BACKEND_API_DOCUMENTATION.md`
- Enhancement Details: `CLIENT_API_ENHANCEMENT.md`
- Summary: `BACKEND_CLIENT_API_SUMMARY.md`
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
