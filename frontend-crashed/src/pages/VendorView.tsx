import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Star,
  Package,
  Building2,
  Truck,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { useVendorDetailSmart, useVendorStatistics } from '@/hooks/useVendorApi';

const VendorView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Use API hooks to fetch vendor data - handles both UUID and name parameters
  const { data: vendor, isLoading, error } = useVendorDetailSmart(id || '');
  const { data: statistics } = useVendorStatistics(vendor?.id || '');

  // Debug logging
  console.log('VendorView Debug:', {
    urlParam: id,
    isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || ''),
    vendor: vendor,
    isLoading,
    error: error?.message,
    hasVendor: !!vendor,
    vendorName: vendor?.name
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading vendor...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error Loading Vendor">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Vendor</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Failed to load vendor data'}
            </p>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!vendor) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The vendor you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Get data from API response
  const vendorProducts = vendor.products || [];
  const vendorOrders = vendor.orders || [];
  const vendorIssues = vendor.issues || [];
  const vendorPayments = vendor.payments || [];

  const renderStars = (rating: number | string) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const safeRating = isNaN(numRating) ? 0 : numRating;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(safeRating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <PageLayout title={vendor.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendors')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
          
          <Button 
            onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Button>
        </div>

        {/* Vendor Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-4xl">
                  {vendor.logo}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-3xl font-bold">{vendor.name}</h2>
                      <p className="text-muted-foreground">Verified Vendor</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(vendor.reliability)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${vendor.contact}`} className="hover:underline">
                      {vendor.contact}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {vendor.website.replace('https://', '')}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Lead Time: {vendor.lead_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.orders_count} Total Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold mt-1">{vendor.orders_count}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                  <p className="text-3xl font-bold mt-1">{vendor.active_issues}</p>
                </div>
                <AlertCircle className={`h-8 w-8 ${vendor.active_issues > 0 ? 'text-destructive' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-3xl font-bold mt-1">{vendorProducts.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reliability</p>
                  <p className="text-3xl font-bold mt-1">{(typeof vendor.reliability === 'string' ? parseFloat(vendor.reliability) : vendor.reliability).toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{vendor.contact}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                          {vendor.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Business Details</h3>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lead Time</span>
                        <span className="text-sm font-medium">{vendor.lead_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reliability Score</span>
                        <span className="text-sm font-medium">{vendor.reliability}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Orders</span>
                        <span className="text-sm font-medium">{vendor.orders_count}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Performance Metrics</h3>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{statistics?.performance?.on_time_delivery_rate || 95}%</p>
                          <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-bold">{statistics?.performance?.quality_rating || 4.5}</p>
                          <p className="text-sm text-muted-foreground">Quality Rating</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-bold">{statistics?.performance?.order_accuracy || 98}%</p>
                          <p className="text-sm text-muted-foreground">Order Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.product}</TableCell>
                          <TableCell>{product.apartment}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.qty}</TableCell>
                          <TableCell>
                            <Badge variant={
                              product.status === 'delivered' ? 'default' :
                              product.status === 'ordered' ? 'secondary' : 'outline'
                            }>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.availability === 'in_stock' ? 'default' : 'destructive'}>
                              {product.availability.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.po_number}</TableCell>
                          <TableCell>{order.apartment}</TableCell>
                          <TableCell>{order.items_count}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'in_transit' ? 'secondary' :
                              order.status === 'confirmed' ? 'outline' : 'outline'
                            }>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.placed_on}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorIssues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{issue.item}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{issue.issue_type.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                          <TableCell>
                            <Badge variant={
                              issue.priority === 'high' ? 'destructive' :
                              issue.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              issue.status === 'resolved' ? 'default' :
                              issue.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.created_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Paid Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.order_no}</TableCell>
                          <TableCell>{payment.apartment}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              payment.status === 'paid' ? 'default' :
                              payment.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.due_date}</TableCell>
                          <TableCell>{payment.paid_date || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default VendorView;
