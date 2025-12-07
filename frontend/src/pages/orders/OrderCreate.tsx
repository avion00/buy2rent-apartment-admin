import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Building2, Store, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apartmentApi, Apartment } from '@/services/apartmentApi';
import { vendorApi, Vendor } from '@/services/vendorApi';
import { useProducts } from '@/hooks/useProductApi';
import { orderApi } from '@/services/orderApi';

interface OrderCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

export const OrderCreate = ({ open, onOpenChange, onCreated }: OrderCreateProps) => {
  const { toast } = useToast();
  const [apartmentId, setApartmentId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingCost, setShippingCost] = useState(''); // HUF, empty by default
  const [discount, setDiscount] = useState(''); // HUF, optional

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load all products once via React Query and filter client-side, like PaymentNew
  const {
    data: productsData,
    isLoading: loadingProducts,
  } = useProducts();
  const allProducts = productsData?.results || [];

  const products = useMemo(
    () =>
      allProducts.filter((product: any) => {
        const matchesApartment = !apartmentId || product.apartment === apartmentId;
        const matchesVendor = !vendorId || product.vendor === vendorId;
        return matchesApartment && matchesVendor;
      }),
    [allProducts, apartmentId, vendorId]
  );

  // Load apartments & vendors when dialog opens
  useEffect(() => {
    if (!open) return;

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
  }, [open, toast]);

  const addItem = () => {
    // Prefer the first product that isn't already used in items
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
        quantity: 1,
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
      quantity: 1,
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
        vendor: vendorId,
        po_number: poNumber.trim(),
        confirmation_code: confirmationCode.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
        items: items.map((item) => ({
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

      onOpenChange(false);
      setApartmentId('');
      setVendorId('');
      setPoNumber('');
      setConfirmationCode('');
      setTrackingNumber('');
      setItems([]);
      setShippingCost('');
      setDiscount('');

      onCreated?.();
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

  const canAddItems = !!apartmentId && !!vendorId && products.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Purchase Order</DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details to create a new order
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
            {/* Order Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Package className="h-3.5 w-3.5" />
                <span>Order Information</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Apartment Selection */}
                <Card className="border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <Label htmlFor="apartment" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Apartment *
                    </Label>
                    <Select value={apartmentId} onValueChange={setApartmentId} disabled={loadingLookups}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select apartment'} />
                      </SelectTrigger>
                      <SelectContent>
                        {apartments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id}>
                            <span className="text-sm">{apt.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedApartment && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Owner: {selectedApartment.owner}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Vendor Selection */}
                <Card className="border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <Label htmlFor="vendor" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                      <Store className="h-3.5 w-3.5 text-primary" />
                      Vendor *
                    </Label>
                    <Select value={vendorId} onValueChange={setVendorId} disabled={loadingLookups}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={loadingLookups ? 'Loading...' : 'Select vendor'} />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            <span className="text-sm">{vendor.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedVendor && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Lead time: {selectedVendor.lead_time}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* PO Number, Confirmation & Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po_number" className="flex items-center gap-1.5 text-sm font-medium">
                    PO Number *
                  </Label>
                  <Input
                    id="po_number"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g., PO-2025-00001"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmation_code" className="flex items-center gap-1.5 text-sm font-medium">
                    Confirmation
                  </Label>
                  <Input
                    id="confirmation_code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="e.g., CONF-8831"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking_number" className="flex items-center gap-1.5 text-sm font-medium">
                    Tracking
                  </Label>
                  <Input
                    id="tracking_number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., TRK-93234"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Package className="h-3.5 w-3.5" />
                  <span>Order Items ({items.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={addItem}
                    className="gap-1.5 h-8 text-xs"
                    disabled={!canAddItems}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {canAddItems ? 'Add Item' : 'Select apartment & vendor first'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addAllProducts}
                    className="gap-1.5 h-8 text-xs"
                    disabled={!canAddItems}
                  >
                    Add All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card key={index} className="border hover:border-primary/30 transition-all">
                    <CardContent className="p-3">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Product Name *
                          </Label>
                          <Select
                            value={item.productId || undefined}
                            onValueChange={(value) => {
                              const product = products.find((p) => p.id === value);
                              if (!product) return;

                              const rawPrice = Number(product.unit_price);
                              const roundedPrice = Number.isNaN(rawPrice)
                                ? 0
                                : Math.round(rawPrice); // HUF: integer price only

                              // Update the whole row in a single state update
                              setItems((prev) => {
                                const next = [...prev];
                                const current = next[index];
                                next[index] = {
                                  ...current,
                                  productId: product.id,
                                  productName: product.product,
                                  sku: product.sku || '',
                                  unitPrice: roundedPrice,
                                };
                                return next;
                              });
                            }}
                          >
                            <SelectTrigger className="h-9 text-sm" disabled={!canAddItems || loadingProducts}>
                              <SelectValue
                                placeholder={
                                  loadingProducts
                                    ? 'Loading products...'
                                    : products.length
                                    ? 'Select product'
                                    : 'No products available'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex flex-col text-xs">
                                    <span className="font-medium">{product.product}</span>
                                    <span className="text-muted-foreground">
                                      {product.sku ? `${product.sku}  b7 ` : ''}€{Number(product.unit_price).toFixed(2)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Qty *
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Price (HUF) *
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                index,
                                'unitPrice',
                                Number.isNaN(parseInt(e.target.value))
                                  ? 0
                                  : parseInt(e.target.value, 10)
                              )
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <div className="flex-1 text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-sm">{item.quantity * item.unitPrice} HUF</p>
                          </div>
                          {items.length > 1 && (
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Order Summary</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Items</p>
                      <p className="text-xl font-bold">{items.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Units</p>
                      <p className="text-xl font-bold">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Items Total</span>
                        <span>{itemsTotalAmount} HUF</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">Shipping Cost</span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          className="h-7 w-24 text-right text-xs"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">Discount</span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          className="h-7 w-24 text-right text-xs"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-primary/20">
                        <span className="text-xs font-semibold">Total to Pay</span>
                        <span className="text-lg font-bold text-primary">{grandTotalAmount} HUF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5" size="sm" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Create Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
