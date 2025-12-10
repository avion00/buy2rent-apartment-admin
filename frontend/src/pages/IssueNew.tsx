import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectTags } from '@/components/ui/multi-select-tags';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  AlertCircle, Upload, X, Package, Building2, Store, FileText, Truck, Calendar, User, Phone, Mail,
  AlertTriangle, CheckCircle2, Info, Loader2, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Hash, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { useApartments } from '@/hooks/useApartmentApi';
import { useVendors } from '@/hooks/useVendorApi';
import { orderApi, Order, OrderItem } from '@/services/orderApi';
import { issueApi } from '@/services/issueApi';
import { vendorApi, Vendor } from '@/services/vendorApi';
import { cn } from '@/lib/utils';

interface ProductIssueData {
  issueQuantity: number;
  issueTypes: string[];
  customIssueType: string;
  description: string;
}

const IssueNew = () => {
  const navigate = useNavigate();
  const { data: apartmentsData, isLoading: apartmentsLoading } = useApartments();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors();
  const apartments = apartmentsData?.results || [];
  const vendors = vendorsData?.results || [];
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  // Track which product is currently expanded (accordion - only one at a time)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  
  // Store issue data for each product independently
  const [productIssueData, setProductIssueData] = useState<Record<string, ProductIssueData>>({});
  
  const [formData, setFormData] = useState({
    orderId: '', 
    apartmentId: '', 
    vendorId: '',
    priority: '', 
    impact: '', 
    expectedResolution: '', 
    replacementEta: '',
    resolutionType: '', 
    resolutionNotes: '',
    deliveryDate: '', 
    invoiceNumber: '', 
    trackingNumber: '',
    aiActivated: false, 
    autoNotifyVendor: true,
    photos: [] as File[],
  });

  const issueTypes = [
    'Broken/Damaged', 'Wrong Item/Color', 'Missing Parts', 'Incorrect Quantity', 'Poor Quality', 
    'Late Delivery', 'Installation Issue', 'Warranty Claim', 'Defective Product', 'Packaging Damage',
    'Wrong Size/Dimensions', 'Expired Product', 'Missing Documentation', 'Safety Hazard', 'Other'
  ];
  
  const priorities = [
    { value: 'Critical', label: 'Critical', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'High', label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { value: 'Low', label: 'Low', color: 'bg-green-500/10 text-green-600 border-green-200' },
  ];
  
  const impactLevels = ['Blocking Progress', 'Delaying Project', 'Partial Impact', 'Minor Inconvenience', 'No Impact'];
  const resolutionTypes = ['Full Replacement', 'Partial Replacement', 'Repair', 'Refund', 'Credit Note', 'Exchange', 'Other'];

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const params: Record<string, string> = {};
        if (formData.apartmentId) params.apartment = formData.apartmentId;
        if (formData.vendorId) params.vendor = formData.vendorId;
        const response = await orderApi.getOrders(params);
        const allOrders = response.results || [];
        const deliveredStatuses = ['delivered', 'received', 'in_transit', 'Delivered', 'Received', 'In Transit'];
        const filtered = allOrders.filter(o => deliveredStatuses.includes(o.status) || o.is_delivered);
        setOrders(filtered.length > 0 ? filtered : allOrders);
      } catch { setOrders([]); }
      finally { setOrdersLoading(false); }
    };
    fetchOrders();
  }, [formData.apartmentId, formData.vendorId]);

  // Fetch order details
  useEffect(() => {
    if (!formData.orderId) { 
      setSelectedOrder(null); 
      setSelectedVendor(null);
      setProductIssueData({});
      setExpandedProductId(null);
      return; 
    }
    setOrderLoading(true);
    orderApi.getOrder(formData.orderId)
      .then(async (order) => {
        setSelectedOrder(order);
        setFormData(prev => ({ 
          ...prev, 
          apartmentId: order.apartment || prev.apartmentId, 
          vendorId: order.vendor || prev.vendorId, 
          trackingNumber: order.tracking_number || '' 
        }));
        // Fetch vendor details
        if (order.vendor) {
          try {
            const vendor = await vendorApi.getVendor(order.vendor);
            setSelectedVendor(vendor);
          } catch {
            setSelectedVendor(null);
          }
        }
        // Initialize issue data for all products using item.id as unique key
        const initialData: Record<string, ProductIssueData> = {};
        order.items?.forEach(item => {
          const itemKey = item.id || item.product || `item-${Math.random()}`;
          initialData[itemKey] = {
            issueQuantity: item.quantity,
            issueTypes: [],
            customIssueType: '',
            description: ''
          };
        });
        setProductIssueData(initialData);
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setOrderLoading(false));
  }, [formData.orderId]);

  // Handle clicking on a product row - toggle expansion (accordion behavior)
  const handleProductClick = (productId: string) => {
    setExpandedProductId(prev => prev === productId ? null : productId);
  };

  // Update issue data for a specific product
  const updateProductIssue = (productId: string, field: keyof ProductIssueData, value: any) => {
    setProductIssueData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value }
    }));
  };

  // Check if a product has issue data filled
  const hasIssueData = (productId: string): boolean => {
    const data = productIssueData[productId];
    return data && data.issueTypes.length > 0 && data.description.trim().length > 0;
  };

  // Get selected products (those with issue data filled)
  const getSelectedProducts = () => {
    return Object.entries(productIssueData)
      .filter(([_, data]) => data.issueTypes.length > 0 && data.description.trim().length > 0)
      .map(([itemKey, data]) => {
        const item = selectedOrder?.items?.find(i => (i.id || i.product) === itemKey);
        return { itemKey, productId: item?.product, ...data, item };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProducts = getSelectedProducts();
    
    if (!formData.orderId || selectedProducts.length === 0 || !formData.priority) {
      toast.error('Please complete all required fields'); 
      return;
    }
    
    setSubmitting(true);
    try {
      // Build items_data array for all selected products
      const itemsData = selectedProducts.map(product => {
        const issueTypesStr = product.issueTypes.includes('Other') 
          ? [...product.issueTypes.filter(t => t !== 'Other'), product.customIssueType].filter(Boolean).join(', ')
          : product.issueTypes.join(', ');
        
        return {
          order_item: product.itemKey,
          product: product.productId || null,
          product_name: product.item?.product_name || '',
          quantity_affected: product.issueQuantity,
          issue_types: issueTypesStr,
          description: product.description,
        };
      });

      // Combine all issue types for the main issue
      const allIssueTypes = [...new Set(selectedProducts.flatMap(p => p.issueTypes))].join(', ');
      
      // Combine descriptions for the main issue
      const combinedDescription = selectedProducts.map(p => 
        `[${p.item?.product_name || 'Product'}] ${p.description} (Qty: ${p.issueQuantity}/${p.item?.quantity || 0})`
      ).join('\n\n');

      // Create a single issue with multiple items
      await issueApi.createIssue({
        apartment: formData.apartmentId, 
        vendor: formData.vendorId,
        order: formData.orderId,
        // Use first product for backward compatibility
        product: selectedProducts[0]?.productId || null,
        order_item: selectedProducts[0]?.itemKey || null,
        product_name: selectedProducts.length === 1 
          ? selectedProducts[0]?.item?.product_name || ''
          : `${selectedProducts.length} Products`,
        type: allIssueTypes, 
        description: `Order: ${selectedOrder?.po_number}\n\n${combinedDescription}`,
        priority: formData.priority, 
        expected_resolution: formData.expectedResolution || undefined,
        vendor_contact: selectedVendor?.contact_person || undefined, 
        impact: formData.impact || undefined,
        replacement_eta: formData.replacementEta || undefined, 
        ai_activated: formData.aiActivated, 
        resolution_status: 'Open',
        resolution_type: formData.resolutionType || undefined,
        resolution_notes: formData.resolutionNotes || undefined,
        delivery_date: formData.deliveryDate || undefined,
        invoice_number: formData.invoiceNumber || undefined,
        tracking_number: formData.trackingNumber || undefined,
        auto_notify_vendor: formData.autoNotifyVendor,
        // New: Send all items in one issue
        items_data: itemsData,
      });
      
      toast.success(`Issue reported with ${selectedProducts.length} product(s)`);
      navigate('/issues');
    } catch (err: any) { 
      toast.error(err.response?.data?.message || 'Failed to report issue'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 10) { 
      toast.error('Maximum 10 photos allowed'); 
      return; 
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const canStep2 = !!selectedOrder;
  const selectedProducts = getSelectedProducts();
  const canStep3 = selectedProducts.length > 0;

  return (
    <PageLayout title="Report New Issue">
      <div className="space-y-6">
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/issues">Issues</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Report New Issue</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/issues')}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><AlertCircle className="h-8 w-8 text-destructive" />Report New Issue</h1></div>
        </div>

        <Card><CardContent className="py-6"><div className="flex items-center justify-center gap-4">
          {[{ n: 1, l: 'Select Order' }, { n: 2, l: 'Select Products' }, { n: 3, l: 'Issue Details' }].map((s, i) => (
            <React.Fragment key={s.n}><div className={`flex items-center gap-2 ${step >= s.n ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 ${step >= s.n ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground/30'}`}>
                {step > s.n ? <CheckCircle2 className="h-5 w-5" /> : s.n}
              </div><span className="font-medium hidden sm:inline">{s.l}</span>
            </div>{i < 2 && <div className={`w-16 h-0.5 ${step > s.n ? 'bg-primary' : 'bg-muted'}`} />}</React.Fragment>
          ))}
        </div></CardContent></Card>

        <form onSubmit={handleSubmit}>
          {step === 1 && <Card><CardHeader><CardTitle><FileText className="h-5 w-5 inline mr-2" />Step 1: Select Order</CardTitle></CardHeader><CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2"><Label><Building2 className="h-4 w-4 inline mr-1" />Apartment</Label>
                <Select value={formData.apartmentId} onValueChange={v => setFormData(p => ({ ...p, apartmentId: v, orderId: '' }))}><SelectTrigger><SelectValue placeholder="Select apartment" /></SelectTrigger><SelectContent>{apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label><Store className="h-4 w-4 inline mr-1" />Vendor</Label>
                <Select value={formData.vendorId} onValueChange={v => setFormData(p => ({ ...p, vendorId: v, orderId: '' }))}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label><FileText className="h-4 w-4 inline mr-1" />Order (PO Number) *</Label>
              <Select value={formData.orderId} onValueChange={v => setFormData(p => ({ ...p, orderId: v }))}><SelectTrigger><SelectValue placeholder={ordersLoading ? "Loading..." : "Select order"} /></SelectTrigger><SelectContent>{orders.length === 0 ? <div className="p-4 text-center text-muted-foreground">No orders found</div> : orders.map(o => <SelectItem key={o.id} value={o.id}><span className="font-medium">{o.po_number}</span> - {o.apartment_name} <Badge variant="outline" className="ml-2">{o.status}</Badge></SelectItem>)}</SelectContent></Select></div>
            {orderLoading && <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            {selectedOrder && !orderLoading && <Card className="border-primary/20 bg-primary/5"><CardContent className="p-6"><h4 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" />Order Details</h4><div className="grid grid-cols-3 gap-4 text-sm"><div><p className="text-muted-foreground">PO Number</p><p className="font-medium">{selectedOrder.po_number}</p></div><div><p className="text-muted-foreground">Apartment</p><p className="font-medium">{selectedOrder.apartment_name}</p></div><div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{selectedOrder.vendor_name}</p></div><div><p className="text-muted-foreground">Items</p><p className="font-medium">{selectedOrder.items_count}</p></div><div><p className="text-muted-foreground">Total</p><p className="font-medium">€{Number(selectedOrder.total).toFixed(2)}</p></div><div><p className="text-muted-foreground">Status</p><Badge variant="outline">{selectedOrder.status}</Badge></div></div></CardContent></Card>}
            <div className="flex justify-end gap-4 pt-4"><Button type="button" variant="outline" onClick={() => navigate('/issues')}>Cancel</Button><Button type="button" onClick={() => setStep(2)} disabled={!canStep2}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button></div>
          </CardContent></Card>}

          {step === 2 && selectedOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Step 2: Select Products with Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info & Selection Count */}
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order</p>
                      <p className="font-semibold">{selectedOrder.po_number}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vendor</p>
                      <p className="font-medium">{selectedOrder.vendor_name}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="font-medium">{selectedOrder.items?.length || 0}</p>
                    </div>
                  </div>
                  <Badge variant={selectedProducts.length > 0 ? "default" : "outline"} className="text-sm px-3 py-1">
                    {selectedProducts.length} issue(s) ready
                  </Badge>
                </div>

                {/* Instruction */}
                <p className="text-sm text-muted-foreground">
                  Click on a product to expand and fill in issue details. Products with completed issue details will be reported.
                </p>

                {/* Product List - Accordion Style */}
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => {
                    // Use item.id as unique key, fallback to item.product
                    const itemKey = item.id || item.product || `item-${Math.random()}`;
                    const isExpanded = expandedProductId === itemKey;
                    const issueData = productIssueData[itemKey];
                    const isComplete = hasIssueData(itemKey);
                    
                    return (
                      <div 
                        key={itemKey} 
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          isExpanded && "ring-2 ring-primary border-primary",
                          isComplete && !isExpanded && "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                        )}
                      >
                        {/* Product Header - Clickable */}
                        <div 
                          className={cn(
                            "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                            isExpanded && "bg-primary/5"
                          )}
                          onClick={() => handleProductClick(itemKey)}
                        >
                          <div className="flex items-center gap-4">
                            {/* Product Image with Status Indicator */}
                            <div className="relative flex-shrink-0">
                              {(item.product_image || item.product_image_url) ? (
                                <img 
                                  src={item.product_image || item.product_image_url} 
                                  alt={item.product_name || 'Product'} 
                                  className={cn(
                                    "w-14 h-14 rounded-lg object-cover border-2",
                                    isComplete ? "border-green-500" : "border-muted"
                                  )}
                                />
                              ) : (
                                <div className={cn(
                                  "w-14 h-14 rounded-lg flex items-center justify-center border-2",
                                  isComplete ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-muted bg-muted"
                                )}>
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              {/* Status badge overlay */}
                              {isComplete && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-base truncate">{item.product_name || 'Unknown Product'}</h4>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      SKU: {item.sku || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Price & Quantity */}
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-center gap-2 justify-end">
                                    <Badge variant="outline" className="font-normal">
                                      <Layers className="h-3 w-3 mr-1" />
                                      Qty: {item.quantity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    €{Number(item.unit_price).toFixed(2)} each
                                  </p>
                                  <p className="font-semibold text-primary">
                                    €{Number(item.total_price).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Issue Summary when collapsed but has data */}
                              {!isExpanded && isComplete && issueData && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {issueData.issueTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({issueData.issueQuantity} affected)
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Expand/Collapse Icon */}
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Issue Form */}
                        {isExpanded && issueData && (
                          <div className="p-4 pt-0 border-t bg-muted/30">
                            <div className="space-y-4 pt-4">
                              {/* Quantity & Issue Types */}
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`qty-${itemKey}`} className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    Quantity Affected *
                                  </Label>
                                  <Input
                                    id={`qty-${itemKey}`}
                                    key={`qty-${itemKey}`}
                                    type="number"
                                    min={1}
                                    max={item.quantity}
                                    value={issueData.issueQuantity}
                                    onChange={(e) => updateProductIssue(itemKey, 'issueQuantity', parseInt(e.target.value) || 1)}
                                    className="bg-background"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Out of {item.quantity} ordered
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Issue Type(s) *
                                  </Label>
                                  <MultiSelectTags
                                    key={`types-${itemKey}`}
                                    options={issueTypes}
                                    value={issueData.issueTypes}
                                    onChange={(v) => updateProductIssue(itemKey, 'issueTypes', v)}
                                    placeholder="Select issue types"
                                  />
                                </div>
                              </div>
                              
                              {/* Custom Issue Type */}
                              {issueData.issueTypes.includes('Other') && (
                                <div className="space-y-2">
                                  <Label htmlFor={`custom-${itemKey}`}>Specify Other Issue Type *</Label>
                                  <Input
                                    id={`custom-${itemKey}`}
                                    key={`custom-${itemKey}`}
                                    value={issueData.customIssueType}
                                    onChange={(e) => updateProductIssue(itemKey, 'customIssueType', e.target.value)}
                                    placeholder="Enter custom issue type..."
                                    className="bg-background"
                                  />
                                </div>
                              )}
                              
                              {/* Description */}
                              <div className="space-y-2">
                                <Label htmlFor={`desc-${itemKey}`} className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Issue Description *
                                </Label>
                                <Textarea
                                  id={`desc-${itemKey}`}
                                  key={`desc-${itemKey}`}
                                  value={issueData.description}
                                  onChange={(e) => updateProductIssue(itemKey, 'description', e.target.value)}
                                  placeholder="Describe the issue in detail. Include any relevant information such as when you noticed the issue, specific damage locations, etc."
                                  rows={4}
                                  className="bg-background"
                                />
                              </div>
                              
                              {/* Status Indicator */}
                              <div className={cn(
                                "p-3 rounded-lg flex items-center gap-2 text-sm",
                                isComplete ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              )}>
                                {isComplete ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Issue details complete - will be included in report
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4" />
                                    Please fill in issue type(s) and description to include this product
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/issues')}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} disabled={!canStep3}>
                      Next: Issue Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && <div className="space-y-6">
            <Card><CardHeader><CardTitle><AlertTriangle className="h-5 w-5 inline mr-2" />Priority & Impact</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Priority *</Label><Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent>{priorities.map(pr => <SelectItem key={pr.value} value={pr.value}><Badge className={pr.color}>{pr.label}</Badge></SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Impact</Label><Select value={formData.impact} onValueChange={v => setFormData(p => ({ ...p, impact: v }))}><SelectTrigger><SelectValue placeholder="Select impact" /></SelectTrigger><SelectContent>{impactLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label><Calendar className="h-4 w-4 inline mr-1" />Expected Resolution</Label><Input type="date" value={formData.expectedResolution} onChange={e => setFormData(p => ({ ...p, expectedResolution: e.target.value }))} /></div>
              <div className="space-y-2"><Label><Truck className="h-4 w-4 inline mr-1" />Replacement ETA</Label><Input type="date" value={formData.replacementEta} onChange={e => setFormData(p => ({ ...p, replacementEta: e.target.value }))} /></div>
            </CardContent></Card>
            {selectedVendor && (
            <Card><CardHeader><CardTitle><User className="h-5 w-5 inline mr-2" />Vendor Contact</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2"><Label>Contact Person</Label><div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.contact_person || 'Not specified'}</div></div>
              <div className="space-y-2"><Label><Mail className="h-4 w-4 inline mr-1" />Email</Label><div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.email || 'Not specified'}</div></div>
              <div className="space-y-2"><Label><Phone className="h-4 w-4 inline mr-1" />Phone</Label><div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.phone || 'Not specified'}</div></div>
            </CardContent></Card>
            )}
            <Card><CardHeader><CardTitle><CheckCircle2 className="h-5 w-5 inline mr-2" />Resolution</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2"><Label>Resolution Type</Label><Select value={formData.resolutionType} onValueChange={v => setFormData(p => ({ ...p, resolutionType: v }))}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{resolutionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={formData.resolutionNotes} onChange={e => setFormData(p => ({ ...p, resolutionNotes: e.target.value }))} /></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle><Info className="h-5 w-5 inline mr-2" />Additional Info</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2"><Label>Delivery Date</Label><Input type="date" value={formData.deliveryDate} onChange={e => setFormData(p => ({ ...p, deliveryDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Invoice #</Label><Input value={formData.invoiceNumber} onChange={e => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Tracking # <span className="text-xs text-muted-foreground">(from Order)</span></Label>
                <Input value={formData.trackingNumber || selectedOrder?.tracking_number || ''} readOnly disabled className="bg-muted cursor-not-allowed" placeholder="Auto-filled from order" />
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle><Upload className="h-5 w-5 inline mr-2" />Photos</CardTitle></CardHeader><CardContent>
              <Button type="button" variant="outline" onClick={() => document.getElementById('photos')?.click()}><Upload className="h-4 w-4 mr-2" />Upload (max 10)</Button>
              <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              {formData.photos.length > 0 && <div className="grid grid-cols-5 gap-2 mt-4">{formData.photos.map((f, i) => <div key={i} className="relative"><img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded" /><button type="button" onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>)}</div>}
            </CardContent></Card>
            <Card><CardContent className="py-4"><div className="flex items-center gap-4"><Checkbox id="ai" checked={formData.aiActivated} onCheckedChange={c => setFormData(p => ({ ...p, aiActivated: c as boolean }))} /><Label htmlFor="ai">Enable AI-assisted communication</Label></div><div className="flex items-center gap-4 mt-2"><Checkbox id="notify" checked={formData.autoNotifyVendor} onCheckedChange={c => setFormData(p => ({ ...p, autoNotifyVendor: c as boolean }))} /><Label htmlFor="notify">Auto-notify vendor</Label></div></CardContent></Card>
            <div className="flex justify-between"><Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button><div className="flex gap-4"><Button type="button" variant="outline" onClick={() => navigate('/issues')}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : `Report ${selectedProducts.length} Issue(s)`}</Button></div></div>
          </div>}
        </form>
      </div>
    </PageLayout>
  );
};

export default IssueNew;
