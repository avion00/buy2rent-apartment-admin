# Client API Enhancement Documentation

## Overview
Enhanced the Client API to include apartments, products, and comprehensive statistics for each client.

## New API Endpoints

### Base URL
```
http://localhost:8000/api/clients/
```

---

## 1. Get Client Apartments
**GET** `/api/clients/{id}/apartments/`

Get all apartments associated with a specific client.

### Response
```json
{
  "count": 2,
  "apartments": [
    {
      "id": "uuid",
      "name": "Downtown Apartment",
      "type": "furnishing",
      "status": "In Progress",
      "client": "client-uuid",
      "address": "123 Main St",
      "start_date": "2024-01-01",
      "due_date": "2024-06-01",
      "designer": "John Designer",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/clients/{client-id}/apartments/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 2. Get Client Products
**GET** `/api/clients/{id}/products/`

Get all products across all apartments for a specific client.

### Response
```json
{
  "count": 25,
  "total_value": 1250000.50,
  "products": [
    {
      "id": "uuid",
      "apartment": "apartment-uuid",
      "vendor": "vendor-uuid",
      "product": "Sofa Set",
      "sku": "SKU123",
      "brand": "IKEA",
      "category": "Furniture",
      "room": "Living Room",
      "quantity": 1,
      "unit_price": 50000.00,
      "total_amount": 50000.00,
      "description": "3-seater sofa",
      "link": "https://example.com/product",
      "size": "Large",
      "image": "/media/products/sofa.jpg",
      "image_url": "https://example.com/image.jpg",
      "availability": "In Stock",
      "status": "Delivered",
      "payment_status": "Paid",
      "issue_state": "No Issue",
      "expected_delivery_date": "2024-02-01",
      "actual_delivery_date": "2024-01-28",
      "payment_due_date": "2024-02-15",
      "payment_amount": 50000.00,
      "paid_amount": 50000.00,
      "replacement_requested": false,
      "replacement_approved": false,
      "created_at": "2024-01-15T00:00:00Z",
      "updated_at": "2024-01-28T00:00:00Z"
    }
  ]
}
```

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/clients/{client-id}/products/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. Get Client Statistics
**GET** `/api/clients/{id}/statistics/`

Get comprehensive statistics for a client including apartments, products, and financial data.

### Response
```json
{
  "apartments": {
    "total": 3,
    "by_status": {
      "Planning": 1,
      "In Progress": 1,
      "Completed": 1
    },
    "by_type": {
      "furnishing": 2,
      "renovation": 1
    }
  },
  "products": {
    "total": 125,
    "total_value": 5250000.00,
    "by_status": {
      "Pending": 10,
      "Ordered": 30,
      "Shipped": 25,
      "Delivered": 55,
      "Cancelled": 5
    }
  },
  "financial": {
    "total_spent": 5250000.00,
    "total_paid": 4500000.00,
    "outstanding": 750000.00
  }
}
```

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/clients/{client-id}/statistics/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 4. Get Client Details (Complete Profile)
**GET** `/api/clients/{id}/details/`

Get complete client profile with apartments, products, and statistics in a single request.

### Response
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+36 20 123 4567",
  "account_status": "Active",
  "type": "Individual",
  "notes": "VIP client",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z",
  "apartments": {
    "count": 2,
    "data": [
      {
        "id": "uuid",
        "name": "Downtown Apartment",
        "type": "furnishing",
        "status": "In Progress",
        ...
      }
    ]
  },
  "products": {
    "count": 25,
    "total_value": 1250000.50,
    "data": [
      {
        "id": "uuid",
        "product": "Sofa Set",
        "status": "Delivered",
        ...
      }
    ]
  },
  "statistics": {
    "apartments": {
      "total": 2,
      "by_status": {...},
      "by_type": {...}
    },
    "products": {
      "total": 25,
      "total_value": 1250000.50,
      "by_status": {...}
    },
    "financial": {
      "total_spent": 1250000.50,
      "total_paid": 1000000.00,
      "outstanding": 250000.50
    }
  }
}
```

### Example Usage
```bash
curl -X GET "http://localhost:8000/api/clients/{client-id}/details/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 5. Enhanced Retrieve Endpoint
**GET** `/api/clients/{id}/`

The standard retrieve endpoint now also returns detailed information using `ClientDetailSerializer`.

### Response
Same as `/api/clients/{id}/details/` endpoint.

---

## API Endpoints Summary

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|---------|
| GET | `/api/clients/` | List all clients | Paginated client list |
| POST | `/api/clients/` | Create new client | Created client |
| GET | `/api/clients/{id}/` | Get client (detailed) | Client with apartments & products |
| PATCH | `/api/clients/{id}/` | Update client | Updated client |
| DELETE | `/api/clients/{id}/` | Delete client | 204 No Content |
| GET | `/api/clients/{id}/apartments/` | Get client apartments | Apartments list with count |
| GET | `/api/clients/{id}/products/` | Get client products | Products list with total value |
| GET | `/api/clients/{id}/statistics/` | Get client statistics | Comprehensive statistics |
| GET | `/api/clients/{id}/details/` | Get complete profile | Full client data |

---

## Performance Optimizations

### Database Query Optimization
- Uses `select_related()` for foreign keys (apartment, vendor)
- Efficient aggregation queries for statistics
- Single query for apartment IDs lookup

### Response Caching
- Statistics are calculated on-demand
- Consider adding caching for frequently accessed clients

---

## Use Cases

### 1. Client Dashboard
Use `/api/clients/{id}/details/` to get all information for a client dashboard in a single request.

### 2. Client Portfolio View
Use `/api/clients/{id}/statistics/` to display summary cards with apartment count, product count, and financial overview.

### 3. Apartment Management
Use `/api/clients/{id}/apartments/` to show all apartments for a specific client.

### 4. Product Tracking
Use `/api/clients/{id}/products/` to track all products across all client apartments.

---

## Error Responses

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 400 Bad Request
```json
{
  "error": "Invalid client ID format"
}
```

---

## Testing the API

### Using Swagger UI
1. Navigate to `http://localhost:8000/api/docs/`
2. Find the "Clients" section
3. Test the new endpoints:
   - `GET /api/clients/{id}/apartments/`
   - `GET /api/clients/{id}/products/`
   - `GET /api/clients/{id}/statistics/`
   - `GET /api/clients/{id}/details/`

### Using cURL
```bash
# Get client apartments
curl -X GET "http://localhost:8000/api/clients/{client-id}/apartments/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get client products
curl -X GET "http://localhost:8000/api/clients/{client-id}/products/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get client statistics
curl -X GET "http://localhost:8000/api/clients/{client-id}/statistics/" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get complete client details
curl -X GET "http://localhost:8000/api/clients/{client-id}/details/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Python requests
```python
import requests

BASE_URL = "http://localhost:8000/api"
TOKEN = "your_access_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Get client details
client_id = "your-client-uuid"
response = requests.get(
    f"{BASE_URL}/clients/{client_id}/details/",
    headers=headers
)

data = response.json()
print(f"Client: {data['name']}")
print(f"Apartments: {data['apartments']['count']}")
print(f"Products: {data['products']['count']}")
print(f"Total Value: {data['products']['total_value']}")
```

---

## Frontend Integration

### Example: Fetching Client Details
```typescript
// Using the existing clientApi service
export const clientApi = {
  // ... existing methods ...
  
  // Get client apartments
  async getClientApartments(id: string) {
    const response = await axiosInstance.get(`/clients/${id}/apartments/`);
    return response.data;
  },
  
  // Get client products
  async getClientProducts(id: string) {
    const response = await axiosInstance.get(`/clients/${id}/products/`);
    return response.data;
  },
  
  // Get client statistics
  async getClientStatistics(id: string) {
    const response = await axiosInstance.get(`/clients/${id}/statistics/`);
    return response.data;
  },
  
  // Get complete client details
  async getClientDetails(id: string) {
    const response = await axiosInstance.get(`/clients/${id}/details/`);
    return response.data;
  },
};
```

### React Query Hook Example
```typescript
export function useClientDetails(id: string | null) {
  return useQuery({
    queryKey: ['client-details', id],
    queryFn: () => clientApi.getClientDetails(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## Benefits

1. **Single Request for Complete Data**: Get all client information in one API call
2. **Flexible Endpoints**: Choose specific data (apartments, products, statistics) or get everything
3. **Performance Optimized**: Efficient database queries with proper relationships
4. **Well Documented**: Full Swagger/OpenAPI documentation
5. **Type Safe**: Proper serializers with validation
6. **Scalable**: Can handle large datasets with pagination support

---

## Next Steps

1. **Test the API**: Use Swagger UI to test all new endpoints
2. **Update Frontend**: Integrate new endpoints in the ClientDetailsModal
3. **Add Caching**: Consider Redis caching for frequently accessed data
4. **Add Filters**: Add query parameters for filtering products/apartments
5. **Add Pagination**: Paginate products list for clients with many products
