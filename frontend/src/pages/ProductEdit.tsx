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
import { useToast } from "@/hooks/use-toast";
import { useProduct, useUpdateProduct, useProductCategories, useCreateCategory } from "@/hooks/useProductApi";
import { useVendors } from "@/hooks/useVendorApi";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductEditSkeleton from "@/components/skeletons/ProductEditSkeleton";
import { MultiSelectTags } from "@/components/ui/multi-select-tags";

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  
  // Get apartment ID from product
  const apartmentId = product?.apartment;

  // State must be declared before any conditional returns
  const [formData, setFormData] = useState({
    // Basic Product Info
    product: "",
    description: "",
    category: "",
    vendor: "",
    vendor_link: "",
    sku: "",
    
    // Product Specifications
    dimensions: "",
    weight: "",
    material: "",
    color: "",
    model_number: "",
    brand: "",
    country_of_origin: "",
    sn: "",
    
    // Pricing
    unit_price: "",
    qty: 1,
    cost: "",
    total_cost: "",
    shipping_cost: "0",
    discount: "0",
    currency: "HUF",
    
    // Status
    availability: "In Stock",
    status: ["Design Approved"] as string[],
    
    // Excel/Measurement Fields
    room: "",
    link: "",
    size: "",
    nm: "",
    plusz_nm: "",
    price_per_nm: "",
    price_per_package: "",
    nm_per_package: "",
    all_package: "",
    package_need_to_order: "",
    all_price: "",
    
    // Dates
    eta: "",
    ordered_on: "",
    
    // Payment
    payment_status: "Unpaid",
    payment_due_date: "",
    payment_amount: "",
    paid_amount: "0",
    
    // Delivery
    delivery_type: "",
    delivery_status_tags: "",
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
    tracking_number: "",
    condition_on_arrival: "",
    
    // Delivery Type Specific Fields
    sender: "",
    sender_address: "",
    sender_phone: "",
    recipient: "",
    recipient_address: "",
    recipient_phone: "",
    recipient_email: "",
    locker_provider: "",
    locker_id: "",
    pickup_provider: "",
    pickup_location: "",
    customs_description: "",
    item_value: "",
    hs_category: "",
    insurance: "no",
    cod: "",
    pickup_time: "",
    delivery_deadline: "",
    special_instructions: "",
    
    // Issues
    issue_state: "No Issue",
    issue_type: "",
    issue_description: "",
    replacement_requested: false,
    replacement_approved: false,
    replacement_eta: "",
    replacement_of: "",
    gallery_images: "",
    attachments: "",
    
    // Notes
    notes: "",
    manual_notes: "",
    ai_summary_notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basic");

  // Apartment data will come from product

  // Fetch categories for this apartment (only if apartmentId exists)
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useProductCategories(apartmentId);
  // API returns array directly, not wrapped in results
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Fetch vendors
  const {
    data: vendorsData,
    isLoading: isLoadingVendors,
    error: vendorsError,
  } = useVendors();
  const vendors = vendorsData?.results || [];

  // Update product mutation
  const updateProductMutation = useUpdateProduct();
  const createCategoryMutation = useCreateCategory();

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      // Use type assertion for fields not yet in TypeScript interface
      const productData = product as any;
      
      console.log("📦 Product data loaded:", product);
      console.log("📋 Category ID:", product.category);
      console.log("🏢 Vendor ID:", product.vendor);
      
      setFormData({
        product: productData.product || "",
        description: productData.description || "",
        category: productData.category ? String(productData.category) : "",
        vendor: productData.vendor ? String(productData.vendor) : "",
        vendor_link: productData.vendor_link || "",
        sku: productData.sku || "",
        dimensions: productData.dimensions || "",
        weight: productData.weight || "",
        material: productData.material || "",
        color: productData.color || "",
        model_number: productData.model_number || "",
        brand: productData.brand || "",
        country_of_origin: productData.country_of_origin || "",
        sn: productData.sn || "",
        unit_price: productData.unit_price?.toString() || "",
        qty: productData.qty || 1,
        cost: productData.cost || "",
        total_cost: productData.total_cost || "",
        shipping_cost: productData.shipping_cost || "0",
        discount: productData.discount || "0",
        currency: productData.currency || "HUF",
        availability: productData.availability || "In Stock",
        status: Array.isArray(productData.status) ? productData.status : (productData.status ? [productData.status] : ["Design Approved"]),
        room: productData.room || "",
        link: productData.link || "",
        size: productData.size || "",
        nm: productData.nm || "",
        plusz_nm: productData.plusz_nm || "",
        price_per_nm: productData.price_per_nm || "",
        price_per_package: productData.price_per_package || "",
        nm_per_package: productData.nm_per_package || "",
        all_package: productData.all_package || "",
        package_need_to_order: productData.package_need_to_order || "",
        all_price: productData.all_price || "",
        eta: productData.eta || "",
        ordered_on: productData.ordered_on || "",
        payment_status: productData.payment_status || "Unpaid",
        payment_due_date: productData.payment_due_date || "",
        payment_amount: productData.payment_amount || "",
        paid_amount: productData.paid_amount || "0",
        delivery_type: productData.delivery_type || "",
        delivery_status_tags: productData.delivery_status_tags || "",
        delivery_address: productData.delivery_address || "",
        delivery_city: productData.delivery_city || "",
        delivery_postal_code: productData.delivery_postal_code || "",
        delivery_country: productData.delivery_country || "",
        delivery_time_window: productData.delivery_time_window || "",
        delivery_instructions: productData.delivery_instructions || "",
        delivery_contact_person: productData.delivery_contact_person || "",
        delivery_contact_phone: productData.delivery_contact_phone || "",
        delivery_contact_email: productData.delivery_contact_email || "",
        delivery_notes: productData.delivery_notes || "",
        tracking_number: productData.tracking_number || "",
        condition_on_arrival: productData.condition_on_arrival || "",
        sender: productData.sender || "",
        sender_address: productData.sender_address || "",
        sender_phone: productData.sender_phone || "",
        recipient: productData.recipient || "",
        recipient_address: productData.recipient_address || "",
        recipient_phone: productData.recipient_phone || "",
        recipient_email: productData.recipient_email || "",
        locker_provider: productData.locker_provider || "",
        locker_id: productData.locker_id || "",
        pickup_provider: productData.pickup_provider || "",
        pickup_location: productData.pickup_location || "",
        customs_description: productData.customs_description || "",
        item_value: productData.item_value || "",
        hs_category: productData.hs_category || "",
        insurance: productData.insurance || "no",
        cod: productData.cod || "",
        pickup_time: productData.pickup_time || "",
        delivery_deadline: productData.delivery_deadline || "",
        special_instructions: productData.special_instructions || "",
        issue_state: productData.issue_state || "No Issue",
        issue_type: productData.issue_type || "",
        issue_description: productData.issue_description || "",
        replacement_requested: productData.replacement_requested || false,
        replacement_approved: productData.replacement_approved || false,
        replacement_eta: productData.replacement_eta || "",
        replacement_of: productData.replacement_of || "",
        gallery_images: productData.gallery_images || "",
        attachments: productData.attachments || "",
        notes: productData.notes || "",
        manual_notes: productData.manual_notes || "",
        ai_summary_notes: productData.ai_summary_notes || "",
      });
      
      if (product.product_image) {
        setImagePreview(product.product_image);
      }
    }
  }, [product]);

  // Show warning if categories fail to load
  useEffect(() => {
    if (categoriesError && !isLoadingCategories) {
      toast({
        title: "Warning",
        description:
          "Failed to load categories. You can still add a product by entering the category ID manually.",
        variant: "destructive",
      });
    }
  }, [categoriesError, isLoadingCategories, toast]);

  // Show warning if vendors fail to load
  useEffect(() => {
    if (vendorsError && !isLoadingVendors) {
      toast({
        title: "Warning",
        description:
          "Failed to load vendors. You can still add a product by entering the vendor ID manually.",
        variant: "destructive",
      });
    }
  }, [vendorsError, isLoadingVendors, toast]);

  // Show loading state
  if (isLoadingProduct) {
    return <ProductEditSkeleton />;
  }

  if (!product) {
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

    if (!formData.product.trim())
      newErrors.product = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0)
      newErrors.unit_price = "Valid unit price is required";
    if (!formData.qty || formData.qty <= 0)
      newErrors.qty = "Valid quantity is required";

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
        // Don't send apartment - it's already set in the product
        formDataToSend.append("category", formData.category);
        formDataToSend.append("product", formData.product);
        formDataToSend.append("vendor", formData.vendor);
        formDataToSend.append("unit_price", formData.unit_price);
        formDataToSend.append("qty", formData.qty.toString());
        formDataToSend.append("availability", formData.availability);
        formDataToSend.append("status", JSON.stringify(formData.status));
        formDataToSend.append("payment_status", formData.payment_status);
        formDataToSend.append("paid_amount", formData.paid_amount);
        formDataToSend.append("currency", formData.currency);
        formDataToSend.append("issue_state", formData.issue_state);
        formDataToSend.append("image_file", imageFile);

        // Debug: Log FormData contents
        console.log("📤 Sending FormData with image:");
        console.log("  - Image file:", imageFile);
        console.log("  - File name:", imageFile.name);
        console.log("  - File size:", imageFile.size);
        console.log("  - File type:", imageFile.type);
        for (let pair of formDataToSend.entries()) {
          console.log(`  - ${pair[0]}:`, pair[1]);
        }

        // Optional fields
        if (formData.description)
          formDataToSend.append("description", formData.description);
        if (formData.vendor_link)
          formDataToSend.append("vendor_link", formData.vendor_link);
        if (formData.sku) formDataToSend.append("sku", formData.sku);
        
        // Product Specifications
        if (formData.dimensions) formDataToSend.append("dimensions", formData.dimensions);
        if (formData.weight) formDataToSend.append("weight", formData.weight);
        if (formData.material) formDataToSend.append("material", formData.material);
        if (formData.color) formDataToSend.append("color", formData.color);
        if (formData.model_number) formDataToSend.append("model_number", formData.model_number);
        if (formData.brand) formDataToSend.append("brand", formData.brand);
        if (formData.country_of_origin) formDataToSend.append("country_of_origin", formData.country_of_origin);
        if (formData.sn) formDataToSend.append("sn", formData.sn);
        
        // Financial
        if (formData.cost) formDataToSend.append("cost", formData.cost);
        if (formData.total_cost) formDataToSend.append("total_cost", formData.total_cost);
        if (formData.shipping_cost) formDataToSend.append("shipping_cost", formData.shipping_cost);
        if (formData.discount) formDataToSend.append("discount", formData.discount);
        
        // Measurements
        if (formData.room) formDataToSend.append("room", formData.room);
        if (formData.link) formDataToSend.append("link", formData.link);
        if (formData.size) formDataToSend.append("size", formData.size);
        if (formData.nm) formDataToSend.append("nm", formData.nm);
        if (formData.plusz_nm) formDataToSend.append("plusz_nm", formData.plusz_nm);
        if (formData.price_per_nm) formDataToSend.append("price_per_nm", formData.price_per_nm);
        if (formData.price_per_package) formDataToSend.append("price_per_package", formData.price_per_package);
        if (formData.nm_per_package) formDataToSend.append("nm_per_package", formData.nm_per_package);
        if (formData.all_package) formDataToSend.append("all_package", formData.all_package);
        if (formData.package_need_to_order) formDataToSend.append("package_need_to_order", formData.package_need_to_order);
        if (formData.all_price) formDataToSend.append("all_price", formData.all_price);
        if (formData.eta) formDataToSend.append("eta", formData.eta);
        if (formData.ordered_on)
          formDataToSend.append("ordered_on", formData.ordered_on);
        if (formData.payment_due_date)
          formDataToSend.append("payment_due_date", formData.payment_due_date);
        if (formData.payment_amount)
          formDataToSend.append("payment_amount", formData.payment_amount);
        if (formData.delivery_type)
          formDataToSend.append("delivery_type", formData.delivery_type);
        if (formData.delivery_status_tags) formDataToSend.append("delivery_status_tags", formData.delivery_status_tags);
        if (formData.delivery_address) formDataToSend.append("delivery_address", formData.delivery_address);
        if (formData.delivery_city) formDataToSend.append("delivery_city", formData.delivery_city);
        if (formData.delivery_postal_code) formDataToSend.append("delivery_postal_code", formData.delivery_postal_code);
        if (formData.delivery_country) formDataToSend.append("delivery_country", formData.delivery_country);
        if (formData.delivery_time_window) formDataToSend.append("delivery_time_window", formData.delivery_time_window);
        if (formData.delivery_instructions) formDataToSend.append("delivery_instructions", formData.delivery_instructions);
        if (formData.delivery_contact_person) formDataToSend.append("delivery_contact_person", formData.delivery_contact_person);
        if (formData.delivery_contact_phone) formDataToSend.append("delivery_contact_phone", formData.delivery_contact_phone);
        if (formData.delivery_contact_email) formDataToSend.append("delivery_contact_email", formData.delivery_contact_email);
        if (formData.delivery_notes) formDataToSend.append("delivery_notes", formData.delivery_notes);
        if (formData.tracking_number) formDataToSend.append("tracking_number", formData.tracking_number);
        if (formData.condition_on_arrival) formDataToSend.append("condition_on_arrival", formData.condition_on_arrival);
        
        // Delivery Type Specific
        if (formData.sender) formDataToSend.append("sender", formData.sender);
        if (formData.sender_address) formDataToSend.append("sender_address", formData.sender_address);
        if (formData.sender_phone) formDataToSend.append("sender_phone", formData.sender_phone);
        if (formData.recipient) formDataToSend.append("recipient", formData.recipient);
        if (formData.recipient_address) formDataToSend.append("recipient_address", formData.recipient_address);
        if (formData.recipient_phone) formDataToSend.append("recipient_phone", formData.recipient_phone);
        if (formData.recipient_email) formDataToSend.append("recipient_email", formData.recipient_email);
        if (formData.locker_provider) formDataToSend.append("locker_provider", formData.locker_provider);
        if (formData.locker_id) formDataToSend.append("locker_id", formData.locker_id);
        if (formData.pickup_provider) formDataToSend.append("pickup_provider", formData.pickup_provider);
        if (formData.pickup_location) formDataToSend.append("pickup_location", formData.pickup_location);
        if (formData.customs_description) formDataToSend.append("customs_description", formData.customs_description);
        if (formData.item_value) formDataToSend.append("item_value", formData.item_value);
        if (formData.hs_category) formDataToSend.append("hs_category", formData.hs_category);
        if (formData.insurance) formDataToSend.append("insurance", formData.insurance);
        if (formData.cod) formDataToSend.append("cod", formData.cod);
        if (formData.pickup_time) formDataToSend.append("pickup_time", formData.pickup_time);
        if (formData.delivery_deadline) formDataToSend.append("delivery_deadline", formData.delivery_deadline);
        if (formData.special_instructions) formDataToSend.append("special_instructions", formData.special_instructions);
        
        // Issues
        if (formData.issue_type) formDataToSend.append("issue_type", formData.issue_type);
        if (formData.issue_description) formDataToSend.append("issue_description", formData.issue_description);
        formDataToSend.append("replacement_requested", formData.replacement_requested.toString());
        formDataToSend.append("replacement_approved", formData.replacement_approved.toString());
        if (formData.replacement_eta) formDataToSend.append("replacement_eta", formData.replacement_eta);
        if (formData.replacement_of) formDataToSend.append("replacement_of", formData.replacement_of);
        
        if (formData.notes) formDataToSend.append("notes", formData.notes);
        if (formData.manual_notes) formDataToSend.append("manual_notes", formData.manual_notes);
        if (formData.ai_summary_notes) formDataToSend.append("ai_summary_notes", formData.ai_summary_notes);

        // Call API with FormData
        await updateProductMutation.mutateAsync({ id: id!, data: formDataToSend as any });
      } else {
        // Use JSON when no image
        const productData = {
          // Don't send apartment - it's already set
          category: formData.category,
          product: formData.product,
          description: formData.description || undefined,
          vendor: formData.vendor,
          vendor_link: formData.vendor_link || undefined,
          sku: formData.sku || undefined,
          
          // Specifications
          dimensions: formData.dimensions || undefined,
          weight: formData.weight || undefined,
          material: formData.material || undefined,
          color: formData.color || undefined,
          model_number: formData.model_number || undefined,
          brand: formData.brand || undefined,
          country_of_origin: formData.country_of_origin || undefined,
          sn: formData.sn || undefined,
          
          // Pricing
          unit_price: formData.unit_price,
          qty: formData.qty,
    // REMOVED: cost: formData.cost || undefined,
    // REMOVED: total_cost: formData.total_cost || undefined,
          shipping_cost: formData.shipping_cost || undefined,
          discount: formData.discount || undefined,
          currency: formData.currency,
          
          availability: formData.availability,
          status: formData.status,
          
          // Measurements
          room: formData.room || undefined,
          link: formData.link || undefined,
          size: formData.size || undefined,
          nm: formData.nm || undefined,
    // REMOVED: plusz_nm: formData.plusz_nm || undefined,
          price_per_nm: formData.price_per_nm || undefined,
          price_per_package: formData.price_per_package || undefined,
          nm_per_package: formData.nm_per_package || undefined,
    // REMOVED: all_package: formData.all_package || undefined,
    // REMOVED: package_need_to_order: formData.package_need_to_order || undefined,
    // REMOVED: all_price: formData.all_price || undefined,
          
          // Dates
          eta: formData.eta || null,
          ordered_on: formData.ordered_on || null,
          
          // Payment
          payment_status: formData.payment_status,
          payment_due_date: formData.payment_due_date || null,
          payment_amount: formData.payment_amount || null,
          paid_amount: formData.paid_amount,
          
          // Delivery
          delivery_type: formData.delivery_type || undefined,
          delivery_status_tags: formData.delivery_status_tags || undefined,
          delivery_address: formData.delivery_address || undefined,
          delivery_city: formData.delivery_city || undefined,
          delivery_postal_code: formData.delivery_postal_code || undefined,
          delivery_country: formData.delivery_country || undefined,
          delivery_time_window: formData.delivery_time_window || undefined,
          delivery_instructions: formData.delivery_instructions || undefined,
          delivery_contact_person: formData.delivery_contact_person || undefined,
          delivery_contact_phone: formData.delivery_contact_phone || undefined,
          delivery_contact_email: formData.delivery_contact_email || undefined,
          delivery_notes: formData.delivery_notes || undefined,
          tracking_number: formData.tracking_number || undefined,
          condition_on_arrival: formData.condition_on_arrival || undefined,
          
          // Delivery Type Specific
    // REMOVED: sender: formData.sender || undefined,
    // REMOVED: sender_address: formData.sender_address || undefined,
    // REMOVED: sender_phone: formData.sender_phone || undefined,
    // REMOVED: recipient: formData.recipient || undefined,
    // REMOVED: recipient_address: formData.recipient_address || undefined,
    // REMOVED: recipient_phone: formData.recipient_phone || undefined,
    // REMOVED: recipient_email: formData.recipient_email || undefined,
    // REMOVED: locker_provider: formData.locker_provider || undefined,
    // REMOVED: locker_id: formData.locker_id || undefined,
    // REMOVED: pickup_provider: formData.pickup_provider || undefined,
    // REMOVED: pickup_location: formData.pickup_location || undefined,
    // REMOVED: customs_description: formData.customs_description || undefined,
    // REMOVED: item_value: formData.item_value || undefined,
    // REMOVED: hs_category: formData.hs_category || undefined,
    // REMOVED: insurance: formData.insurance || undefined,
    // REMOVED: cod: formData.cod || undefined,
    // REMOVED: pickup_time: formData.pickup_time || undefined,
          delivery_deadline: formData.delivery_deadline || undefined,
          special_instructions: formData.special_instructions || undefined,
          
          // Issues
    // REMOVED: issue_state: formData.issue_state,
    // REMOVED: issue_type: formData.issue_type || undefined,
    // REMOVED: issue_description: formData.issue_description || undefined,
    // REMOVED: replacement_requested: formData.replacement_requested,
    // REMOVED: replacement_approved: formData.replacement_approved,
    // REMOVED: replacement_eta: formData.replacement_eta || null,
          replacement_of: formData.replacement_of || undefined,
          
          notes: formData.notes || undefined,
          manual_notes: formData.manual_notes || undefined,
          ai_summary_notes: formData.ai_summary_notes || undefined,
        };

        await updateProductMutation.mutateAsync({ id: id!, data: productData as any });
      }

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });

      navigate(`/products/${id}`);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Calculate total amount: (unit_price * qty) + shipping - discount
  const total =
    formData.unit_price && formData.qty
      ? parseFloat(formData.unit_price) * formData.qty +
        (parseFloat(formData.shipping_cost) || 0) -
        (parseFloat(formData.discount) || 0)
      : 0;
  
  // Calculate outstanding balance: total - paid_amount
  const outstandingBalance = total - (parseFloat(formData.paid_amount) || 0);

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
              <BreadcrumbLink href={`/apartments/${apartmentId}`}>
                Apartment
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/products/${id}`}>
                {product.product}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/products/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mt-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Basic Product Information</h3>
                  
                  {/* Row 1: Product Name & Category */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product Name *</Label>
                      <Input
                        id="product"
                        value={formData.product}
                        onChange={(e) =>
                          setFormData({ ...formData, product: e.target.value })
                        }
                        placeholder="Modern Sofa"
                      />
                      {errors.product && (
                        <p className="text-sm text-destructive">
                          {errors.product}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <CreatableCombobox
                        options={categories.map((cat: any) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                        onCreate={async (name) => {
                          const newCategory = await createCategoryMutation.mutateAsync({
                            name,
                            apartment: apartmentId!,
                            sheet_name: name,
                          });
                          return { id: newCategory.id, name: newCategory.name };
                        }}
                        placeholder="Select category"
                        searchPlaceholder="Search categories..."
                        emptyText="No categories found."
                        createText="Create new category"
                        isLoading={isLoadingCategories}
                      />
                      {errors.category && (
                        <p className="text-sm text-destructive">
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Vendor & Link */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor *</Label>
                      <CreatableCombobox
                        options={vendors.map((vendor: any) => ({
                          value: vendor.id,
                          label: vendor.company_name || vendor.name,
                        }))}
                        value={formData.vendor}
                        onValueChange={(value) =>
                          setFormData({ ...formData, vendor: value })
                        }
                        onNavigateToCreate={() => {
                          navigate('/vendors/new');
                        }}
                        placeholder="Select vendor"
                        searchPlaceholder="Search vendors..."
                        emptyText="No vendors found."
                        createText="Create new vendor"
                        isLoading={isLoadingVendors}
                      />
                      {errors.vendor && (
                        <p className="text-sm text-destructive">
                          {errors.vendor}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link">Product Link (Optional)</Label>
                      <Input
                        id="link"
                        type="url"
                        value={formData.link}
                        onChange={(e) =>
                          setFormData({ ...formData, link: e.target.value })
                        }
                        placeholder="https://example.com/product"
                      />
                    </div>
                  </div>

                  {/* Row 3: SKU & Room */}
                 
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        placeholder="SOFA-001"
                      />
                      {errors.sku && (
                        <p className="text-sm text-destructive">{errors.sku}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room">Room (Optional)</Label>
                      <Input
                        id="room"
                        value={formData.room}
                        onChange={(e) =>
                          setFormData({ ...formData, room: e.target.value })
                        }
                        placeholder="Living Room, Bedroom, etc."
                      />
                    </div>
                  </div>

                  {/* Row 4: Product Image */}
                   <div className="grid gap-4 md:grid-cols-2">
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
                        <p className="text-sm text-muted-foreground">
                          {imageFile?.name}
                        </p>
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
                  

                  {/* Row 5: Unit Price & Quantity */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Unit Price (HUF) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit_price: e.target.value,
                          })
                        }
                        placeholder="150000"
                      />
                      {errors.unitPrice && (
                        <p className="text-sm text-destructive">
                          {errors.unitPrice}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qty">Quantity *</Label>
                      <Input
                        id="qty"
                        type="number"
                        min="1"
                        value={formData.qty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            qty: parseInt(e.target.value) || 1,
                          })
                        }
                        placeholder="1"
                      />
                      {errors.qty && (
                        <p className="text-sm text-destructive">{errors.qty}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 6: Availability & Status */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability *</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, availability: value })
                        }
                      >
                        <SelectTrigger id="availability">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In Stock">In Stock</SelectItem>
                          <SelectItem value="Backorder">Backorder</SelectItem>
                          <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Product Status *</Label>
                      <MultiSelectTags
                        options={[
                          'Design Approved',
                          'Ready To Order',
                          'Ordered',
                          'Waiting For Stock',
                          'Shipped',
                          'Delivered',
                          'Damaged',
                          'Wrong Item',
                          'Missing Parts',
                        ]}
                        value={Array.isArray(formData.status) ? formData.status : []}
                        onChange={(values) =>
                          setFormData({ ...formData, status: values })
                        }
                        placeholder="Add status..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Measurements Tab */}
                <TabsContent value="measurements" className="space-y-6 mt-6">
                  {/* Product Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Specifications</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) =>
                            setFormData({ ...formData, dimensions: e.target.value })
                          }
                          placeholder="120x80x45 cm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="25 kg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) =>
                            setFormData({ ...formData, material: e.target.value })
                          }
                          placeholder="Oak Wood"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          placeholder="Natural Oak"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) =>
                            setFormData({ ...formData, size: e.target.value })
                          }
                          placeholder="Large"
                        />
                      </div>
                    </div>
                  </div>

                  {/* NM Measurements (for flooring, tiles, etc.) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">NM Measurements (for Flooring/Tiles)</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="nm">NM</Label>
                        <Input
                          id="nm"
                          type="number"
                          step="0.01"
                          value={formData.nm}
                          onChange={(e) =>
                            setFormData({ ...formData, nm: e.target.value })
                          }
                          placeholder="10.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plusz_nm">Plus NM</Label>
                        <Input
                          id="plusz_nm"
                          type="number"
                          step="0.01"
                          value={formData.plusz_nm}
                          onChange={(e) =>
                            setFormData({ ...formData, plusz_nm: e.target.value })
                          }
                          placeholder="1.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price_per_nm">Price per NM</Label>
                        <Input
                          id="price_per_nm"
                          type="number"
                          step="0.01"
                          value={formData.price_per_nm}
                          onChange={(e) =>
                            setFormData({ ...formData, price_per_nm: e.target.value })
                          }
                          placeholder="5000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price_per_package">Price per Package</Label>
                        <Input
                          id="price_per_package"
                          type="number"
                          step="0.01"
                          value={formData.price_per_package}
                          onChange={(e) =>
                            setFormData({ ...formData, price_per_package: e.target.value })
                          }
                          placeholder="15000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nm_per_package">NM per Package</Label>
                        <Input
                          id="nm_per_package"
                          type="number"
                          step="0.01"
                          value={formData.nm_per_package}
                          onChange={(e) =>
                            setFormData({ ...formData, nm_per_package: e.target.value })
                          }
                          placeholder="3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="package_need_to_order">Package Need to Order</Label>
                        <Input
                          id="package_need_to_order"
                          type="number"
                          value={formData.package_need_to_order}
                          onChange={(e) =>
                            setFormData({ ...formData, package_need_to_order: e.target.value })
                          }
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                  
                  {/* Row 1: Total Amount & Shipping Cost */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="total_amount">Total Amount (HUF)</Label>
                      <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center">
                        <span className="font-semibold text-lg">
                          {total.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Auto-calculated: (Unit Price × Qty) + Shipping - Discount
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_cost">Shipping Cost (Optional)</Label>
                      <Input
                        id="shipping_cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.shipping_cost}
                        onChange={(e) =>
                          setFormData({ ...formData, shipping_cost: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (Optional)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Row 2: Paid Amount & Outstanding Balance */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paid_amount">Paid Amount</Label>
                      <Input
                        id="paid_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.paid_amount}
                        onChange={(e) =>
                          setFormData({ ...formData, paid_amount: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Outstanding Balance</Label>
                      <div className={`h-10 px-3 py-2 rounded-md border flex items-center ${
                        outstandingBalance > 0 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-green-50 border-green-200 text-green-700'
                      }`}>
                        <span className="font-semibold text-lg">
                          {outstandingBalance.toLocaleString()} HUF
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Auto-calculated: Total Amount - Paid Amount
                      </p>
                    </div>
                  </div>

                  {/* Row 3: Payment Status & Currency */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status *</Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, payment_status: value })
                        }
                      >
                        <SelectTrigger id="paymentStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, currency: value })
                        }
                      >
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HUF">HUF (Hungarian Forint)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 4: Payment Due Date */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="paymentDueDate">Payment Due Date *</Label>
                      <Input
                        id="paymentDueDate"
                        type="date"
                        value={formData.payment_due_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_due_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Additional Tab */}
                <TabsContent value="additional" className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

                  {/* Product Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        placeholder="e.g., IKEA, Samsung, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country_of_origin">Country of Origin</Label>
                      <Input
                        id="country_of_origin"
                        value={formData.country_of_origin}
                        onChange={(e) =>
                          setFormData({ ...formData, country_of_origin: e.target.value })
                        }
                        placeholder="e.g., Hungary, China, Germany"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition_on_arrival">Condition on Arrival</Label>
                    <Input
                      id="condition_on_arrival"
                      value={formData.condition_on_arrival}
                      onChange={(e) =>
                        setFormData({ ...formData, condition_on_arrival: e.target.value })
                      }
                      placeholder="Good, Damaged, Needs Inspection, etc."
                    />
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Notes & Documentation</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">General Notes</Label>
                      <EnhancedTextarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="General notes about this product..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manual_notes">Manual Notes</Label>
                      <EnhancedTextarea
                        id="manual_notes"
                        value={formData.manual_notes}
                        onChange={(e) =>
                          setFormData({ ...formData, manual_notes: e.target.value })
                        }
                        placeholder="Manual notes added by staff..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai_summary_notes">AI Summary Notes</Label>
                      <EnhancedTextarea
                        id="ai_summary_notes"
                        value={formData.ai_summary_notes}
                        onChange={(e) =>
                          setFormData({ ...formData, ai_summary_notes: e.target.value })
                        }
                        placeholder="AI-generated summary and insights..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        AI-generated summaries and recommendations
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Pagination Navigation */}
              <div className="flex gap-4 justify-between mt-6 border-t pt-6">
                <div>
                  {activeTab !== "basic" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const tabs = ["basic", "measurements", "pricing", "additional"];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                    >
                      ← Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/products/${id}`);
                    }}
                  >
                    Cancel
                  </Button>

                  {activeTab !== "additional" ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const tabs = ["basic", "measurements", "pricing", "additional"];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Next →
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={updateProductMutation.isPending}
                    >
                      {updateProductMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {updateProductMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ProductEdit;
