import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { useCreateProduct, useProductCategories } from "@/hooks/useProductApi";
import { useApartment } from "@/hooks/useApartmentApi";
import { useVendors } from "@/hooks/useVendorApi";
import { ArrowLeft, Loader2 } from "lucide-react";

const ProductNew = () => {
  const [searchParams] = useSearchParams();
  const apartmentId = searchParams.get("apartmentId");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State must be declared before any conditional returns
  const [formData, setFormData] = useState({
    // API fields (snake_case)
    product: "",
    description: "",
    category: "",
    vendor: "",
    vendor_link: "",
    sku: "",
    unit_price: "",
    qty: 1,
    availability: "In Stock",
    status: "Design Approved",
    room: "",
    link: "",
    eta: "",
    ordered_on: "",
    expected_delivery_date: "",
    actual_delivery_date: "",
    payment_status: "Unpaid",
    payment_due_date: "",
    payment_amount: "",
    paid_amount: "0",
    currency: "HUF",
    delivery_type: "",
    issue_state: "No Issue",
    notes: "",
    // UI-only fields (for display, not sent to API)
    tracking_number: "",
    delivery_address: "",
    delivery_city: "",
    delivery_postal_code: "",
    delivery_country: "",
    delivery_time_window: "",
    delivery_instructions: "",
    delivery_contact_person: "",
    delivery_contact_phone: "",
    delivery_contact_email: "",
    delivery_notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // Fetch apartment data
  const { data: apartment, isLoading: isLoadingApartment } = useApartment(apartmentId);
  
  // Fetch categories for this apartment (only if apartmentId exists)
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useProductCategories(apartmentId);
  // API returns array directly, not wrapped in results
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  
  // Fetch vendors
  const { data: vendorsData, isLoading: isLoadingVendors, error: vendorsError } = useVendors();
  const vendors = vendorsData?.results || [];
  
  // Create product mutation
  const createProductMutation = useCreateProduct();

  useEffect(() => {
    if (!apartmentId) {
      toast({
        title: "Error",
        description: "Apartment ID is required",
        variant: "destructive",
      });
      navigate("/apartments");
    }
  }, [apartmentId, navigate, toast]);
  
  // Show warning if categories fail to load
  useEffect(() => {
    if (categoriesError && !isLoadingCategories) {
      toast({
        title: "Warning",
        description: "Failed to load categories. You can still add a product by entering the category ID manually.",
        variant: "destructive",
      });
    }
  }, [categoriesError, isLoadingCategories, toast]);
  
  // Show warning if vendors fail to load
  useEffect(() => {
    if (vendorsError && !isLoadingVendors) {
      toast({
        title: "Warning",
        description: "Failed to load vendors. You can still add a product by entering the vendor ID manually.",
        variant: "destructive",
      });
    }
  }, [vendorsError, isLoadingVendors, toast]);
  
  // Show loading state (only wait for apartment, categories can load in background)
  if (isLoadingApartment) {
    return (
      <PageLayout title="Loading...">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Loading apartment details...</h2>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product.trim()) newErrors.product = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) newErrors.unit_price = "Valid unit price is required";
    if (!formData.qty || formData.qty <= 0) newErrors.qty = "Valid quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use FormData if image is present, otherwise use JSON
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('apartment', apartmentId!);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('product', formData.product);
        formDataToSend.append('vendor', formData.vendor);
        formDataToSend.append('unit_price', formData.unit_price);
        formDataToSend.append('qty', formData.qty.toString());
        formDataToSend.append('availability', formData.availability);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('payment_status', formData.payment_status);
        formDataToSend.append('paid_amount', formData.paid_amount);
        formDataToSend.append('currency', formData.currency);
        formDataToSend.append('issue_state', formData.issue_state);
        formDataToSend.append('image_file', imageFile);
        
        // Debug: Log FormData contents
        console.log('📤 Sending FormData with image:');
        console.log('  - Image file:', imageFile);
        console.log('  - File name:', imageFile.name);
        console.log('  - File size:', imageFile.size);
        console.log('  - File type:', imageFile.type);
        for (let pair of formDataToSend.entries()) {
          console.log(`  - ${pair[0]}:`, pair[1]);
        }
        
        // Optional fields
        if (formData.description) formDataToSend.append('description', formData.description);
        if (formData.vendor_link) formDataToSend.append('vendor_link', formData.vendor_link);
        if (formData.sku) formDataToSend.append('sku', formData.sku);
        if (formData.room) formDataToSend.append('room', formData.room);
        if (formData.link) formDataToSend.append('link', formData.link);
        if (formData.eta) formDataToSend.append('eta', formData.eta);
        if (formData.ordered_on) formDataToSend.append('ordered_on', formData.ordered_on);
        if (formData.expected_delivery_date) formDataToSend.append('expected_delivery_date', formData.expected_delivery_date);
        if (formData.actual_delivery_date) formDataToSend.append('actual_delivery_date', formData.actual_delivery_date);
        if (formData.payment_due_date) formDataToSend.append('payment_due_date', formData.payment_due_date);
        if (formData.payment_amount) formDataToSend.append('payment_amount', formData.payment_amount);
        if (formData.delivery_type) formDataToSend.append('delivery_type', formData.delivery_type);
        if (formData.notes) formDataToSend.append('notes', formData.notes);

        // Call API with FormData
        await createProductMutation.mutateAsync(formDataToSend as any);
      } else {
        // Use JSON when no image
        const productData = {
          apartment: apartmentId!,
          category: formData.category,
          product: formData.product,
          description: formData.description || undefined,
          vendor: formData.vendor,
          vendor_link: formData.vendor_link || undefined,
          sku: formData.sku || undefined,
          unit_price: formData.unit_price,
          qty: formData.qty,
          availability: formData.availability,
          status: formData.status,
          room: formData.room || undefined,
          link: formData.link || undefined,
          eta: formData.eta || null,
          ordered_on: formData.ordered_on || null,
          expected_delivery_date: formData.expected_delivery_date || null,
          actual_delivery_date: formData.actual_delivery_date || null,
          payment_status: formData.payment_status,
          payment_due_date: formData.payment_due_date || null,
          payment_amount: formData.payment_amount || null,
          paid_amount: formData.paid_amount,
          currency: formData.currency,
          delivery_type: formData.delivery_type || undefined,
          issue_state: formData.issue_state,
          notes: formData.notes || undefined,
        };

        await createProductMutation.mutateAsync(productData);
      }
      
      navigate(`/apartments/${apartmentId}`);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (!apartment) {
    return (
      <PageLayout title="Apartment Not Found">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Apartment not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/apartments")}>Back to Apartments</Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const total = formData.unit_price && formData.qty ? parseFloat(formData.unit_price) * formData.qty : 0;

  return (
    <PageLayout title="Add Product">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apartments/${apartmentId}`}>{apartment.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/apartments/${apartmentId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Add Product</h1>
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
                  <Label htmlFor="category">Category *</Label>
                  {isLoadingCategories ? (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-input bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading categories...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Enter category UUID"
                    />
                  )}
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>
              </div>


            



              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  {isLoadingVendors ? (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-input bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading vendors...</span>
                    </div>
                  ) : vendors.length > 0 ? (
                    <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                      <SelectTrigger id="vendor">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor: any) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.company_name} - {vendor.website}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="Enter vendor UUID"
                    />
                  )}
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
                  <Label htmlFor="imageFile">Product Image</Label>
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-48 border rounded-md overflow-hidden bg-muted">
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{imageFile?.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a product image (JPG, PNG, GIF, etc.)
                  </p>
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
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
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
                    value={formData.issue_state}
                    onValueChange={(value: any) => setFormData({ ...formData, issue_state: value })}
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
                    value={formData.ordered_on}
                    onChange={(e) => setFormData({ ...formData, ordered_on: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDeliveryDate">Actual Delivery</Label>
                  <Input
                    id="actualDeliveryDate"
                    type="date"
                    value={formData.actual_delivery_date}
                    onChange={(e) => setFormData({ ...formData, actual_delivery_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDueDate">Payment Due</Label>
                  <Input
                    id="paymentDueDate"
                    type="date"
                    value={formData.payment_due_date}
                    onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value: any) => setFormData({ ...formData, payment_status: value })}
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
                        value={formData.delivery_type}
                        onValueChange={(value) => setFormData({ ...formData, delivery_type: value })}
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
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                        placeholder="DPD-HU-2025-1234"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Input
                        id="deliveryAddress"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                        placeholder="Street address, floor, apartment"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">City</Label>
                      <Input
                        id="deliveryCity"
                        value={formData.delivery_city}
                        onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                        placeholder="Budapest"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryPostalCode">Postal Code</Label>
                      <Input
                        id="deliveryPostalCode"
                        value={formData.delivery_postal_code}
                        onChange={(e) => setFormData({ ...formData, delivery_postal_code: e.target.value })}
                        placeholder="1061"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryCountry">Country</Label>
                      <Input
                        id="deliveryCountry"
                        value={formData.delivery_country}
                        onChange={(e) => setFormData({ ...formData, delivery_country: e.target.value })}
                        placeholder="Hungary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTimeWindow">Delivery Time Window</Label>
                    <Input
                      id="deliveryTimeWindow"
                      value={formData.delivery_time_window}
                      onChange={(e) => setFormData({ ...formData, delivery_time_window: e.target.value })}
                      placeholder="09:00 - 12:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                    <EnhancedTextarea
                      id="deliveryInstructions"
                      value={formData.delivery_instructions}
                      onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
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
                          value={formData.delivery_contact_person}
                          onChange={(e) => setFormData({ ...formData, delivery_contact_person: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryContactPhone">Contact Phone</Label>
                        <Input
                          id="deliveryContactPhone"
                          value={formData.delivery_contact_phone}
                          onChange={(e) => setFormData({ ...formData, delivery_contact_phone: e.target.value })}
                          placeholder="+36 20 123 4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryContactEmail">Contact Email</Label>
                        <Input
                          id="deliveryContactEmail"
                          type="email"
                          value={formData.delivery_contact_email}
                          onChange={(e) => setFormData({ ...formData, delivery_contact_email: e.target.value })}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Additional Delivery Notes</Label>
                    <EnhancedTextarea
                      id="deliveryNotes"
                      value={formData.delivery_notes}
                      onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
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
                <Button type="button" variant="outline" onClick={() => navigate(`/apartments/${apartmentId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createProductMutation.isPending ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ProductNew;
