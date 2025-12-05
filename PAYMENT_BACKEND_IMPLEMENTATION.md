# Payment Backend API Implementation

## Overview
This document describes the backend changes made to support the Payment-Product relationship and automatic payment status updates.

---

## Database Changes

### 1. Payment Model (`payments/models.py`)

#### **New Field Added:**
```python
products = models.ManyToManyField(
    'products.Product',
    related_name='payments',
    blank=True,
    help_text="Products included in this payment"
)
```

**Purpose:** Links multiple products to a single payment, allowing one payment to cover multiple products.

---

## Automatic Payment Status Updates

### 2. Signal Handlers

#### **`payment_saved` Signal:**
- **Trigger:** When a Payment is created or updated
- **Action:** Automatically updates `payment_status` for all linked products
- **Logic:**
  - Calculates total paid amount across all payments for each product
  - Compares with product total (unit_price × qty)
  - Updates product status:
    - `Paid` - if total_paid >= product_total
    - `Partially Paid` - if total_paid > 0 but < product_total
    - `Unpaid` - if total_paid == 0

#### **`payment_deleted` Signal:**
- **Trigger:** When a Payment is deleted
- **Action:** Recalculates payment status for all previously linked products
- **Logic:** Same as above, but excludes the deleted payment

---

## API Changes

### 3. Payment Serializer (`payments/serializers.py`)

#### **New Fields:**
```python
products = models.ManyToManyField()  # List of product IDs (writable)
product_details = ProductSummarySerializer()  # Full product info (read-only)
product_count = SerializerMethodField()  # Count of products
```

#### **ProductSummarySerializer:**
Returns lightweight product information:
```json
{
  "id": "uuid",
  "product": "Product Name",
  "category_name": "Category",
  "unit_price": "1000.00",
  "qty": 2,
  "payment_status": "Partially Paid"
}
```

#### **Custom Create/Update Methods:**
- Handles `products` field separately
- Uses `.set()` method for ManyToMany relationship
- Automatically triggers payment status updates via signals

---

## API Request/Response Examples

### **Create Payment with Products**

**Request:**
```http
POST /api/payments/
Content-Type: application/json

{
  "apartment": "apartment-uuid",
  "vendor": "vendor-uuid",
  "order_reference": "ORD-2025-001",
  "due_date": "2025-12-31",
  "total_amount": "5000.00",
  "amount_paid": "2000.00",
  "status": "Partial",
  "products": [
    "product-uuid-1",
    "product-uuid-2",
    "product-uuid-3"
  ],
  "notes": "Initial payment for furniture"
}
```

**Response:**
```json
{
  "id": "payment-uuid",
  "apartment": "apartment-uuid",
  "apartment_details": { ... },
  "vendor": "vendor-uuid",
  "vendor_details": { ... },
  "vendor_name": "IKEA",
  "order_reference": "ORD-2025-001",
  "total_amount": "5000.00",
  "amount_paid": "2000.00",
  "outstanding_amount": "3000.00",
  "due_date": "2025-12-31",
  "status": "Partial",
  "last_payment_date": null,
  "notes": "Initial payment for furniture",
  "products": [
    "product-uuid-1",
    "product-uuid-2",
    "product-uuid-3"
  ],
  "product_details": [
    {
      "id": "product-uuid-1",
      "product": "Office Chair",
      "category_name": "Furniture",
      "unit_price": "1500.00",
      "qty": 2,
      "payment_status": "Partially Paid"
    },
    {
      "id": "product-uuid-2",
      "product": "Desk Lamp",
      "category_name": "Lighting",
      "unit_price": "500.00",
      "qty": 4,
      "payment_status": "Unpaid"
    }
  ],
  "product_count": 3,
  "payment_history": [],
  "created_at": "2025-12-03T15:30:00Z",
  "updated_at": "2025-12-03T15:30:00Z"
}
```

---

## Product Model Updates

### **Automatic Fields Updated:**
When a payment is created/updated/deleted, these Product fields are automatically updated:

```python
payment_status = 'Paid' | 'Partially Paid' | 'Unpaid'
paid_amount = Decimal  # Total paid across all payments
payment_amount = Decimal  # Product total (unit_price × qty)
```

---

## Migration

### **Migration File:** `payments/migrations/0002_payment_products.py`

**To Apply:**
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

**What it does:**
- Adds `products` ManyToMany field to Payment model
- Creates junction table: `payments_payment_products`

---

## Admin Interface

### **Payment Admin Updates:**
- ✅ `filter_horizontal` widget for easy product selection
- ✅ Product count displayed in list view
- ✅ Products can be added/removed when creating/editing payments

---

## Workflow Example

### **Scenario: Creating a Payment for 3 Products**

1. **User selects products in frontend:**
   - Product A: 1000 HUF × 2 = 2000 HUF
   - Product B: 500 HUF × 1 = 500 HUF
   - Product C: 1500 HUF × 1 = 1500 HUF
   - **Total: 4000 HUF**

2. **Frontend sends request:**
   ```json
   {
     "products": ["product-a-uuid", "product-b-uuid", "product-c-uuid"],
     "total_amount": "4000.00",
     "amount_paid": "2000.00",
     "status": "Partial"
   }
   ```

3. **Backend creates payment:**
   - Payment record created
   - Products linked via ManyToMany

4. **Signal triggers:**
   - `payment_saved` signal fires
   - For each product:
     - Calculate total paid across all payments
     - Update `payment_status` field
     - Update `paid_amount` field

5. **Product statuses updated:**
   - Product A: `Partially Paid` (if 2000 HUF paid)
   - Product B: `Unpaid` (if 0 HUF allocated)
   - Product C: `Unpaid` (if 0 HUF allocated)

---

## Benefits

### ✅ **Automatic Status Management**
- No manual updates needed
- Payment status always accurate
- Works across create, update, and delete operations

### ✅ **Flexible Payment Structure**
- One payment can cover multiple products
- One product can have multiple payments
- Supports partial payments

### ✅ **Data Integrity**
- Signals ensure consistency
- Automatic recalculation on changes
- Prevents orphaned payment statuses

### ✅ **Rich API Response**
- Full product details included
- Payment history tracked
- Outstanding amounts calculated

---

## Testing Checklist

- [ ] Create payment with products
- [ ] Update payment (add/remove products)
- [ ] Delete payment (verify product status resets)
- [ ] Create multiple payments for same product
- [ ] Verify payment_status updates correctly
- [ ] Check product paid_amount calculation
- [ ] Test with 0 products
- [ ] Test with 100+ products
- [ ] Verify admin interface works
- [ ] Check API response format

---

## Next Steps

1. **Run Migration:**
   ```bash
   python manage.py migrate
   ```

2. **Test API:**
   - Use Postman/Swagger to test endpoints
   - Verify product status updates

3. **Frontend Integration:**
   - Update PaymentNew.tsx to send `products` array
   - Display product_details in payment list
   - Show product_count in payment cards

4. **Optional Enhancements:**
   - Add payment allocation (specify amount per product)
   - Add payment method details (bank transfer, card, etc.)
   - Add email notifications when payment status changes
   - Add payment reminders for overdue payments

---

## API Endpoints

### **Payments:**
- `GET /api/payments/` - List all payments
- `POST /api/payments/` - Create payment (with products)
- `GET /api/payments/{id}/` - Get payment details
- `PUT /api/payments/{id}/` - Update payment
- `PATCH /api/payments/{id}/` - Partial update
- `DELETE /api/payments/{id}/` - Delete payment

### **Products:**
- `GET /api/products/` - List all products (includes payment_status)
- `GET /api/products/{id}/` - Get product (includes payments list)

---

## Database Schema

```
┌─────────────────┐         ┌──────────────────────────┐         ┌─────────────────┐
│    Payment      │         │ payment_payment_products │         │    Product      │
├─────────────────┤         ├──────────────────────────┤         ├─────────────────┤
│ id (UUID)       │────────>│ payment_id (FK)          │<────────│ id (UUID)       │
│ apartment (FK)  │         │ product_id (FK)          │         │ apartment (FK)  │
│ vendor (FK)     │         └──────────────────────────┘         │ vendor (FK)     │
│ order_reference │                                              │ product         │
│ total_amount    │                                              │ unit_price      │
│ amount_paid     │                                              │ qty             │
│ due_date        │                                              │ payment_status  │
│ status          │                                              │ paid_amount     │
│ notes           │                                              │ payment_amount  │
└─────────────────┘                                              └─────────────────┘
```

---

**Implementation Complete! 🎉**
