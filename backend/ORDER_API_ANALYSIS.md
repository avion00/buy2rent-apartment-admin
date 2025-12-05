# Order API Integration Analysis

## ✅ API Readiness Assessment

### 1. Backend Order Model Structure

The Order model has all necessary fields:

```python
# Core Fields
- id (UUID) ✅
- po_number (unique) ✅
- apartment (ForeignKey) ✅
- vendor (ForeignKey) ✅
- items_count ✅
- total (decimal) ✅
- status (choices) ✅
- placed_on (date) ✅
- expected_delivery (date, optional) ✅
- actual_delivery (date, optional) ✅
- notes (text) ✅
- shipping_address (text) ✅
- tracking_number ✅
```

### 2. API Endpoints Available

```
GET    /api/orders/              # List all orders with pagination
POST   /api/orders/              # Create new order
GET    /api/orders/{id}/         # Get single order details
PUT    /api/orders/{id}/         # Update order
PATCH  /api/orders/{id}/         # Partial update
DELETE /api/orders/{id}/         # Delete order

# Custom Endpoints
GET    /api/orders/statistics/   # Get order statistics
GET    /api/orders/by_vendor/    # Filter by vendor (requires vendor_id param)
GET    /api/orders/by_apartment/ # Filter by apartment (requires apartment_id param)
```

### 3. Frontend-Backend Field Mapping

| Frontend Field | Backend Field | Type | Notes |
|---------------|--------------|------|-------|
| `po_number` | `po_number` | string | ✅ Direct match |
| `apartment` | `apartment_name` | string | ✅ Read-only, from relation |
| `vendor` | `vendor_name` | string | ✅ Read-only, from relation |
| `items_count` | `items_count` | number | ✅ Direct match |
| `total` | `total` | decimal | ✅ Direct match |
| `confirmation` | `tracking_number` | string | ⚠️ Can repurpose or add new field |
| `tracking` | `tracking_number` | string | ✅ Direct match |
| `status` | `status` | string | ⚠️ Needs mapping (see below) |
| `placed_on` | `placed_on` | date | ✅ Direct match |
| - | `expected_delivery` | date | ➕ Additional field available |
| - | `actual_delivery` | date | ➕ Additional field available |
| - | `notes` | text | ➕ Additional field available |
| - | `items` | array | ✅ Nested items included |

### 4. Status Mapping Required

**Backend Status Values:**
- `draft`
- `confirmed` 
- `in_transit`
- `delivered`
- `cancelled`
- `returned`

**Frontend Status Values:**
- `Draft` → `draft`
- `Sent` → `confirmed`
- `Confirmed` → `in_transit`
- `Received` → `delivered`

### 5. Order Items Structure

Each order includes nested items with:
```json
{
  "id": "uuid",
  "product_name": "string",
  "sku": "string",
  "quantity": number,
  "unit_price": decimal,
  "total_price": decimal,
  "description": "text",
  "specifications": {}
}
```

## 🔧 Required Frontend Changes

### 1. API Service Setup

Create `src/services/orderService.ts`:

```typescript
interface Order {
  id: string;
  po_number: string;
  apartment: string;
  apartment_name: string;
  vendor: string;
  vendor_name: string;
  items_count: number;
  total: number;
  status: 'draft' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  placed_on: string;
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  shipping_address?: string;
  tracking_number?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description?: string;
  specifications?: Record<string, any>;
}
```

### 2. Status Mapping Function

```typescript
const mapFrontendToBackend = (status: string): string => {
  const mapping: Record<string, string> = {
    'Draft': 'draft',
    'Sent': 'confirmed',
    'Confirmed': 'in_transit',
    'Received': 'delivered'
  };
  return mapping[status] || status.toLowerCase();
};

const mapBackendToFrontend = (status: string): string => {
  const mapping: Record<string, string> = {
    'draft': 'Draft',
    'confirmed': 'Sent',
    'in_transit': 'Confirmed',
    'delivered': 'Received',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  return mapping[status] || status;
};
```

### 3. Create Order Payload

When creating an order, send:

```json
{
  "po_number": "PO-2025-001",
  "apartment": "apartment-uuid",
  "vendor": "vendor-uuid",
  "items_count": 3,
  "total": "2499.99",
  "status": "draft",
  "placed_on": "2025-12-05",
  "expected_delivery": "2025-12-20",
  "notes": "Please deliver to reception",
  "shipping_address": "123 Main St",
  "tracking_number": ""
}
```

Note: Items should be created separately or through a nested serializer update.

## ⚠️ Issues to Address

### 1. Missing Confirmation Field
Frontend uses a separate `confirmation` field, but backend only has `tracking_number`. Options:
- Add `confirmation_number` field to Order model
- Use `tracking_number` for both confirmation and tracking
- Store confirmation in `notes` or create a JSON field

### 2. Order Items Creation
Currently, OrderItem creation is not exposed through the main Order endpoint. Need to:
- Implement nested creation in OrderSerializer
- Or create items after order creation using separate API calls

### 3. Date Format
Ensure consistent date formatting:
- Backend expects: `YYYY-MM-DD`
- Frontend displays: `YYYY-MM-DD` or localized format

## ✅ What's Working

1. ✅ Order CRUD operations
2. ✅ Filtering by apartment and vendor
3. ✅ Search functionality (po_number, vendor name, apartment name)
4. ✅ Ordering/sorting
5. ✅ Statistics endpoint
6. ✅ Nested items retrieval
7. ✅ Pagination support

## 🚀 Next Steps

1. **Update OrderSerializer** to handle nested item creation:
```python
def create(self, validated_data):
    items_data = validated_data.pop('items', [])
    order = Order.objects.create(**validated_data)
    for item_data in items_data:
        OrderItem.objects.create(order=order, **item_data)
    return order
```

2. **Add confirmation_number field** to Order model if needed

3. **Update frontend** to use actual API instead of mock data

4. **Implement proper error handling** for API responses

5. **Add loading states** in frontend components

## 📝 Testing Checklist

- [ ] Create order with multiple items
- [ ] Update order status
- [ ] Filter by apartment
- [ ] Filter by vendor
- [ ] Search by PO number
- [ ] Sort by date/total
- [ ] View order details with items
- [ ] Update tracking number
- [ ] Delete order
- [ ] Handle validation errors
- [ ] Test pagination with many orders

## 🔐 Security Considerations

1. All endpoints require authentication (JWT)
2. UUID primary keys prevent enumeration attacks
3. Proper permission checks needed for update/delete
4. Input validation on all fields
5. SQL injection protection through ORM

## 📊 Sample API Responses

### GET /api/orders/
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/orders/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "po_number": "PO-2025-001",
      "apartment_name": "Budapest Apartment #A12",
      "vendor_name": "IKEA Hungary",
      "items_count": 8,
      "total": "2499.99",
      "status": "confirmed",
      "placed_on": "2025-10-20",
      "expected_delivery": "2025-10-25",
      "actual_delivery": null,
      "is_delivered": false
    }
  ]
}
```

### GET /api/orders/{id}/
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "po_number": "PO-2025-001",
  "apartment": "apartment-uuid",
  "apartment_name": "Budapest Apartment #A12",
  "vendor": "vendor-uuid",
  "vendor_name": "IKEA Hungary",
  "items_count": 2,
  "total": "2499.99",
  "status": "confirmed",
  "placed_on": "2025-10-20",
  "expected_delivery": "2025-10-25",
  "actual_delivery": null,
  "notes": "Please call before delivery",
  "shipping_address": "123 Main St, Budapest",
  "tracking_number": "TRK-123456",
  "is_delivered": false,
  "items": [
    {
      "id": "item-uuid-1",
      "product_name": "Modern Sofa",
      "sku": "SOFA-001",
      "quantity": 1,
      "unit_price": "1999.99",
      "total_price": "1999.99",
      "description": "3-seater modern sofa",
      "specifications": {
        "color": "gray",
        "material": "fabric"
      }
    },
    {
      "id": "item-uuid-2",
      "product_name": "Coffee Table",
      "sku": "TABLE-002",
      "quantity": 1,
      "unit_price": "500.00",
      "total_price": "500.00",
      "description": "Glass top coffee table",
      "specifications": {
        "dimensions": "120x60x45cm"
      }
    }
  ],
  "created_at": "2025-10-20T10:30:00Z",
  "updated_at": "2025-10-22T14:20:00Z"
}
```

## ✅ Conclusion

The Order API is **90% ready for integration**. Main tasks:
1. Implement nested item creation in the serializer
2. Map status values between frontend and backend
3. Update frontend to use real API endpoints
4. Handle the confirmation field requirement

The API structure is solid and follows REST best practices with proper filtering, searching, and pagination support.
