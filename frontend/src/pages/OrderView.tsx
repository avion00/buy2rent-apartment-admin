import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useOrder } from '@/hooks/useOrderApi';
import { format } from 'date-fns';
import OrderViewSkeleton from '@/components/skeletons/OrderViewSkeleton';
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Store,
  Package,
  DollarSign,
  Calendar,
  Truck,
  FileText,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit,
  MapPin,
  ClipboardList,
  Image,
} from 'lucide-react';

const OrderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(id || '');

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const colors: Record<string, string> = {
      'draft': 'bg-gray-500/10 text-gray-500',
      'pending': 'bg-yellow-500/10 text-yellow-500',
      'sent': 'bg-blue-500/10 text-blue-500',
      'confirmed': 'bg-green-500/10 text-green-500',
      'delivered': 'bg-purple-500/10 text-purple-500',
      'received': 'bg-emerald-500/10 text-emerald-500',
      'cancelled': 'bg-red-500/10 text-red-500',
    };
    return colors[statusLower] || 'bg-gray-500/10 text-gray-500';
  };

  // Loading state
  if (loading) {
    return <OrderViewSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <PageLayout title="Error">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Error loading order</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not found state
  if (!order) {
    return (
      <PageLayout title="Not Found">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  ) || 0;

  return (
    <PageLayout title={`Order ${order.po_number}`}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{order.po_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{order.po_number}</h1>
                <p className="text-muted-foreground">Purchase Order Details</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              {order.is_delivered && (
                <Badge className="bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Delivered
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{order.items_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{Number(order.total).toLocaleString()} HUF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placed On</p>
                  <p className="text-2xl font-bold">
                    {order.placed_on ? format(new Date(order.placed_on), 'MMM dd') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="text-2xl font-bold">
                    {order.expected_delivery ? format(new Date(order.expected_delivery), 'MMM dd') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Apartment</p>
                        <p className="font-medium">{order.apartment_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vendor</p>
                        <p className="font-medium">{order.vendor_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">PO Number</p>
                        <p className="font-medium font-mono">{order.po_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Confirmation Code</p>
                        <p className="font-medium font-mono">{order.confirmation_code || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-medium font-mono">{order.tracking_number || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Shipping Address</p>
                        <p className="font-medium">{order.shipping_address || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={item.id || index}>
                            <TableCell className="w-12">
                              <div className="w-10 h-10 bg-muted/30 rounded flex items-center justify-center">
                                {item.product_image ? (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      e.currentTarget.src = '';
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement?.classList.add('bg-muted/30');
                                    }}
                                  />
                                ) : (
                                  <Image className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">{item.sku || '-'}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(item.unit_price).toLocaleString()} HUF
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {Number(item.total_price).toLocaleString()} HUF
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No items in this order</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Timeline */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Total</span>
                  <span>{itemsTotal.toLocaleString()} HUF</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {Number(order.total).toLocaleString()} HUF
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Order Placed</p>
                      <p className="text-xs text-muted-foreground">
                        {order.placed_on ? format(new Date(order.placed_on), 'PPP') : '-'}
                      </p>
                    </div>
                  </div>

                  {order.expected_delivery && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-full">
                        <Truck className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Expected Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.expected_delivery), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.actual_delivery && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-500/10 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Actual Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.actual_delivery), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-gray-500/10 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {order.created_at ? format(new Date(order.created_at), 'PPP p') : '-'}
                      </p>
                    </div>
                  </div>

                  {order.updated_at && order.updated_at !== order.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gray-500/10 rounded-full">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.updated_at), 'PPP p')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderView;
