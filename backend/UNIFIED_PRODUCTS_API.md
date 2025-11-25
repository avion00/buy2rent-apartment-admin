# 🎉 UNIFIED PRODUCTS API

All product functionality has been merged into a single, comprehensive API endpoint.

## 📍 **Base Endpoint**
```
/api/products/
```

## 🔧 **Complete API Reference**

### **1. CRUD Operations**

#### **List All Products**
```http
GET /api/products/
```
**Query Parameters:**
- `apartment` - Filter by apartment ID
- `category` - Filter by category ID
- `vendor` - Filter by vendor ID
- `status` - Filter by status
- `search` - Search in product name, SKU, vendor name, etc.

#### **Get Single Product**
```http
GET /api/products/{product_id}/
```

#### **Create Product**
```http
POST /api/products/
Content-Type: application/json

{
  "apartment": "apartment_uuid",
  "product": "Product Name",
  "description": "Product description",
  "sku": "SKU001",
  "unit_price": 1000.00,
  "qty": 1,
  "sn": "Serial Number",
  "room": "Living Room",
  "cost": "1000 Ft",
  "total_cost": "1000 Ft"
}
```

#### **Update Product**
```http
PUT /api/products/{product_id}/
Content-Type: application/json

{
  "product": "Updated Product Name",
  "unit_price": 1500.00,
  "status": "Ordered"
}
```

#### **Delete Product**
```http
DELETE /api/products/{product_id}/
```

### **2. Import Operations**

#### **Import Excel/CSV File**
```http
POST /api/products/import_excel/
Content-Type: multipart/form-data

apartment_id: apartment_uuid
file: [Excel/CSV file]
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed successfully",
  "data": {
    "total_products": 50,
    "successful_imports": 48,
    "failed_imports": 2,
    "sheets_processed": 3,
    "errors": []
  }
}
```

#### **Download Import Template**
```http
GET /api/products/import_template/
```
Returns Excel file with sample data and all supported columns.

### **3. Category Operations**

#### **Get Categories for Apartment**
```http
GET /api/products/categories/?apartment_id={apartment_id}
```

**Response:**
```json
[
  {
    "id": "category_uuid",
    "name": "Heating",
    "sheet_name": "Heating",
    "product_count": 25,
    "apartment": "apartment_uuid",
    "import_date": "2025-11-19T..."
  }
]
```

#### **Get Products by Category**
```http
GET /api/products/by_category/?category_id={category_id}
```

**Response:**
```json
{
  "category": {
    "id": "category_uuid",
    "name": "Heating",
    "sheet_name": "Heating"
  },
  "products": [
    {
      "id": "product_uuid",
      "product": "boiler",
      "sn": "1",
      "room": "Bathroom",
      "cost": "5000 Ft",
      "total_cost": "5000 Ft"
    }
  ]
}
```

### **4. Import Session Management**

#### **Get Import Sessions**
```http
GET /api/products/import_sessions/?apartment_id={apartment_id}
```

**Response:**
```json
[
  {
    "id": "session_uuid",
    "file_name": "apartment-demo.xlsx",
    "status": "completed",
    "total_products": 50,
    "successful_imports": 48,
    "failed_imports": 2,
    "started_at": "2025-11-19T...",
    "completed_at": "2025-11-19T..."
  }
]
```

#### **Delete Import Session**
```http
DELETE /api/products/delete_import_session/?session_id={session_id}
```

### **5. Statistics & Analytics**

#### **Get Product Statistics**
```http
GET /api/products/statistics/?apartment_id={apartment_id}
```

**Response:**
```json
{
  "total_items": 150,
  "ordered_items": 120,
  "delivered_items": 80,
  "open_issues": 5,
  "total_value": 500000.00,
  "total_payable": 450000.00,
  "total_paid": 300000.00,
  "outstanding_balance": 150000.00,
  "overdue_payments": 3
}
```

#### **Get Products by Apartment**
```http
GET /api/products/by_apartment/?apartment_id={apartment_id}
```

### **6. Status Management**

#### **Update Product Status**
```http
PATCH /api/products/{product_id}/update_status/
Content-Type: application/json

{
  "status": "Ordered",
  "status_tags": ["Ordered", "Pending Delivery"]
}
```

#### **Update Delivery Status**
```http
PATCH /api/products/{product_id}/update_delivery_status/
Content-Type: application/json

{
  "delivery_status_tags": ["Delivered", "No Issues"]
}
```

## 📊 **Product Model Fields**

### **Core Fields**
- `id` - UUID
- `product` - Product name
- `description` - Description
- `sku` - Product SKU
- `unit_price` - Price (Decimal)
- `qty` - Quantity
- `apartment` - Apartment UUID
- `vendor` - Vendor UUID
- `category` - Category UUID

### **Excel Import Fields**
- `sn` - Serial Number
- `product_image` - Image URL
- `cost` - Cost as text
- `total_cost` - Total cost
- `link` - Product link
- `size` - Product size
- `nm` - Square meters
- `plusz_nm` - Additional meters
- `price_per_nm` - Price per meter
- `price_per_package` - Package price
- `nm_per_package` - Meters per package
- `all_package` - Total packages
- `package_need_to_order` - Packages to order
- `all_price` - Final price
- `room` - Room location

### **Status Fields**
- `availability` - In Stock/Backorder/Out of Stock
- `status` - 12 workflow statuses
- `payment_status` - Unpaid/Partially Paid/Paid
- `issue_state` - Issue tracking

### **Dates**
- `eta` - Estimated arrival
- `ordered_on` - Order date
- `expected_delivery_date` - Expected delivery
- `actual_delivery_date` - Actual delivery
- `payment_due_date` - Payment due date
- `created_at` - Creation timestamp
- `updated_at` - Last update

## 🎯 **Frontend Usage Examples**

### **JavaScript/TypeScript**
```javascript
// Get all products for apartment
const products = await fetch('/api/products/?apartment=apartment_id')
  .then(res => res.json());

// Import Excel file
const formData = new FormData();
formData.append('apartment_id', apartmentId);
formData.append('file', excelFile);

const result = await fetch('/api/products/import_excel/', {
  method: 'POST',
  body: formData
}).then(res => res.json());

// Get categories
const categories = await fetch(`/api/products/categories/?apartment_id=${apartmentId}`)
  .then(res => res.json());

// Get statistics
const stats = await fetch(`/api/products/statistics/?apartment_id=${apartmentId}`)
  .then(res => res.json());
```

## 🔍 **Search & Filtering**

### **Search Products**
```http
GET /api/products/?search=boiler
GET /api/products/?search=SKU001
GET /api/products/?search=Bathroom
```

### **Filter Products**
```http
GET /api/products/?apartment={id}&status=Ordered
GET /api/products/?category={id}&payment_status=Unpaid
GET /api/products/?vendor={id}&issue_state=No Issue
```

### **Sort Products**
```http
GET /api/products/?ordering=-created_at
GET /api/products/?ordering=unit_price
GET /api/products/?ordering=-expected_delivery_date
```

## ✅ **What's Unified**

- ✅ **CRUD Operations** - Create, Read, Update, Delete products
- ✅ **Excel Import** - Upload and process Excel/CSV files
- ✅ **Category Management** - View categories from Excel sheets
- ✅ **Import Sessions** - Track and manage import history
- ✅ **Statistics** - Comprehensive analytics
- ✅ **Search & Filter** - Advanced querying
- ✅ **Status Management** - Update product and delivery status
- ✅ **Template Download** - Get sample Excel template

## 🚀 **Benefits**

1. **Single Endpoint** - All product functionality in `/api/products/`
2. **Consistent API** - Same authentication, error handling, pagination
3. **Better Documentation** - All endpoints in one Swagger section
4. **Easier Frontend Integration** - One service to handle all product operations
5. **Comprehensive Features** - Full product lifecycle management

**Your unified Products API is now ready to use!** 🎉
