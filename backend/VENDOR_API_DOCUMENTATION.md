# Vendor API Complete Documentation

## Overview

The Vendor API provides a comprehensive interface for managing vendors and accessing vendor-related data. All endpoints are part of a **single VendorViewSet** located in `vendors/views.py`.

---

## Base URL

```
http://localhost:8000/api/vendors/
```

---

## Standard CRUD Operations

These endpoints are automatically provided by Django REST Framework's ModelViewSet.

### 1. List All Vendors

**GET** `/api/vendors/`

**Description**: Retrieve a list of all vendors with optional filtering, searching, and sorting.

**Query Parameters**:
- `search`: Search in name, company_name, email, contact_person
- `ordering`: Sort by name, created_at, reliability, orders_count
- `page`: Page number for pagination
- `page_size`: Number of items per page

**Example Request**:
```bash
GET /api/vendors/?search=IKEA&ordering=-reliability
```

**Example Response**:
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/vendors/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "name": "IKEA Hungary",
      "company_name": "IKEA Kereskedelmi Kft.",
      "contact_person": "János Kovács",
      "email": "info@ikea.hu",
      "phone": "+36 1 234 5678",
      "website": "https://www.ikea.com/hu",
      "logo": "🛋️",
      "lead_time": "7-14 days",
      "reliability": 4.8,
      "orders_count": 125,
      "active_issues": 2,
      "address": "Budapest utca 123",
      "city": "Budapest",
      "country": "Hungary",
      "postal_code": "1234",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-11-20T15:45:00Z"
    }
  ]
}
```

---

### 2. Get Single Vendor

**GET** `/api/vendors/{id}/`

**Description**: Retrieve detailed information about a specific vendor.

**Path Parameters**:
- `id` (UUID): Vendor ID

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/
```

**Example Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "IKEA Hungary",
  "company_name": "IKEA Kereskedelmi Kft.",
  "contact_person": "János Kovács",
  "email": "info@ikea.hu",
  "phone": "+36 1 234 5678",
  "website": "https://www.ikea.com/hu",
  "logo": "🛋️",
  "lead_time": "7-14 days",
  "reliability": 4.8,
  "orders_count": 125,
  "active_issues": 2,
  "address": "Budapest utca 123",
  "city": "Budapest",
  "country": "Hungary",
  "postal_code": "1234",
  "tax_id": "HU12345678",
  "business_type": "Limited Company",
  "year_established": "1998",
  "employee_count": "500+",
  "category": "Furniture & Home Goods",
  "product_categories": "Furniture, Lighting, Textiles, Kitchen",
  "certifications": "ISO 9001, FSC",
  "specializations": "Scandinavian Design, Flat-pack furniture",
  "payment_terms": "Net 30",
  "delivery_terms": "FOB Budapest",
  "warranty_period": "2 years",
  "return_policy": "30 days return policy",
  "minimum_order": "1000 HUF",
  "notes": "Preferred vendor for modern furniture",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-11-20T15:45:00Z"
}
```

---

### 3. Create Vendor

**POST** `/api/vendors/`

**Description**: Create a new vendor.

**Required Fields**:
- `name` (string): Vendor name

**Optional Fields**:
- `company_name`, `contact_person`, `email`, `phone`, `website`
- `logo`, `lead_time`, `reliability`, `orders_count`, `active_issues`
- `address`, `city`, `country`, `postal_code`
- `tax_id`, `business_type`, `year_established`, `employee_count`
- `category`, `product_categories`, `certifications`, `specializations`
- `payment_terms`, `delivery_terms`, `warranty_period`, `return_policy`, `minimum_order`
- `notes`

**Example Request**:
```json
POST /api/vendors/
{
  "name": "OBI Hungary",
  "company_name": "OBI Építőanyag Kft.",
  "email": "info@obi.hu",
  "phone": "+36 1 987 6543",
  "website": "https://www.obi.hu",
  "city": "Budapest",
  "country": "Hungary",
  "payment_terms": "Net 30",
  "lead_time": "3-7 days"
}
```

**Example Response**:
```json
{
  "id": "new-uuid-here",
  "name": "OBI Hungary",
  "company_name": "OBI Építőanyag Kft.",
  "email": "info@obi.hu",
  ...
}
```

---

### 4. Update Vendor (Full)

**PUT** `/api/vendors/{id}/`

**Description**: Completely replace vendor data (all fields required).

**Example Request**:
```json
PUT /api/vendors/550e8400-e29b-41d4-a716-446655440000/
{
  "name": "IKEA Hungary Updated",
  "company_name": "IKEA Kereskedelmi Kft.",
  "email": "contact@ikea.hu",
  ... (all other fields)
}
```

---

### 5. Update Vendor (Partial)

**PATCH** `/api/vendors/{id}/`

**Description**: Update specific vendor fields (only provided fields are updated).

**Example Request**:
```json
PATCH /api/vendors/550e8400-e29b-41d4-a716-446655440000/
{
  "email": "newemail@ikea.hu",
  "phone": "+36 1 999 8888",
  "reliability": 4.9
}
```

---

### 6. Delete Vendor

**DELETE** `/api/vendors/{id}/`

**Description**: Delete a vendor (only if no related products exist).

**Example Request**:
```bash
DELETE /api/vendors/550e8400-e29b-41d4-a716-446655440000/
```

**Response**: `204 No Content`

---

## Custom Action Endpoints

These are specialized endpoints for specific use cases.

### 7. Search Vendor by Name

**GET** `/api/vendors/search_by_name/`

**Description**: Find a vendor by name (case-insensitive, URL-friendly).

**Query Parameters**:
- `name` (required): Vendor name (spaces can be replaced with hyphens)

**Example Request**:
```bash
GET /api/vendors/search_by_name/?name=ikea-hungary
```

**Example Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "IKEA Hungary",
  ...
}
```

---

### 8. Get Frontend Detail by Name

**GET** `/api/vendors/frontend_detail_by_name/`

**Description**: Get vendor details optimized for frontend display, accessed by name.

**Query Parameters**:
- `name` (required): Vendor name

**Example Request**:
```bash
GET /api/vendors/frontend_detail_by_name/?name=ikea-hungary
```

**Example Response**: See "Frontend Detail by ID" response structure.

---

### 9. Get Frontend Detail by ID

**GET** `/api/vendors/{id}/frontend_detail/`

**Description**: Get vendor details with embedded products, orders, issues, and payments.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/frontend_detail/
```

**Example Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "IKEA Hungary",
  "logo": "🛋️",
  "contact": "info@ikea.hu",
  "website": "https://www.ikea.com/hu",
  "lead_time": "7-14 days",
  "reliability": 4.8,
  "orders_count": 125,
  "active_issues": 2,
  "products_count": 450,
  "orders_total_value": 15000000.00,
  "products": [
    {
      "id": "product-uuid",
      "product": "KALLAX Shelf",
      "apartment": "Apartment A",
      "price": 45000.00,
      "qty": 2,
      "availability": "in_stock",
      "status": "delivered"
    }
  ],
  "orders": [
    {
      "id": "order-uuid",
      "po_number": "PO-2024-001",
      "apartment": "Apartment A",
      "items_count": 15,
      "total": 450000.00,
      "status": "delivered",
      "placed_on": "2024-10-15"
    }
  ],
  "issues": [
    {
      "id": "issue-uuid",
      "item": "KALLAX Shelf",
      "issue_type": "damaged",
      "description": "Shelf damaged during delivery",
      "priority": "high",
      "status": "open",
      "created_date": "2024-11-01"
    }
  ],
  "payments": [
    {
      "id": "payment-uuid",
      "order_no": "PO-2024-001",
      "apartment": "Apartment A",
      "amount": 450000.00,
      "status": "paid",
      "due_date": "2024-11-15",
      "paid_date": "2024-11-10"
    }
  ]
}
```

---

### 10. Get Vendor Products

**GET** `/api/vendors/{id}/products/`

**Description**: Get all products from this vendor.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/products/
```

**Example Response**:
```json
[
  {
    "id": "product-uuid",
    "product": "KALLAX Shelf",
    "apartment": "apartment-uuid",
    "apartment_details": {
      "id": "apartment-uuid",
      "name": "Apartment A"
    },
    "vendor": "550e8400-e29b-41d4-a716-446655440000",
    "vendor_name": "IKEA Hungary",
    "sku": "KALLAX-001",
    "unit_price": "45000.00",
    "qty": 2,
    "status": "Delivered",
    ...
  }
]
```

---

### 11. Get Vendor Orders

**GET** `/api/vendors/{id}/orders/`

**Description**: Get all orders placed with this vendor.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/orders/
```

---

### 12. Get Vendor Issues

**GET** `/api/vendors/{id}/issues/`

**Description**: Get all issues related to this vendor's products.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/issues/
```

---

### 13. Get Vendor Payments

**GET** `/api/vendors/{id}/payments/`

**Description**: Get all payments made to this vendor.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/payments/
```

---

### 14. Get Vendor Statistics

**GET** `/api/vendors/{id}/statistics/`

**Description**: Get comprehensive analytics and statistics for this vendor.

**Example Request**:
```bash
GET /api/vendors/550e8400-e29b-41d4-a716-446655440000/statistics/
```

**Example Response**:
```json
{
  "vendor_info": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "IKEA Hungary",
    "reliability": 4.8,
    "orders_count": 125,
    "active_issues": 2
  },
  "products": {
    "total": 450,
    "delivered": 420,
    "with_issues": 5
  },
  "orders": {
    "total": 125,
    "delivered": 118,
    "total_value": 15000000.00
  },
  "payments": {
    "total": 125,
    "paid": 115,
    "total_amount": 15000000.00,
    "outstanding_amount": 500000.00
  },
  "issues": {
    "total": 8,
    "open": 2
  },
  "performance": {
    "on_time_delivery_rate": 95.5,
    "quality_rating": 4.5,
    "order_accuracy": 98.0
  }
}
```

---

## Frontend Integration

### For VendorDetailsModalAPI Component

Use this endpoint to get vendor details:

```typescript
// By ID
GET /api/vendors/{vendorId}/

// By name (from product)
GET /api/vendors/frontend_detail_by_name/?name={vendorName}
```

### For VendorView Page

Use this endpoint for complete vendor page:

```typescript
GET /api/vendors/{vendorId}/frontend_detail/
```

This returns vendor info + products + orders + issues + payments in one call.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "name parameter is required"
}
```

### 404 Not Found
```json
{
  "error": "Vendor not found"
}
```

### 500 Server Error
```json
{
  "detail": "Internal server error message"
}
```

---

## Best Practices

### 1. **For Listing Vendors**
Use: `GET /api/vendors/`
- Supports search, filtering, pagination
- Returns basic vendor info

### 2. **For Vendor Details in Modal**
Use: `GET /api/vendors/{id}/`
- Returns complete vendor information
- No related data (products, orders, etc.)

### 3. **For Vendor Detail Page**
Use: `GET /api/vendors/{id}/frontend_detail/`
- Returns vendor + products + orders + issues + payments
- Optimized for frontend display
- Limited to 50 items per category for performance

### 4. **For Analytics/Dashboard**
Use: `GET /api/vendors/{id}/statistics/`
- Returns computed statistics
- Performance metrics
- Financial summaries

---

## Database Schema

### Vendor Model Fields

```python
class Vendor(models.Model):
    # Core fields
    id = UUIDField (primary key)
    name = CharField(max_length=255)
    company_name = CharField(max_length=255, blank=True)
    contact_person = CharField(max_length=255, blank=True)
    email = EmailField(blank=True)
    phone = CharField(max_length=20, blank=True)
    website = URLField(blank=True)
    
    # Performance metrics
    logo = CharField(max_length=16, blank=True)
    lead_time = CharField(max_length=100, blank=True)
    reliability = DecimalField(max_digits=3, decimal_places=2, default=0)
    orders_count = PositiveIntegerField(default=0)
    active_issues = PositiveIntegerField(default=0)
    
    # Address
    address = CharField(max_length=255, blank=True)
    city = CharField(max_length=100, blank=True)
    country = CharField(max_length=100, blank=True)
    postal_code = CharField(max_length=20, blank=True)
    
    # Business info
    tax_id = CharField(max_length=100, blank=True)
    business_type = CharField(max_length=100, blank=True)
    year_established = CharField(max_length=10, blank=True)
    employee_count = CharField(max_length=20, blank=True)
    
    # Classification
    category = CharField(max_length=100, blank=True)
    product_categories = TextField(blank=True)
    certifications = TextField(blank=True)
    specializations = TextField(blank=True)
    
    # Terms
    payment_terms = CharField(max_length=100, blank=True)
    delivery_terms = CharField(max_length=255, blank=True)
    warranty_period = CharField(max_length=100, blank=True)
    return_policy = TextField(blank=True)
    minimum_order = CharField(max_length=100, blank=True)
    
    # Metadata
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

---

## Summary

✅ **You have ONE correct, comprehensive Vendor API**
- Standard CRUD operations (list, create, read, update, delete)
- Custom actions for specialized use cases
- Optimized endpoints for frontend pages
- Statistics and analytics endpoints

🎯 **All endpoints are part of the same VendorViewSet**
- No duplicates
- Well-organized
- Following Django REST Framework best practices

📚 **Use the right endpoint for your use case**
- Basic CRUD: `/api/vendors/` and `/api/vendors/{id}/`
- Frontend pages: `/api/vendors/{id}/frontend_detail/`
- Analytics: `/api/vendors/{id}/statistics/`
- Related data: `/api/vendors/{id}/products/`, `/orders/`, `/issues/`, `/payments/`
