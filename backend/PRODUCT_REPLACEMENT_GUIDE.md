# 🔄 Product Replacement System Guide

## 📋 Overview

The `replacement_of` field in the Product model is used to track product replacements when items are damaged, wrong, or need to be replaced for any reason.

## 🎯 When to Use `replacement_of`

### **Leave Empty (null) For:**
- ✅ **New Products**: Regular product orders
- ✅ **Initial Orders**: First-time product purchases
- ✅ **Standard Items**: Products without any replacement history

### **Use `replacement_of` For:**
- 🔄 **Replacement Items**: When replacing a damaged product
- 🔄 **Wrong Item Corrections**: When the wrong item was delivered
- 🔄 **Defective Item Replacements**: When original item was defective
- 🔄 **Upgrade Replacements**: When upgrading to a better version

## 📊 How It Works

### **Scenario 1: Normal Product Creation**
```json
{
  "apartment": "550e8400-e29b-41d4-a716-446655440000",
  "product": "IKEA MALM Bed Frame",
  "vendor": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "sku": "MALM-001",
  "unit_price": 179.00,
  "qty": 1,
  "replacement_of": null,  // ← Leave empty for new products
  "image_url": "https://www.ikea.com/us/en/images/products/malm-bed-frame-white__0103224_pe248878_s5.jpg"
}
```

### **Scenario 2: Replacement Product**
```json
{
  "apartment": "550e8400-e29b-41d4-a716-446655440000",
  "product": "IKEA MALM Bed Frame (Replacement)",
  "vendor": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "sku": "MALM-001-R",
  "unit_price": 179.00,
  "qty": 1,
  "replacement_of": "original-product-uuid-here",  // ← UUID of damaged product
  "image_url": "https://www.ikea.com/us/en/images/products/malm-bed-frame-white__0103224_pe248878_s5.jpg"
}
```

## 🔗 Replacement Chain Tracking

### **Original Product**
```
Product A (UUID: abc123...)
├── replacement_of: null
├── status: "Damaged"
└── replacements: [Product B]
```

### **Replacement Product**
```
Product B (UUID: def456...)
├── replacement_of: abc123... (points to Product A)
├── status: "Ordered"
└── replacements: []
```

## 🛠️ API Usage Examples

### **Create New Product (No Replacement)**
```bash
POST /api/products/
{
  "apartment": "apartment-uuid",
  "product": "Dining Table",
  "vendor": "vendor-uuid",
  "sku": "DT-001",
  "unit_price": 299.99,
  "qty": 1
  // replacement_of is automatically null
}
```

### **Create Replacement Product**
```bash
POST /api/products/
{
  "apartment": "apartment-uuid",
  "product": "Dining Table (Replacement)",
  "vendor": "vendor-uuid",
  "sku": "DT-001-R",
  "unit_price": 299.99,
  "qty": 1,
  "replacement_of": "original-product-uuid"
}
```

### **Query Replacements**
```bash
# Get all replacements for a product
GET /api/products/original-uuid/

# Response includes:
{
  "id": "original-uuid",
  "product": "Dining Table",
  "status": "Damaged",
  "replacements": [
    {
      "id": "replacement-uuid",
      "product": "Dining Table (Replacement)",
      "status": "Ordered"
    }
  ]
}
```

## 🎯 Business Logic

### **Replacement Workflow**
1. **Issue Reported**: Original product marked as "Damaged"
2. **Replacement Requested**: `replacement_requested = true`
3. **Replacement Approved**: `replacement_approved = true`
4. **New Product Created**: With `replacement_of` pointing to original
5. **Tracking**: Both products linked for full history

### **Status Updates**
```python
# Original product
original_product.status = "Damaged"
original_product.replacement_requested = True
original_product.replacement_approved = True
original_product.save()

# Replacement product
replacement_product = Product.objects.create(
    apartment=original_product.apartment,
    product=f"{original_product.product} (Replacement)",
    vendor=original_product.vendor,
    replacement_of=original_product,
    status="Ordered"
)
```

## 📊 Reporting & Analytics

### **Replacement Rate Tracking**
```python
# Products with replacements
products_with_replacements = Product.objects.filter(
    replacements__isnull=False
).distinct()

# Replacement products
replacement_products = Product.objects.filter(
    replacement_of__isnull=False
)

# Replacement rate by vendor
vendor_replacement_rate = Vendor.objects.annotate(
    total_products=Count('products'),
    replacement_count=Count('products__replacements')
)
```

## 🔧 Field Configuration

### **Database Schema**
```python
replacement_of = models.ForeignKey(
    'self',                    # Self-referencing to Product model
    on_delete=models.SET_NULL, # Keep history if original deleted
    null=True,                 # Optional field
    blank=True,                # Can be empty in forms
    related_name='replacements', # Reverse relationship name
    help_text="Optional: Select the product this item is replacing"
)
```

### **Key Features**
- ✅ **Optional**: `null=True, blank=True`
- ✅ **Self-Referencing**: Points to another Product
- ✅ **History Preservation**: `SET_NULL` keeps records
- ✅ **Reverse Lookup**: `product.replacements.all()`
- ✅ **UUID Support**: Works with secure UUID primary keys

## 🎨 Frontend Integration

### **Product Form**
```javascript
// Show replacement field only when needed
const showReplacementField = productStatus === 'Damaged' || 
                            productStatus === 'Wrong Item' ||
                            isReplacementProduct;

// Dropdown with existing products
<Select 
  name="replacement_of"
  placeholder="Select product to replace (optional)"
  options={existingProducts}
  value={formData.replacement_of}
  onChange={handleReplacementChange}
  disabled={!showReplacementField}
/>
```

### **Product Display**
```javascript
// Show replacement chain
{product.replacement_of && (
  <div className="replacement-info">
    <span>Replaces: {product.replacement_of.product}</span>
  </div>
)}

{product.replacements.length > 0 && (
  <div className="replacements-list">
    <h4>Replacements:</h4>
    {product.replacements.map(replacement => (
      <div key={replacement.id}>
        {replacement.product} - {replacement.status}
      </div>
    ))}
  </div>
)}
```

## 📋 Best Practices

### **✅ Do:**
- Leave `replacement_of` empty for new products
- Use descriptive names for replacement products
- Update original product status when creating replacement
- Track replacement reasons in notes
- Link replacement to same apartment and vendor

### **❌ Don't:**
- Set `replacement_of` for initial product orders
- Create circular references (A replaces B, B replaces A)
- Delete original products (use status updates instead)
- Forget to update replacement flags on original product

## 🔍 Troubleshooting

### **Common Issues**

**Q: Can't find product UUID for replacement_of**
```bash
# Get product UUIDs
GET /api/products/?apartment=apartment-uuid
# Copy the UUID of the product you want to replace
```

**Q: Replacement field showing as required**
- The field is optional (`null=True, blank=True`)
- Leave empty for new products
- Only fill when creating actual replacements

**Q: Long image URLs getting truncated**
- `image_url` now supports up to 500 characters
- Use URL shorteners if needed for very long URLs

## 🎯 Summary

- **`replacement_of`**: Optional UUID field linking to replaced product
- **`image_url`**: Now supports up to 500 characters
- **Use Case**: Track product replacement history and relationships
- **Default**: Leave empty for new products
- **When to Use**: Only when creating replacement products

Your product system now supports comprehensive replacement tracking with optional, user-friendly fields!
