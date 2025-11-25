import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
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
} from "lucide-react";
import { toast } from "sonner";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const product = useDataStore((state) => state.products.find((p) => p.id === id));
  const apartment = useDataStore((state) => state.apartments.find((a) => a.id === product?.apartmentId));
  const issue = useDataStore((state) => state.issues.find((i) => i.id === product?.issueId));
  const deleteProduct = useDataStore((state) => state.deleteProduct);
  const addActivity = useDataStore((state) => state.addActivity);

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

  if (!product) {
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
    if (window.confirm(`Are you sure you want to delete "${product.product}"?`)) {
      deleteProduct(product.id);

      if (apartment) {
        addActivity({
          apartmentId: apartment.id,
          actor: "Admin",
          icon: "Trash2",
          summary: `Deleted product: ${product.product}`,
          type: "product",
        });
      }

      toast.success("Product deleted successfully");
      navigate(`/apartments/${product.apartmentId}`);
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
              <Link to={`/apartments/${product.apartmentId}`}>{apartment?.name || "Apartment"}</Link>
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
              onClick={() => navigate(`/apartments/${product.apartmentId}`)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{product.product}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.statusTags?.map((tag) => (
              <Badge key={tag} className={getStatusColor(tag)}>
                {tag}
              </Badge>
            ))}
            {product.deliveryStatusTags?.map((tag) => (
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{product.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-mono text-sm">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{product.room || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <Badge variant={product.availability === "In Stock" ? "default" : "secondary"}>
                    {product.availability}
                  </Badge>
                </div>
                {product.vendorLink && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vendor Link</p>
                    <a
                      href={product.vendorLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      View on Vendor Site
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Price</p>
                    <p className="text-2xl font-bold">{product.unitPrice.toLocaleString()} HUF</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-xl font-bold">{product.qty}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {(product.unitPrice * product.qty).toLocaleString()} HUF
                    </p>
                  </div>
                  {product.paymentStatus && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                      <Badge className={getStatusColor(product.paymentStatus)}>{product.paymentStatus}</Badge>
                    </div>
                  )}
                </div>
                {product.paymentAmount && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Amount:</span>
                      <span className="font-medium">{product.paymentAmount.toLocaleString()} HUF</span>
                    </div>
                    {product.paidAmount !== undefined && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paid Amount:</span>
                          <span className="font-medium">{product.paidAmount.toLocaleString()} HUF</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Outstanding Balance:</span>
                          <span
                            className={product.paymentAmount - product.paidAmount > 0 ? "text-danger" : "text-success"}
                          >
                            {(product.paymentAmount - product.paidAmount).toLocaleString()} HUF
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {product.orderedOn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ordered On</p>
                      <p className="font-medium">{new Date(product.orderedOn).toLocaleDateString()}</p>
                    </div>
                  )}
                  {product.expectedDeliveryDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">{new Date(product.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {product.actualDeliveryDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Delivery</p>
                      <p className="font-medium">{new Date(product.actualDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {product.paymentDueDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Due</p>
                      <p className="font-medium">{new Date(product.paymentDueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {product.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{product.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {product.imageUrl ? (
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.imageUrl}
                  alt={product.product}
                  className="w-full rounded-lg object-cover aspect-square"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No image available</p>
              </CardContent>
            </Card>
          )}

          {product.issueState && product.issueState !== "No Issue" && (
            <Card className="border-danger/50 bg-danger/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger">
                  <AlertCircle className="h-5 w-5" />
                  Issue Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(product.issueState)}>{product.issueState}</Badge>
                {issue && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{issue.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <span className="ml-2 font-medium">{new Date(issue.reportedOn).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-1 text-foreground">{issue.description}</p>
                    </div>
                    {issue.aiActivated && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-2">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Active - See conversation above
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
