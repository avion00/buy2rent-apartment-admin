# Vendor Update Fix

## Issue
When clicking "Change Vendor" button in the Vendor Details modal, the vendor was not being updated in the ApartmentView page.

## Root Cause
The `updateProduct` function in `ApartmentView.tsx` was just a placeholder that logged to console instead of actually calling the API to update the product.

```typescript
// OLD CODE (placeholder)
const updateProduct = (productId: string, updates: any) => {
  // TODO: Implement product update API call
  console.log("Update product:", productId, updates);
};
```

## Solution

### 1. Import the `useUpdateProduct` hook
```typescript
import { useProductsByApartment, useDeleteProduct, useUpdateProduct } from "@/hooks/useProductApi";
```

### 2. Initialize the mutation hook
```typescript
const updateProductMutation = useUpdateProduct();
```

### 3. Get the refetch function from products query
```typescript
const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch } = useProductsByApartment(id || null);
```

### 4. Replace placeholder with actual API call
```typescript
const updateProduct = async (productId: string, updates: any) => {
  try {
    await updateProductMutation.mutateAsync({ id: productId, data: updates });
    // Refetch products to show updated data
    refetch();
  } catch (error) {
    console.error("Error updating product:", error);
    toast({
      title: "Error",
      description: "Failed to update product",
      variant: "destructive",
    });
  }
};
```

## How It Works Now

1. **User clicks vendor name** → Opens Vendor Details Modal
2. **Modal fetches vendors** from API (`GET /api/vendors/`)
3. **User clicks "Change Vendor"** → Shows dropdown with all vendors
4. **User selects new vendor** → Clicks "Change Vendor" button
5. **Modal calls `onVendorUpdated`** callback with vendor ID and name
6. **ApartmentView calls `updateProduct`** with vendor data
7. **API is called** (`PATCH /api/products/{id}/`) to update the product
8. **Products list is refetched** to show the updated vendor
9. **Toast notification** shows success message

## API Endpoints Used

- `GET /api/vendors/` - Fetch all vendors
- `PATCH /api/products/{productId}/` - Update product vendor

## Files Modified

1. `frontend/src/pages/ApartmentView.tsx`
   - Added `useUpdateProduct` hook import
   - Initialized `updateProductMutation`
   - Added `refetch` from products query
   - Replaced placeholder `updateProduct` with actual API call

2. `frontend/src/components/modals/VendorDetailsModal.tsx` (previously updated)
   - Fetches vendors from API
   - Shows vendor details
   - Allows vendor selection/change
   - Calls `onVendorUpdated` callback

## Testing

1. Open an apartment view page
2. Click on a vendor name in the products table
3. Click "Change Vendor" button
4. Select a different vendor from the dropdown
5. Click "Change Vendor" button
6. ✅ The vendor should update in the table
7. ✅ Toast notification should appear
8. ✅ Page should refresh with new vendor name

## Benefits

- ✅ **Real-time updates**: Product vendor is updated immediately
- ✅ **Error handling**: Shows error toast if update fails
- ✅ **Auto-refresh**: Product list refreshes after update
- ✅ **User feedback**: Toast notifications for success/error
- ✅ **API integration**: Uses proper React Query mutations
