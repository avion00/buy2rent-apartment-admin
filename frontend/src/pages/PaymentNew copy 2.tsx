import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { useCreatePayment } from "@/hooks/usePaymentApi";
import { useOrders } from "@/hooks/useOrderApi";
import { orderApi, Order } from "@/services/orderApi";
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Building2, 
  DollarSign, 
  FileText, 
  Calendar,
  CreditCard,
  Wallet,
  Building,
  Store,
  Receipt,
  Banknote,
  Package,
  CheckCircle2,
  ShoppingCart,
  Truck,
  Hash,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
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

const PaymentNew = () => {
  const navigate = useNavigate();

  // Fetch orders
  const { orders, loading: ordersLoading } = useOrders({ page_size: 100 });
  
  // State
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    due_date: "",
    amount_paid: "0",
    status: "Unpaid",
    payment_method: "Bank Transfer",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // API Mutations
  const createPaymentMutation = useCreatePayment();

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => 
      order.po_number?.toLowerCase().includes(query) ||
      order.apartment_name?.toLowerCase().includes(query) ||
      order.vendor_name?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Fetch full order details when selected
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedOrderId) {
        setSelectedOrder(null);
        return;
      }
      
      setOrderLoading(true);
      try {
        const orderData = await orderApi.getOrder(selectedOrderId);
        setSelectedOrder(orderData);
      } catch (err) {
        toast.error("Failed to load order details");
        setSelectedOrder(null);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderDetails();
  }, [selectedOrderId]);

  // Calculate totals from selected order
  const orderTotal = useMemo(() => {
    if (!selectedOrder) return 0;
    return parseFloat(String(selectedOrder.total || 0));
  }, [selectedOrder]);

  const outstandingBalance = useMemo(() => {
    const paid = parseFloat(formData.amount_paid || "0");
    return (orderTotal - paid).toFixed(2);
  }, [orderTotal, formData.amount_paid]);

  // Get product IDs from order items
  const productIds = useMemo(() => {
    if (!selectedOrder?.items) return [];
    return selectedOrder.items.map(item => item.product).filter(Boolean);
  }, [selectedOrder]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedOrder) newErrors.order = "Please select an order";
    if (!formData.due_date) newErrors.due_date = "Due date is required";
    
    const amountPaid = parseFloat(formData.amount_paid || "0");
    if (amountPaid < 0) newErrors.amount_paid = "Amount paid cannot be negative";
    if (amountPaid > orderTotal) newErrors.amount_paid = "Amount paid cannot exceed total";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedOrder) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const amountPaid = parseFloat(formData.amount_paid || "0");
      let status = "Unpaid";
      if (amountPaid >= orderTotal) status = "Paid";
      else if (amountPaid > 0) status = "Partial";

      const paymentData = {
        apartment: selectedOrder.apartment,
        vendor: selectedOrder.vendor,
        order_reference: selectedOrder.po_number,
        due_date: formData.due_date,
        total_amount: orderTotal.toFixed(2),
        amount_paid: formData.amount_paid || "0",
        status: status,
        notes: formData.notes,
        products: productIds,
      };

      await createPaymentMutation.mutateAsync(paymentData);
      toast.success("Payment created successfully");
      navigate("/payments");
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error(error.response?.data?.message || "Failed to create payment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <PageLayout title="Create New Payment">
      <div className="container px-0 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/payments">Payments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create New Payment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Payment</h1>
            <p className="text-sm text-muted-foreground">
              Select an order to create a payment record
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Order */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Order</CardTitle>
                  <CardDescription>Choose an order to create payment for</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number, apartment, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Order Selection */}
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                        selectedOrderId === order.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedOrderId === order.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {selectedOrderId === order.id ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Receipt className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{order.po_number}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {order.apartment_name}
                              <span className="text-muted-foreground/50">•</span>
                              <Store className="h-3 w-3" />
                              {order.vendor_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">€{parseFloat(String(order.total || 0)).toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.order && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.order}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Details (shown when order is selected) */}
          {selectedOrderId && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Products and quantities from the selected order</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {orderLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : selectedOrder ? (
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">PO Number</p>
                        <p className="font-semibold">{selectedOrder.po_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Apartment</p>
                        <p className="font-medium">{selectedOrder.apartment_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vendor</p>
                        <p className="font-medium">{selectedOrder.vendor_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                      </div>
                    </div>

                    {/* Items Table */}
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.items.map((item, idx) => (
                              <TableRow key={item.id || idx}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {item.product_image ? (
                                      <img 
                                        src={item.product_image} 
                                        alt={item.product_name || 'Product'}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
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
                                <TableCell className="text-center">
                                  <Badge variant="outline">{item.quantity}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  €{parseFloat(String(item.unit_price || 0)).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  €{parseFloat(String(item.total_price || 0)).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No items in this order</p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex justify-end">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Order Total</span>
                          <span className="text-xl font-bold text-primary">
                            €{orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {selectedOrder && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Set payment due date and amount</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Due Date *
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange("due_date", e.target.value)}
                      className={errors.due_date ? "border-destructive" : ""}
                    />
                    {errors.due_date && (
                      <p className="text-sm text-destructive">{errors.due_date}</p>
                    )}
                  </div>

                  {/* Amount Paid */}
                  <div className="space-y-2">
                    <Label htmlFor="amount_paid" className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      Amount Paid (€)
                    </Label>
                    <Input
                      id="amount_paid"
                      type="number"
                      step="0.01"
                      min="0"
                      max={orderTotal}
                      value={formData.amount_paid}
                      onChange={(e) => handleInputChange("amount_paid", e.target.value)}
                      className={errors.amount_paid ? "border-destructive" : ""}
                    />
                    {errors.amount_paid && (
                      <p className="text-sm text-destructive">{errors.amount_paid}</p>
                    )}
                  </div>

                  {/* Outstanding Balance */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      Outstanding Balance
                    </Label>
                    <Input
                      value={`€${outstandingBalance}`}
                      readOnly
                      className="bg-muted font-semibold text-primary"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(v) => handleInputChange("payment_method", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="Card Payment">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Card Payment
                        </div>
                      </SelectItem>
                      <SelectItem value="Cash">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/payments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedOrder || createPaymentMutation.isPending}>
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default PaymentNew;
