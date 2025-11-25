# Product API Integration Guide

This guide provides complete documentation for the Product API endpoints and their integration with the frontend.

## 🔧 Backend API Endpoints

### Base URL
```
http://localhost:8000/api/products/
```

### 1. **List All Products**
```http
GET /api/products/
```

**Query Parameters:**
- `apartment` - Filter by apartment ID
- `vendor` - Filter by vendor ID
- `status` - Filter by product status
- `payment_status` - Filter by payment status
- `issue_state` - Filter by issue state
- `search` - Search in product name, SKU, vendor name, apartment name
- `ordering` - Sort by fields (e.g., `-created_at`, `unit_price`)

**Example:**
```bash
curl "http://localhost:8000/api/products/?apartment=<apartment_id>&status=Ordered"
```

### 2. **Get Single Product**
```http
GET /api/products/{id}/
```

### 3. **Create Product**
```http
POST /api/products/
Content-Type: application/json

{
  "apartment": "apartment_uuid",
  "vendor": "vendor_uuid",
  "product": "Modern Sofa",
  "sku": "SOFA-001",
  "unit_price": 89900,
  "qty": 1,
  "status": "Design Approved",
  "category": "Furniture",
  "room": "Living Room"
}
```

### 4. **Update Product**
```http
PUT /api/products/{id}/
PATCH /api/products/{id}/
```

### 5. **Delete Product**
```http
DELETE /api/products/{id}/
```

### 6. **Get Products by Apartment**
```http
GET /api/products/by_apartment/?apartment_id={apartment_id}
```

### 7. **Update Product Status**
```http
PATCH /api/products/{id}/update_status/

{
  "status": "Delivered",
  "status_tags": ["Delivered", "No Issue"]
}
```

### 8. **Update Delivery Status**
```http
PATCH /api/products/{id}/update_delivery_status/

{
  "delivery_status_tags": ["Delivered", "No Issue"]
}
```

### 9. **Get Product Statistics**
```http
GET /api/products/statistics/?apartment_id={apartment_id}
```

**Response:**
```json
{
  "total_items": 15,
  "ordered_items": 12,
  "delivered_items": 8,
  "open_issues": 2,
  "total_value": 450000.00,
  "total_payable": 450000.00,
  "total_paid": 320000.00,
  "outstanding_balance": 130000.00,
  "overdue_payments": 1
}
```

## 📋 Product Model Fields

### Core Fields
- `id` (UUID) - Unique identifier
- `apartment` (UUID) - Foreign key to Apartment
- `vendor` (UUID) - Foreign key to Vendor
- `product` (string) - Product name
- `sku` (string) - Stock Keeping Unit
- `unit_price` (decimal) - Price per unit
- `qty` (integer) - Quantity
- `availability` - In Stock | Backorder | Out of Stock
- `status` - Design Approved | Ready To Order | Ordered | etc.

### Dates
- `eta` (date) - Estimated Time of Arrival
- `ordered_on` (date) - Order date
- `expected_delivery_date` (date) - Expected delivery
- `actual_delivery_date` (date) - Actual delivery

### Payment Fields
- `payment_status` - Unpaid | Partially Paid | Paid
- `payment_due_date` (date) - Payment due date
- `payment_amount` (decimal) - Total amount to pay
- `paid_amount` (decimal) - Amount already paid
- `currency` (string) - Default: HUF
- `shipping_cost` (decimal) - Shipping cost
- `discount` (decimal) - Discount amount

### Delivery Fields
- `delivery_type` (string) - Delivery method
- `delivery_address` (text) - Full delivery address
- `delivery_city` (string) - Delivery city
- `delivery_postal_code` (string) - Postal code
- `delivery_country` (string) - Country
- `delivery_instructions` (text) - Special instructions
- `delivery_contact_person` (string) - Contact person
- `delivery_contact_phone` (string) - Contact phone
- `delivery_contact_email` (email) - Contact email
- `tracking_number` (string) - Shipment tracking

### Issue Management
- `issue_state` - No Issue | Issue Reported | AI Resolving | etc.
- `issue_type` (string) - Type of issue
- `issue_description` (text) - Issue details
- `replacement_requested` (boolean) - Replacement needed
- `replacement_approved` (boolean) - Replacement approved
- `replacement_eta` (date) - Replacement ETA
- `replacement_of` (UUID) - Original product being replaced

### Additional Fields
- `category` (string) - Product category
- `room` (string) - Target room
- `brand` (string) - Product brand
- `country_of_origin` (string) - Manufacturing country
- `image_url` (URL) - Product image
- `vendor_link` (URL) - Vendor product page
- `notes` (text) - General notes
- `manual_notes` (text) - Manual notes
- `ai_summary_notes` (text) - AI-generated notes

### Computed Fields
- `total_amount` (read-only) - (unit_price × qty) + shipping - discount
- `outstanding_balance` (read-only) - total_amount - paid_amount
- `status_tags` (read-only) - Array of status tags
- `delivery_status_tags` (read-only) - Array of delivery status tags

## 🎯 Frontend Integration

### 1. **Fetch Products for Apartment**
```typescript
// Using React Query
const { data: products = [], isLoading } = useProducts({ apartment: apartmentId });
```

### 2. **Update Product Status**
```typescript
const updateProductMutation = useUpdateProduct();

const handleStatusUpdate = async (productId: string, newTags: string[]) => {
  await updateProductMutation.mutateAsync({
    id: productId,
    product: { status_tags: newTags }
  });
};
```

### 3. **Delete Product**
```typescript
const deleteProductMutation = useDeleteProduct();

const handleDelete = async (productId: string) => {
  await deleteProductMutation.mutateAsync(productId);
};
```

### 4. **Calculate Statistics**
```typescript
// Frontend calculations from product array
const totalItems = products.length;
const orderedItems = products.filter(p => 
  ["Ordered", "Shipped", "Delivered"].includes(p.status)
).length;
const totalValue = products.reduce((sum, p) => 
  sum + (p.unit_price * p.qty), 0
);
```

## 🔄 Field Mapping (Backend ↔ Frontend)

The API provides both snake_case (backend) and camelCase (frontend) versions:

| Backend Field | Frontend Field | Type |
|---------------|----------------|------|
| `image_url` | `imageUrl` | string |
| `vendor_link` | `vendorLink` | string |
| `unit_price` | `unitPrice` | number |
| `expected_delivery_date` | `expectedDeliveryDate` | string |
| `actual_delivery_date` | `actualDeliveryDate` | string |
| `payment_amount` | `paymentAmount` | number |
| `paid_amount` | `paidAmount` | number |
| `payment_status` | `paymentStatus` | string |
| `payment_due_date` | `paymentDueDate` | string |
| `issue_state` | `issueState` | string |
| `ordered_on` | `orderedOn` | string |
| `delivery_address` | `deliveryAddress` | string |
| `delivery_city` | `deliveryCity` | string |
| `status_tags` | `statusTags` | string[] |
| `delivery_status_tags` | `deliveryStatusTags` | string[] |

## 🧪 Testing the API

### 1. **Start Django Server**
```bash
cd backend
python manage.py runserver
```

### 2. **Create Sample Data**
```bash
python test_product_api.py --create-sample
```

### 3. **Test API Endpoints**
```bash
python test_product_api.py
```

### 4. **View API Documentation**
Visit: http://localhost:8000/api/docs/

## 🚀 Integration Checklist

- ✅ **Product Model** - Complete with all required fields
- ✅ **Product Serializer** - Includes both snake_case and camelCase fields
- ✅ **Product ViewSet** - Full CRUD + custom endpoints
- ✅ **URL Registration** - Registered at `/api/products/`
- ✅ **Filtering & Search** - Apartment, vendor, status filtering
- ✅ **Statistics Endpoint** - Real-time calculations
- ✅ **Status Updates** - Custom endpoints for status management
- ✅ **Frontend Compatibility** - Field mapping for React components

## 📝 Usage Examples

### Frontend Component Integration
```tsx
const ApartmentView = () => {
  const { id } = useParams();
  const { data: products = [], isLoading } = useProducts({ apartment: id });
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleStatusChange = async (productId: string, newTags: string[]) => {
    await updateProductMutation.mutateAsync({
      id: productId,
      product: { status_tags: newTags }
    });
  };

  const handleDelete = async (productId: string) => {
    await deleteProductMutation.mutateAsync(productId);
  };

  return (
    <div>
      {products.map(product => (
        <ProductRow 
          key={product.id}
          product={product}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

The Product API is now fully compatible with the frontend requirements and ready for integration! 🎉
