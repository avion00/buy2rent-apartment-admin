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
import { AITextEnhancer } from '@/components/ui/AITextEnhancer';
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
import { Skeleton } from '@/components/ui/skeleton';

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

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);
  
  // Store issue data for each product independently
  const [productIssueData, setProductIssueData] = useState<Record<string, ProductIssueData>>({});
  
  const [formData, setFormData] = useState({
    orderId: '', 
    apartmentId: 'all', 
    vendorId: 'all',
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
  
  const [searchQuery, setSearchQuery] = useState('');

  const issueTypes = [
    'Other (Custom)',
    'Broken/Damaged', 'Wrong Item/Color', 'Missing Parts', 'Incorrect Quantity', 'Poor Quality', 
    'Late Delivery', 'Installation Issue', 'Warranty Claim', 'Defective Product', 'Packaging Damage',
    'Wrong Size/Dimensions', 'Expired Product', 'Missing Documentation', 'Safety Hazard'
  ];
  
  const priorities = [
    { value: 'Critical', label: 'Critical', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'High', label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { value: 'Low', label: 'Low', color: 'bg-green-500/10 text-green-600 border-green-200' },
  ];
  
  const impactLevels = ['Blocking Progress', 'Delaying Project', 'Partial Impact', 'Minor Inconvenience', 'No Impact'];
  const resolutionTypes = ['Full Replacement', 'Partial Replacement', 'Repair', 'Refund', 'Credit Note', 'Exchange', 'Other'];

  // Fetch orders - now fetches all orders and filters client-side for better UX
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await orderApi.getOrders({});
        const allOrders = response.results || [];
        const deliveredStatuses = ['delivered', 'received', 'in_transit', 'Delivered', 'Received', 'In Transit'];
        const filtered = allOrders.filter(o => deliveredStatuses.includes(o.status) || o.is_delivered);
        setOrders(filtered.length > 0 ? filtered : allOrders);
      } catch { setOrders([]); }
      finally { setOrdersLoading(false); }
    };
    fetchOrders();
  }, []);

  // Fetch order details and auto-advance to Step 2
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
        // Auto-advance to Step 2 (product selection)
        setStep(2);
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
        const issueTypesStr = product.issueTypes.join(', ');
        
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
  
  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    // Search filter (PO number, apartment, vendor)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesPO = order.po_number?.toLowerCase().includes(query);
      const matchesApartment = order.apartment_name?.toLowerCase().includes(query);
      const matchesVendor = order.vendor_name?.toLowerCase().includes(query);
      if (!matchesPO && !matchesApartment && !matchesVendor) return false;
    }
    
    // Apartment filter (skip if 'all' or empty)
    if (formData.apartmentId && formData.apartmentId !== 'all' && order.apartment !== formData.apartmentId) return false;
    
    // Vendor filter (skip if 'all' or empty)
    if (formData.vendorId && formData.vendorId !== 'all' && order.vendor !== formData.vendorId) return false;
    
    return true;
  });

  return (
    <PageLayout title="Report New Issue">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/issues')} className="hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/issues" className="text-muted-foreground hover:text-foreground">Issues</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">Report New Issue</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <Card className="border-none shadow-sm"><CardContent className="py-5"><div className="flex items-center justify-center gap-4">
          {[{ n: 1, l: 'Select Order' }, { n: 2, l: 'Select Products' }, { n: 3, l: 'Issue Details' }].map((s, i) => (
            <React.Fragment key={s.n}><div className={`flex items-center gap-2 ${step >= s.n ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 ${step >= s.n ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground/30'}`}>
                {step > s.n ? <CheckCircle2 className="h-5 w-5" /> : s.n}
              </div><span className="font-medium hidden sm:inline">{s.l}</span>
            </div>{i < 2 && <div className={`w-16 h-0.5 ${step > s.n ? 'bg-primary' : 'bg-muted'}`} />}</React.Fragment>
          ))}
        </div></CardContent></Card>

        <form onSubmit={handleSubmit}>
          {step === 1 && <Card><CardHeader><CardTitle><FileText className="h-5 w-5 inline mr-2" />Step 1: Select Order</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Search for an order by PO number, or filter by apartment/vendor to narrow down your search</p>
          </CardHeader><CardContent className="space-y-6">
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by PO number, apartment, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10"
                  disabled={ordersLoading}
                />
              </div>
              {apartmentsLoading ? (
                <Skeleton className="h-10 w-full sm:w-[200px]" />
              ) : (
                <Select value={formData.apartmentId} onValueChange={v => setFormData(p => ({ ...p, apartmentId: v }))}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All apartments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All apartments</SelectItem>
                    {apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {vendorsLoading ? (
                <Skeleton className="h-10 w-full sm:w-[200px]" />
              ) : (
                <Select value={formData.vendorId} onValueChange={v => setFormData(p => ({ ...p, vendorId: v }))}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vendors</SelectItem>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {(searchQuery || (formData.apartmentId && formData.apartmentId !== 'all') || (formData.vendorId && formData.vendorId !== 'all')) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setFormData(p => ({ ...p, apartmentId: 'all', vendorId: 'all' }));
                  }}
                  title="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {ordersLoading ? 'Loading orders...' : `${filteredOrders.length} order(s)`}
              </p>
            </div>
            
            {/* Order List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {ordersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {searchQuery || formData.apartmentId !== 'all' || formData.vendorId !== 'all' 
                        ? 'No orders match your search/filters' 
                        : 'No orders found'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map(order => (
                  <Card
                    key={order.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-sm",
                      formData.orderId === order.id 
                        ? "ring-2 ring-primary border-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    )}
                    onClick={() => {
                      // Select order - will auto-advance to Step 2
                      setFormData(p => ({ ...p, orderId: order.id }));
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-semibold text-base">{order.po_number}</h4>
                          <Badge variant="outline" className="text-xs">{order.status}</Badge>
                        </div>
                        {formData.orderId === order.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          {order.apartment_name}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Store className="h-3 w-3 flex-shrink-0" />
                          {order.vendor_name}
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Package className="h-3 w-3" />
                          {order.items_count}
                        </span>
                        <span className="font-medium text-foreground flex-shrink-0">€{Number(order.total).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {orderLoading && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading order details...</span>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-4 pt-4"><Button type="button" variant="outline" onClick={() => navigate('/issues')}>Cancel</Button><Button type="button" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={!canStep2}>Next<ArrowRight className="h-4 w-4 ml-2" /></Button></div>
          </CardContent></Card>}

          {step === 2 && !selectedOrder && orderLoading && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-2 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedOrder && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Select Products with Issues</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{selectedOrder.po_number} • {selectedOrder.vendor_name} • {selectedOrder.items?.length || 0} items</p>
                  </div>
                  <Badge variant={selectedProducts.length > 0 ? "default" : "outline"} className="text-xs">
                    {selectedProducts.length} ready
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
                  Click products to report issues. Fill in the form to include them in your report.
                </p>

                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-2 animate-pulse">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-12 h-12 rounded" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-5 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedOrder.items.map((item) => {
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
                          isExpanded && "ring-1 ring-primary border-primary",
                          isComplete && !isExpanded && "border-green-500 bg-green-50/30 dark:bg-green-950/10"
                        )}
                      >
                        <div 
                          className={cn(
                            "p-2 cursor-pointer hover:bg-muted/30 transition-colors",
                            isExpanded && "bg-muted/50"
                          )}
                          onClick={() => handleProductClick(itemKey)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative flex-shrink-0">
                              {item.product_image ? (
                                <img 
                                  src={item.product_image} 
                                  alt={item.product_name || 'Product'} 
                                  className="w-12 h-12 rounded object-cover border"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded flex items-center justify-center border bg-muted">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              {isComplete && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-sm truncate">{item.product_name || 'Unknown Product'}</h4>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    {item.quantity}
                                  </Badge>
                                  <span className="text-xs font-semibold">€{Number(item.total_price).toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.sku || 'N/A'} • €{Number(item.unit_price).toFixed(2)}
                                </span>
                                {!isExpanded && isComplete && issueData && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    {issueData.issueTypes.slice(0, 2).map(type => (
                                      <Badge key={type} variant="secondary" className="text-[10px] px-1 py-0">
                                        {type}
                                      </Badge>
                                    ))}
                                    {issueData.issueTypes.length > 2 && (
                                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                        +{issueData.issueTypes.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Issue Form */}
                        {isExpanded && issueData && (
                          <div className="p-3 pt-0 border-t bg-gradient-to-b from-muted/20 to-muted/40 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-3 pt-3">
                              {/* Quantity & Issue Types - Premium Cards */}
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                                  <Label htmlFor={`qty-${itemKey}`} className="flex items-center gap-1.5 text-xs font-semibold">
                                    <Layers className="h-3.5 w-3.5 text-primary" />
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
                                    className="h-9 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                  />
                                  <p className="text-[10px] text-muted-foreground">
                                    Out of {item.quantity} ordered
                                  </p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                                  <Label className="flex items-center gap-1.5 text-xs font-semibold">
                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                                    Issue Type(s) *
                                  </Label>
                                  <MultiSelectTags
                                    key={`types-${itemKey}`}
                                    options={issueTypes}
                                    value={issueData.issueTypes}
                                    onChange={(v) => updateProductIssue(itemKey, 'issueTypes', v)}
                                    placeholder="Select issue types"
                                    allowCustom={true}
                                    customPlaceholder="Enter your custom issue type..."
                                  />
                                </div>
                              </div>
                              
                              
                              {/* Description - Premium Card */}
                              <div className="space-y-1.5 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                                <Label htmlFor={`desc-${itemKey}`} className="flex items-center gap-1.5 text-xs font-semibold">
                                  <FileText className="h-3.5 w-3.5 text-primary" />
                                  Issue Description *
                                </Label>
                                <div className="relative">
                                  <Textarea
                                    id={`desc-${itemKey}`}
                                    key={`desc-${itemKey}`}
                                    value={issueData.description}
                                    onChange={(e) => updateProductIssue(itemKey, 'description', e.target.value)}
                                    placeholder="Describe the issue in detail. Include any relevant information such as when you noticed the issue, specific damage locations, etc."
                                    rows={3}
                                    className="bg-background border-0 focus:ring-0 focus:outline-none transition-all resize-none text-sm pr-10"
                                  />
                                  <div className="absolute top-2 right-2">
                                    <AITextEnhancer
                                      text={issueData.description}
                                      onTextEnhanced={(enhanced) => updateProductIssue(itemKey, 'description', enhanced)}
                                      variant="ghost"
                                      size="sm"
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {issueData.description.length} characters
                                </p>
                              </div>
                              
                              {/* Status Indicator - Animated */}
                              <div className={cn(
                                "p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium border transition-all duration-300",
                                isComplete 
                                  ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 shadow-sm animate-in fade-in zoom-in duration-300" 
                                  : "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                              )}>
                                {isComplete ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 animate-in zoom-in duration-300" />
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
                  <Button type="button" variant="outline" onClick={() => { 
                    setFormData(p => ({ ...p, apartmentId: 'all', vendorId: 'all' }));
                    setStep(1); 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/issues')}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={!canStep3}>
                      Next: Issue Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && !selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column Skeleton */}
                <div className="space-y-6 lg:col-span-2">
                  <Card className="animate-pulse">
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="animate-pulse">
                    <CardHeader>
                      <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right Column Skeleton */}
                <div className="space-y-6">
                  <Card className="animate-pulse">
                    <CardHeader>
                      <Skeleton className="h-6 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          )}

          {step === 3 && selectedOrder && <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - 2/3 width */}
              <div className="space-y-6 lg:col-span-2">
                {/* Priority & Impact */}
                <Card>
                  <CardHeader>
                    <CardTitle><AlertTriangle className="h-5 w-5 inline mr-2" />Priority & Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                        <SelectContent>{priorities.map(pr => <SelectItem key={pr.value} value={pr.value}><Badge className={pr.color}>{pr.label}</Badge></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impact</Label>
                      <Select value={formData.impact} onValueChange={v => setFormData(p => ({ ...p, impact: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select impact" /></SelectTrigger>
                        <SelectContent>{impactLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label><Calendar className="h-4 w-4 inline mr-1" />Expected Resolution</Label>
                      <Input type="date" value={formData.expectedResolution} onChange={e => setFormData(p => ({ ...p, expectedResolution: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label><Truck className="h-4 w-4 inline mr-1" />Replacement ETA</Label>
                      <Input type="date" value={formData.replacementEta} onChange={e => setFormData(p => ({ ...p, replacementEta: e.target.value }))} />
                    </div>
                  </CardContent>
                </Card>

                {/* Resolution */}
                <Card>
                  <CardHeader>
                    <CardTitle><CheckCircle2 className="h-5 w-5 inline mr-2" />Resolution</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Resolution Type</Label>
                      <Select value={formData.resolutionType} onValueChange={v => setFormData(p => ({ ...p, resolutionType: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{resolutionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input value={formData.resolutionNotes} onChange={e => setFormData(p => ({ ...p, resolutionNotes: e.target.value }))} />
                    </div>
                  </CardContent>
                </Card>

                {/* Photos */}
                <Card>
                  <CardHeader>
                    <CardTitle><Upload className="h-5 w-5 inline mr-2" />Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('photos')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />Upload (max 10)
                    </Button>
                    <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {formData.photos.map((f, i) => (
                          <div key={i} className="relative">
                            <img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded" />
                            <button 
                              type="button" 
                              onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))} 
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Checkbox id="ai" checked={formData.aiActivated} onCheckedChange={c => setFormData(p => ({ ...p, aiActivated: c as boolean }))} />
                    <Label htmlFor="ai">Enable AI-assisted communication</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox id="notify" checked={formData.autoNotifyVendor} onCheckedChange={c => setFormData(p => ({ ...p, autoNotifyVendor: c as boolean }))} />
                    <Label htmlFor="notify">Auto-notify vendor</Label>
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6 lg:col-span-1">
                {/* Vendor Contact */}
                {selectedVendor && (
                  <Card>
                    <CardHeader>
                      <CardTitle><User className="h-5 w-5 inline mr-2" />Vendor Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.contact_person || 'Not specified'}</div>
                      </div>
                      <div className="space-y-2">
                        <Label><Mail className="h-4 w-4 inline mr-1" />Email</Label>
                        <div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.email || 'Not specified'}</div>
                      </div>
                      <div className="space-y-2">
                        <Label><Phone className="h-4 w-4 inline mr-1" />Phone</Label>
                        <div className="p-2 bg-muted rounded-md text-sm">{selectedVendor.phone || 'Not specified'}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle><Info className="h-5 w-5 inline mr-2" />Additional Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Delivery Date</Label>
                        <Input type="date" value={formData.deliveryDate} onChange={e => setFormData(p => ({ ...p, deliveryDate: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Invoice #</Label>
                        <Input value={formData.invoiceNumber} onChange={e => setFormData(p => ({ ...p, invoiceNumber: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tracking # <span className="text-xs text-muted-foreground">(from Order)</span></Label>
                      <Input value={formData.trackingNumber || selectedOrder?.tracking_number || ''} readOnly disabled className="bg-muted cursor-not-allowed" placeholder="Auto-filled from order" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/issues')}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : `Report ${selectedProducts.length} Issue(s)`}
                </Button>
              </div>
            </div>
          </div>}
        </form>
      </div>
    </PageLayout>
  );
};

export default IssueNew;
