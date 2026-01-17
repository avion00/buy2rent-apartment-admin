import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
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
  CheckSquare
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
import { useApartments } from "@/hooks/useApartmentApi";
import { useVendors } from "@/hooks/useVendorApi";
import { useProducts } from "@/hooks/useProductApi";
import { usePayment, useUpdatePayment } from "@/hooks/usePaymentApi";
import PaymentEditSkeleton from "@/components/skeletons/PaymentEditSkeleton";

const PaymentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // State for form data
  const [formData, setFormData] = useState({
    // Order Information
    apartment: "",
    vendor: "",
    order_reference: "",
    due_date: "",
    
    // Payment Amount
    total_amount: "",
    amount_paid: "0",
    
    // Payment Details
    status: "Unpaid",
    last_payment_date: "",
    payment_method: "Bank Transfer", // Bank Transfer, Card Payment, Cash
    
    // Bank Transfer Details
    bank_name: "",
    account_holder: "",
    account_number: "",
    iban: "",
    swift_bic_code: "",
    
    // Card Payment Details
    card_number: "",
    card_holder_name: "",
    expiry_date: "",
    cvv: "",
    
    // Additional Notes
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // API Hooks
  const { data: paymentData, isLoading } = usePayment(id || "");
  const updatePaymentMutation = useUpdatePayment();

  // Fetch apartments
  const {
    data: apartmentsData,
    isLoading: isLoadingApartments,
  } = useApartments();
  const apartments = apartmentsData?.results || [];

  // Fetch vendors
  const {
    data: vendorsData,
    isLoading: isLoadingVendors,
  } = useVendors();
  const vendors = vendorsData?.results || [];

  // Fetch products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useProducts();
  const allProducts = productsData?.results || [];

  // Load payment data into form
  useEffect(() => {
    if (paymentData) {
      setFormData({
        apartment: paymentData.apartment,
        vendor: paymentData.vendor,
        order_reference: paymentData.order_reference,
        due_date: paymentData.due_date,
        total_amount: String(paymentData.total_amount),
        amount_paid: String(paymentData.amount_paid),
        status: paymentData.status,
        last_payment_date: paymentData.last_payment_date || "",
        payment_method: "Bank Transfer",
        bank_name: "",
        account_holder: "",
        account_number: "",
        iban: "",
        swift_bic_code: "",
        card_number: "",
        card_holder_name: "",
        expiry_date: "",
        cvv: "",
        notes: paymentData.notes,
      });
      setSelectedProducts(paymentData.products || []);
    }
  }, [paymentData]);

  // Calculate outstanding balance
  const outstandingBalance = formData.total_amount && formData.amount_paid
    ? (parseFloat(formData.total_amount) - parseFloat(formData.amount_paid)).toFixed(2)
    : "0.00";

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
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

    // Required fields
    if (!formData.apartment) newErrors.apartment = "Apartment is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.order_reference.trim()) newErrors.order_reference = "Order reference is required";
    if (!formData.due_date) newErrors.due_date = "Due date is required";
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0)
      newErrors.total_amount = "Valid total amount is required";

    // Validate amount paid
    if (formData.amount_paid && parseFloat(formData.amount_paid) < 0)
      newErrors.amount_paid = "Amount paid cannot be negative";
    if (formData.amount_paid && formData.total_amount && 
        parseFloat(formData.amount_paid) > parseFloat(formData.total_amount))
      newErrors.amount_paid = "Amount paid cannot exceed total amount";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!id) {
      toast.error("Payment ID is required");
      return;
    }

    try {
      // Prepare payment data
      const updateData = {
        apartment: formData.apartment,
        vendor: formData.vendor,
        order_reference: formData.order_reference,
        due_date: formData.due_date,
        total_amount: formData.total_amount,
        amount_paid: formData.amount_paid || "0",
        status: formData.status,
        last_payment_date: formData.last_payment_date || null,
        notes: formData.notes,
        products: selectedProducts,
      };

      // Call API to update payment
      await updatePaymentMutation.mutateAsync({ id, data: updateData });

      toast.success("Payment updated successfully");
      navigate("/payments");
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.response?.data?.message || "Failed to update payment");
    }
  };

  const handleCancel = () => {
    navigate("/payments");
  };

  // Show loading state
  if (isLoading || isLoadingApartments || isLoadingVendors) {
    return <PaymentEditSkeleton />;
  }

  return (
    <PageLayout title="Edit Payment">
      <div className="container px-0 py-6 ">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/payments">Payments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Payment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Payment</h1>
              <p className="text-muted-foreground mt-1">
                Update payment information and details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Order Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Apartment */}
                    <div className="space-y-2">
                      <Label htmlFor="apartment" className="required flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Apartment
                      </Label>
                      <Select
                        value={formData.apartment}
                        onValueChange={(value) => handleInputChange("apartment", value)}
                      >
                        <SelectTrigger
                          id="apartment"
                          className={errors.apartment ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Select apartment" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingApartments ? (
                            <SelectItem value="loading" disabled>
                              Loading apartments...
                            </SelectItem>
                          ) : apartments.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No apartments found
                            </SelectItem>
                          ) : (
                            apartments.map((apt: any) => (
                              <SelectItem key={apt.id} value={apt.id}>
                                {apt.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.apartment && (
                        <p className="text-sm text-destructive">{errors.apartment}</p>
                      )}
                    </div>

                    {/* Vendor */}
                    <div className="space-y-2">
                      <Label htmlFor="vendor" className="required flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        Vendor
                      </Label>
                      <Select
                        value={formData.vendor}
                        onValueChange={(value) => handleInputChange("vendor", value)}
                      >
                        <SelectTrigger
                          id="vendor"
                          className={errors.vendor ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingVendors ? (
                            <SelectItem value="loading" disabled>
                              Loading vendors...
                            </SelectItem>
                          ) : vendors.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No vendors found
                            </SelectItem>
                          ) : (
                            vendors.map((vendor: any) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.vendor && (
                        <p className="text-sm text-destructive">{errors.vendor}</p>
                      )}
                    </div>

                    {/* Order Reference */}
                    <div className="space-y-2">
                      <Label htmlFor="order_reference" className="required flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        Order Reference
                      </Label>
                      <Input
                        id="order_reference"
                        value={formData.order_reference}
                        onChange={(e) => handleInputChange("order_reference", e.target.value)}
                        placeholder="e.g., ORD-2025-001"
                        className={errors.order_reference ? "border-destructive" : ""}
                      />
                      {errors.order_reference && (
                        <p className="text-sm text-destructive">{errors.order_reference}</p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="required flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Due Date
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
                  </div>
            </CardContent>
          </Card>

          {/* Payment Amount Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Payment Amount</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="total_amount" className="required">
                        Total Amount (HUF)
                      </Label>
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.total_amount}
                        onChange={(e) => handleInputChange("total_amount", e.target.value)}
                        placeholder="0.00"
                        className={errors.total_amount ? "border-destructive" : ""}
                      />
                      {errors.total_amount && (
                        <p className="text-sm text-destructive">{errors.total_amount}</p>
                      )}
                    </div>

                    {/* Amount Paid */}
                    <div className="space-y-2">
                      <Label htmlFor="amount_paid">Amount Paid (HUF)</Label>
                      <Input
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount_paid}
                        onChange={(e) => handleInputChange("amount_paid", e.target.value)}
                        placeholder="0.00"
                        className={errors.amount_paid ? "border-destructive" : ""}
                      />
                      {errors.amount_paid && (
                        <p className="text-sm text-destructive">{errors.amount_paid}</p>
                      )}
                    </div>

                    {/* Balance (Calculated) */}
                    <div className="space-y-2">
                      <Label htmlFor="balance">Balance (HUF)</Label>
                      <Input
                        id="balance"
                        value={outstandingBalance}
                        readOnly
                        className="bg-muted text-primary font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">
                        Automatically calculated
                      </p>
                    </div>
                  </div>
            </CardContent>
          </Card>

          {/* Payment Details Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Payment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <Label>Payment Method</Label>
                      <Tabs value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="Bank Transfer">
                            <Building className="h-4 w-4 mr-2" />
                            Bank Transfer
                          </TabsTrigger>
                          <TabsTrigger value="Card Payment">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Card Payment
                          </TabsTrigger>
                          <TabsTrigger value="Cash">
                            <Banknote className="h-4 w-4 mr-2" />
                            Cash
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Bank Transfer Details */}
                    {formData.payment_method === "Bank Transfer" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-semibold text-sm">Bank Transfer Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              value={formData.bank_name}
                              onChange={(e) => handleInputChange("bank_name", e.target.value)}
                              placeholder="e.g., OTP Bank"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account_holder">Account Holder</Label>
                            <Input
                              id="account_holder"
                              value={formData.account_holder}
                              onChange={(e) => handleInputChange("account_holder", e.target.value)}
                              placeholder="Full name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                              id="account_number"
                              value={formData.account_number}
                              onChange={(e) => handleInputChange("account_number", e.target.value)}
                              placeholder="XXXX-XXXX-XXXX-XXXX"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="iban">IBAN</Label>
                            <Input
                              id="iban"
                              value={formData.iban}
                              onChange={(e) => handleInputChange("iban", e.target.value)}
                              placeholder="HU42 1177 3016 1111 1018 0000 0000"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="swift_bic_code">SWIFT/BIC Code</Label>
                            <Input
                              id="swift_bic_code"
                              value={formData.swift_bic_code}
                              onChange={(e) => handleInputChange("swift_bic_code", e.target.value)}
                              placeholder="e.g., OTPVHUHB"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Payment Details */}
                    {formData.payment_method === "Card Payment" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-semibold text-sm">Card Payment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="card_number">Card Number</Label>
                            <Input
                              id="card_number"
                              value={formData.card_number}
                              onChange={(e) => handleInputChange("card_number", e.target.value)}
                              placeholder="XXXX XXXX XXXX XXXX"
                              maxLength={19}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="card_holder_name">Card Holder Name</Label>
                            <Input
                              id="card_holder_name"
                              value={formData.card_holder_name}
                              onChange={(e) => handleInputChange("card_holder_name", e.target.value)}
                              placeholder="Name as on card"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="expiry_date">Expiry Date</Label>
                            <Input
                              id="expiry_date"
                              value={formData.expiry_date}
                              onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              placeholder="XXX"
                              maxLength={4}
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cash Payment */}
                    {formData.payment_method === "Cash" && (
                      <div className="p-6 border rounded-lg bg-muted/50 text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Cash payment selected. No additional details required.
                        </p>
                      </div>
                    )}

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <EnhancedTextarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Add any additional payment notes or instructions..."
                        rows={4}
                      />
                    </div>
                  </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updatePaymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePaymentMutation.isPending}>
              {updatePaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default PaymentEdit;
