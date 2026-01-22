import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreatePaymentFromOrder, usePayments } from "@/hooks/usePaymentApi";
import { paymentApi } from "@/services/paymentApi";
import { useOrders } from "@/hooks/useOrderApi";
import { Order, OrderItem, orderApi } from "@/services/orderApi";
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  DollarSign, 
  Calendar,
  CreditCard,
  Building,
  Receipt,
  Banknote,
  Package,
  CheckCircle2,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Search,
  ChevronRight,
  Wallet,
  Building2,
  User,
  Clock,
  FileText,
  Check
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Step type for the wizard
type Step = 'select-order' | 'review-items' | 'payment-details';

const PaymentNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState<Step>('select-order');
  
  // Selected order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Selected items from the order
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Payment form data
  const [paymentData, setPaymentData] = useState({
    due_date: "",
    total_amount: "",
    needs_to_pay: "",
    shipping_cost: "",
    discount: "",
    payment_method: "Bank Transfer",
    reference_number: "",
    notes: "",
    // Bank Transfer fields
    bank_name: "",
    account_holder: "",
    account_number: "",
    iban: "",
    // Card Payment fields
    card_holder: "",
    card_last_four: "",
  });
  
  // Search/filter for orders
  const [orderSearch, setOrderSearch] = useState("");
  
  // Loading state for fetching order details
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  
  // Fetch orders
  const { orders, loading: loadingOrders } = useOrders({ page_size: 100 });
  
  // Fetch existing payments to filter out fully paid orders
  const { data: paymentsData } = usePayments({ page_size: 200 });
  const existingPayments = paymentsData?.results || [];
  
  // Create payment mutation
  const createPaymentMutation = useCreatePaymentFromOrder();
  
  // Get map of order IDs to their payment status
  const orderPaymentStatus = useMemo(() => {
    const statusMap = new Map<string, { status: string; paymentId: string }>();
    existingPayments.forEach(payment => {
      if (payment.order) {
        // If order already has a payment, store its status
        // Prioritize "Paid" status if multiple payments exist
        const existing = statusMap.get(payment.order);
        if (!existing || payment.status === 'Paid') {
          statusMap.set(payment.order, { status: payment.status, paymentId: payment.id });
        }
      }
    });
    return statusMap;
  }, [existingPayments]);
  
  // Filter orders: exclude orders that are already fully paid
  const availableOrders = useMemo(() => {
    return orders.filter(order => {
      const paymentInfo = orderPaymentStatus.get(order.id);
      // Exclude orders that are fully paid
      return !paymentInfo || paymentInfo.status !== 'Paid';
    });
  }, [orders, orderPaymentStatus]);
  
  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return availableOrders;
    const search = orderSearch.toLowerCase();
    return availableOrders.filter(order => 
      order.po_number?.toLowerCase().includes(search) ||
      order.vendor_name?.toLowerCase().includes(search) ||
      order.apartment_name?.toLowerCase().includes(search)
    );
  }, [availableOrders, orderSearch]);
  
  // Calculate totals from selected items
  const selectedItemsTotal = useMemo(() => {
    if (!selectedOrder || !selectedOrder.items || selectedItems.length === 0) return 0;
    return selectedOrder.items
      .filter(item => selectedItems.includes(item.id || ''))
      .reduce((sum, item) => {
        const price = parseFloat(String(item.unit_price || 0));
        const qty = item.quantity || 1;
        return sum + (price * qty);
      }, 0);
  }, [selectedOrder, selectedItems]);
  
  // When order is selected, auto-select items based on URL parameter
  useEffect(() => {
    if (selectedOrder && selectedOrder.items) {
      const productIdFromUrl = searchParams.get('product');
      
      if (productIdFromUrl) {
        // Only select the specific product from URL
        const matchingItem = selectedOrder.items.find(item => item.product === productIdFromUrl);
        if (matchingItem && matchingItem.id) {
          setSelectedItems([matchingItem.id]);
        } else {
          // If product not found, select all items as fallback
          setSelectedItems(selectedOrder.items.map(item => item.id || '').filter(Boolean));
        }
      } else {
        // No product specified, select all items
        setSelectedItems(selectedOrder.items.map(item => item.id || '').filter(Boolean));
      }
      
      // Set due date from order's expected_delivery or default to 30 days from now
      let defaultDueDate: Date;
      if (selectedOrder.expected_delivery) {
        defaultDueDate = new Date(selectedOrder.expected_delivery);
      } else {
        defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      }
      
      setPaymentData(prev => ({
        ...prev,
        due_date: defaultDueDate.toISOString().split('T')[0],
        total_amount: "",
        needs_to_pay: "0",
        shipping_cost: "0",
        discount: "0",
      }));
    }
  }, [selectedOrder, searchParams]);
  
  // Update total amount when selected items change
  useEffect(() => {
    if (selectedItemsTotal > 0) {
      setPaymentData(prev => ({
        ...prev,
        total_amount: Math.round(selectedItemsTotal).toString(),
      }));
    }
  }, [selectedItemsTotal]);
  
  // Auto-select order from URL parameter
  useEffect(() => {
    const orderIdFromUrl = searchParams.get('order');
    if (orderIdFromUrl && orders.length > 0 && !selectedOrder) {
      const orderToSelect = orders.find(order => order.id === orderIdFromUrl);
      if (orderToSelect) {
        handleSelectOrder(orderToSelect);
      }
    }
  }, [searchParams, orders, selectedOrder]);
  
  // Calculate final total (with shipping and discount)
  const finalTotal = useMemo(() => {
    const subtotal = parseInt(paymentData.total_amount) || 0;
    const shipping = parseInt(paymentData.shipping_cost) || 0;
    const discount = parseInt(paymentData.discount) || 0;
    return subtotal + shipping - discount;
  }, [paymentData.total_amount, paymentData.shipping_cost, paymentData.discount]);
  
  // Calculate outstanding balance
  const outstandingBalance = useMemo(() => {
    const needsToPay = parseInt(paymentData.needs_to_pay) || 0;
    return finalTotal - needsToPay;
  }, [finalTotal, paymentData.needs_to_pay]);
  
  // Handle order selection - fetch full order details with items
  const handleSelectOrder = async (order: Order) => {
    setLoadingOrderDetails(true);
    try {
      // Fetch full order details including items
      const fullOrder = await orderApi.getOrder(order.id);
      setSelectedOrder(fullOrder);
      setCurrentStep('review-items');
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  };
  
  // Handle item toggle
  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Handle select all items
  const handleSelectAllItems = () => {
    if (!selectedOrder || !selectedOrder.items) return;
    const allItemIds = selectedOrder.items.map(item => item.id || '').filter(Boolean);
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order");
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    if (!paymentData.due_date) {
      toast.error("Please set a due date");
      return;
    }
    
    try {
      const initialAmountPaid = parseInt(paymentData.needs_to_pay) || 0;
      
      // Use the new order-based payment creation with all fields
      // Set amount_paid to 0 initially - it will be updated by payment history
      const paymentRequest = {
        order: selectedOrder.id,
        order_items: selectedItems,
        due_date: paymentData.due_date,
        // Amount fields
        total_amount: parseInt(paymentData.total_amount) || 0,
        shipping_cost: parseInt(paymentData.shipping_cost) || 0,
        discount: parseInt(paymentData.discount) || 0,
        amount_paid: 0, // Start with 0, will be updated by payment history
        // Payment method
        payment_method: paymentData.payment_method as 'Bank Transfer' | 'Card Payment' | 'Cash',
        reference_number: paymentData.reference_number,
        notes: paymentData.notes,
        // Bank Transfer details
        bank_name: paymentData.bank_name,
        account_holder: paymentData.account_holder,
        account_number: paymentData.account_number,
        iban: paymentData.iban,
        // Card Payment details
        card_holder: paymentData.card_holder,
        card_last_four: paymentData.card_last_four,
      };
      
      const createdPayment = await createPaymentMutation.mutateAsync(paymentRequest);
      
      // If there's an initial payment amount, create a payment history record
      if (initialAmountPaid > 0) {
        await paymentApi.createPaymentHistory({
          payment: createdPayment.id,
          date: new Date().toISOString().split('T')[0],
          amount: initialAmountPaid,
          method: paymentData.payment_method || 'Bank Transfer',
          reference_no: paymentData.reference_number || '',
          note: 'Initial payment when creating payment record',
        });
      }
      
      toast.success("Payment created successfully!");
      navigate("/payments");
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error(error.response?.data?.message || "Failed to create payment");
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      delivered: "bg-green-500/10 text-green-600 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    };
    return colors[status?.toLowerCase()] || "bg-gray-500/10 text-gray-600";
  };
  
  // Steps configuration
  const steps = [
    { id: 'select-order', label: 'Select Order', icon: ShoppingCart },
    { id: 'review-items', label: 'Review Items', icon: Package },
    { id: 'payment-details', label: 'Payment Details', icon: CreditCard },
  ];
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <PageLayout title="Create Payment">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/payments")}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Payment</h1>
            <p className="text-muted-foreground mt-1">
              Create a payment record from an existing order
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={cn(
                    "mt-2 text-sm font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Select Order */}
        {currentStep === 'select-order' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Select an Order</CardTitle>
                  <CardDescription>
                    Choose an order to create a payment record
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number, vendor, or apartment..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Orders Table */}
              {loadingOrders || loadingOrderDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">
                    {loadingOrderDetails ? "Loading order details..." : "Loading orders..."}
                  </span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">No orders found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">PO Number</TableHead>
                        <TableHead className="font-semibold">Apartment</TableHead>
                        <TableHead className="font-semibold">Vendor</TableHead>
                        <TableHead className="font-semibold text-center">Items</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const total = parseFloat(String(order.total || 0));
                        
                        return (
                          <TableRow
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectedOrder?.id === order.id 
                                ? "bg-primary/5" 
                                : "hover:bg-muted/50"
                            )}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{order.po_number}</span>
                                <Badge variant="outline" className={cn("text-xs", getStatusColor(order.status))}>
                                  {order.status}
                                </Badge>
                                {orderPaymentStatus.get(order.id)?.status === 'Partial' && (
                                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                                    Has Payment
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">{order.apartment_name || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">{order.vendor_name || 'N/A'}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-muted-foreground">{order.items_count || order.items?.length || 0}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {order.placed_on 
                                  ? format(new Date(order.placed_on), 'MMM dd, yyyy')
                                  : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-primary">
                                {total.toLocaleString()} HUF
                              </span>
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Items */}
        {currentStep === 'review-items' && selectedOrder && (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Selected Order</p>
                    <h2 className="text-2xl font-bold">{selectedOrder.po_number}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedOrder.apartment_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedOrder.vendor_name}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentStep('select-order')}>
                    Change Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Order Items</CardTitle>
                      <CardDescription>
                        Select items to include in this payment
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedItems.length === (selectedOrder.items?.length || 0)}
                      onCheckedChange={handleSelectAllItems}
                    />
                    <Label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
                      Select All ({selectedItems.length}/{selectedOrder.items?.length || 0})
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedOrder.items || []).map((item) => {
                        const isSelected = selectedItems.includes(item.id || '');
                        const unitPrice = parseFloat(String(item.unit_price || 0));
                        const total = unitPrice * (item.quantity || 1);
                        
                        return (
                          <TableRow 
                            key={item.id}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                            )}
                            onClick={() => handleItemToggle(item.id || '')}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleItemToggle(item.id || '')}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.product_image || item.product_image_url ? (
                                  <img 
                                    src={item.product_image || item.product_image_url} 
                                    alt={item.product_name || 'Product'}
                                    className="w-10 h-10 rounded-lg object-cover border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{item.product_name || 'Unknown Product'}</p>
                                  {item.sku && (
                                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {item.category_name || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {unitPrice.toLocaleString()} HUF
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {total.toLocaleString()} HUF
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Selected Total */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ready for payment
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-3xl font-bold text-primary">
                        {selectedItemsTotal.toLocaleString()} <span className="text-lg">HUF</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('select-order')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep('payment-details')}
                disabled={selectedItems.length === 0}
                className="gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {currentStep === 'payment-details' && selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Amount Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-500/10 rounded-xl">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Payment Amount</CardTitle>
                      <CardDescription>
                        Set the payment amounts
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Amount Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="total_amount" className="text-sm font-medium">
                        Total Amount (HUF) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="total_amount"
                        type="number"
                        step="1"
                        min="0"
                        value={paymentData.total_amount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, total_amount: e.target.value }))}
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    
                    {/* Amount Paid */}
                    <div className="space-y-2">
                      <Label htmlFor="needs_to_pay" className="text-sm font-medium">
                        Amount Paid (HUF)
                      </Label>
                      <Input
                        id="needs_to_pay"
                        type="number"
                        step="1"
                        min="0"
                        value={paymentData.needs_to_pay}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, needs_to_pay: e.target.value }))}
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    
                    {/* Outstanding Balance */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Outstanding Balance (HUF)</Label>
                      <div className={cn(
                        "h-11 px-3 flex items-center rounded-md border bg-muted/50 font-semibold",
                        outstandingBalance > 0 ? "text-red-600" : outstandingBalance < 0 ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {outstandingBalance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Shipping and Discount */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shipping Cost */}
                    <div className="space-y-2">
                      <Label htmlFor="shipping_cost" className="text-sm font-medium">
                        Shipping Cost (HUF) <span className="text-muted-foreground text-xs">(Optional)</span>
                      </Label>
                      <Input
                        id="shipping_cost"
                        type="number"
                        step="1"
                        min="0"
                        value={paymentData.shipping_cost}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, shipping_cost: e.target.value }))}
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    
                    {/* Discount */}
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm font-medium">
                        Discount (HUF) <span className="text-muted-foreground text-xs">(Optional)</span>
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        step="1"
                        min="0"
                        value={paymentData.discount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                  </div>
                  
                  {/* Final Total Display */}
                  {(parseInt(paymentData.shipping_cost) > 0 || parseInt(paymentData.discount) > 0) && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{parseInt(paymentData.total_amount || '0').toLocaleString()} HUF</span>
                      </div>
                      {parseInt(paymentData.shipping_cost) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">+ Shipping</span>
                          <span>{parseInt(paymentData.shipping_cost).toLocaleString()} HUF</span>
                        </div>
                      )}
                      {parseInt(paymentData.discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">- Discount</span>
                          <span className="text-green-600">-{parseInt(paymentData.discount).toLocaleString()} HUF</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Final Total</span>
                        <span className="text-primary">{finalTotal.toLocaleString()} HUF</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Due Date and Order Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Due Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={paymentData.due_date}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, due_date: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Order Reference
                      </Label>
                      <div className="h-11 px-3 flex items-center rounded-md border bg-muted/50 text-muted-foreground">
                        {selectedOrder.po_number}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Payment Details</CardTitle>
                      <CardDescription>
                        Configure payment method and details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Tabs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                      {[
                        { value: 'Bank Transfer', icon: Building, label: 'Bank Transfer' },
                        { value: 'Card Payment', icon: CreditCard, label: 'Card Payment' },
                        { value: 'Cash', icon: Banknote, label: 'Cash' },
                      ].map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentData.payment_method === method.value;
                        
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setPaymentData(prev => ({ ...prev, payment_method: method.value }))}
                            className={cn(
                              "py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2",
                              isSelected 
                                ? "bg-background shadow-sm text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank Transfer Fields */}
                  {paymentData.payment_method === 'Bank Transfer' && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_name" className="text-sm font-medium">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={paymentData.bank_name}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, bank_name: e.target.value }))}
                            placeholder="e.g., OTP Bank"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account_holder" className="text-sm font-medium">Account Holder</Label>
                          <Input
                            id="account_holder"
                            value={paymentData.account_holder}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, account_holder: e.target.value }))}
                            placeholder="Full name"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account_number" className="text-sm font-medium">Account Number</Label>
                          <Input
                            id="account_number"
                            value={paymentData.account_number}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, account_number: e.target.value }))}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="iban" className="text-sm font-medium">IBAN</Label>
                          <Input
                            id="iban"
                            value={paymentData.iban}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, iban: e.target.value }))}
                            placeholder="HU42 1177 3016 1111 1018 0000 0000"
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Payment Fields */}
                  {paymentData.payment_method === 'Card Payment' && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="card_holder" className="text-sm font-medium">Card Holder Name</Label>
                          <Input
                            id="card_holder"
                            value={paymentData.card_holder}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, card_holder: e.target.value }))}
                            placeholder="Name on card"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card_last_four" className="text-sm font-medium">Card Last 4 Digits</Label>
                          <Input
                            id="card_last_four"
                            value={paymentData.card_last_four}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, card_last_four: e.target.value.slice(0, 4) }))}
                            placeholder="1234"
                            maxLength={4}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash - No additional fields needed */}
                  {paymentData.payment_method === 'Cash' && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground text-center">
                        No additional details required for cash payment
                      </p>
                    </div>
                  )}

                  {/* Reference Number */}
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-sm font-medium">
                      Reference Number (Optional)
                    </Label>
                    <Input
                      id="reference"
                      value={paymentData.reference_number}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                      placeholder="e.g., INV-2025-001"
                      className="h-11"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('review-items')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createPaymentMutation.isPending || !paymentData.due_date || !paymentData.total_amount}
                  className="gap-2 px-8"
                >
                  {createPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Payment
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Number</span>
                      <span className="font-medium">{selectedOrder.po_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Apartment</span>
                      <span className="font-medium">{selectedOrder.apartment_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vendor</span>
                      <span className="font-medium">{selectedOrder.vendor_name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Selected</span>
                      <span className="font-medium">{selectedItems.length} of {selectedOrder.items?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{parseInt(paymentData.total_amount || '0').toLocaleString()} HUF</span>
                    </div>
                    {parseInt(paymentData.shipping_cost) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">+{parseInt(paymentData.shipping_cost).toLocaleString()} HUF</span>
                      </div>
                    )}
                    {parseInt(paymentData.discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-green-600">-{parseInt(paymentData.discount).toLocaleString()} HUF</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Final Total</span>
                      <span className="font-medium">{finalTotal.toLocaleString()} HUF</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium text-green-600">{parseInt(paymentData.needs_to_pay || '0').toLocaleString()} HUF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className={cn(
                        "font-medium",
                        outstandingBalance > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {outstandingBalance.toLocaleString()} HUF
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">
                        {paymentData.due_date 
                          ? format(new Date(paymentData.due_date), 'MMM dd, yyyy')
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">{paymentData.payment_method}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Outstanding Balance</span>
                      <span className="text-2xl font-bold text-primary">
                        {outstandingBalance.toLocaleString()} HUF
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      parseInt(paymentData.needs_to_pay || '0') > 0 
                        ? parseInt(paymentData.needs_to_pay || '0') >= finalTotal
                          ? "bg-green-500/10"
                          : "bg-blue-500/10"
                        : "bg-yellow-500/10"
                    )}>
                      <Clock className={cn(
                        "h-5 w-5",
                        parseInt(paymentData.needs_to_pay || '0') > 0 
                          ? parseInt(paymentData.needs_to_pay || '0') >= finalTotal
                            ? "text-green-600"
                            : "text-blue-600"
                          : "text-yellow-600"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">Payment Status</p>
                      <p className="text-sm text-muted-foreground">
                        {parseInt(paymentData.needs_to_pay || '0') <= 0 
                          ? "Will be created as Unpaid"
                          : parseInt(paymentData.needs_to_pay || '0') >= finalTotal
                            ? "Will be created as Paid"
                            : "Will be created as Partial"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PaymentNew;
