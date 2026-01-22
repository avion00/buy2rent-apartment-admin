import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectTags } from "@/components/ui/multi-select-tags";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AITextEnhancer } from "@/components/ui/AITextEnhancer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, AlertTriangle, CheckCircle2, Package, Calendar, Truck, Loader2, FileText, Layers
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderInfo {
  order_id: string;
  po_number: string;
  status: string;
  quantity: number;
  expected_delivery?: string;
  shipping_address?: string;
}

interface ProductData {
  id: string;
  product: string;
  sku?: string;
  unit_price?: string;
  product_image?: string;
  order_status_info?: OrderInfo[];
}

interface OrderSelection {
  selected: boolean;
  quantity: number;
}

interface ReportIssueFromProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductData | null;
  apartmentId: string;
  existingIssueId?: string | null;
  onSubmit: (issueData: any, issueId?: string | null) => Promise<void>;
}

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

export function ReportIssueFromProductDialog({
  open,
  onOpenChange,
  product,
  apartmentId,
  existingIssueId,
  onSubmit,
}: ReportIssueFromProductDialogProps) {
  const [step, setStep] = useState(1); // 1: Select Orders, 2: Issue Details
  const [orderSelections, setOrderSelections] = useState<Record<string, OrderSelection>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingExistingIssue, setLoadingExistingIssue] = useState(false);
  const [existingIssueData, setExistingIssueData] = useState<any>(null);
  const selectionsInitializedRef = useRef(false);
  
  // Form data for issue details (single form for all orders)
  const [formData, setFormData] = useState({
    totalQuantity: 0,
    issueTypes: [] as string[],
    description: '',
    priority: '',
    impact: '',
    expectedResolution: '',
    replacementEta: '',
    resolutionType: '',
    resolutionNotes: '',
    aiActivated: false,
    autoNotifyVendor: true,
  });

  // Fetch existing issue data if editing - only once when dialog opens
  useEffect(() => {
    const fetchExistingIssue = async () => {
      if (existingIssueId && open && product?.order_status_info) {
        setLoadingExistingIssue(true);
        try {
          const { issueApi } = await import('@/services/issueApi');
          const issue = await issueApi.getIssue(existingIssueId);
          setExistingIssueData(issue);
          
          // Pre-fill form data
          const issueTypes = issue.type ? issue.type.split(', ').filter(Boolean) : [];
          setFormData({
            totalQuantity: issue.items?.reduce((sum: number, item: any) => sum + (item.quantity_affected || 0), 0) || 0,
            issueTypes,
            description: issue.description?.split('\n\nIssue Description:\n')[1] || issue.description || '',
            priority: issue.priority || '',
            impact: issue.impact || '',
            expectedResolution: issue.expected_resolution || '',
            replacementEta: issue.replacement_eta || '',
            resolutionType: issue.resolution_type || '',
            resolutionNotes: issue.resolution_notes || '',
            aiActivated: issue.ai_activated || false,
            autoNotifyVendor: issue.auto_notify_vendor !== false,
          });
          
          // Pre-select orders from issue items
          const selections: Record<string, OrderSelection> = {};
          
          // First, initialize ALL orders as unselected
          product.order_status_info.forEach(orderInfo => {
            selections[orderInfo.order_id] = {
              selected: false,
              quantity: orderInfo.quantity,
            };
          });
          
          // Then, mark orders that have IssueItems as selected
          product.order_status_info.forEach(orderInfo => {
            const hasIssueItem = issue.items.some((item: any) => {
              // Check if description contains this order's PO number
              if (item.description && orderInfo.po_number) {
                return item.description.includes(orderInfo.po_number);
              }
              // Fallback: check order_item.order if available
              if (item.order_item?.order) {
                return item.order_item.order === orderInfo.order_id;
              }
              return false;
            });
            
            if (hasIssueItem) {
              selections[orderInfo.order_id].selected = true;
            }
          });
          
          setOrderSelections(selections);
          selectionsInitializedRef.current = true;
        } catch (error) {
          console.error('Failed to fetch existing issue:', error);
          toast.error('Failed to load issue data');
        } finally {
          setLoadingExistingIssue(false);
        }
      }
    };
    
    // Only fetch when dialog first opens with an existing issue ID
    // Don't re-fetch if product changes (which happens on re-renders)
    if (existingIssueId && open) {
      fetchExistingIssue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingIssueId, open]);

  // Initialize order selections when product changes (for new issues ONLY)
  useEffect(() => {
    // Only initialize if:
    // 1. Not in edit mode (!existingIssueId)
    // 2. Product data is available
    // 3. Selections haven't been initialized yet (prevents re-initialization)
    if (product?.order_status_info && !existingIssueId && !selectionsInitializedRef.current && open) {
      const initialData: Record<string, OrderSelection> = {};
      product.order_status_info.forEach(orderInfo => {
        initialData[orderInfo.order_id] = {
          selected: false,
          quantity: orderInfo.quantity,
        };
      });
      setOrderSelections(initialData);
      selectionsInitializedRef.current = true;
    }
  }, [product, existingIssueId, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setOrderSelections({});
      setExistingIssueData(null);
      selectionsInitializedRef.current = false;
      setFormData({
        totalQuantity: 0,
        issueTypes: [],
        description: '',
        priority: '',
        impact: '',
        expectedResolution: '',
        replacementEta: '',
        resolutionType: '',
        resolutionNotes: '',
        aiActivated: false,
        autoNotifyVendor: true,
      });
    }
  }, [open]);

  const toggleOrderSelection = (orderId: string) => {
    setOrderSelections(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], selected: !prev[orderId]?.selected }
    }));
  };

  const getSelectedOrders = () => {
    return Object.entries(orderSelections)
      .filter(([_, data]) => data.selected)
      .map(([orderId, data]) => {
        const orderInfo = product?.order_status_info?.find(o => o.order_id === orderId);
        return { orderId, orderInfo, quantity: data.quantity };
      });
  };

  const selectedOrders = getSelectedOrders();
  const totalQuantity = selectedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const canProceedToDetails = selectedOrders.length > 0;
  
  // Update total quantity when orders are selected
  useEffect(() => {
    if (step === 2) {
      setFormData(prev => ({ ...prev, totalQuantity }));
    }
  }, [selectedOrders.length, step, totalQuantity]);

  const handleSubmit = async () => {
    if (!formData.priority || !formData.issueTypes.length || !formData.description.trim()) {
      toast.error('Please complete all required fields (Priority, Issue Types, Description)');
      return;
    }

    setSubmitting(true);
    try {
      // Use first selected order for main issue
      const firstOrder = selectedOrders[0];
      
      // Fetch the full order details to get vendor ID
      const { orderApi } = await import('@/services/orderApi');
      const orderDetails = await orderApi.getOrder(firstOrder.orderId);
      
      // Build items_data array for all selected orders
      const itemsData = selectedOrders.map(order => ({
        order_item: null,
        product: product?.id || null,
        product_name: product?.product || '',
        quantity_affected: order.quantity,
        issue_types: formData.issueTypes.join(', '),
        description: `Order: ${order.orderInfo?.po_number || 'N/A'} | Ordered: ${order.orderInfo?.expected_delivery ? new Date(order.orderInfo.expected_delivery).toLocaleDateString() : 'N/A'} | Qty: ${order.quantity}`,
      }));

      // Build comprehensive description with order context for AI/Vendor
      const orderContext = selectedOrders.map(o => 
        `• Order ${o.orderInfo?.po_number || 'N/A'} (${o.quantity} units) - Expected: ${o.orderInfo?.expected_delivery ? new Date(o.orderInfo.expected_delivery).toLocaleDateString() : 'N/A'}`
      ).join('\n');
      
      const fullDescription = `Product: ${product?.product}${product?.sku ? ` (SKU: ${product.sku})` : ''}\n\nAffected Orders (${selectedOrders.length}):\n${orderContext}\n\nTotal Quantity Affected: ${formData.totalQuantity}\n\nIssue Description:\n${formData.description}`;
      
      const issueData = {
        apartment: apartmentId,
        vendor: orderDetails.vendor,
        order: firstOrder.orderId,
        product: product?.id || null,
        product_name: product?.product || '',
        type: formData.issueTypes.join(', '),
        description: fullDescription,
        priority: formData.priority,
        expected_resolution: formData.expectedResolution || undefined,
        impact: formData.impact || undefined,
        replacement_eta: formData.replacementEta || undefined,
        ai_activated: formData.aiActivated,
        resolution_status: 'Open',
        resolution_type: formData.resolutionType || undefined,
        resolution_notes: formData.resolutionNotes || undefined,
        auto_notify_vendor: formData.autoNotifyVendor,
        items_data: itemsData,
      };

      await onSubmit(issueData, existingIssueId);
      toast.success(existingIssueId ? 'Issue updated successfully' : `Issue reported for ${selectedOrders.length} order(s)`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  const orders = product.order_status_info || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{existingIssueId ? 'Edit Issue' : 'Report Issue'} - {product.product}</DialogTitle>
          <DialogDescription>
            {loadingExistingIssue ? (
              'Loading issue data...'
            ) : step === 1 ? (
              `Step 1: Select which orders have this issue (${orders.length} order(s) available)`
            ) : (
              'Step 2: Describe the issue and set priority'
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loadingExistingIssue ? (
            <div className="space-y-4 py-4">
              {/* Product Info Skeleton */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Skeleton className="w-16 h-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Order Selection Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
          {step === 1 && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {product.product_image ? (
                  <img 
                    src={product.product_image} 
                    alt={product.product} 
                    className="w-16 h-16 rounded object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded flex items-center justify-center border bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{product.product}</h4>
                  <p className="text-sm text-muted-foreground">{product.sku || 'N/A'}</p>
                </div>
              </div>

              {/* Orders List - Simple Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Select orders with issues:
                  </p>
                  {selectedOrders.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedOrders.length} selected • {totalQuantity} units total
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {orders.map((orderInfo) => {
                    const selection = orderSelections[orderInfo.order_id];
                    
                    return (
                      <div 
                        key={orderInfo.order_id}
                        className={cn(
                          "border rounded-lg p-3 transition-all cursor-pointer hover:bg-muted/50",
                          selection?.selected && "ring-2 ring-primary border-primary bg-primary/5"
                        )}
                        onClick={() => toggleOrderSelection(orderInfo.order_id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selection?.selected || false}
                            onCheckedChange={() => toggleOrderSelection(orderInfo.order_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm">{orderInfo.po_number}</h4>
                              <Badge variant="outline" className="text-xs">{orderInfo.status}</Badge>
                              <span className="text-xs text-muted-foreground">• {orderInfo.quantity} units</span>
                              {orderInfo.expected_delivery && (
                                <span className="text-xs text-muted-foreground">
                                  • Expected: {new Date(orderInfo.expected_delivery).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {orderInfo.shipping_address && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {orderInfo.shipping_address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedOrders.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    Select at least one order to continue
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Summary of Selected Orders */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Selected Orders Summary
                </h4>
                <div className="space-y-1 text-xs">
                  {selectedOrders.map(order => (
                    <div key={order.orderId} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {order.orderInfo?.po_number} • {order.orderInfo?.expected_delivery ? new Date(order.orderInfo.expected_delivery).toLocaleDateString() : 'N/A'}
                      </span>
                      <Badge variant="outline" className="text-xs">{order.quantity} units</Badge>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t flex items-center justify-between font-semibold">
                    <span>Total Affected Quantity:</span>
                    <span className="text-primary">{totalQuantity} units</span>
                  </div>
                </div>
              </div>

              {/* Single Issue Form for All Orders */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issue Details
                </h4>
                
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      Issue Type(s) *
                    </Label>
                    <MultiSelectTags
                      options={issueTypes}
                      value={formData.issueTypes}
                      onChange={(v) => setFormData(prev => ({ ...prev, issueTypes: v }))}
                      placeholder="Select issue types (e.g., Broken/Damaged, Wrong Item)"
                      allowCustom={true}
                      customPlaceholder="Custom issue type..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Issue Description *
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the issue in detail... (This will be sent to the vendor with order context)"
                        rows={4}
                        className="pr-10"
                      />
                      <div className="absolute top-2 right-2">
                        <AITextEnhancer
                          text={formData.description}
                          onTextEnhanced={(enhanced) => setFormData(prev => ({ ...prev, description: enhanced }))}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Order details (PO numbers, dates, quantities) will be automatically included for the vendor
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority & Impact */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority & Impact
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(pr => (
                          <SelectItem key={pr.value} value={pr.value}>
                            <Badge className={pr.color}>{pr.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Impact</Label>
                    <Select value={formData.impact} onValueChange={v => setFormData(p => ({ ...p, impact: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                      <SelectContent>
                        {impactLevels.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Expected Resolution</Label>
                    <Input 
                      type="date" 
                      value={formData.expectedResolution} 
                      onChange={e => setFormData(p => ({ ...p, expectedResolution: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Replacement ETA</Label>
                    <Input 
                      type="date" 
                      value={formData.replacementEta} 
                      onChange={e => setFormData(p => ({ ...p, replacementEta: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolution
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Resolution Type</Label>
                    <Select value={formData.resolutionType} onValueChange={v => setFormData(p => ({ ...p, resolutionType: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input 
                      value={formData.resolutionNotes} 
                      onChange={e => setFormData(p => ({ ...p, resolutionNotes: e.target.value }))} 
                      placeholder="Resolution notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="ai" 
                    checked={formData.aiActivated} 
                    onCheckedChange={c => setFormData(p => ({ ...p, aiActivated: c as boolean }))} 
                  />
                  <Label htmlFor="ai" className="text-sm">Enable AI-assisted communication</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="notify" 
                    checked={formData.autoNotifyVendor} 
                    onCheckedChange={c => setFormData(p => ({ ...p, autoNotifyVendor: c as boolean }))} 
                  />
                  <Label htmlFor="notify" className="text-sm">Auto-notify vendor</Label>
                </div>
              </div>

              {/* Final Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Report Summary:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product: {product.product}</li>
                  <li>• Affected Orders: {selectedOrders.length}</li>
                  <li>• Total Quantity: {totalQuantity} units</li>
                  <li>• Issue Types: {formData.issueTypes.length > 0 ? formData.issueTypes.join(', ') : 'Not set'}</li>
                  <li>• Priority: {formData.priority || 'Not set'}</li>
                </ul>
              </div>
            </div>
          )}
            </>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between sm:justify-between">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!canProceedToDetails}
              >
                Next: Describe Issue ({selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''})
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Orders
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !formData.priority || !formData.issueTypes.length || !formData.description.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : existingIssueId ? (
                  `Update Issue for ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''}`
                ) : (
                  `Report Issue for ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
