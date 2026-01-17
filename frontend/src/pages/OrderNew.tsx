import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Building2, Store, ShoppingCart, DollarSign, ArrowLeft, CheckSquare, Square, Minus, X, Image ,Loader2} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apartmentApi, Apartment } from '@/services/apartmentApi';
import { vendorApi, Vendor } from '@/services/vendorApi';
import { productApi, Product } from '@/services/productApi';
import { orderApi } from '@/services/orderApi';

interface OrderItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

interface SelectedProduct {
  id: string;
  quantity: number;
}

const OrderNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apartmentId, setApartmentId] = useState('');
  const [vendorId, setVendorId] = useState('all');
  const [poNumber, setPoNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('draft');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState('');
  const [discount, setDiscount] = useState('');

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = useMemo(
    () => {
      if (!apartmentId) return [];
      
      return products.filter((product) => {
        const matchesVendor = !vendorId || vendorId === 'all' || product.vendor === vendorId;
        return matchesVendor;
      });
    },
    [products, apartmentId, vendorId]
  );

  // Load apartments & vendors on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingLookups(true);
        const [aptRes, vendorRes] = await Promise.all([
          apartmentApi.getApartments({ page_size: 100 }),
          vendorApi.getVendors(),
        ]);
        if (cancelled) return;
        setApartments(aptRes.results || []);
        setVendors(vendorRes.results || []);
      } catch (error) {
        console.error('Failed to load apartments/vendors', error);
        toast({
          title: 'Failed to load data',
          description: 'Could not load apartments or vendors. Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Load products when apartment changes
  useEffect(() => {
    let cancelled = false;
    
    const loadProducts = async () => {
      if (!apartmentId) {
        setProducts([]);
        setSelectedProducts([]);
        return;
      }

      try {
        setLoadingProducts(true);
        const response = await productApi.getProducts({ 
          apartment: apartmentId,
          page_size: 1000 
        });
        if (cancelled) return;
        setProducts(response.results || []);
        setSelectedProducts([]);
      } catch (error) {
        console.error('Failed to load products', error);
        toast({
          title: 'Failed to load products',
          description: 'Could not load products for this apartment.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [apartmentId, toast]);

  const addProductToOrder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Check if product already exists in order
    const existingItem = items.find((item) => item.productId === productId);
    if (existingItem) {
      toast({
        title: 'Product already in order',
        description: `${product.product} is already in your order.`,
        variant: 'destructive',
      });
      return;
    }

    // Add product directly to order items
    const newItem: OrderItem = {
      productId: product.id,
      productName: product.product,
      sku: product.sku || '',
      quantity: 1,
      unitPrice: Math.round(Number(product.unit_price) || 0),
    };

    setItems((prev) => [...prev, newItem]);
    
    toast({
      title: 'Product added',
      description: `${product.product} has been added to the order.`,
    });
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === productId);
      if (exists) {
        return prev.filter((p) => p.id !== productId);
      } else {
        return [...prev, { id: productId, quantity: 1 }];
      }
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  const addSelectedToOrder = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Please select at least one product to add to the order.',
        variant: 'destructive',
      });
      return;
    }

    const newItems: OrderItem[] = [];
    
    for (const sp of selectedProducts) {
      const product = products.find((p) => p.id === sp.id);
      if (product) {
        newItems.push({
          productId: product.id,
          productName: product.product,
          sku: product.sku || '',
          quantity: sp.quantity,
          unitPrice: Math.round(Number(product.unit_price) || 0),
        });
      }
    }

    const existingIds = new Set(items.map((i) => i.productId));
    const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.productId));

    if (uniqueNewItems.length === 0) {
      toast({
        title: 'Products already added',
        description: 'All selected products are already in the order.',
        variant: 'destructive',
      });
      return;
    }

    setItems((prev) => [...prev, ...uniqueNewItems]);
    setSelectedProducts([]);
    
    toast({
      title: 'Products added',
      description: `Added ${uniqueNewItems.length} product(s) to the order.`,
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apartmentId || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select an apartment and add at least one item",
        variant: "destructive"
      });
      return;
    }
    
    // Determine vendor from selected items if not explicitly selected
    let orderVendor = vendorId;
    if (!orderVendor || orderVendor === 'all') {
      // Get vendor from the first product in the order
      const firstProduct = products.find(p => p.id === items[0]?.productId);
      if (firstProduct?.vendor) {
        orderVendor = firstProduct.vendor;
      } else {
        toast({
          title: "Validation Error",
          description: "Unable to determine vendor for this order. Please select a vendor.",
          variant: "destructive"
        });
        return;
      }
    }
    if (!poNumber.trim()) {
      toast({
        title: 'Validation Error',
        description: 'PO Number is required.',
        variant: 'destructive',
      });
      return;
    }
    if (items.some((i) => !i.productId || i.quantity <= 0 || i.unitPrice < 0)) {
      toast({
        title: 'Validation Error',
        description: 'Each item must have a product, quantity > 0 and price ≥ 0.',
        variant: 'destructive',
      });
      return;
    }

    const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const shippingValue = parseInt(shippingCost || '0', 10) || 0;
    const discountValue = parseInt(discount || '0', 10) || 0;
    let grandTotal = itemsTotal + shippingValue - discountValue;
    if (grandTotal < 0) grandTotal = 0;
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    try {
      setSubmitting(true);

      const today = new Date().toISOString().split('T')[0];

      const payload: any = {
        apartment: apartmentId,
        vendor: orderVendor,
        po_number: poNumber.trim(),
        confirmation_code: confirmationCode.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
        status: status,
        expected_delivery: expectedDelivery || undefined,
        shipping_address: shippingAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          product: item.productId, // Link to the product
          product_name: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
        items_count: totalUnits,
        total: grandTotal,
        placed_on: today,
      };

      await orderApi.createOrder(payload as any);

      toast({
        title: 'Order Created',
        description: `Order created with ${items.length} items. Total: ${grandTotal} HUF`,
      });

      navigate('/orders');
    } catch (error: any) {
      console.error('Failed to create order', error?.response?.data || error);

      let description = 'Please check the form and try again.';
      const data = error?.response?.data;

      if (data?.details && typeof data.details === 'object') {
        const messages: string[] = [];
        Object.entries(data.details).forEach(([field, msgs]) => {
          if (Array.isArray(msgs)) {
            messages.push(`${field}: ${msgs.join(', ')}`);
          } else if (typeof msgs === 'string') {
            messages.push(`${field}: ${msgs}`);
          }
        });
        if (messages.length) {
          description = messages.join(' | ');
        }
      } else if (data?.detail) {
        description = String(data.detail);
      }

      toast({
        title: 'Failed to create order',
        description,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const itemsTotalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const shippingValue = parseInt(shippingCost || '0', 10) || 0;
  const discountValue = parseInt(discount || '0', 10) || 0;
  let grandTotalAmount = itemsTotalAmount + shippingValue - discountValue;
  if (grandTotalAmount < 0) grandTotalAmount = 0;

  const selectedApartment = apartments.find((a) => a.id === apartmentId);
  const selectedVendor = vendors.find((v) => v.id === vendorId);

  const canSelectProducts = !!apartmentId && filteredProducts.length > 0;
  const hasSelectedProducts = selectedProducts.length > 0;

  return (
    <PageLayout title="New Order">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Purchase Order</h1>
              <p className="text-muted-foreground">Fill in the details to create a new order</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Order Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apartment Selection */}
                  <Card className="border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <Label htmlFor="apartment" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Apartment *
                      </Label>
                      <Select value={apartmentId} onValueChange={setApartmentId} disabled={loadingLookups}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={loadingLookups ? 'Loading apartments...' : 'Select apartment'} />
                        </SelectTrigger>
                        <SelectContent>
                          {apartments.map((apt) => (
                            <SelectItem key={apt.id} value={apt.id}>
                              <span>{apt.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedApartment && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Owner: {selectedApartment.owner}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Vendor Selection */}
                  <Card className="border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <Label htmlFor="vendor" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                        <Store className="h-4 w-4 text-primary" />
                        Vendor (Optional Filter)
                      </Label>
                      <Select value={vendorId} onValueChange={setVendorId} disabled={loadingLookups || !apartmentId}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={!apartmentId ? 'Select apartment first' : loadingLookups ? 'Loading vendors...' : 'All vendors'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              <span>{vendor.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedVendor && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Lead time: {selectedVendor.lead_time}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* PO Number, Confirmation, Tracking & Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="po_number">PO Number *</Label>
                    <Input
                      id="po_number"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      placeholder="e.g., PO-2025-00001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmation_code">Confirmation</Label>
                    <Input
                      id="confirmation_code"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="e.g., CONF-8831"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tracking_number">Tracking</Label>
                    <Input
                      id="tracking_number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., TRK-93234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Expected Delivery & Shipping Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_delivery">Expected Delivery</Label>
                    <Input
                      id="expected_delivery"
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => setExpectedDelivery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_address">Shipping Address</Label>
                    <Input
                      id="shipping_address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter shipping address"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <EnhancedTextarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this order"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products and Order Items - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Available Products - 50% width */}
              <Card className="lg:col-span-1">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-primary" />
                    Available Products ({filteredProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                {loadingProducts ? (
                  <div className="max-h-[450px]">
                    <div>
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-2 px-2 py-1.5 ${
                            i < 7 ? 'border-b border-border/50' : ''
                          }`}
                        >
                          {/* Image skeleton */}
                          <div className="w-8 h-8 rounded overflow-hidden">
                            <Skeleton className="w-full h-full" />
                          </div>
                          
                          {/* Product info skeleton */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1 mb-0.5">
                              <Skeleton className="h-3 w-32" />
                              <Skeleton className="h-2 w-12 opacity-60" />
                            </div>
                            <Skeleton className="h-2 w-20 opacity-40" />
                          </div>
                          
                          {/* Price skeleton */}
                          <div className="text-right flex-shrink-0">
                            <Skeleton className="h-3 w-14 mb-0.5" />
                            <Skeleton className="h-2 w-8 ml-auto opacity-40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !apartmentId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select an apartment first</p>
                    <p className="text-sm">Products will appear here after selecting an apartment</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No products found</p>
                    <p className="text-sm">
                      {vendorId && vendorId !== 'all'
                        ? 'Try selecting a different vendor or "All Vendors"'
                        : 'This apartment has no products yet'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[450px] overflow-y-auto">
                    <div>
                      {filteredProducts.map((product, idx) => {
                        const isInOrder = items.some((item) => item.productId === product.id);

                        return (
                          <div
                            key={product.id}
                            onClick={() => !isInOrder && addProductToOrder(product.id)}
                            className={`group flex items-center gap-2 px-2 py-1.5 transition-all cursor-pointer ${
                              isInOrder 
                                ? 'opacity-50 cursor-not-allowed bg-muted/30' 
                                : 'hover:bg-accent hover:shadow-sm'
                            } ${
                              idx < filteredProducts.length - 1 ? 'border-b border-border/50' : ''
                            }`}
                          >
                            {/* Product Image */}
                            <div className="w-8 h-8 bg-muted/30 rounded flex items-center justify-center flex-shrink-0">
                              {product.product_image ? (
                                <img 
                                  src={product.product_image} 
                                  alt={product.product}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Image className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1">
                                <p className="font-medium text-xs truncate flex-1">{product.product}</p>
                                {product.sku && (
                                  <span className="text-[10px] text-muted-foreground">{product.sku}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {product.vendor_name || 'No vendor'}
                              </p>
                            </div>
                            
                            {/* Price and Status */}
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-xs">{Number(product.unit_price).toLocaleString()}</p>
                              {isInOrder ? (
                                <span className="text-[10px] text-green-600 dark:text-green-500 font-medium">Added</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">HUF</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>

              {/* Order Items - 50% width */}
              <Card className="lg:col-span-1">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Order Items ({items.length})
                    </span>
                    {items.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        Total: {items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString()} HUF
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {loadingProducts && items.length === 0 ? (
                    <div className="max-h-[450px]">
                      <div>
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center gap-2 px-2 py-1.5 ${
                              i < 2 ? 'border-b border-border/50' : ''
                            }`}
                          >
                            {/* Image skeleton */}
                            <div className="w-8 h-8 rounded overflow-hidden">
                              <Skeleton className="w-full h-full" />
                            </div>
                            
                            {/* Item details skeleton */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1 mb-0.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-2 w-10 opacity-60" />
                              </div>
                              
                              {/* Quantity controls skeleton */}
                              <div className="flex items-center gap-1 mt-0.5">
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="w-10 h-5 rounded" />
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="h-2 w-16 ml-1 opacity-40" />
                              </div>
                            </div>
                            
                            {/* Total and remove skeleton */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <Skeleton className="h-3 w-16 mb-0.5" />
                                <Skeleton className="h-2 w-8 ml-auto opacity-40" />
                              </div>
                              <Skeleton className="w-5 h-5 rounded-full opacity-30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium">No items in order</p>
                      <p className="text-[10px] mt-1">Click products to add them</p>
                    </div>
                  ) : (
                    <div className="max-h-[450px] overflow-y-auto">
                      <div>
                        {items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={index} className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-accent transition-all ${
                              index < items.length - 1 ? 'border-b border-border/50' : ''
                            }`}>
                              {/* Product Image */}
                              <div className="w-8 h-8 bg-muted/30 rounded flex items-center justify-center flex-shrink-0">
                                {product?.product_image ? (
                                  <img 
                                    src={product.product_image} 
                                    alt={item.productName}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      e.currentTarget.src = '';
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Image className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1">
                                  <p className="text-xs font-medium truncate flex-1">{item.productName}</p>
                                  {item.sku && (
                                    <span className="text-[10px] text-muted-foreground">{item.sku}</span>
                                  )}
                                </div>
                                
                                {/* Quantity and Price Controls */}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                    className="w-5 h-5 rounded bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-10 h-5 text-[11px] text-center border border-input bg-background rounded px-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                    className="w-5 h-5 rounded bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                  <span className="text-[10px] text-muted-foreground ml-1">× {item.unitPrice.toLocaleString()}</span>
                                </div>
                              </div>
                              
                              {/* Total and Remove */}
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-xs font-semibold">{(item.quantity * item.unitPrice).toLocaleString()}</p>
                                  <p className="text-[10px] text-muted-foreground">HUF</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-all"
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
            </div>

            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Items</p>
                    <p className="text-3xl font-bold">{items.length}</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Units</p>
                    <p className="text-3xl font-bold">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-background/50 rounded-lg">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Items Total</span>
                      <span>{itemsTotalAmount} HUF</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Shipping Cost</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="h-8 w-28 text-right"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="h-8 w-28 text-right"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total to Pay</span>
                      <span className="text-2xl font-bold text-primary">{grandTotalAmount} HUF</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default OrderNew;
