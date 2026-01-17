import { useParams, useNavigate, Link } from "react-router-dom";
import { useApartment, useApartmentStatistics, useApartmentActivities } from "@/hooks/useApartmentApi";
import { useProductsByApartment, useDeleteProduct, useUpdateProduct } from "@/hooks/useProductApi";
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
import { MultiSelectTags } from "@/components/ui/multi-select-tags";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "lucide-react";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { VendorDetailsModal } from "@/components/modals/VendorDetailsModal";
import { IssueManagementModal } from "@/components/modals/IssueManagementModal";
import { DeliveryLocationModal } from "@/components/modals/DeliveryLocationModal";
import { SkuEditModal } from "@/components/modals/SkuEditModal";
import { UnitPriceEditModal } from "@/components/modals/UnitPriceEditModal";
import { QuantityEditModal } from "@/components/modals/QuantityEditModal";
import ApartmentViewSkeleton, { ApartmentViewProductsSkeleton, StatisticsCardsSkeleton, RecentActivitySkeleton } from "@/components/skeletons/ApartmentViewSkeleton";

const ApartmentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch apartment data from API
  const { data: apartment, isLoading, error } = useApartment(id || null);

  // Fetch products for this apartment
  const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch } = useProductsByApartment(id || null);
  // API returns array directly, not paginated response
  const products = productsData || [];
  
  // Fetch apartment statistics
  const { data: statistics, isLoading: isLoadingStats } = useApartmentStatistics(id || null);
  
  // Fetch apartment activities
  const { data: activities = [], isLoading: isLoadingActivities } = useApartmentActivities(id || null);
  
  // Delete product mutation
  const deleteProductMutation = useDeleteProduct();
  
  // Update product mutation
  const updateProductMutation = useUpdateProduct();
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: '', name: '', apartmentId: '' });
  

  // Helper function to format date without timezone issues
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // TODO: Add API hooks for deliveries when ready
  const deliveries: any[] = [];
  const aiNotes: any[] = [];
  const manualNote = "";

  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [noteText, setNoteText] = useState(manualNote);

  // Modal states
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorModalEditMode, setVendorModalEditMode] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<any>(null);
  const [deliveryLocationModalOpen, setDeliveryLocationModalOpen] = useState(false);
  const [selectedProductForDelivery, setSelectedProductForDelivery] = useState<any>(null);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [selectedProductForSku, setSelectedProductForSku] = useState<any>(null);
  const [unitPriceModalOpen, setUnitPriceModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<any>(null);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState<any>(null);

  // Delete handlers
  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteDialog({ open: true, id: productId, name: productName, apartmentId: id || '' });
  };

  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync({
        id: deleteDialog.id,
        name: deleteDialog.name,
        apartmentId: deleteDialog.apartmentId
      });
      setDeleteDialog({ open: false, id: '', name: '', apartmentId: '' });
    } catch (error) {
      // Error is handled by the mutation hook
      setDeleteDialog({ open: false, id: '', name: '', apartmentId: '' });
    }
  };

  // Loading state
  if (isLoading) {
    return <ApartmentViewSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <PageLayout title="Error">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error loading apartment</h2>
            <p className="text-muted-foreground mb-4">Unable to fetch apartment details. Please try again.</p>
            <Button onClick={() => navigate("/apartments")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apartments
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not found state
  if (!apartment) {
    return (
      <PageLayout title="Not Found">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">Apartment not found</h2>
            <Button onClick={() => navigate("/apartments")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apartments
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${apartment.name}"?`)) {
      // TODO: Implement delete API call
      toast({
        title: "Success",
        description: "Apartment deleted successfully",
      });
      navigate("/apartments");
    }
  };

  const handleProductStatusChange = (productId: string, newStatus: any) => {
    // TODO: Implement product status update API call
    toast({
      title: "Success",
      description: "Product status updated",
    });
  };

  const handleSaveNote = () => {
    // TODO: Implement save note API call
    toast({
      title: "Success",
      description: "Note saved",
    });
  };

  // Product update function using mutation hook
  const updateProduct = async (productId: string, updates: any) => {
    try {
      await updateProductMutation.mutateAsync({ id: productId, data: updates });
      // Refetch products to show updated data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = (productId: string) => {
    // TODO: Implement product delete API call
  };

  const addActivity = (activity: any) => {
    // TODO: Implement activity logging API call
  };

  // Use statistics from API or fallback to 0
  const totalItems = statistics?.total_items || 0;
  const orderedItems = statistics?.ordered_items || 0;
  const deliveredItems = statistics?.delivered_items || 0;
  const openIssues = statistics?.open_issues || 0;
  const totalValue = statistics?.total_value || 0;
  const totalPaid = statistics?.total_paid || 0;
  const outstandingBalance = statistics?.outstanding_balance || 0;
  const overduePayments = statistics?.overdue_payments || 0;

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered") || lowerStatus.includes("closed") || lowerStatus.includes("paid") || lowerStatus.includes("completed"))
      return "bg-green-500/10 text-green-500";
    if (
      lowerStatus.includes("issue") ||
      lowerStatus.includes("damaged") ||
      lowerStatus.includes("wrong") ||
      lowerStatus.includes("missing") ||
      lowerStatus.includes("overdue")
    )
      return "bg-red-500/10 text-red-500";
    if (lowerStatus.includes("waiting") || lowerStatus.includes("pending") || lowerStatus.includes("partial"))
      return "bg-yellow-500/10 text-yellow-500";
    if (lowerStatus.includes("ordered") || lowerStatus.includes("shipped") || lowerStatus.includes("transit") || lowerStatus.includes("ordering"))
      return "bg-blue-500/10 text-blue-500";
    if (lowerStatus.includes("planning"))
      return "bg-purple-500/10 text-purple-500";
    return "bg-gray-500/10 text-gray-500";
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
            {/* <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Progress:</strong> {apartment.progress}%
              </p>
            </div> */}
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
        {/* <Progress value={apartment.progress} className="h-2" /> */}
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
                {isLoadingStats ? (
                  <>
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalItems}</div>
                    <p className="text-xs text-muted-foreground">
                      {orderedItems} ordered, {deliveredItems} delivered
                    </p>
                  </>
                )}
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
                {isLoadingStats ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold">{totalValue.toLocaleString()} HUF</div>
                )}
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
                {isLoadingStats ? (
                  <>
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-28 bg-muted animate-pulse rounded mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{outstandingBalance.toLocaleString()} HUF</div>
                    <p className="text-xs text-muted-foreground">Paid: {totalPaid.toLocaleString()} HUF</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Open Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{openIssues}</div>
                    <p className="text-xs text-muted-foreground">{overduePayments} overdue payments</p>
                  </>
                )}
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
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">{apartment.client_details?.name || apartment.owner || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Designer</p>
                    <p className="font-medium">{apartment.designer || 'N/A'}</p>
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
                    <p className="font-medium">{apartment.start_date ? new Date(apartment.start_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{apartment.due_date ? new Date(apartment.due_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingActivities ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-4 w-4 rounded-full bg-muted animate-pulse flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
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
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => navigate(`/products/import?apartmentId=${id}`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Import Excel/CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>
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

          {isLoadingProducts ? (
            <ApartmentViewProductsSkeleton />
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
                        <TableHead>Product Name</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>SKU</TableHead>
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
                        const statusArray = Array.isArray(product.status) ? product.status : [];
                        const rowColorClass =
                          statusArray.includes("Delivered") || statusArray.includes("Closed")
                            ? "bg-green-500/5"
                            : statusArray.includes("Damaged") ||
                                statusArray.includes("Wrong Item") ||
                                statusArray.includes("Missing")
                              ? "bg-red-500/5"
                              : statusArray.includes("Shipped") || statusArray.includes("Ordered")
                                ? "bg-blue-500/5"
                                : statusArray.includes("Waiting For Stock")
                                  ? "bg-yellow-500/5"
                                  : "";

                        const outstandingBalance = parseFloat(product.payment_amount || '0') - parseFloat(product.paid_amount || '0');

                        return (
                          <TableRow key={product.id} className={rowColorClass}>
                            <TableCell>
                              {product.product_image ? (
                                <img
                                  src={product.product_image}
                                  alt={product.product}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.link ? (
                                <a
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                  title="Click to view product page"
                                >
                                  {product.product}
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="font-medium text-muted-foreground">{product.product}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-primary hover:underline"
                                  onClick={() => {
                                    setSelectedVendorName(product.vendor_name || 'Not Assigned');
                                    setSelectedProductId(product.id);
                                    setVendorModalEditMode(false);
                                    setVendorModalOpen(true);
                                  }}
                                >
                                  {product.vendor_name || <span className="text-muted-foreground italic">Not Assigned</span>}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setSelectedVendorName(product.vendor_name || 'Not Assigned');
                                    setSelectedProductId(product.id);
                                    setVendorModalEditMode(true);
                                    setVendorModalOpen(true);
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-mono text-xs text-primary hover:underline"
                                onClick={() => {
                                  setSelectedProductForSku(product);
                                  setSkuModalOpen(true);
                                }}
                              >
                                {product.sku || <span className="text-muted-foreground italic">Add SKU</span>}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline"
                                onClick={() => {
                                  setSelectedProductForPrice(product);
                                  setUnitPriceModalOpen(true);
                                }}
                              >
                                {parseFloat(product.unit_price).toLocaleString()} HUF
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              {/* Calculate total ordered quantity from all orders */}
                              {(() => {
                                const totalOrderedQty = product.order_status_info && product.order_status_info.length > 0
                                  ? product.order_status_info.reduce((sum: number, orderInfo: any) => sum + (orderInfo.quantity || 0), 0)
                                  : 0;
                                
                                return totalOrderedQty > 0 ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold">{totalOrderedQty}</span>
                                    <span className="text-xs text-muted-foreground">(ordered)</span>
                                  </div>
                                ) : (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary hover:underline"
                                    onClick={() => {
                                      setSelectedProductForQuantity(product);
                                      setQuantityModalOpen(true);
                                    }}
                                  >
                                    {product.qty}
                                  </Button>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {/* Calculate total based on ordered quantity if available, otherwise use product qty */}
                              {(() => {
                                const totalOrderedQty = product.order_status_info && product.order_status_info.length > 0
                                  ? product.order_status_info.reduce((sum: number, orderInfo: any) => sum + (orderInfo.quantity || 0), 0)
                                  : 0;
                                
                                const qtyToUse = totalOrderedQty > 0 ? totalOrderedQty : product.qty;
                                const total = parseFloat(product.unit_price) * qtyToUse;
                                
                                return `${total.toLocaleString()} HUF`;
                              })()}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 min-w-[200px]">
                                {/* Order Status Information */}
                                {product.order_status_info && product.order_status_info.length > 0 ? (
                                  product.order_status_info.map((orderInfo: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        variant={
                                          orderInfo.status === 'sent' ? 'default' :
                                          'outline'
                                        }
                                        className="text-xs"
                                      >
                                        {orderInfo.status === 'draft' ? 'Draft' :
                                         orderInfo.status === 'sent' ? 'Sent' :
                                         orderInfo.status}
                                      </Badge>
                                      <a
                                        href={`/orders/${orderInfo.order_id}`}
                                        className="text-xs text-primary hover:underline"
                                        title={`View order ${orderInfo.po_number}`}
                                      >
                                        {orderInfo.po_number}
                                      </a>
                                      <span className="text-xs text-muted-foreground">
                                        (Qty: {orderInfo.quantity})
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">
                                    Not ordered yet
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 min-w-[200px]">
                                {/* Delivery Status Information from Database */}
                                {product.delivery_status_info && product.delivery_status_info.length > 0 ? (
                                  product.delivery_status_info.map((deliveryInfo: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        variant={
                                          deliveryInfo.status === 'Received' ? 'default' :
                                          deliveryInfo.status === 'Returned' ? 'destructive' :
                                          deliveryInfo.status === 'In Transit' ? 'secondary' :
                                          deliveryInfo.status === 'Delayed' ? 'secondary' :
                                          'outline'
                                        }
                                        className={cn(
                                          "text-xs",
                                          deliveryInfo.status === 'Received' && "bg-green-500/10 text-green-500",
                                          deliveryInfo.status === 'In Transit' && "bg-blue-500/10 text-blue-500",
                                          deliveryInfo.status === 'Confirmed' && "bg-yellow-500/10 text-yellow-500",
                                          deliveryInfo.status === 'Delayed' && "bg-orange-500/10 text-orange-500",
                                          deliveryInfo.status === 'Returned' && "bg-red-500/10 text-red-500"
                                        )}
                                      >
                                        {deliveryInfo.status}
                                      </Badge>
                                      <a
                                        href={`/deliveries`}
                                        className="text-xs text-primary hover:underline"
                                        title={`View delivery ${deliveryInfo.order_reference}`}
                                      >
                                        {deliveryInfo.order_reference}
                                      </a>
                                      {deliveryInfo.tracking_number && (
                                        <span className="text-xs text-muted-foreground">
                                          (Track: {deliveryInfo.tracking_number})
                                        </span>
                                      )}
                                      {deliveryInfo.expected_date && (
                                        <span className="text-xs text-muted-foreground">
                                          ETA: {new Date(deliveryInfo.expected_date).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {/* Show expected delivery from order if available */}
                                {product.order_status_info && product.order_status_info.length > 0 ? (
                                  product.order_status_info.map((orderInfo: any, idx: number) => (
                                    orderInfo.expected_delivery ? (
                                      <div key={idx} className="flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs">
                                          {format(new Date(orderInfo.expected_delivery), "PP")}
                                        </span>
                                      </div>
                                    ) : null
                                  ))
                                ) : (
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
                                            updateProduct(product.id, { expected_delivery_date: formatDateForAPI(date) });
                                            toast({
                                              title: "Success",
                                              description: "Expected delivery date updated",
                                            });
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {/* Priority 1: Show shipping address from order */}
                                {product.order_status_info && product.order_status_info.length > 0 && product.order_status_info.some((o: any) => o.shipping_address) ? (
                                  product.order_status_info.map((orderInfo: any, idx: number) => (
                                    orderInfo.shipping_address ? (
                                      <div key={idx} className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs line-clamp-2">
                                          {orderInfo.shipping_address}
                                        </span>
                                      </div>
                                    ) : null
                                  ))
                                ) : (
                                  <>
                                    {/* Priority 2: Show delivery location from tracking */}
                                    {product.delivery_status_info && product.delivery_status_info.length > 0 ? (
                                      product.delivery_status_info.map((deliveryInfo: any, idx: number) => (
                                        deliveryInfo.location ? (
                                          <div key={idx} className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                            <span className="text-xs line-clamp-2">
                                              {deliveryInfo.location}
                                            </span>
                                          </div>
                                        ) : null
                                      ))
                                    ) : null}
                                    
                                    {/* Priority 3: Show product delivery address as fallback */}
                                    {(!product.delivery_status_info || product.delivery_status_info.length === 0 || !product.delivery_status_info.some((d: any) => d.location)) && (
                                      product.delivery_address || product.delivery_city ? (
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
                                      )
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {/* Show actual delivery date from delivery if available */}
                                {product.delivery_status_info && product.delivery_status_info.length > 0 ? (
                                  <>
                                    {product.delivery_status_info.map((deliveryInfo: any, idx: number) => (
                                      deliveryInfo.actual_date ? (
                                        <div key={idx} className="flex items-center gap-2">
                                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs">
                                            {format(new Date(deliveryInfo.actual_date), "PP")}
                                          </span>
                                        </div>
                                      ) : null
                                    ))}
                                  </>
                                ) : (
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
                                            updateProduct(product.id, { actual_delivery_date: formatDateForAPI(date) });
                                            toast({
                                              title: "Success",
                                              description: "Actual delivery date updated",
                                            });
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* Show payment status from orders/payments */}
                              {product.payment_status_from_orders ? (
                                <Badge 
                                  variant={
                                    product.payment_status_from_orders === 'Paid' ? 'default' :
                                    product.payment_status_from_orders === 'Partially Paid' ? 'secondary' :
                                    'outline'
                                  }
                                  className={
                                    product.payment_status_from_orders === 'Paid' ? 'bg-green-500/10 text-green-500' :
                                    product.payment_status_from_orders === 'Partially Paid' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-red-500/10 text-red-500'
                                  }
                                >
                                  {product.payment_status_from_orders}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                                  Unpaid
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {product.payment_due_date ? (
                                  <>
                                    <div className="text-xs">
                                      {new Date(product.payment_due_date).toLocaleDateString()}
                                    </div>
                                    {outstandingBalance > 0 && (
                                      <div className="text-xs text-red-500 font-medium">
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
                              {/* Show issue type from Issues page */}
                              {product.issue_status_info && product.issue_status_info.status !== 'No Issue' ? (
                                <div className="text-xs text-gray-700">
                                  {product.issue_status_info.type || 'Issue reported'}
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
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
                                  setIssueModalOpen(true);
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
                                  onClick={() => handleDeleteClick(product.id, product.product)}
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
      <VendorDetailsModal 
        open={vendorModalOpen} 
        onOpenChange={setVendorModalOpen} 
        vendorName={selectedVendorName}
        productId={selectedProductId}
        openInEditMode={vendorModalEditMode}
        onVendorUpdated={(vendorId, vendorName) => {
          // Update the product with new vendor
          updateProduct(selectedProductId, { vendor: vendorId, vendor_name: vendorName });
          toast({
            title: "Vendor Updated",
            description: `Product vendor changed to ${vendorName}`,
          });
          refetch(); // Refresh the product list
        }}
      />


      {selectedProductForIssue && (
        <IssueManagementModal
          open={issueModalOpen}
          onOpenChange={setIssueModalOpen}
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

      {selectedProductForSku && (
        <SkuEditModal
          open={skuModalOpen}
          onOpenChange={setSkuModalOpen}
          currentSku={selectedProductForSku.sku || ''}
          productId={selectedProductForSku.id}
          productName={selectedProductForSku.product}
          onSkuUpdated={(newSku) => {
            updateProduct(selectedProductForSku.id, { sku: newSku });
            toast({
              title: "Success",
              description: "SKU updated successfully",
            });
            refetch(); // Refresh the product list
          }}
        />
      )}

      {selectedProductForPrice && (
        <UnitPriceEditModal
          open={unitPriceModalOpen}
          onOpenChange={setUnitPriceModalOpen}
          currentPrice={selectedProductForPrice.unit_price || '0'}
          productId={selectedProductForPrice.id}
          productName={selectedProductForPrice.product}
          onPriceUpdated={(newPrice) => {
            updateProduct(selectedProductForPrice.id, { unit_price: newPrice });
            toast({
              title: "Success",
              description: "Unit price updated successfully",
            });
            refetch(); // Refresh the product list
          }}
        />
      )}

      {selectedProductForQuantity && (
        <QuantityEditModal
          open={quantityModalOpen}
          onOpenChange={setQuantityModalOpen}
          currentQuantity={selectedProductForQuantity.qty || '1'}
          productId={selectedProductForQuantity.id}
          productName={selectedProductForQuantity.product}
          onQuantityUpdated={(newQuantity) => {
            updateProduct(selectedProductForQuantity.id, { qty: newQuantity });
            toast({
              title: "Success",
              description: "Quantity updated successfully",
            });
            refetch(); // Refresh the product list
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: '', name: '', apartmentId: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, id: '', name: '', apartmentId: '' })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              autoFocus
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default ApartmentView;
