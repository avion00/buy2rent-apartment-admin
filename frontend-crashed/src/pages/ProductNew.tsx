import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useCreateProductWithImage, useVendors, useApartments, useProductCategories } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X } from "lucide-react";

const ProductNew = () => {
  const [searchParams] = useSearchParams();
  const apartmentId = searchParams.get("apartmentId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: apartments } = useApartments();
  const { data: vendors } = useVendors();
  const createProductMutation = useCreateProductWithImage();
  const apartment = apartments?.find((a) => a.id === apartmentId);
  const { data: categories } = useProductCategories(apartmentId || undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    product: "",
    vendor: "",
    sku: "",
    unitPrice: "",
    qty: "",
    status: "Design Approved" as const,
    expectedDeliveryDate: "",
    actualDeliveryDate: "",
    paymentStatus: "Unpaid" as const,
    paymentDueDate: "",
    issueState: "No Issue" as const,
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
    // Excel import fields
    category: "",
    room: "",
    productImage: "",
    cost: "",
    totalCost: "",
    description: "",
    link: "",
    size: "",
    nm: "",
    pluszNm: "",
    pricePerNm: "",
    pricePerPackage: "",
    nmPerPackage: "",
    allPackage: "",
    packageNeedToOrder: "",
    allPrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleImageSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    const unitPrice = parseFloat(formData.unitPrice);
    const qty = parseInt(formData.qty);

    const newProduct = {
      apartment: apartmentId!,
      product: formData.product,
      vendor: formData.vendor,
      vendor_link: "",
      sku: formData.sku,
      unit_price: formData.unitPrice, // Keep as string to match API
      qty,
      availability: "In Stock" as const,
      status: formData.status,
      expected_delivery_date: formData.expectedDeliveryDate || undefined,
      actual_delivery_date: formData.actualDeliveryDate || undefined,
      payment_status: formData.paymentStatus,
      payment_due_date: formData.paymentDueDate || undefined,
      payment_amount: unitPrice * qty,
      paid_amount: "0",
      issue_state: formData.issueState,
      ordered_on: formData.orderedOn || new Date().toISOString().split("T")[0],
      image_url: formData.imageUrl || "",
      notes: formData.notes || "",
      delivery_type: formData.deliveryType || "",
      delivery_address: formData.deliveryAddress || "",
      delivery_city: formData.deliveryCity || "",
      delivery_postal_code: formData.deliveryPostalCode || "",
      delivery_country: formData.deliveryCountry || "",
      delivery_instructions: formData.deliveryInstructions || "",
      delivery_contact_person: formData.deliveryContactPerson || "",
      delivery_contact_phone: formData.deliveryContactPhone || "",
      delivery_contact_email: formData.deliveryContactEmail || "",
      tracking_number: formData.trackingNumber || "",
      delivery_time_window: formData.deliveryTimeWindow || "",
      delivery_notes: formData.deliveryNotes || "",
      currency: "HUF",
      shipping_cost: "0",
      discount: "0",
      // Excel import fields
      category: formData.category || null,
      room: formData.room || "",
      brand: "",
      country_of_origin: "",
      condition_on_arrival: "",
      issue_type: "",
      issue_description: "",
      replacement_requested: false,
      replacement_approved: false,
      replacement_eta: null,
      replacement_of: null,
      attachments: [],
      manual_notes: "",
      ai_summary_notes: "",
      created_by: "",
      // Additional Excel fields
      sn: "",
      cost: formData.cost || "",
      total_cost: formData.totalCost || "",
      link: formData.link || "",
      size: formData.size || "",
      nm: formData.nm || "",
      plusz_nm: formData.pluszNm || "",
      price_per_nm: formData.pricePerNm || "",
      price_per_package: formData.pricePerPackage || "",
      nm_per_package: formData.nmPerPackage || "",
      all_package: formData.allPackage || "",
      package_need_to_order: formData.packageNeedToOrder || "",
      all_price: formData.allPrice || "",
      description: formData.description || "",
      product_image: formData.productImage || "",
    };

    try {
      await createProductMutation.mutateAsync({ 
        product: newProduct, 
        imageFile: selectedImage || undefined 
      });
      navigate(`/apartments/${apartmentId}`);
    } catch (error) {
      console.error('Create product error:', error);
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

  const total = formData.unitPrice && formData.qty ? parseFloat(formData.unitPrice) * parseInt(formData.qty) : 0;

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
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
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
                  <Label>Image</Label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Image URL (https://example.com/image.jpg)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {(imagePreview || formData.imageUrl) && (
                      <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Product"
                          className="w-full h-full object-contain"
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeSelectedImage}
                            className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Kitchen-livingroom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productImage">Product Image</Label>
                  <Input
                    id="productImage"
                    value={formData.productImage}
                    onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                    placeholder="Product image URL"
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

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="40000 Ft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalCost">Total Cost</Label>
                  <Input
                    id="totalCost"
                    value={formData.totalCost}
                    onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                    placeholder="40000 Ft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="Size dimensions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Product Link</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <EnhancedTextarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
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

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Measurement & Packaging (NM Fields)</h3>
                
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="nm">NM</Label>
                      <Input
                        id="nm"
                        value={formData.nm}
                        onChange={(e) => setFormData({ ...formData, nm: e.target.value })}
                        placeholder="Square meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pluszNm">Plus NM</Label>
                      <Input
                        id="pluszNm"
                        value={formData.pluszNm}
                        onChange={(e) => setFormData({ ...formData, pluszNm: e.target.value })}
                        placeholder="Additional square meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePerNm">Price per NM</Label>
                      <Input
                        id="pricePerNm"
                        value={formData.pricePerNm}
                        onChange={(e) => setFormData({ ...formData, pricePerNm: e.target.value })}
                        placeholder="Price per square meter"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerPackage">Price per Package</Label>
                      <Input
                        id="pricePerPackage"
                        value={formData.pricePerPackage}
                        onChange={(e) => setFormData({ ...formData, pricePerPackage: e.target.value })}
                        placeholder="Package price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nmPerPackage">NM per Package</Label>
                      <Input
                        id="nmPerPackage"
                        value={formData.nmPerPackage}
                        onChange={(e) => setFormData({ ...formData, nmPerPackage: e.target.value })}
                        placeholder="Square meters per package"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allPackage">All Package</Label>
                      <Input
                        id="allPackage"
                        value={formData.allPackage}
                        onChange={(e) => setFormData({ ...formData, allPackage: e.target.value })}
                        placeholder="Total packages"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="packageNeedToOrder">Package Need to Order</Label>
                      <Input
                        id="packageNeedToOrder"
                        value={formData.packageNeedToOrder}
                        onChange={(e) => setFormData({ ...formData, packageNeedToOrder: e.target.value })}
                        placeholder="Packages to order"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allPrice">All Price</Label>
                      <Input
                        id="allPrice"
                        value={formData.allPrice}
                        onChange={(e) => setFormData({ ...formData, allPrice: e.target.value })}
                        placeholder="Total price"
                      />
                    </div>
                  </div>
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
                <Button type="button" variant="outline" onClick={() => navigate(`/apartments/${apartmentId}`)}>
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ProductNew;
