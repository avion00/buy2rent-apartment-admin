# Payment API Integration - Complete Guide

## Overview
This document describes the complete frontend-backend integration for the Payment system with Product selection functionality.

---

## Files Created/Modified

### **Backend Files:**
1. ✅ `backend/payments/models.py` - Added products ManyToMany field & signals
2. ✅ `backend/payments/serializers.py` - Added product handling
3. ✅ `backend/payments/admin.py` - Added product admin features
4. ✅ `backend/payments/migrations/0003_payment_products.py` - Database migration

### **Frontend Files:**
1. ✅ `frontend/src/services/paymentApi.ts` - API service layer
2. ✅ `frontend/src/hooks/usePaymentApi.ts` - React Query hooks
3. ✅ `frontend/src/pages/PaymentNew.tsx` - Create payment with products
4. ✅ `frontend/src/pages/PaymentEdit.tsx` - Edit payment with products

---

## API Service Layer

### **File:** `frontend/src/services/paymentApi.ts`

#### **Type Definitions:**
```typescript
export interface Payment {
  id: string;
  apartment: string;
  apartment_details: ApartmentDetails;
  vendor: string;
  vendor_details: VendorDetails;
  vendor_name: string;
  order_reference: string;
  total_amount: string;
  amount_paid: string;
  outstanding_amount: string;
  due_date: string;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  last_payment_date: string | null;
  notes: string;
  products: string[];  // Array of product UUIDs
  product_details: ProductSummary[];  // Full product info
  product_count: number;
  payment_history: PaymentHistory[];
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  apartment: string;
  vendor: string;
  order_reference: string;
  due_date: string;
  total_amount: string;
  amount_paid: string;
  status: string;
  last_payment_date?: string | null;
  notes?: string;
  products: string[];  // Product IDs to include
}
```

#### **API Methods:**
```typescript
export const paymentApi = {
  getPayments: (params?) => Promise<PaymentListResponse>
  getPayment: (id) => Promise<Payment>
  createPayment: (data) => Promise<Payment>
  updatePayment: (id, data) => Promise<Payment>
  patchPayment: (id, data) => Promise<Payment>
  deletePayment: (id) => Promise<void>
  getPaymentHistory: (paymentId?) => Promise<PaymentHistory[]>
  createPaymentHistory: (data) => Promise<PaymentHistory>
}
```

---

## React Query Hooks

### **File:** `frontend/src/hooks/usePaymentApi.ts`

#### **Available Hooks:**

```typescript
// Query Hooks (GET)
usePayments(params?)  // List all payments with filters
usePayment(id)  // Get single payment
usePaymentHistory(paymentId?)  // Get payment history

// Mutation Hooks (POST/PUT/DELETE)
useCreatePayment()  // Create new payment
useUpdatePayment()  // Update existing payment
usePatchPayment()  // Partial update
useDeletePayment()  // Delete payment
useCreatePaymentHistory()  // Add payment history entry
```

#### **Usage Example:**
```typescript
const PaymentNew = () => {
  const createPaymentMutation = useCreatePayment();
  
  const handleSubmit = async (data) => {
    await createPaymentMutation.mutateAsync(data);
    // Automatically invalidates queries and refetches
  };
  
  return (
    <Button disabled={createPaymentMutation.isPending}>
      {createPaymentMutation.isPending ? "Creating..." : "Create"}
    </Button>
  );
};
```

---

## PaymentNew Page

### **File:** `frontend/src/pages/PaymentNew.tsx`

#### **Features:**
- ✅ Create new payment with product selection
- ✅ Filter products by apartment and vendor
- ✅ Select multiple products with checkboxes
- ✅ Auto-calculate total from selected products
- ✅ Real-time validation
- ✅ API integration with React Query

#### **State Management:**
```typescript
const [formData, setFormData] = useState({
  apartment: "",
  vendor: "",
  order_reference: "",
  due_date: "",
  total_amount: "",
  amount_paid: "0",
  status: "Unpaid",
  notes: "",
});

const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
const createPaymentMutation = useCreatePayment();
```

#### **Product Selection Logic:**
```typescript
// Filter products by apartment and vendor
const filteredProducts = allProducts.filter((product) => {
  const matchesApartment = !formData.apartment || 
                          product.apartment === formData.apartment;
  const matchesVendor = !formData.vendor || 
                       product.vendor === formData.vendor;
  return matchesApartment && matchesVendor;
});

// Auto-calculate total from selected products
useEffect(() => {
  if (selectedProducts.length > 0) {
    const total = selectedProducts.reduce((sum, productId) => {
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        const price = parseFloat(product.unit_price || 0);
        const quantity = parseInt(product.qty || 1);
        return sum + (price * quantity);
      }
      return sum;
    }, 0);
    setFormData((prev) => ({ ...prev, total_amount: total.toFixed(2) }));
  }
}, [selectedProducts]);
```

#### **Submit Handler:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }
  
  try {
    const paymentData = {
      apartment: formData.apartment,
      vendor: formData.vendor,
      order_reference: formData.order_reference,
      due_date: formData.due_date,
      total_amount: formData.total_amount,
      amount_paid: formData.amount_paid || "0",
      status: formData.status,
      last_payment_date: formData.last_payment_date || null,
      notes: formData.notes,
      products: selectedProducts,  // Include selected product IDs
    };
    
    await createPaymentMutation.mutateAsync(paymentData);
    toast.success("Payment created successfully");
    navigate("/payments");
  } catch (error) {
    toast.error("Failed to create payment");
  }
};
```

---

## PaymentEdit Page

### **File:** `frontend/src/pages/PaymentEdit.tsx`

#### **Features:**
- ✅ Edit existing payment
- ✅ Load payment data from API
- ✅ Update product selection
- ✅ Real-time validation
- ✅ API integration with React Query

#### **Data Loading:**
```typescript
const { id } = useParams<{ id: string }>();
const { data: paymentData, isLoading } = usePayment(id || "");
const updatePaymentMutation = useUpdatePayment();

// Load payment data into form
useEffect(() => {
  if (paymentData) {
    setFormData({
      apartment: paymentData.apartment,
      vendor: paymentData.vendor,
      order_reference: paymentData.order_reference,
      due_date: paymentData.due_date,
      total_amount: paymentData.total_amount,
      amount_paid: paymentData.amount_paid,
      status: paymentData.status,
      notes: paymentData.notes,
      // ... other fields
    });
    setSelectedProducts(paymentData.products || []);
  }
}, [paymentData]);
```

#### **Update Handler:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }
  
  try {
    const updateData = {
      apartment: formData.apartment,
      vendor: formData.vendor,
      order_reference: formData.order_reference,
      due_date: formData.due_date,
      total_amount: formData.total_amount,
      amount_paid: formData.amount_paid || "0",
      status: formData.status,
      last_payment_date: formData.last_payment_date || null,
      notes: formData.notes,
      products: selectedProducts,
    };
    
    await updatePaymentMutation.mutateAsync({ id, data: updateData });
    toast.success("Payment updated successfully");
    navigate("/payments");
  } catch (error) {
    toast.error("Failed to update payment");
  }
};
```

---

## Complete Workflow

### **Creating a Payment:**

```
1. User navigates to /payments/new
   ↓
2. PaymentNew component loads
   ↓
3. Fetch apartments, vendors, products (useApartments, useVendors, useProducts)
   ↓
4. User selects apartment → Products filtered
   ↓
5. User selects vendor → Products further filtered
   ↓
6. User checks products → selectedProducts array updated
   ↓
7. Total amount auto-calculated from selected products
   ↓
8. User fills other fields (order ref, due date, etc.)
   ↓
9. User clicks "Create Payment"
   ↓
10. Form validation runs
   ↓
11. createPaymentMutation.mutateAsync(paymentData) called
   ↓
12. POST /api/payments/ with products array
   ↓
13. Backend creates payment + links products
   ↓
14. Signal fires → Updates product payment_status
   ↓
15. Response received with product_details
   ↓
16. Query cache invalidated → Lists refresh
   ↓
17. Navigate to /payments
   ↓
18. Success toast displayed
```

### **Editing a Payment:**

```
1. User navigates to /payments/:id/edit
   ↓
2. PaymentEdit component loads
   ↓
3. usePayment(id) fetches payment data
   ↓
4. useEffect loads data into form
   ↓
5. selectedProducts set from paymentData.products
   ↓
6. User modifies fields/products
   ↓
7. User clicks "Update Payment"
   ↓
8. Form validation runs
   ↓
9. updatePaymentMutation.mutateAsync({ id, data }) called
   ↓
10. PUT /api/payments/:id/ with updated data
   ↓
11. Backend updates payment + products
   ↓
12. Signal fires → Updates product payment_status
   ↓
13. Response received
   ↓
14. Query cache invalidated → Lists refresh
   ↓
15. Navigate to /payments
   ↓
16. Success toast displayed
```

---

## API Request/Response Examples

### **Create Payment Request:**
```http
POST /api/payments/
Content-Type: application/json

{
  "apartment": "uuid-apartment",
  "vendor": "uuid-vendor",
  "order_reference": "ORD-2025-001",
  "due_date": "2025-12-31",
  "total_amount": "5000.00",
  "amount_paid": "2000.00",
  "status": "Partial",
  "notes": "Initial payment",
  "products": [
    "uuid-product-1",
    "uuid-product-2",
    "uuid-product-3"
  ]
}
```

### **Create Payment Response:**
```json
{
  "id": "uuid-payment",
  "apartment": "uuid-apartment",
  "apartment_details": { ... },
  "vendor": "uuid-vendor",
  "vendor_details": { ... },
  "vendor_name": "IKEA",
  "order_reference": "ORD-2025-001",
  "total_amount": "5000.00",
  "amount_paid": "2000.00",
  "outstanding_amount": "3000.00",
  "due_date": "2025-12-31",
  "status": "Partial",
  "last_payment_date": null,
  "notes": "Initial payment",
  "products": [
    "uuid-product-1",
    "uuid-product-2",
    "uuid-product-3"
  ],
  "product_details": [
    {
      "id": "uuid-product-1",
      "product": "Office Chair",
      "category_name": "Furniture",
      "unit_price": "1500.00",
      "qty": 2,
      "payment_status": "Partially Paid"
    },
    {
      "id": "uuid-product-2",
      "product": "Desk Lamp",
      "category_name": "Lighting",
      "unit_price": "500.00",
      "qty": 4,
      "payment_status": "Unpaid"
    }
  ],
  "product_count": 3,
  "payment_history": [],
  "created_at": "2025-12-03T16:00:00Z",
  "updated_at": "2025-12-03T16:00:00Z"
}
```

---

## React Query Cache Management

### **Automatic Cache Invalidation:**

```typescript
// After creating payment
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
  // All payment lists will refetch automatically
}

// After updating payment
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
  queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.id) });
  // Both lists and detail views will refetch
}

// After deleting payment
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
  // Lists will refetch, detail views will be removed
}
```

---

## Error Handling

### **Frontend Error Handling:**
```typescript
try {
  await createPaymentMutation.mutateAsync(paymentData);
  toast.success("Payment created successfully");
} catch (error: any) {
  console.error("Error creating payment:", error);
  toast.error(error.response?.data?.message || "Failed to create payment");
}
```

### **Backend Error Responses:**
```json
{
  "detail": "Error message",
  "apartment": ["This field is required."],
  "total_amount": ["Ensure this value is greater than 0."]
}
```

---

## Testing Checklist

### **Frontend:**
- [ ] Create payment without products
- [ ] Create payment with products
- [ ] Select all products
- [ ] Deselect products
- [ ] Filter products by apartment
- [ ] Filter products by vendor
- [ ] Auto-calculate total amount
- [ ] Validate required fields
- [ ] Edit existing payment
- [ ] Update product selection
- [ ] Cancel form navigation
- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Success toasts display correctly

### **Backend:**
- [ ] Create payment API works
- [ ] Update payment API works
- [ ] Delete payment API works
- [ ] Products linked correctly
- [ ] Product payment_status updates
- [ ] Payment history tracked
- [ ] Validation errors returned
- [ ] Permissions enforced

---

## Benefits of This Integration

### ✅ **Type Safety**
- Full TypeScript support
- Autocomplete for API methods
- Compile-time error checking

### ✅ **Automatic Caching**
- React Query handles caching
- Automatic background refetching
- Optimistic updates possible

### ✅ **Loading States**
- `isPending` for mutations
- `isLoading` for queries
- Easy to show spinners

### ✅ **Error Handling**
- Centralized error handling
- Toast notifications
- User-friendly messages

### ✅ **Code Reusability**
- Hooks can be used anywhere
- API service is centralized
- Easy to maintain

---

## Next Steps

1. **Add Payment Filters:**
   - Filter by status
   - Filter by date range
   - Search by order reference

2. **Add Payment History UI:**
   - Display payment history table
   - Add new payment history entries
   - Track payment timeline

3. **Add Payment Analytics:**
   - Total payments by status
   - Overdue payments dashboard
   - Payment trends chart

4. **Add Bulk Operations:**
   - Bulk delete payments
   - Bulk status update
   - Export to CSV

---

**Integration Complete! 🎉**

The Payment system is now fully integrated with the backend API, including product selection, automatic status updates, and comprehensive error handling.
