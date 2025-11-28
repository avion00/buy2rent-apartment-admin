import { useParams, useNavigate, Link } from "react-router-dom";
import { useApartment, useDeleteApartment, useClients, useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useApi";
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
  Clock,
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
  AlertCircle,
} from "lucide-react";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { DetailViewSkeleton } from "@/components/skeletons/CardSkeleton";

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
  
  // For now, we'll use empty arrays for deliveries, activities, etc.
  // These will be integrated when their respective APIs are available
  const deliveries: any[] = [];
  const activities: any[] = [];
  const aiNotes: any[] = [];
  const manualNote = "";

  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [noteText, setNoteText] = useState("");

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
  const handleDelete = async () => {
    if (!apartment) return;
    
    if (confirm(`Are you sure you want to delete "${apartment.name}"? This action cannot be undone.`)) {
      try {
        await deleteApartmentMutation.mutateAsync(apartment.id);
        navigate('/apartments');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // Product-related functions using API
  const handleProductStatusChange = async (productId: string, newStatus: any) => {
    try {
      await updateProductMutation.mutateAsync({ id: productId, product: { status: newStatus } });
    } catch (error) {
      console.error('Product status update error:', error);
    }
  };

  const handleSaveNote = () => {
    // TODO: Implement note saving with API when notes API is available
    console.log('Save note:', noteText);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.product}"? This action cannot be undone.`)) {
      try {
        await deleteProductMutation.mutateAsync(productId);
      } catch (error) {
        console.error('Delete product error:', error);
      }
    }
  };

  // Calculate overview stats from consolidated product data
  const totalItems = products.length;
  const orderedItems = products.filter((p) => ["Ordered", "Shipped", "Delivered"].includes(p.status)).length;
  const deliveredItems = products.filter((p) => p.status === "Delivered").length;
  const openIssues = products.filter((p) => p.issue_state && !["No Issue", "Resolved"].includes(p.issue_state)).length;
  const totalValue = products.reduce((sum, p) => sum + p.unit_price * p.qty, 0);
  const totalPayable = products.reduce((sum, p) => sum + (p.payment_amount || 0), 0);
  const totalPaid = products.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const outstandingBalance = totalPayable - totalPaid;
  const overduePayments = products.filter(
    (p) => p.payment_due_date && p.payment_amount && p.payment_amount > p.paid_amount && new Date(p.payment_due_date) < new Date(),
  ).length;

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
    if (lowerStatus.includes("shipped") || lowerStatus.includes("ordered") || lowerStatus.includes("progress"))
      return "bg-primary text-primary-foreground";
    if (lowerStatus.includes("waiting") || lowerStatus.includes("pending"))
      return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <PageLayout title={apartment.name}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{apartment.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/apartments")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apartments
            </Button>
            <Badge variant="outline" className="capitalize">
              {apartment.type}
            </Badge>
            <Badge className={getStatusColor(apartment.status)}>{apartment.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/apartments/${apartment.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
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
                {orderedItems} ordered • {deliveredItems} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValue.toLocaleString()} HUF</div>
              <p className="text-xs text-muted-foreground">Project value</p>
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
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries ({deliveries.length})</TabsTrigger>
            <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
            <TabsTrigger value="ai-notes">AI Notes ({aiNotes.length})</TabsTrigger>
            <TabsTrigger value="manual-notes">Manual Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage all products for this apartment project
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                            {productsLoading ? "Loading products..." : "No products found for this apartment."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.product}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.product}</TableCell>
                            <TableCell>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline"
                              >
                                {product.vendor_name || product.vendor}
                                <Settings className="ml-1 h-3 w-3" />
                              </Button>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                            <TableCell className="text-right">{product.unit_price.toLocaleString()} HUF</TableCell>
                            <TableCell className="text-center">{product.qty}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {(product.unit_price * product.qty).toLocaleString()} HUF
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.availability}</Badge>
                            </TableCell>
                            <TableCell>
                              {product.expected_delivery_date ? new Date(product.expected_delivery_date).toLocaleDateString() : 'Not set'}
                            </TableCell>
                            <TableCell>
                              {product.delivery_address || 'Not set'}
                            </TableCell>
                            <TableCell>
                              {product.actual_delivery_date ? new Date(product.actual_delivery_date).toLocaleDateString() : 'Not delivered'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.payment_status === 'Paid' ? 'default' : 'destructive'}>
                                {product.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.payment_due_date ? new Date(product.payment_due_date).toLocaleDateString() : 'Not set'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.issue_state === 'No Issue' ? 'default' : 'destructive'}>
                                {product.issue_state}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Bot className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              {product.ordered_on ? new Date(product.ordered_on).toLocaleDateString() : 'Not ordered'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ApartmentView;
