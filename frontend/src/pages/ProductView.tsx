import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProduct } from "@/hooks/useProductApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Image as ImageIcon,
  Bell,
  MessageSquare,
  Bot,
  User,
  Truck,
  MapPin,
  Phone,
  Mail,
  FileText,
  Ruler,
  Weight,
  Palette,
  Tag,
  Globe,
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Building2,
  Box,
  Barcode,
} from "lucide-react";
import { toast } from "sonner";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fullscreenImage, setFullscreenImage] = useState(false);

  // Fetch product data from API
  const { data: product, isLoading, error } = useProduct(id || null);
  const apartment = product?.apartment_details;
  
  // TODO: Add issue API integration when ready
  const issue = null;

  // Generate notifications from issue status and AI communication
  const notifications = [];
  if (issue) {
    if (issue.resolutionStatus === "Closed") {
      notifications.push({
        id: "resolved",
        title: "Issue Resolved",
        message: `The issue for ${product?.product} has been successfully resolved.`,
        timestamp: issue.aiCommunicationLog?.[issue.aiCommunicationLog.length - 1]?.timestamp || issue.reportedOn,
        type: "success",
      });
    } else if (issue.resolutionStatus === "Resolution Agreed") {
      notifications.push({
        id: "agreed",
        title: "Resolution Agreed",
        message: "Vendor has agreed to a resolution for the issue.",
        timestamp: issue.aiCommunicationLog?.[issue.aiCommunicationLog.length - 1]?.timestamp || issue.reportedOn,
        type: "info",
      });
    } else if (issue.resolutionStatus === "Pending Vendor Response") {
      notifications.push({
        id: "pending",
        title: "Awaiting Vendor Response",
        message: "AI chatbot is waiting for vendor response.",
        timestamp: issue.aiCommunicationLog?.[issue.aiCommunicationLog.length - 1]?.timestamp || issue.reportedOn,
        type: "warning",
      });
    }

    if (issue.aiActivated && issue.aiCommunicationLog && issue.aiCommunicationLog.length > 0) {
      notifications.push({
        id: "ai-active",
        title: "AI Chatbot Active",
        message: `${issue.aiCommunicationLog.length} messages exchanged with supplier.`,
        timestamp: issue.aiCommunicationLog[issue.aiCommunicationLog.length - 1].timestamp,
        type: "info",
      });
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [fullscreenImage]);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="container mx-auto py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Skeleton className="h-4 w-20" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-24" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-32" />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Product Information Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="p-3 bg-background rounded-lg border">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specifications Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-3 bg-background rounded-lg border">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent">
                  <Skeleton className="h-6 w-44" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-32 w-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-3 bg-background rounded-lg border">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Image Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-slate-500/5 to-transparent">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-square" />
                </CardContent>
              </Card>

              {/* Quick Stats Skeleton */}
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-cyan-500/5 to-transparent">
                  <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <PageLayout title="Product Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Product not found</h2>
          <Button onClick={() => navigate("/apartments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apartments
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handleDelete = () => {
    // TODO: Implement delete with API
    if (window.confirm(`Are you sure you want to delete "${product.product}"?`)) {
      toast.success("Product deleted successfully");
      navigate(`/apartments/${product.apartment}`);
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered") || lowerStatus.includes("closed") || lowerStatus.includes("paid"))
      return "bg-success text-success-foreground";
    if (
      lowerStatus.includes("issue") ||
      lowerStatus.includes("damaged") ||
      lowerStatus.includes("wrong") ||
      lowerStatus.includes("missing")
    )
      return "bg-danger text-danger-foreground";
    if (lowerStatus.includes("waiting") || lowerStatus.includes("pending") || lowerStatus.includes("partial"))
      return "bg-warning text-warning-foreground";
    if (lowerStatus.includes("ordered") || lowerStatus.includes("shipped") || lowerStatus.includes("transit"))
      return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <PageLayout title={product.product}>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/apartments">Apartments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/apartments/${product.apartment}`}>{apartment?.name || "Apartment"}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.product}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-start space-x-2  mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/apartments/${product.apartment}`)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{product.product}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Array.isArray(product.status) ? product.status : []).map((tag) => (
              <Badge key={tag} className={getStatusColor(tag)}>
                {tag}
              </Badge>
            ))}
            {(product.delivery_status_tags || []).map((tag) => (
              <Badge key={tag} variant="outline" className={getStatusColor(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {notifications.length > 0 && (
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-danger text-danger-foreground text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 rounded-lg border border-border bg-muted/30 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <Badge
                              variant="outline"
                              className={
                                notification.type === "success"
                                  ? "bg-success/10 text-success border-success/20"
                                  : notification.type === "warning"
                                    ? "bg-warning/10 text-warning border-warning/20"
                                    : "bg-primary/10 text-primary border-primary/20"
                              }
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/products/${product.id}/edit`)}
            className="shrink-0"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="shrink-0">
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Product Information */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Description */}
              {product.description && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Vendor</p>
                  </div>
                  <p className="font-semibold">{product.vendor_name || "-"}</p>
                  {product.vendor_link && (
                    <a
                      href={product.vendor_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <div className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Barcode className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">SKU</p>
                  </div>
                  <p className="font-mono text-sm font-semibold">{product.sku || "-"}</p>
                </div>
                
                <div className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Category</p>
                  </div>
                  <p className="font-semibold">{product.category_name || "-"}</p>
                </div>
                
                <div className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Room</p>
                  </div>
                  <p className="font-semibold">{product.room || "-"}</p>
                </div>
                
                <div className="p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Availability</p>
                  </div>
                  <Badge variant={product.availability === "In Stock" ? "default" : "secondary"}>
                    {product.availability}
                  </Badge>
                </div>
                
                <div className="p-3 bg-background rounded-lg border col-span-full sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Product Status</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(product.status) ? product.status : []).length > 0 ? (
                      (Array.isArray(product.status) ? product.status : []).map((tag) => (
                        <Badge key={tag} className={getStatusColor(tag)}>
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No status set</span>
                    )}
                  </div>
                </div>
                
                {product.brand && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Brand</p>
                    </div>
                    <p className="font-semibold">{product.brand}</p>
                  </div>
                )}
                
                {product.model_number && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Model Number</p>
                    </div>
                    <p className="font-mono text-sm font-semibold">{product.model_number}</p>
                  </div>
                )}
                
                {product.sn && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Barcode className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Serial Number</p>
                    </div>
                    <p className="font-mono text-sm font-semibold">{product.sn}</p>
                  </div>
                )}
                
                {product.country_of_origin && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Country of Origin</p>
                    </div>
                    <p className="font-semibold">{product.country_of_origin}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Product Specifications */}
          {(product.dimensions || product.weight || product.material || product.color || product.size) && (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-600" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.dimensions && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Dimensions</p>
                      </div>
                      <p className="font-semibold">{product.dimensions}</p>
                    </div>
                  )}
                  
                  {product.weight && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Weight</p>
                      </div>
                      <p className="font-semibold">{product.weight}</p>
                    </div>
                  )}
                  
                  {product.material && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Material</p>
                      </div>
                      <p className="font-semibold">{product.material}</p>
                    </div>
                  )}
                  
                  {product.color && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Color</p>
                      </div>
                      <p className="font-semibold">{product.color}</p>
                    </div>
                  )}
                  
                  {product.size && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Size</p>
                      </div>
                      <p className="font-semibold">{product.size}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing & Payment */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                  <p className="text-2xl font-bold text-primary">{parseFloat(product.unit_price).toLocaleString()} {product.currency}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border-2 border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-blue-600">{product.qty}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border-2 border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {parseFloat(product.total_amount).toLocaleString()} {product.currency}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {product.shipping_cost && parseFloat(product.shipping_cost) > 0 && (
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Shipping Cost</p>
                    <p className="font-semibold">{parseFloat(product.shipping_cost).toLocaleString()} {product.currency}</p>
                  </div>
                )}
                
                {product.discount && parseFloat(product.discount) > 0 && (
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Discount</p>
                    <p className="font-semibold text-green-600">-{parseFloat(product.discount).toLocaleString()} {product.currency}</p>
                  </div>
                )}
                
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                  <Badge className={getStatusColor(product.payment_status)}>{product.payment_status}</Badge>
                </div>
                
                {product.payment_status_from_orders && (
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Order Payment Status</p>
                    <Badge className={getStatusColor(product.payment_status_from_orders)}>{product.payment_status_from_orders}</Badge>
                  </div>
                )}
              </div>
              
              {(product.payment_amount || product.paid_amount) && (
                <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {product.payment_amount && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment Amount</p>
                        <p className="font-semibold">{parseFloat(product.payment_amount).toLocaleString()} {product.currency}</p>
                      </div>
                    )}
                    {product.paid_amount !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
                        <p className="font-semibold text-green-600">{parseFloat(product.paid_amount).toLocaleString()} {product.currency}</p>
                      </div>
                    )}
                    {product.outstanding_balance !== undefined && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Outstanding Balance</p>
                        <p className={`text-lg font-bold ${parseFloat(product.outstanding_balance) > 0 ? 'text-danger' : 'text-success'}`}>
                          {parseFloat(product.outstanding_balance).toLocaleString()} {product.currency}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Order Tracking */}
          {product.order_status_info && product.order_status_info.length > 0 && (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {product.order_status_info.map((order, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          {order.po_number && (
                            <span className="text-sm font-mono text-muted-foreground">PO: {order.po_number}</span>
                          )}
                        </div>
                        {order.quantity && (
                          <span className="text-sm font-semibold">Qty: {order.quantity}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {order.placed_on && (
                          <div>
                            <p className="text-xs text-muted-foreground">Placed On</p>
                            <p className="font-medium">{new Date(order.placed_on).toLocaleDateString()}</p>
                          </div>
                        )}
                        {order.expected_delivery && (
                          <div>
                            <p className="text-xs text-muted-foreground">Expected Delivery</p>
                            <p className="font-medium">{new Date(order.expected_delivery).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      {order.shipping_address && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
                          <p className="text-sm">{order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Delivery Information */}
          {(product.delivery_status_info && product.delivery_status_info.length > 0) || product.delivery_address || product.tracking_number ? (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-600" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Delivery Status Tracking */}
                {product.delivery_status_info && product.delivery_status_info.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Delivery Tracking</h4>
                    {product.delivery_status_info.map((delivery, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                          {delivery.priority && (
                            <Badge variant="outline">{delivery.priority}</Badge>
                          )}
                        </div>
                        {delivery.tracking_number && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                            <p className="font-mono text-sm font-semibold">{delivery.tracking_number}</p>
                          </div>
                        )}
                        {delivery.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Current Location</p>
                              <p className="text-sm font-medium">{delivery.location}</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {delivery.expected_date && (
                            <div>
                              <p className="text-xs text-muted-foreground">Expected Date</p>
                              <p className="font-medium">{new Date(delivery.expected_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {delivery.actual_date && (
                            <div>
                              <p className="text-xs text-muted-foreground">Actual Date</p>
                              <p className="font-medium">{new Date(delivery.actual_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Delivery Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.delivery_type && (
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Delivery Type</p>
                      <p className="font-semibold capitalize">{product.delivery_type.replace('_', ' ')}</p>
                    </div>
                  )}
                  
                  {product.tracking_number && (
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                      <p className="font-mono text-sm font-semibold">{product.tracking_number}</p>
                    </div>
                  )}
                  
                  {product.ordered_on && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Ordered On</p>
                      </div>
                      <p className="font-semibold">{new Date(product.ordered_on).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {product.expected_delivery_date && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Expected Delivery</p>
                      </div>
                      <p className="font-semibold">{new Date(product.expected_delivery_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {product.actual_delivery_date && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-muted-foreground">Actual Delivery</p>
                      </div>
                      <p className="font-semibold text-green-600">{new Date(product.actual_delivery_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {product.eta && (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">ETA</p>
                      </div>
                      <p className="font-semibold">{new Date(product.eta).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {product.condition_on_arrival && (
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Condition on Arrival</p>
                      <p className="font-semibold">{product.condition_on_arrival}</p>
                    </div>
                  )}
                </div>
                
                {/* Delivery Address */}
                {product.delivery_address && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <h4 className="font-semibold text-sm">Delivery Address</h4>
                    </div>
                    <p className="text-sm mb-1">{product.delivery_address}</p>
                    {(product.delivery_city || product.delivery_postal_code || product.delivery_country) && (
                      <p className="text-sm text-muted-foreground">
                        {[product.delivery_city, product.delivery_postal_code, product.delivery_country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Contact Information */}
                {(product.delivery_contact_person || product.delivery_contact_phone || product.delivery_contact_email) && (
                  <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Delivery Contact</h4>
                    {product.delivery_contact_person && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{product.delivery_contact_person}</span>
                      </div>
                    )}
                    {product.delivery_contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${product.delivery_contact_phone}`} className="text-sm text-primary hover:underline">
                          {product.delivery_contact_phone}
                        </a>
                      </div>
                    )}
                    {product.delivery_contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${product.delivery_contact_email}`} className="text-sm text-primary hover:underline">
                          {product.delivery_contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Delivery Instructions */}
                {(product.delivery_instructions || product.delivery_notes || product.special_instructions) && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">Instructions & Notes</h4>
                    {product.delivery_instructions && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Delivery Instructions</p>
                        <p className="text-sm">{product.delivery_instructions}</p>
                      </div>
                    )}
                    {product.delivery_notes && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Delivery Notes</p>
                        <p className="text-sm">{product.delivery_notes}</p>
                      </div>
                    )}
                    {product.special_instructions && (
                      <div>
                        <p className="text-xs text-muted-foreground">Special Instructions</p>
                        <p className="text-sm">{product.special_instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Notes & Additional Information */}
          {(product.notes || product.manual_notes || product.ai_summary_notes) && (
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Notes & Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {product.notes && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">General Notes</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{product.notes}</p>
                  </div>
                )}
                {product.manual_notes && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Manual Notes</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{product.manual_notes}</p>
                  </div>
                )}
                {product.ai_summary_notes && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground font-semibold">AI Summary</p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{product.ai_summary_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Product Image with Zoom */}
          {product.product_image ? (
            <Card className="border-2 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="relative group cursor-pointer overflow-hidden"
                  onMouseEnter={() => setImageZoom(true)}
                  onMouseLeave={() => setImageZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setFullscreenImage(true)}
                >
                  <img
                    src={product.product_image}
                    alt={product.product}
                    className="w-full object-cover aspect-square transition-transform duration-200"
                    style={{
                      transform: imageZoom ? 'scale(1.5)' : 'scale(1)',
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  />
                  
                  {/* Zoom indicator overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
                  
                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    Hover to zoom • Click for fullscreen
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardContent className="py-24 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No image available</p>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Stats */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-cyan-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-cyan-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Ordered</span>
                {product.is_ordered ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Active Order</span>
                {product.has_active_order ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{new Date(product.updated_at).toLocaleDateString()}</span>
              </div>
              {product.created_by && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Created By</span>
                  <span className="text-sm font-medium">{product.created_by}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issue Status */}
          {product.issue_state && product.issue_state !== "No Issue" && (
            <Card className="border-2 border-danger/50 bg-danger/5">
              <CardHeader className="bg-gradient-to-r from-danger/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-danger">
                  <AlertCircle className="h-5 w-5" />
                  Issue Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="p-3 bg-background rounded-lg border border-danger/20">
                  <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                  <Badge className={getStatusColor(product.issue_state)}>{product.issue_state}</Badge>
                </div>
                
                {product.issue_status_info && product.issue_status_info.status !== 'No Issue' && (
                  <div className="space-y-3">
                    {product.issue_status_info.type && (
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Issue Type</p>
                        <p className="font-semibold">{product.issue_status_info.type}</p>
                      </div>
                    )}
                    {product.issue_status_info.priority && (
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Priority</p>
                        <Badge variant="outline">{product.issue_status_info.priority}</Badge>
                      </div>
                    )}
                    {product.issue_status_info.created_at && (
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Reported On</p>
                        <p className="font-medium">{new Date(product.issue_status_info.created_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {product.issue_description && (
                  <div className="p-4 bg-background rounded-lg border border-danger/20">
                    <p className="text-xs text-muted-foreground mb-2">Description</p>
                    <p className="text-sm leading-relaxed">{product.issue_description}</p>
                  </div>
                )}
                
                {(product.replacement_requested || product.replacement_approved) && (
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Replacement Status</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {product.replacement_requested ? (
                          <CheckCircle2 className="h-4 w-4 text-warning" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Replacement Requested</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.replacement_approved ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Replacement Approved</span>
                      </div>
                      {product.replacement_eta && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">Replacement ETA</p>
                          <p className="text-sm font-medium">{new Date(product.replacement_eta).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && product.product_image && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(false)}
        >
          <button
            onClick={() => setFullscreenImage(false)}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors duration-200 group"
            aria-label="Close fullscreen"
          >
            <XCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">{product.product}</p>
            <p className="text-xs text-white/70 mt-0.5">Press ESC or click outside to close</p>
          </div>
          
          <img
            src={product.product_image}
            alt={product.product}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 mt-6 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Show AI Conversation prominently if active issue exists */}
          {issue && issue.aiActivated && issue.aiCommunicationLog && issue.aiCommunicationLog.length > 0 && (
            <Card className="mb-6 overflow-hidden border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        AI Chatbot Conversation
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <span className="animate-pulse mr-1.5">●</span>
                          Active
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Live conversation with {product.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={getStatusColor(issue.resolutionStatus || "Open")}>
                      {issue.resolutionStatus || "Open"}
                    </Badge>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-medium">{issue.aiCommunicationLog.length} messages</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] sm:h-[500px]">
                  <div className="p-4 sm:p-6 space-y-4">
                    {issue.aiCommunicationLog.map((log, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                          log.sender === "AI" ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                            log.sender === "AI"
                              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                              : log.sender === "Vendor"
                                ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {log.sender === "AI" ? (
                            <Bot className="h-5 w-5" />
                          ) : log.sender === "Vendor" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>

                        <div
                          className={`flex-1 space-y-1.5 max-w-[85%] sm:max-w-[75%] ${
                            log.sender === "AI" ? "items-start" : "items-end"
                          } flex flex-col`}
                        >
                          <div
                            className={`flex items-center gap-2 ${log.sender === "AI" ? "flex-row" : "flex-row-reverse"}`}
                          >
                            <span className="text-xs font-semibold text-foreground">{log.sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              log.sender === "AI"
                                ? "bg-primary text-primary-foreground rounded-tl-sm"
                                : log.sender === "Vendor"
                                  ? "bg-secondary text-secondary-foreground rounded-tr-sm"
                                  : "bg-muted/50 text-foreground rounded-tl-sm border border-border"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{log.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground px-1">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {issue.resolutionStatus === "Pending Vendor Response" && (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                          <div className="flex gap-1">
                            <span
                              className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">Supplier is typing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductView;
