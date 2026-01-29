import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Building2, Store, ShoppingCart, DollarSign, Loader2, ArrowLeft, Save, RefreshCw, AlertCircle, Minus, X, Image, CheckSquare } from 'lucide-react';
import { apartmentApi, Apartment } from '@/services/apartmentApi';
import { vendorApi, Vendor } from '@/services/vendorApi';
import { useProducts } from '@/hooks/useProductApi';
import { orderApi } from '@/services/orderApi';
import { useOrder } from '@/hooks/useOrderApi';
import OrderEditSkeleton from '@/components/skeletons/OrderEditSkeleton';

interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

const OrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch existing order
  const { order, loading: loadingOrder, error: orderError } = useOrder(id || '');
  
  const [apartmentId, setApartmentId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    data: productsData,
    isLoading: loadingProducts,
  } = useProducts({
    apartment: apartmentId,
    page_size: 1000,
  });
  const allProducts = productsData?.results || [];

  const products = useMemo(
    () =>
      allProducts.filter((product: any) => {
        const matchesVendor = !vendorId || product.vendor === vendorId;
        return matchesVendor;
      }),
    [allProducts, vendorId]
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

  // Populate form when order data AND lookups are loaded
  useEffect(() => {
    if (order && !initialized && !loadingLookups && apartments.length > 0 && vendors.length > 0) {
      // Set apartment - check if it exists in the list
      const apartmentExists = apartments.some(a => a.id === order.apartment);
      setApartmentId(apartmentExists ? order.apartment : '');
      
      // Set vendor - check if it exists in the list
      const vendorExists = vendors.some(v => v.id === order.vendor);
      setVendorId(vendorExists ? order.vendor : '');
      
      setPoNumber(order.po_number || '');
      setConfirmationCode(order.confirmation_code || '');
      setTrackingNumber(order.tracking_number || '');
      setStatus(order.status || 'draft');
      setNotes(order.notes || '');
      setShippingAddress(order.shipping_address || '');
      setExpectedDelivery(order.expected_delivery || '');
      
      // Convert order items to local format
      if (order.items && order.items.length > 0) {
        const mappedItems: OrderItem[] = order.items.map((item) => ({
          id: item.id,
          productId: item.product || '',
          productName: item.product_name || '',
          sku: item.sku || '',
          quantity: item.quantity || 1,
          unitPrice: Math.round(Number(item.unit_price) || 0),
        }));
        setItems(mappedItems);
      }
      
      setInitialized(true);
    }
  }, [order, initialized, loadingLookups, apartments, vendors]);

  const addItem = () => {
    const usedIds = new Set(items.map((i) => i.productId));
    const candidate = products.find((p) => !usedIds.has(p.id)) || products[0];

    if (!candidate) {
      return;
    }

    const defaultPrice = Math.round(Number(candidate.unit_price) || 0);

    setItems((prev) => [
      ...prev,
      {
        productId: candidate.id,
        productName: candidate.product,
        sku: candidate.sku || '',
        quantity: candidate.qty || 1,
        unitPrice: defaultPrice,
      },
    ]);
  };

  const addAllProducts = () => {
    if (!products.length) return;

    const usedIds = new Set(items.map((i) => i.productId));
    const newProducts = products.filter((p) => !usedIds.has(p.id));

    if (!newProducts.length) return;

    const newItems = newProducts.map((p) => ({
      productId: p.id,
      productName: p.product,
      sku: p.sku || '',
      quantity: p.qty || 1,
      unitPrice: Math.round(Number(p.unit_price) || 0),
    }));

    setItems((prev) => [...prev, ...newItems]);
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

    if (!apartmentId || !vendorId || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    if (!poNumber.trim()) {
      toast({
        title: 'Validation Error',
        description: 'PO Number is required.',
        variant: 'destructive',
      });
      return;
    }
    if (items.some((i) => !i.productName || i.quantity <= 0 || i.unitPrice < 0)) {
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

      const payload: any = {
        apartment: apartmentId,
        vendor: vendorId,
        po_number: poNumber.trim(),
        confirmation_code: confirmationCode.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
        status: status,
        notes: notes.trim() || undefined,
        shipping_address: shippingAddress.trim() || undefined,
        expected_delivery: expectedDelivery || undefined,
        items: items.map((item) => ({
          id: item.id,
          product_name: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
        items_count: totalUnits,
        total: grandTotal,
      };

      await orderApi.updateOrder(id!, payload);

      toast({
        title: 'Order Updated',
        description: `Order updated successfully. Total: ${grandTotal} HUF`,
      });

      navigate(`/orders/${id}`);
    } catch (error: any) {
      console.error('Failed to update order', error?.response?.data || error);

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
        title: 'Failed to update order',
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

  const canAddItems = !!apartmentId && !!vendorId && products.length > 0;

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
  ];

  // Loading state - wait for both order and lookups
  const isLoading = loadingOrder || loadingLookups || (order && !initialized);
  if (isLoading) {
    return <OrderEditSkeleton />;
  }

  // Error state
  if (orderError) {
    return (
      <PageLayout title="Error">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error loading order</h2>
            <p className="text-muted-foreground mb-4">{orderError}</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not found state
  if (!order) {
    return (
      <PageLayout title="Not Found">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Order">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/orders/${id}`}>{order.po_number}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Order</h1>
              <p className="text-muted-foreground">Update order details for {order.po_number}</p>
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
                          <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select apartment'} />
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
                        Vendor *
                      </Label>
                      <Select value={vendorId} onValueChange={setVendorId} disabled={loadingLookups}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select vendor'} />
                        </SelectTrigger>
                        <SelectContent>
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
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Fields */}
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
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this order"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products and Order Items - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Available Products - 50% width */}
              <Card className="lg:col-span-1">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Package className="h-4 w-4 text-primary" />
                      Available Products ({products.length})
                    </span>
                    {products.length > 0 && !loadingProducts && (
                      <button
                        type="button"
                        onClick={addAllProducts}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Select All
                      </button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {loadingProducts ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-8 w-8 mx-auto mb-3 opacity-50 animate-spin" />
                      <p className="text-sm">Loading products...</p>
                    </div>
                  ) : !apartmentId || !vendorId ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Please select apartment and vendor</p>
                      <p className="text-sm">Products will appear here</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No products found</p>
                      <p className="text-sm">This apartment/vendor has no products</p>
                    </div>
                  ) : (
                    <div className="max-h-[450px] overflow-y-auto">
                      <div>
                        {products.map((product, idx) => {
                          const isInOrder = items.some((item) => item.productId === product.id);

                          return (
                            <div
                              key={product.id}
                              onClick={() => !isInOrder && addItem()}
                              className={`group flex items-center gap-2 px-2 py-1.5 transition-all cursor-pointer ${
                                isInOrder 
                                  ? 'opacity-50 cursor-not-allowed bg-muted/30' 
                                  : 'hover:bg-accent hover:shadow-sm'
                              } ${
                                idx < products.length - 1 ? 'border-b border-border/50' : ''
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
                  {items.length === 0 ? (
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
              <Button type="button" variant="outline" onClick={() => navigate(`/orders/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
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

export default OrderEdit;
