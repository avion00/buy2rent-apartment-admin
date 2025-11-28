import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDataStore } from "@/stores/useDataStore";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { apartments, vendors, updateProduct, addActivity } = useDataStore();
  const product = useDataStore((state) => state.products.find((p) => p.id === id));
  const apartment = apartments.find((a) => a.id === product?.apartmentId);

  const [formData, setFormData] = useState<{
    product: string;
    vendor: string;
    sku: string;
    unitPrice: string;
    qty: string;
    status: string;
    expectedDeliveryDate: string;
    actualDeliveryDate: string;
    paymentStatus: string;
    paymentDueDate: string;
    issueState: string;
    orderedOn: string;
    imageUrl: string;
    notes: string;
    deliveryType: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    deliveryCountry: string;
    deliveryInstructions: string;
    deliveryContactPerson: string;
    deliveryContactPhone: string;
    deliveryContactEmail: string;
    trackingNumber: string;
    deliveryTimeWindow: string;
    deliveryNotes: string;
  }>({
    product: "",
    vendor: "",
    sku: "",
    unitPrice: "",
    qty: "",
    status: "Design Approved",
    expectedDeliveryDate: "",
    actualDeliveryDate: "",
    paymentStatus: "Unpaid",
    paymentDueDate: "",
    issueState: "No Issue",
    orderedOn: "",
    imageUrl: "",
    notes: "",
    deliveryType: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    deliveryCountry: "",
    deliveryInstructions: "",
    deliveryContactPerson: "",
    deliveryContactPhone: "",
    deliveryContactEmail: "",
    trackingNumber: "",
    deliveryTimeWindow: "",
    deliveryNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        product: product.product,
        vendor: product.vendor,
        sku: product.sku,
        unitPrice: product.unitPrice.toString(),
        qty: product.qty.toString(),
        status: product.status || "Design Approved",
        expectedDeliveryDate: product.expectedDeliveryDate || "",
        actualDeliveryDate: product.actualDeliveryDate || "",
        paymentStatus: product.paymentStatus || "Unpaid",
        paymentDueDate: product.paymentDueDate || "",
        issueState: product.issueState || "No Issue",
        orderedOn: product.orderedOn || "",
        imageUrl: product.imageUrl || "",
        notes: product.notes || "",
        deliveryType: product.deliveryType || "",
        deliveryAddress: product.deliveryAddress || "",
        deliveryCity: product.deliveryCity || "",
        deliveryPostalCode: product.deliveryPostalCode || "",
        deliveryCountry: product.deliveryCountry || "",
        deliveryInstructions: product.deliveryInstructions || "",
        deliveryContactPerson: product.deliveryContactPerson || "",
        deliveryContactPhone: product.deliveryContactPhone || "",
        deliveryContactEmail: product.deliveryContactEmail || "",
        trackingNumber: product.trackingNumber || "",
        deliveryTimeWindow: product.deliveryTimeWindow || "",
        deliveryNotes: product.deliveryNotes || "",
      });
    }
  }, [product]);

  if (!product || !apartment) {
    return (
      <PageLayout title="Product Not Found">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Product not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/apartments")}>Back to Apartments</Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product.trim()) newErrors.product = "Product name is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) newErrors.unitPrice = "Valid unit price is required";
    if (!formData.qty || parseInt(formData.qty) <= 0) newErrors.qty = "Valid quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    const unitPrice = parseFloat(formData.unitPrice);
    const qty = parseInt(formData.qty);
    const total = unitPrice * qty;

    const updatedProduct = {
      product: formData.product,
      vendor: formData.vendor,
      sku: formData.sku,
      unitPrice,
      qty,
      status: formData.status as any,
      statusTags: [formData.status],
      expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      actualDeliveryDate: formData.actualDeliveryDate || undefined,
      paymentStatus: formData.paymentStatus as any,
      paymentDueDate: formData.paymentDueDate || undefined,
      paymentAmount: total,
      issueState: formData.issueState as any,
      orderedOn: formData.orderedOn || undefined,
      imageUrl: formData.imageUrl || undefined,
      notes: formData.notes || undefined,
      deliveryType: formData.deliveryType || undefined,
      deliveryAddress: formData.deliveryAddress || undefined,
      deliveryCity: formData.deliveryCity || undefined,
      deliveryPostalCode: formData.deliveryPostalCode || undefined,
      deliveryCountry: formData.deliveryCountry || undefined,
      deliveryInstructions: formData.deliveryInstructions || undefined,
      deliveryContactPerson: formData.deliveryContactPerson || undefined,
      deliveryContactPhone: formData.deliveryContactPhone || undefined,
      deliveryContactEmail: formData.deliveryContactEmail || undefined,
      trackingNumber: formData.trackingNumber || undefined,
      deliveryTimeWindow: formData.deliveryTimeWindow || undefined,
      deliveryNotes: formData.deliveryNotes || undefined,
    };

    updateProduct(product.id, updatedProduct);

    addActivity({
      apartmentId: product.apartmentId,
      actor: "Admin",
      icon: "Edit",
      summary: `Updated product: ${formData.product}`,
      type: "product",
    });

    toast({
      title: "Product updated",
      description: `${formData.product} has been updated successfully.`,
    });

    navigate(`/products/${product.id}`);
  };

  const total = formData.unitPrice && formData.qty ? parseFloat(formData.unitPrice) * parseInt(formData.qty) : 0;

  return (
    <PageLayout title="Edit Product">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apartments/${apartment.id}`}>{apartment.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/products/${product.id}`}>{product.product}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product">Product Name *</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    placeholder="Modern Sofa"
                  />
                  {errors.product && <p className="text-sm text-destructive">{errors.product}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.name}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor && <p className="text-sm text-destructive">{errors.vendor}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SOFA-001"
                  />
                  {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (HUF) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="150000"
                  />
                  {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="1"
                  />
                  {errors.qty && <p className="text-sm text-destructive">{errors.qty}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Total Amount</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center">
                    <span className="font-semibold text-lg">{total.toLocaleString()} HUF</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Product Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design Approved">Design Approved</SelectItem>
                      <SelectItem value="Ready To Order">Ready To Order</SelectItem>
                      <SelectItem value="Ordered">Ordered</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueState">Issue State</Label>
                  <Select
                    value={formData.issueState}
                    onValueChange={(value: any) => setFormData({ ...formData, issueState: value })}
                  >
                    <SelectTrigger id="issueState">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No Issue">No Issue</SelectItem>
                      <SelectItem value="Issue Reported">Issue Reported</SelectItem>
                      <SelectItem value="AI Resolving">AI Resolving</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="orderedOn">Ordered On</Label>
                  <Input
                    id="orderedOn"
                    type="date"
                    value={formData.orderedOn}
                    onChange={(e) => setFormData({ ...formData, orderedOn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDeliveryDate">Actual Delivery</Label>
                  <Input
                    id="actualDeliveryDate"
                    type="date"
                    value={formData.actualDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, actualDeliveryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDueDate">Payment Due</Label>
                  <Input
                    id="paymentDueDate"
                    type="date"
                    value={formData.paymentDueDate}
                    onChange={(e) => setFormData({ ...formData, paymentDueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                >
                  <SelectTrigger id="paymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Delivery Location Details</h3>
                
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryType">Delivery Service</Label>
                      <Select
                        value={formData.deliveryType}
                        onValueChange={(value) => setFormData({ ...formData, deliveryType: value })}
                      >
                        <SelectTrigger id="deliveryType">
                          <SelectValue placeholder="Select delivery service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DPD Hungary">DPD Hungary</SelectItem>
                          <SelectItem value="GLS Hungary">GLS Hungary</SelectItem>
                          <SelectItem value="Sameday Courier Hungary">Sameday Courier Hungary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        value={formData.trackingNumber}
                        onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                        placeholder="DPD-HU-2025-1234"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Input
                        id="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        placeholder="Street address, floor, apartment"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">City</Label>
                      <Input
                        id="deliveryCity"
                        value={formData.deliveryCity}
                        onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                        placeholder="Budapest"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryPostalCode">Postal Code</Label>
                      <Input
                        id="deliveryPostalCode"
                        value={formData.deliveryPostalCode}
                        onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                        placeholder="1061"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryCountry">Country</Label>
                      <Input
                        id="deliveryCountry"
                        value={formData.deliveryCountry}
                        onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                        placeholder="Hungary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTimeWindow">Delivery Time Window</Label>
                    <Input
                      id="deliveryTimeWindow"
                      value={formData.deliveryTimeWindow}
                      onChange={(e) => setFormData({ ...formData, deliveryTimeWindow: e.target.value })}
                      placeholder="09:00 - 12:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                    <EnhancedTextarea
                      id="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                      placeholder="How to receive the delivery (e.g., ring doorbell, use elevator, call before arrival)..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-semibold mb-3">Contact Information</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryContactPerson">Contact Person</Label>
                        <Input
                          id="deliveryContactPerson"
                          value={formData.deliveryContactPerson}
                          onChange={(e) => setFormData({ ...formData, deliveryContactPerson: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryContactPhone">Contact Phone</Label>
                        <Input
                          id="deliveryContactPhone"
                          value={formData.deliveryContactPhone}
                          onChange={(e) => setFormData({ ...formData, deliveryContactPhone: e.target.value })}
                          placeholder="+36 20 123 4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryContactEmail">Contact Email</Label>
                        <Input
                          id="deliveryContactEmail"
                          type="email"
                          value={formData.deliveryContactEmail}
                          onChange={(e) => setFormData({ ...formData, deliveryContactEmail: e.target.value })}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Additional Delivery Notes</Label>
                    <EnhancedTextarea
                      id="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                      placeholder="Any special notes about the delivery..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Product Notes</Label>
                <EnhancedTextarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this product..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(`/products/${product.id}`)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ProductEdit;
