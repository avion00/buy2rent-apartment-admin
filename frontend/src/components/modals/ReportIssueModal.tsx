import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectTags } from '@/components/ui/multi-select-tags';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, Upload, X, Package, Building2, Store, FileText, 
  Truck, Calendar, User, Phone, Mail, Hash, DollarSign, Clock,
  AlertTriangle, CheckCircle2, Info, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useApartments } from '@/hooks/useApartmentApi';
import { useVendors } from '@/hooks/useVendorApi';
import { orderApi, Order, OrderItem } from '@/services/orderApi';
import { issueApi, CreateIssueData } from '@/services/issueApi';

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueCreated?: () => void;
}

interface SelectedProductIssue {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  issueQuantity: number;
  issueTypes: string[];
  customIssueType: string;
  description: string;
}

export const ReportIssueModal = ({ open, onOpenChange, onIssueCreated }: ReportIssueModalProps) => {
  // API Data
  const { data: apartmentsData, isLoading: apartmentsLoading } = useApartments();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors();
  
  // Extract arrays with fallback to empty arrays
  const apartments = apartmentsData?.results || [];
  const vendors = vendorsData?.results || [];
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Order Selection
    orderId: '',
    apartmentId: '',
    vendorId: '',
    
    // Selected Products with Issues
    selectedProducts: [] as SelectedProductIssue[],
    
    // Global Issue Details
    priority: '',
    impact: '',
    expectedResolution: '',
    replacementEta: '',
    
    // Vendor Contact
    vendorContact: '',
    vendorContactEmail: '',
    vendorContactPhone: '',
    
    // Resolution
    resolutionType: '',
    resolutionNotes: '',
    
    // Additional Info
    deliveryDate: '',
    invoiceNumber: '',
    trackingNumber: '',
    
    // AI & Automation
    aiActivated: false,
    autoNotifyVendor: true,
    
    // Photos
    photos: [] as File[],
  });

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Order, 2: Select Products, 3: Issue Details

  // Issue Types
  const issueTypes = [
    'Broken/Damaged',
    'Wrong Item/Color',
    'Missing Parts',
    'Incorrect Quantity',
    'Poor Quality',
    'Late Delivery',
    'Installation Issue',
    'Warranty Claim',
    'Defective Product',
    'Packaging Damage',
    'Wrong Size/Dimensions',
    'Expired Product',
    'Missing Documentation',
    'Safety Hazard',
    'Other'
  ];

  const priorities = [
    { value: 'Critical', label: 'Critical', color: 'bg-red-500/10 text-red-600', description: 'Immediate attention required' },
    { value: 'High', label: 'High', color: 'bg-orange-500/10 text-orange-600', description: 'Needs resolution within 24 hours' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600', description: 'Needs resolution within 3 days' },
    { value: 'Low', label: 'Low', color: 'bg-green-500/10 text-green-600', description: 'Can wait for scheduled resolution' },
  ];
  
  const impactLevels = [
    { value: 'Blocking Progress', description: 'Work cannot continue' },
    { value: 'Delaying Project', description: 'Project timeline affected' },
    { value: 'Partial Impact', description: 'Some work affected' },
    { value: 'Minor Inconvenience', description: 'Workaround available' },
    { value: 'No Impact', description: 'Cosmetic or future concern' },
  ];

  const resolutionTypes = [
    'Full Replacement',
    'Partial Replacement',
    'Repair',
    'Refund',
    'Credit Note',
    'Exchange',
    'Discount on Next Order',
    'Other',
  ];

  // Fetch orders when apartment or vendor changes
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const params: Record<string, string> = {};
        if (formData.apartmentId) params.apartment = formData.apartmentId;
        if (formData.vendorId) params.vendor = formData.vendorId;
        // Fetch all orders first, then filter client-side for delivered/received
        
        const response = await orderApi.getOrders(params);
        const allOrders = response.results || [];
        
        // Filter to show only orders that can have issues reported
        // (delivered, received, in_transit, or any status that indicates items were shipped)
        const deliveredStatuses = ['delivered', 'received', 'in_transit', 'Delivered', 'Received', 'In Transit'];
        const filteredOrders = allOrders.filter(order => 
          deliveredStatuses.includes(order.status) || order.is_delivered
        );
        
        setOrders(filteredOrders.length > 0 ? filteredOrders : allOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [formData.apartmentId, formData.vendorId]);

  // Fetch full order details when order is selected
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!formData.orderId) {
        setSelectedOrder(null);
        return;
      }
      
      setOrderLoading(true);
      try {
        const order = await orderApi.getOrder(formData.orderId);
        setSelectedOrder(order);
        
        // Auto-fill apartment and vendor from order
        if (order.apartment) {
          setFormData(prev => ({ ...prev, apartmentId: order.apartment }));
        }
        if (order.vendor) {
          setFormData(prev => ({ ...prev, vendorId: order.vendor }));
        }
        if (order.tracking_number) {
          setFormData(prev => ({ ...prev, trackingNumber: order.tracking_number || '' }));
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderDetails();
  }, [formData.orderId]);

  const handleProductSelect = (item: OrderItem, selected: boolean) => {
    if (selected) {
      const newProduct: SelectedProductIssue = {
        productId: item.product,
        productName: item.product_name || 'Unknown Product',
        sku: item.sku || '',
        quantity: item.quantity,
        unitPrice: String(item.unit_price),
        issueQuantity: item.quantity,
        issueTypes: [],
        customIssueType: '',
        description: '',
      };
      setFormData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, newProduct]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(p => p.productId !== item.product)
      }));
    }
  };

  const updateProductIssue = (productId: string, field: keyof SelectedProductIssue, value: any) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(p => 
        p.productId === productId ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.orderId) {
      toast.error('Please select an order');
      return;
    }
    
    if (formData.selectedProducts.length === 0) {
      toast.error('Please select at least one product with an issue');
      return;
    }

    for (const product of formData.selectedProducts) {
      if (product.issueTypes.length === 0) {
        toast.error(`Please select issue type(s) for ${product.productName}`);
        return;
      }
      if (!product.description.trim()) {
        toast.error(`Please provide a description for ${product.productName}`);
        return;
      }
    }

    if (!formData.priority) {
      toast.error('Please select a priority level');
      return;
    }

    setSubmitting(true);

    try {
      // Create an issue for each selected product
      for (const product of formData.selectedProducts) {
        const issueTypesString = product.issueTypes.includes('Other') 
          ? [...product.issueTypes.filter(t => t !== 'Other'), product.customIssueType].filter(Boolean).join(', ')
          : product.issueTypes.join(', ');

        const issueData: CreateIssueData = {
          apartment: formData.apartmentId,
          product: product.productId,
          vendor: formData.vendorId,
          type: issueTypesString,
          description: `${product.description}\n\n---\nOrder: ${selectedOrder?.po_number}\nQuantity Affected: ${product.issueQuantity} of ${product.quantity}\nUnit Price: €${product.unitPrice}`,
          priority: formData.priority,
          expected_resolution: formData.expectedResolution || undefined,
          vendor_contact: formData.vendorContact || undefined,
          impact: formData.impact || undefined,
          replacement_eta: formData.replacementEta || undefined,
          ai_activated: formData.aiActivated,
          resolution_status: 'Open',
        };

        await issueApi.createIssue(issueData);
      }

      toast.success('Issue(s) Reported Successfully', {
        description: `${formData.selectedProducts.length} issue(s) have been created and assigned.`,
      });

      onOpenChange(false);
      onIssueCreated?.();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      apartmentId: '',
      vendorId: '',
      selectedProducts: [],
      priority: '',
      impact: '',
      expectedResolution: '',
      replacementEta: '',
      vendorContact: '',
      vendorContactEmail: '',
      vendorContactPhone: '',
      resolutionType: '',
      resolutionNotes: '',
      deliveryDate: '',
      invoiceNumber: '',
      trackingNumber: '',
      aiActivated: false,
      autoNotifyVendor: true,
      photos: [],
    });
    setSelectedOrder(null);
    setStep(1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const selectedApartment = apartments.find(a => a.id === formData.apartmentId);
  const selectedVendor = vendors.find(v => v.id === formData.vendorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Report New Issue
          </DialogTitle>
          <DialogDescription>
            Report product issues from a received order. All details will be tracked and communicated automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-4">
          <span>Select Order</span>
          <span>Select Products</span>
          <span>Issue Details</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Order Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Apartment Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Apartment
                  </Label>
                  <Select 
                    value={formData.apartmentId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, apartmentId: value, orderId: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={apartmentsLoading ? "Loading..." : "Select apartment (optional)"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {apartments.map(apt => (
                        <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Vendor
                  </Label>
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value, orderId: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={vendorsLoading ? "Loading..." : "Select vendor (optional)"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Order (PO Number) *
                </Label>
                <Select 
                  value={formData.orderId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, orderId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={ordersLoading ? "Loading orders..." : "Select an order"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {orders.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {ordersLoading ? 'Loading...' : 'No delivered/received orders found'}
                      </div>
                    ) : (
                      orders.map(order => (
                        <SelectItem key={order.id} value={order.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.po_number}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-sm text-muted-foreground">{order.apartment_name}</span>
                            <Badge variant="outline" className="text-xs">{order.status}</Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Details Preview */}
              {orderLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {selectedOrder && !orderLoading && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Order Details
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">PO Number</p>
                        <p className="font-medium">{selectedOrder.po_number}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Apartment</p>
                        <p className="font-medium">{selectedOrder.apartment_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vendor</p>
                        <p className="font-medium">{selectedOrder.vendor_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="outline">{selectedOrder.status}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{selectedOrder.items_count} items</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">€{Number(selectedOrder.total).toFixed(2)}</p>
                      </div>
                      {selectedOrder.placed_on && (
                        <div>
                          <p className="text-muted-foreground">Placed On</p>
                          <p className="font-medium">{selectedOrder.placed_on}</p>
                        </div>
                      )}
                      {selectedOrder.actual_delivery && (
                        <div>
                          <p className="text-muted-foreground">Delivered On</p>
                          <p className="font-medium">{selectedOrder.actual_delivery}</p>
                        </div>
                      )}
                      {selectedOrder.tracking_number && (
                        <div>
                          <p className="text-muted-foreground">Tracking</p>
                          <p className="font-medium">{selectedOrder.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Product Selection */}
          {step === 2 && selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Select Products with Issues
                </h4>
                <Badge variant="outline">
                  {formData.selectedProducts.length} selected
                </Badge>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {selectedOrder.items?.map((item) => {
                  const isSelected = formData.selectedProducts.some(p => p.productId === item.product);
                  const selectedProduct = formData.selectedProducts.find(p => p.productId === item.product);
                  
                  return (
                    <Card key={item.id || item.product} className={`transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleProductSelect(item, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{item.product_name || 'Unknown Product'}</p>
                                <p className="text-sm text-muted-foreground">SKU: {item.sku || 'N/A'}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p>Qty: {item.quantity}</p>
                                <p className="text-muted-foreground">€{Number(item.unit_price).toFixed(2)} each</p>
                                <p className="font-medium">€{Number(item.total_price).toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Issue Details for Selected Product */}
                            {isSelected && selectedProduct && (
                              <div className="space-y-3 pt-3 border-t">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Quantity Affected *</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={item.quantity}
                                      value={selectedProduct.issueQuantity}
                                      onChange={(e) => updateProductIssue(item.product, 'issueQuantity', parseInt(e.target.value) || 1)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Issue Type(s) *</Label>
                                    <MultiSelectTags
                                      options={issueTypes}
                                      value={selectedProduct.issueTypes}
                                      onChange={(value) => updateProductIssue(item.product, 'issueTypes', value)}
                                      placeholder="Select types"
                                    />
                                  </div>
                                </div>

                                {selectedProduct.issueTypes.includes('Other') && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">Specify Other Issue *</Label>
                                    <Input
                                      placeholder="Enter custom issue type..."
                                      value={selectedProduct.customIssueType}
                                      onChange={(e) => updateProductIssue(item.product, 'customIssueType', e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <Label className="text-xs">Issue Description *</Label>
                                  <Textarea
                                    placeholder="Describe the issue with this product..."
                                    value={selectedProduct.description}
                                    onChange={(e) => updateProductIssue(item.product, 'description', e.target.value)}
                                    rows={2}
                                    className="resize-none text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Issue Details */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Priority & Impact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority *
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={p.color}>{p.label}</Badge>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Impact Level
                  </Label>
                  <Select value={formData.impact} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact" />
                    </SelectTrigger>
                    <SelectContent>
                      {impactLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <span>{level.value}</span>
                            <span className="text-xs text-muted-foreground ml-2">- {level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expected Resolution Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.expectedResolution}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedResolution: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Replacement ETA
                  </Label>
                  <Input
                    type="date"
                    value={formData.replacementEta}
                    onChange={(e) => setFormData(prev => ({ ...prev, replacementEta: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Vendor Contact */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Vendor Contact Information
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Contact Person</Label>
                    <Input
                      placeholder="Contact name"
                      value={formData.vendorContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorContact: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="contact@vendor.com"
                      value={formData.vendorContactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorContactEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.vendorContactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendorContactPhone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Resolution */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requested Resolution Type</Label>
                  <Select value={formData.resolutionType} onValueChange={(value) => setFormData(prev => ({ ...prev, resolutionType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Input
                    placeholder="Additional resolution details..."
                    value={formData.resolutionNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Reference Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Delivery Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Invoice Number
                  </Label>
                  <Input
                    placeholder="INV-XXXXX"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Tracking Number
                  </Label>
                  <Input
                    placeholder="Tracking #"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Photos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Photos (Optional, max 10)
                </Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {formData.photos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Automation Options */}
              <div className="space-y-3">
                <h4 className="font-medium">Automation Options</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aiActivated"
                      checked={formData.aiActivated}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aiActivated: checked as boolean }))}
                    />
                    <Label htmlFor="aiActivated" className="text-sm cursor-pointer">
                      Enable AI-assisted vendor communication
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoNotify"
                      checked={formData.autoNotifyVendor}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoNotifyVendor: checked as boolean }))}
                    />
                    <Label htmlFor="autoNotify" className="text-sm cursor-pointer">
                      Automatically notify vendor via email
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedOrder) ||
                    (step === 2 && formData.selectedProducts.length === 0)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reporting...
                    </>
                  ) : (
                    `Report ${formData.selectedProducts.length} Issue(s)`
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
