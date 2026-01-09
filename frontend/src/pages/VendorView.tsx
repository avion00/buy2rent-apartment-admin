import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useVendor, useVendorProducts, useRemoveVendorProduct } from '@/hooks/useVendorApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, User as UserIcon, Image as ImageIcon } from 'lucide-react';

const VendorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch vendor data from API
  const { data: vendor, isLoading, error } = useVendor(id || null);
  
  // Fetch vendor products
  const { data: products = [], isLoading: productsLoading } = useVendorProducts(id || null);
  
  // Remove product mutation
  const removeProduct = useRemoveVendorProduct(id || '');

  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor details...</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Error or not found state
  if (error || !vendor) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "The vendor you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const renderStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(numRating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{numRating.toFixed(1)}</span>
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
            onClick={() => navigate(`/vendors/${id}/edit`)}
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
              <div className="flex items-center justify-center bg-muted rounded-full w-24 h-24 overflow-hidden">
                {vendor.website ? (
                  <img 
                    src={`https://logo.clearbit.com/${new URL(vendor.website).hostname}`}
                    alt={`${vendor.name} logo`}
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackAttempted) {
                        target.dataset.fallbackAttempted = 'true';
                        target.src = `https://www.google.com/s2/favicons?domain=${new URL(vendor.website).hostname}&sz=128`;
                      } else {
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.className = 'text-4xl';
                          fallback.textContent = vendor.logo || vendor.name.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl">
                    {vendor.logo || vendor.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
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
                    <a href={`mailto:${vendor.email}`} className="hover:underline">
                      {vendor.email}
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
                  <p className="text-3xl font-bold mt-1">
                    {productsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      products.length
                    )}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reliability</p>
                  <p className="text-3xl font-bold mt-1">
                    {(() => {
                      const rel = typeof vendor.reliability === 'string' ? parseFloat(vendor.reliability) : vendor.reliability;
                      return rel.toFixed(1);
                    })()}
                  </p>
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
                        <span className="text-sm">{vendor.email}</span>
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
                          <p className="text-2xl font-bold">95%</p>
                          <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-bold">4.5</p>
                          <p className="text-sm text-muted-foreground">Quality Rating</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-bold">98%</p>
                          <p className="text-sm text-muted-foreground">Order Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                {productsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Products</h3>
                    <p className="text-muted-foreground">
                      This vendor hasn't supplied any products yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product Details</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Apartment</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Availability</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.product_image ? (
                                <img 
                                  src={product.product_image} 
                                  alt={product.product}
                                  className="w-16 h-16 object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 bg-muted rounded-md flex items-center justify-center ${product.product_image ? 'hidden' : ''}`}>
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 min-w-[200px]">
                                <p className="font-medium">{product.product}</p>
                                {product.description && (
                                  <p className="text-xs text-muted-foreground">{product.description}</p>
                                )}
                                {product.dimensions && (
                                  <p className="text-xs text-muted-foreground">📏 {product.dimensions}</p>
                                )}
                                {product.material && (
                                  <p className="text-xs text-muted-foreground">🧱 {product.material}</p>
                                )}
                                {product.color && (
                                  <p className="text-xs text-muted-foreground">🎨 {product.color}</p>
                                )}
                                {product.brand && (
                                  <p className="text-xs text-muted-foreground">🏷️ {product.brand}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category_name}</Badge>
                            </TableCell>
                            <TableCell>
                              {product.apartment_details?.client_details ? (
                                <div className="space-y-1 min-w-[150px]">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{product.apartment_details.client_details.name}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{product.apartment_details.client_details.email}</p>
                                  <p className="text-xs text-muted-foreground">{product.apartment_details.client_details.phone}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {product.apartment_details.client_details.type}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.apartment_details ? (
                                <div className="space-y-1 min-w-[150px]">
                                  <p className="text-sm font-medium">{product.apartment_details.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.apartment_details.type}</p>
                                  <p className="text-xs text-muted-foreground">👤 {product.apartment_details.owner}</p>
                                  <Badge variant={
                                    product.apartment_details.status === 'Delivery' ? 'default' :
                                    product.apartment_details.status === 'In Progress' ? 'secondary' : 'outline'
                                  } className="text-xs">
                                    {product.apartment_details.status}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{product.room || '-'}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">{product.qty || '-'}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {product.unit_price ? (
                                <div className="space-y-1">
                                  <span className="font-medium">
                                    {typeof product.unit_price === 'number' 
                                      ? `${product.unit_price.toFixed(2)} ${product.currency || ''}`
                                      : `${product.unit_price} ${product.currency || ''}`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {product.total_amount || product.total_cost ? (
                                <div className="space-y-1">
                                  <span className="font-semibold text-primary">
                                    {product.total_amount || product.total_cost} {product.currency || ''}
                                  </span>
                                  {product.outstanding_balance && parseFloat(product.outstanding_balance) > 0 && (
                                    <p className="text-xs text-destructive">
                                      Due: {product.outstanding_balance} {product.currency}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 min-w-[120px]">
                                <Badge variant={
                                  product.payment_status === 'Paid' ? 'default' :
                                  product.payment_status === 'Unpaid' ? 'destructive' :
                                  product.payment_status === 'Partial' ? 'secondary' : 'outline'
                                }>
                                  {product.payment_status || 'Unknown'}
                                </Badge>
                                {product.paid_amount && parseFloat(product.paid_amount) > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Paid: {product.paid_amount} {product.currency}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                product.availability === 'In Stock' ? 'default' :
                                product.availability === 'Out of Stock' ? 'destructive' :
                                product.availability === 'Pre-order' ? 'secondary' : 'outline'
                              }>
                                {product.availability || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={removeProduct.isPending}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Product?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{product.product}" from this vendor? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeProduct.mutate(product.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-6">
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Orders</h3>
                  <p className="text-muted-foreground">
                    Order history for this vendor will be displayed here.
                  </p>
                </div>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues" className="mt-6">
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Issues</h3>
                  <p className="text-muted-foreground">
                    Issue tracking for this vendor will be displayed here.
                  </p>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-6">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payments</h3>
                  <p className="text-muted-foreground">
                    Payment history for this vendor will be displayed here.
                  </p>
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
