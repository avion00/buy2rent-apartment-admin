import { useParams, useNavigate, Link } from "react-router-dom";
import { useApartment, useDeleteApartment, useClients, useProducts, useUpdateProduct, useDeleteProduct, useVendors } from "@/hooks/useApi";
import type { Product, Client, Vendor } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  ExternalLink,
  Plus,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Sparkles,
  Send,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Bot,
  Eye,
  SquarePen,
  Settings,
  CreditCard,
  MapPin,
  Building2,
} from "lucide-react";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { DetailViewSkeleton } from "@/components/skeletons/CardSkeleton";
import { VendorDetailsModal } from "@/components/modals/VendorDetailsModal";
import { PaymentDetailsModal } from "@/components/modals/PaymentDetailsModal";
import { IssueManagementModal } from "@/components/modals/IssueManagementModal";
import { DeliveryLocationModal } from "@/components/modals/DeliveryLocationModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SKUEditModal } from "@/components/modals/SKUEditModal";
import { UnitPriceEditModal } from "@/components/modals/UnitPriceEditModal";
import { QuantityEditModal } from "@/components/modals/QuantityEditModal";
import { ClientDetailsModalAPI } from "@/components/modals/ClientDetailsModalAPI";
import { VendorDetailsModalAPI } from "@/components/modals/VendorDetailsModalAPI";

const ApartmentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch apartment data from API
  const { 
    data: apartment, 
    isLoading: apartmentLoading, 
    error: apartmentError 
  } = useApartment(id || "");

  // Fetch clients for owner names
  const { data: clients = [] } = useClients();
  const { data: vendors = [] } = useVendors();

  // Delete mutation
  const deleteApartmentMutation = useDeleteApartment();

  // Helper function to get owner name from client ID
  const getOwnerName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Fetch products for this apartment
  const { data: products = [], isLoading: productsLoading } = useProducts({ apartment: id });
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const deliveries: any[] = [];
  const activities: any[] = [];
  const aiNotes: any[] = [];
  const manualNote = "";

  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [noteText, setNoteText] = useState("");

  // Modal states
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [deliveryLocationModalOpen, setDeliveryLocationModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [issueManagementModalOpen, setIssueManagementModalOpen] = useState(false);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<any>(null);
  const [selectedProductForPayment, setSelectedProductForPayment] = useState<any>(null);
  const [selectedProductForDelivery, setSelectedProductForDelivery] = useState<any>(null);
  const [deleteApartmentDialog, setDeleteApartmentDialog] = useState<{ open: boolean; apartmentName: string }>({ open: false, apartmentName: '' });
  const [deleteProductDialog, setDeleteProductDialog] = useState<{ open: boolean; productId: string; productName: string }>({ open: false, productId: '', productName: '' });
  const [skuEditModalOpen, setSKUEditModalOpen] = useState(false);
  const [selectedProductForSKU, setSelectedProductForSKU] = useState<Product | null>(null);
  const [unitPriceEditModalOpen, setUnitPriceEditModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<Product | null>(null);
  const [quantityEditModalOpen, setQuantityEditModalOpen] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [vendorDetailsModalOpen, setVendorDetailsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Show loading skeleton while data is loading
  if (apartmentLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="space-y-6">
          <DetailViewSkeleton />
        </div>
      </PageLayout>
    );
  }

  // Show error or not found state
  if (apartmentError || !apartment) {
    return (
      <PageLayout title="Apartment Not Found">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Apartment Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {apartmentError ? `Error loading apartment: ${apartmentError.message}` : 'The apartment you are looking for does not exist or has been removed.'}
              </p>
              <Button onClick={() => navigate("/apartments")}>Back to Apartments</Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Handle delete apartment
  const handleDelete = () => {
    if (!apartment) return;
    setDeleteApartmentDialog({ open: true, apartmentName: apartment.name });
  };

  const confirmDeleteApartment = async () => {
    if (!apartment) return;
    try {
      await deleteApartmentMutation.mutateAsync(apartment.id);
      navigate('/apartments');
    } catch (error) {
      console.error('Delete error:', error);
    }
    setDeleteApartmentDialog({ open: false, apartmentName: '' });
  };

  const handleSaveNote = () => {
    // TODO: Implement note saving with API
    console.log('Save note:', noteText);
  };

  // Product-related functions using API
  const handleProductStatusChange = async (productId: string, newStatus: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { status: newStatus }
      });
      toast({
        title: "Success",
        description: "Product status updated successfully",
      });
    } catch (error) {
      console.error('Product status update error:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleDeliveryStatusChange = async (productId: string, newStatus: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { delivery_type: newStatus }
      });
      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });
    } catch (error) {
      console.error('Delivery status update error:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const handleSKUUpdate = async (productId: string, newSKU: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { sku: newSKU }
      });
      toast({
        title: "Success",
        description: "SKU updated successfully",
      });
    } catch (error) {
      console.error('SKU update error:', error);
      toast({
        title: "Error",
        description: "Failed to update SKU",
        variant: "destructive",
      });
    }
  };

  const handleUnitPriceUpdate = async (productId: string, newPrice: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { unit_price: newPrice }
      });
      toast({
        title: "Success",
        description: "Unit price updated successfully",
      });
    } catch (error) {
      console.error('Unit price update error:', error);
      toast({
        title: "Error",
        description: "Failed to update unit price",
        variant: "destructive",
      });
    }
  };

  const handleQuantityUpdate = async (productId: string, newQuantity: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { qty: parseInt(newQuantity) }
      });
      toast({
        title: "Success",
        description: "Quantity updated successfully",
      });
    } catch (error) {
      console.error('Quantity update error:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleClientDetailsClick = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setClientDetailsModalOpen(true);
    }
  };

  const handleExpectedDeliveryDateChange = async (productId: string, date: Date) => {
    try {
      // Format date in local timezone to avoid off-by-one errors
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { expected_delivery_date: formattedDate }
      });
      toast({
        title: "Success",
        description: "Expected delivery date updated successfully",
      });
    } catch (error) {
      console.error('Expected delivery date update error:', error);
      toast({
        title: "Error",
        description: "Failed to update expected delivery date",
        variant: "destructive",
      });
    }
  };

  const handleActualDeliveryDateChange = async (productId: string, date: Date) => {
    try {
      // Format date in local timezone to avoid off-by-one errors
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      await updateProductMutation.mutateAsync({
        id: productId,
        product: { actual_delivery_date: formattedDate }
      });
      toast({
        title: "Success",
        description: "Actual delivery date updated successfully",
      });
    } catch (error) {
      console.error('Actual delivery date update error:', error);
      toast({
        title: "Error",
        description: "Failed to update actual delivery date",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setDeleteProductDialog({ open: true, productId, productName: product.product });
  };

  const confirmDeleteProduct = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteProductDialog.productId);
      toast({
        title: "Success", 
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Delete product error:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
    setDeleteProductDialog({ open: false, productId: '', productName: '' });
  };

  // Calculate overview stats from consolidated product data
  const totalItems = products.length;
  const orderedItems = products.filter((p) => ["Ordered", "Shipped", "Delivered"].includes(p.status)).length;
  const deliveredItems = products.filter((p) => p.status === "Delivered").length;
  const openIssues = products.filter((p) => p.issue_state && !["No Issue", "Resolved"].includes(p.issue_state)).length;
  const totalValue = products.reduce((sum, p) => sum + parseFloat(String(p.unit_price)) * p.qty, 0);
  const totalPayable = products.reduce((sum, p) => sum + parseFloat(String(p.payment_amount || 0)), 0);
  const totalPaid = products.reduce((sum, p) => sum + parseFloat(String(p.paid_amount || 0)), 0);
  const outstandingBalance = totalPayable - totalPaid;
  const overduePayments = products.filter((p) => {
    if (!p.payment_due_date || !p.payment_amount) return false;
    const outstanding = parseFloat(String(p.payment_amount || 0)) - parseFloat(String(p.paid_amount || 0));
    const isOverdue = new Date(p.payment_due_date) < new Date() && outstanding > 0;
    return isOverdue;
  }).length;

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered") || lowerStatus.includes("closed") || lowerStatus.includes("paid"))
      return "bg-success text-success-foreground";
    if (
      lowerStatus.includes("issue") ||
      lowerStatus.includes("damaged") ||
      lowerStatus.includes("wrong") ||
      lowerStatus.includes("missing") ||
      lowerStatus.includes("overdue")
    )
      return "bg-danger text-danger-foreground";
    if (lowerStatus.includes("waiting") || lowerStatus.includes("pending") || lowerStatus.includes("partial"))
      return "bg-warning text-warning-foreground";
    if (lowerStatus.includes("ordered") || lowerStatus.includes("shipped") || lowerStatus.includes("transit"))
      return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <PageLayout title={apartment.name}>
      {/* Breadcrumbs with Back Button */}
      <div className="mb-6 flex items-center gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/apartments">Apartments</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{apartment.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/apartments")} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{apartment.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={apartment.type === "furnishing" ? "bg-primary" : "bg-accent"}>
                {apartment.type === "furnishing" ? "Furnishing" : "Renovating"}
              </Badge>
              <Badge className={getStatusColor(apartment.status)}>{apartment.status}</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Progress:</strong> {apartment.progress}%
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/apartments/${apartment.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
        <Progress value={apartment.progress} className="h-2" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid w-full grid-cols-4 min-w-[600px] sm:min-w-0 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              Products & Procurement logs
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              Notes (AI)
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {orderedItems} ordered, {deliveredItems} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Total Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toLocaleString()} HUF</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-warning" />
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outstandingBalance.toLocaleString()} HUF</div>
                <p className="text-xs text-muted-foreground">Paid: {totalPaid.toLocaleString()} HUF</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-danger" />
                  Open Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openIssues}</div>
                <p className="text-xs text-muted-foreground">{overduePayments} overdue payments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Apartment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">{getOwnerName(apartment.client)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Designer</p>
                    <p className="font-medium">{apartment.designer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{apartment.address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{apartment.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{apartment.start_date ? new Date(apartment.start_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{apartment.due_date ? new Date(apartment.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                        <p className="leading-tight">{activity.summary}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product & Procurement Log Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">Product & Procurement Log ({products.length})</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => navigate(`/products/new?apartmentId=${id}`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {productsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <RefreshCw className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Loading products...</h3>
                <p className="text-muted-foreground">Please wait while we fetch the product data</p>
              </CardContent>
            </Card>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Add your first furniture item to get started</p>
                <Button onClick={() => navigate(`/products/new?apartmentId=${id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead className="min-w-[200px]">Product Name</TableHead>
                        <TableHead className="min-w-[180px]">Vendor</TableHead>
                        <TableHead className="min-w-[120px]">SKU</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Product Status</TableHead>
                        <TableHead>Delivery Status</TableHead>
                        <TableHead>Expected Delivery</TableHead>
                        <TableHead>Delivery Location</TableHead>
                        <TableHead>Actual Delivery</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Payment Due</TableHead>
                        <TableHead>Issue State</TableHead>
                        <TableHead>Actions / Chatbot</TableHead>
                        <TableHead>Ordered On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const rowColorClass =
                          product.status === "Delivered" || product.status === "Closed"
                            ? "bg-success/5"
                            : product.status === "Damaged" ||
                                product.status === "Wrong Item" ||
                                product.status === "Missing"
                              ? "bg-danger/5"
                              : product.status === "Shipped" || product.status === "Ordered"
                                ? "bg-primary/5"
                                : product.status === "Waiting For Stock"
                                  ? "bg-warning/5"
                                  : "";

                        const outstandingBalance = parseFloat(String(product.payment_amount || 0)) - parseFloat(String(product.paid_amount || 0));

                        return (
                          <TableRow key={product.id} className={rowColorClass}>
                            <TableCell>
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.product}
                                  className="h-10 w-10 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.link || product.vendor_link ? (
                                <a
                                  href={product.link || product.vendor_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                  {product.product}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="font-medium">{product.product}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {product.vendor_details ? (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm hover:underline"
                                    onClick={() => {
                                      setSelectedVendor(product.vendor_details!);
                                      setVendorDetailsModalOpen(true);
                                    }}
                                  >
                                    {product.vendor_details.name}
                                  </Button>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {product.vendor_name || 'Unknown Vendor'}
                                  </span>
                                )}
                                <Select
                                  value={product.vendor || 'unknown'}
                                  onValueChange={async (vendorId) => {
                                    try {
                                      await updateProductMutation.mutateAsync({
                                        id: product.id,
                                        product: { vendor: vendorId === 'unknown' ? null : vendorId }
                                      });
                                      toast({
                                        title: "Success",
                                        description: vendorId === 'unknown' ? "Vendor removed" : "Vendor updated successfully",
                                      });
                                    } catch (error) {
                                      console.error('Vendor update error:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to update vendor",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-8 h-8 p-0 border-0">
                                    <Settings className="h-4 w-4" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map((vendor) => (
                                      <SelectItem key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="unknown" className="text-muted-foreground italic">
                                      Unknown Vendor
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline font-mono text-xs"
                                onClick={() => {
                                  setSelectedProductForSKU(product);
                                  setSKUEditModalOpen(true);
                                }}
                              >
                                {product.sku || <span className="text-muted-foreground">Add SKU</span>}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline"
                                onClick={() => {
                                  setSelectedProductForPrice(product);
                                  setUnitPriceEditModalOpen(true);
                                }}
                              >
                                {parseFloat(String(product.unit_price)).toLocaleString()} HUF
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline"
                                onClick={() => {
                                  setSelectedProductForQty(product);
                                  setQuantityEditModalOpen(true);
                                }}
                              >
                                {product.qty}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {(parseFloat(String(product.unit_price)) * product.qty).toLocaleString()} HUF
                            </TableCell>
                            <TableCell>
                              <Select
                                value={product.status || "Design Approved"}
                                onValueChange={(value) => handleProductStatusChange(product.id, value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Design Approved">Design Approved</SelectItem>
                                  <SelectItem value="Ready To Order">Ready To Order</SelectItem>
                                  <SelectItem value="Ordered">Ordered</SelectItem>
                                  <SelectItem value="Waiting For Stock">Waiting For Stock</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="In Transit">In Transit</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Damaged">Damaged</SelectItem>
                                  <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                                  <SelectItem value="Missing Parts">Missing Parts</SelectItem>
                                  <SelectItem value="Incorrect Quantity">Incorrect Quantity</SelectItem>
                                  <SelectItem value="Replacement Ordered">Replacement Ordered</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={product.delivery_type || "Not Set"}
                                onValueChange={(value) => handleDeliveryStatusChange(product.id, value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Set">Not Set</SelectItem>
                                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="In Transit">In Transit</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Partially Delivered">Partially Delivered</SelectItem>
                                  <SelectItem value="Issue Reported">Issue Reported</SelectItem>
                                  <SelectItem value="Return Scheduled">Return Scheduled</SelectItem>
                                  <SelectItem value="Return Received">Return Received</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "w-[140px] justify-start text-left font-normal",
                                      !product.expected_delivery_date && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3 w-3" />
                                    {product.expected_delivery_date
                                      ? format(new Date(product.expected_delivery_date), "PP")
                                      : "Pick date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      product.expected_delivery_date ? new Date(product.expected_delivery_date) : undefined
                                    }
                                    onSelect={(date) => {
                                      if (date) {
                                        handleExpectedDeliveryDateChange(product.id, date);
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell>
                              {product.delivery_address || product.delivery_city ? (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProductForDelivery(product);
                                    setDeliveryLocationModalOpen(true);
                                  }}
                                  className="p-0 h-auto text-primary hover:underline flex items-center gap-1 text-left"
                                >
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="line-clamp-2">
                                    {product.delivery_city ? `${product.delivery_city}${product.delivery_address ? ', ' + product.delivery_address.split(',')[0] : ''}` : product.delivery_address}
                                  </span>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "w-[140px] justify-start text-left font-normal",
                                      !product.actual_delivery_date && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3 w-3" />
                                    {product.actual_delivery_date
                                      ? format(new Date(product.actual_delivery_date), "PP")
                                      : "Pick date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      product.actual_delivery_date ? new Date(product.actual_delivery_date) : undefined
                                    }
                                    onSelect={(date) => {
                                      if (date) {
                                        handleActualDeliveryDateChange(product.id, date);
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  setSelectedProductForPayment(product);
                                  setPaymentModalOpen(true);
                                }}
                              >
                                {product.payment_status ? (
                                  <Badge className={getStatusColor(product.payment_status)}>
                                    {product.payment_status}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">Set Payment</span>
                                )}
                                <CreditCard className="ml-1 h-3 w-3" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {product.payment_due_date ? (
                                  <>
                                    <div className="text-xs">
                                      {new Date(product.payment_due_date).toLocaleDateString()}
                                    </div>
                                    {outstandingBalance > 0 && (
                                      <div className="text-xs text-danger font-medium">
                                        Balance: {outstandingBalance.toLocaleString()} HUF
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.issue_state && product.issue_state !== "No Issue" ? (
                                <Badge className={getStatusColor(product.issue_state)}>{product.issue_state}</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-success/10 text-success">
                                  No Issue
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={
                                  product.issue_state && product.issue_state !== "No Issue" ? "default" : "outline"
                                }
                                onClick={() => {
                                  setSelectedProductForIssue(product);
                                  setIssueManagementModalOpen(true);
                                }}
                                className={cn(product.issue_state === "AI Resolving" && "animate-pulse")}
                              >
                                <Bot
                                  className={cn(
                                    "mr-1 h-3 w-3",
                                    product.issue_state === "AI Resolving" && "animate-spin",
                                  )}
                                />
                                {product.issue_state === "AI Resolving"
                                  ? "AI Active"
                                  : product.issue_state && product.issue_state !== "No Issue"
                                    ? "Manage Issue"
                                    : "Report Issue"}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {product.ordered_on ? new Date(product.ordered_on).toLocaleDateString() : "-"}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/products/${product.id}`)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/products/${product.id}/edit`)}
                                >
                                  <SquarePen className=" h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    handleDeleteProduct(product.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes (AI) Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Notes</CardTitle>
                <CardDescription>Add observations or notes about this apartment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedTextarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={10}
                  placeholder="Enter your notes here..."
                />
                <Button onClick={handleSaveNote}>Save Note</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI & Vendor Communication</CardTitle>
                <CardDescription>AI-generated emails and vendor correspondence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={note.sender === "AI" ? "default" : "outline"}>{note.sender}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {note.emailSubject && (
                        <div>
                          <p className="text-xs text-muted-foreground">Subject:</p>
                          <p className="font-medium text-sm">{note.emailSubject}</p>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded">{note.content}</div>
                    </div>
                  ))}
                  {aiNotes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No AI communications yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-xl font-semibold">Activity Timeline</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.icon === "ShoppingCart" && <Package className="h-5 w-5 text-primary" />}
                        {activity.icon === "CreditCard" && <DollarSign className="h-5 w-5 text-primary" />}
                        {activity.icon === "Mail" && <Mail className="h-5 w-5 text-primary" />}
                        {activity.icon === "PackageCheck" && <CheckCircle className="h-5 w-5 text-primary" />}
                        {activity.icon === "Package" && <Package className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.summary}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">by {activity.actor}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No activity recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <VendorDetailsModal open={vendorModalOpen} onOpenChange={setVendorModalOpen} vendorName={selectedVendorName} />

      {selectedProductForPayment && (
        <PaymentDetailsModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          product={selectedProductForPayment}
          onSave={async (updates) => {
            try {
              // Convert and map fields to match API expectations
              const apiUpdates: Partial<Product> = {};
              
              if (updates.discount !== undefined) apiUpdates.discount = String(updates.discount);
              if (updates.shippingCost !== undefined) apiUpdates.shipping_cost = String(updates.shippingCost);
              if (updates.paymentAmount !== undefined) apiUpdates.payment_amount = Number(updates.paymentAmount);
              if (updates.totalPaid !== undefined) apiUpdates.paid_amount = String(updates.totalPaid);
              if (updates.paymentStatus !== undefined) apiUpdates.payment_status = updates.paymentStatus;
              if (updates.currency !== undefined) apiUpdates.currency = updates.currency;
              
              await updateProductMutation.mutateAsync({
                id: selectedProductForPayment.id,
                product: apiUpdates
              });
              toast({
                title: "Success",
                description: "Payment details updated successfully",
              });
            } catch (error) {
              console.error('Payment update error:', error);
              toast({
                title: "Error",
                description: "Failed to update payment details",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      {selectedProductForIssue && (
        <IssueManagementModal
          open={issueManagementModalOpen}
          onOpenChange={setIssueManagementModalOpen}
          product={selectedProductForIssue}
          onIssueUpdated={() => {
            // Refresh will happen automatically via store
          }}
        />
      )}

      <DeliveryLocationModal
        open={deliveryLocationModalOpen}
        onOpenChange={setDeliveryLocationModalOpen}
        product={selectedProductForDelivery}
      />

      {/* Delete Apartment Confirmation Dialog */}
      <ConfirmDialog
        open={deleteApartmentDialog.open}
        onOpenChange={(open) => setDeleteApartmentDialog({ ...deleteApartmentDialog, open })}
        title="Delete Apartment"
        description={`Are you sure you want to delete "${deleteApartmentDialog.apartmentName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteApartment}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        open={deleteProductDialog.open}
        onOpenChange={(open) => setDeleteProductDialog({ ...deleteProductDialog, open })}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProductDialog.productName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteProduct}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* SKU Edit Modal */}
      {selectedProductForSKU && (
        <SKUEditModal
          open={skuEditModalOpen}
          onOpenChange={setSKUEditModalOpen}
          currentSKU={selectedProductForSKU.sku}
          productName={selectedProductForSKU.product}
          onSave={(newSKU) => handleSKUUpdate(selectedProductForSKU.id, newSKU)}
        />
      )}

      {/* Unit Price Edit Modal */}
      {selectedProductForPrice && (
        <UnitPriceEditModal
          open={unitPriceEditModalOpen}
          onOpenChange={setUnitPriceEditModalOpen}
          currentPrice={selectedProductForPrice.unit_price}
          productName={selectedProductForPrice.product}
          currency={selectedProductForPrice.currency || 'HUF'}
          onSave={(newPrice) => handleUnitPriceUpdate(selectedProductForPrice.id, newPrice)}
        />
      )}

      {/* Quantity Edit Modal */}
      {selectedProductForQty && (
        <QuantityEditModal
          open={quantityEditModalOpen}
          onOpenChange={setQuantityEditModalOpen}
          currentQuantity={selectedProductForQty.qty}
          productName={selectedProductForQty.product}
          unitPrice={selectedProductForQty.unit_price}
          currency={selectedProductForQty.currency || 'HUF'}
          onSave={(newQty) => handleQuantityUpdate(selectedProductForQty.id, newQty)}
        />
      )}

      {/* Client Details Modal */}
      <ClientDetailsModalAPI
        open={clientDetailsModalOpen}
        onOpenChange={setClientDetailsModalOpen}
        client={selectedClient}
      />

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModalAPI
          open={vendorDetailsModalOpen}
          onOpenChange={(open) => {
            setVendorDetailsModalOpen(open);
            if (!open) {
              setSelectedVendor(null);
            }
          }}
          vendor={selectedVendor}
        />
      )}
    </PageLayout>
  );
};

export default ApartmentView;
