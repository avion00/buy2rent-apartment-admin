import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, AlertCircle, Bot, MessageSquare, Image as ImageIcon, Clock, CheckCircle2, XCircle, Loader2, Building2, User, Mail, Phone, Calendar, ShoppingCart, FileText, Target, Truck } from 'lucide-react';
import { ProductIssueCard } from '@/components/issues/ProductIssueCard';
import { AIConversationPanel } from '@/components/issues/AIConversationPanel';
import { IssuePhotosGallery } from '@/components/issues/IssuePhotosGallery';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { IssueResolutionPanel } from '@/components/issues/IssueResolutionPanel';
import { toast } from 'sonner';
import { issueApi, Issue } from '@/services/issueApi';
import { IssueDetailSkeleton } from '@/components/skeletons/IssueDetailSkeleton';

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!issueId) {
      setError('No issue ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    issueApi.getIssue(issueId)
      .then((data) => {
        setIssue(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch issue:', err);
        setError('Issue not found');
      })
      .finally(() => setLoading(false));
  }, [issueId]);

  const handleUpdateIssue = async (updates: any) => {
    if (!issue) return;
    try {
      const updated = await issueApi.updateIssue(issue.id, updates);
      setIssue(updated);
      toast.success('Issue updated');
    } catch (err) {
      toast.error('Failed to update issue');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Issue Details">
        <IssueDetailSkeleton />
      </PageLayout>
    );
  }

  if (error || !issue) {
    return (
      <PageLayout title="Issue Not Found">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Issue Not Found</h2>
          <Button onClick={() => navigate('/issues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Pending Vendor Response': return 'secondary';
      case 'Resolution Agreed': return 'default';
      case 'Closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Closed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Open': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <PageLayout title="Issue Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/issues')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Issue Details</h1>
              <p className="text-muted-foreground">Issue #{issue.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(issue.status || 'Open')}
            <Badge variant={getStatusColor(issue.status || 'Open')}>
              {issue.status || 'Open'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      {issue.type}
                    </CardTitle>
                    <CardDescription>
                      Reported on {issue.reported_on ? new Date(issue.reported_on).toLocaleDateString() : 'Unknown'}
                    </CardDescription>
                  </div>
                  {issue.ai_activated && (
                    <Badge variant="default" className="gap-1">
                      <Bot className="h-3 w-3" />
                      AI Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product-specific Descriptions */}
                {issue.items && issue.items.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-3">Issue Descriptions by Product</h4>
                    {issue.items.map((item: any, index: number) => (
                      <div key={item.id || index} className="p-4 bg-muted/30 rounded-lg  space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-sm">{item.product_name || item.order_item_product_name || 'Unknown Product'}</h5>
                          {item.quantity_affected && (
                            <Badge variant="outline" className="flex-shrink-0">
                              Qty: {item.quantity_affected}
                            </Badge>
                          )}
                        </div>
                        {item.issue_types && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.issue_types.split(',').map((type: string, i: number) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {type.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                {/* Key Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant={issue.priority === 'Critical' ? 'destructive' : issue.priority === 'High' ? 'default' : 'secondary'}>
                      {issue.priority || 'Medium'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusColor(issue.status || 'Open')}>
                      {issue.status || 'Open'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution Status</p>
                    <p className="font-medium">{issue.resolution_status || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>

                {issue.impact && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="h-4 w-4" /> Impact
                      </p>
                      <p className="font-medium">{issue.impact}</p>
                    </div>
                  </>
                )}

                {/* Dates Section */}
                {(issue.expected_resolution || issue.replacement_eta || issue.delivery_date) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {issue.expected_resolution && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Expected Resolution
                          </p>
                          <p className="font-medium">{new Date(issue.expected_resolution).toLocaleDateString()}</p>
                        </div>
                      )}
                      {issue.replacement_eta && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Truck className="h-4 w-4" /> Replacement ETA
                          </p>
                          <p className="font-medium">{new Date(issue.replacement_eta).toLocaleDateString()}</p>
                        </div>
                      )}
                      {issue.delivery_date && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Delivery Date
                          </p>
                          <p className="font-medium">{new Date(issue.delivery_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Additional Info Section */}
                {(issue.invoice_number || issue.tracking_number || issue.order_details?.tracking_number) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {issue.invoice_number && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Invoice #
                          </p>
                          <p className="font-medium">{issue.invoice_number}</p>
                        </div>
                      )}
                      {(issue.tracking_number || issue.order_details?.tracking_number) && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Truck className="h-4 w-4" /> Tracking #
                            {!issue.tracking_number && issue.order_details?.tracking_number && (
                              <span className="text-xs">(from Order)</span>
                            )}
                          </p>
                          <p className="font-medium">{issue.tracking_number || issue.order_details?.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Resolution Info Section */}
                {(issue.resolution_type || issue.resolution_notes) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Resolution Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {issue.resolution_type && (
                          <div>
                            <p className="text-sm text-muted-foreground">Resolution Type</p>
                            <Badge variant="outline">{issue.resolution_type}</Badge>
                          </div>
                        )}
                      </div>
                      {issue.resolution_notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Resolution Notes</p>
                          <p className="text-sm whitespace-pre-wrap">{issue.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order & Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order & Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Details */}
                {issue.order_details && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Order Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="font-medium">{issue.order_details.order_number || issue.order_details.id}</p>
                      </div>
                      {issue.order_details.order_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">{new Date(issue.order_details.order_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      {issue.order_details.status && (
                        <div>
                          <p className="text-sm text-muted-foreground">Order Status</p>
                          <Badge variant="outline">{issue.order_details.status}</Badge>
                        </div>
                      )}
                      {issue.order_details.total_amount && (
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-medium">${issue.order_details.total_amount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Issue Items - Multiple Products (Premium Layout) */}
                {issue.items && issue.items.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          Affected Products
                        </CardTitle>
                        <Badge variant="secondary" className="font-semibold">
                          {issue.items.length} {issue.items.length === 1 ? 'Item' : 'Items'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {issue.items.map((item: any, index: number) => (
                        <div 
                          key={item.id || index} 
                          className="flex gap-4 p-4 rounded-xl border bg-gradient-to-r from-background to-muted/20 hover:shadow-sm transition-all"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-muted bg-gradient-to-br from-muted to-muted/50 shadow-sm">
                              {item.product_image ? (
                                <img 
                                  src={item.product_image} 
                                  alt={item.product_name || 'Product'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Product Name & Quantity */}
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-semibold text-sm line-clamp-1">
                                {item.product_name || item.order_item_product_name || 'Unknown Product'}
                              </h5>
                              <Badge variant="outline" className="flex-shrink-0 gap-1">
                                <ShoppingCart className="h-3 w-3" />
                                {item.quantity_affected}
                              </Badge>
                            </div>
                            
                            {/* Issue Types */}
                            {item.issue_types && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.issue_types.split(',').slice(0, 4).map((type: string, i: number) => (
                                  <Badge 
                                    key={i} 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5 bg-destructive/5 text-destructive border-destructive/20 gap-1"
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                    {type.trim()}
                                  </Badge>
                                ))}
                                {item.issue_types.split(',').length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{item.issue_types.split(',').length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Description */}
                            {item.description && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                <p className="line-clamp-2">{item.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Order Item Details (Legacy - for issues without items) */}
                {issue.order_item_details && (!issue.items || issue.items.length === 0) && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" /> Order Item Details
                    </h4>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {(issue.order_item_details.product_image || issue.product_details?.product_image) ? (
                          <img 
                            src={issue.order_item_details.product_image || issue.product_details?.product_image} 
                            alt={issue.order_item_details.product_name || 'Product'} 
                            className="w-24 h-24 rounded-lg object-cover border-2 border-muted"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg flex items-center justify-center border-2 border-muted bg-muted">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Product Details */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Product Name</p>
                          <p className="font-medium">{issue.order_item_details.product_name}</p>
                        </div>
                        {issue.order_item_details.quantity && (
                          <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-medium">{issue.order_item_details.quantity}</p>
                          </div>
                        )}
                        {issue.order_item_details.unit_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Unit Price</p>
                            <p className="font-medium">${issue.order_item_details.unit_price}</p>
                          </div>
                        )}
                        {issue.order_item_details.total_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Total Price</p>
                            <p className="font-medium">${issue.order_item_details.total_price}</p>
                          </div>
                        )}
                        {issue.order_item_details.sku && (
                          <div>
                            <p className="text-sm text-muted-foreground">SKU</p>
                            <p className="font-medium">{issue.order_item_details.sku}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Details - Show all products from items */}
                {issue.items && issue.items.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" /> Product Details ({issue.items.length})
                    </h4>
                    {issue.items.map((item: any, index: number) => (
                      <div key={item.id || index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.product_image ? (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name || 'Product'} 
                                className="w-24 h-24 rounded-lg object-cover border-2 border-muted"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-lg flex items-center justify-center border-2 border-muted bg-muted">
                                <Package className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          {/* Product Info */}
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Product Name</p>
                              <p className="font-medium">{item.product_name || item.order_item_product_name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Quantity Affected</p>
                              <p className="font-medium">{item.quantity_affected || 1}</p>
                            </div>
                            {item.issue_types && (
                              <div>
                                <p className="text-sm text-muted-foreground">Issue Types</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.issue_types.split(',').slice(0, 2).map((type: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {type.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : issue.product_details ? (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" /> Product Details
                    </h4>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {issue.product_details.product_image ? (
                          <img 
                            src={issue.product_details.product_image} 
                            alt={issue.product_details.product || 'Product'} 
                            className="w-24 h-24 rounded-lg object-cover border-2 border-muted"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg flex items-center justify-center border-2 border-muted bg-muted">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Product Name</p>
                          <p className="font-medium">{issue.product_details.product}</p>
                        </div>
                        {issue.product_details.sku && (
                          <div>
                            <p className="text-sm text-muted-foreground">SKU</p>
                            <p className="font-medium">{issue.product_details.sku}</p>
                          </div>
                        )}
                        {issue.product_details.category && (
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium">{issue.product_details.category}</p>
                          </div>
                        )}
                        {issue.product_details.unit_price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Unit Price</p>
                            <p className="font-medium">${issue.product_details.unit_price}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Fallback if no order/product details */}
                {!issue.order_details && !issue.order_item_details && !issue.product_details && (
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center border-2 border-muted bg-muted flex-shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{issue.display_product_name || issue.product_name || 'Unknown'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apartment & Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Apartment & Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apartment Info */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Apartment
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{issue.apartment_details?.name || 'Unknown'}</p>
                      </div>
                      {issue.apartment_details?.address && (
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{issue.apartment_details.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Vendor
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{issue.vendor_name || issue.vendor_details?.name || 'Unknown'}</p>
                      </div>
                      {issue.vendor_details?.contact_person && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> Contact Person
                          </p>
                          <p className="font-medium">{issue.vendor_details.contact_person}</p>
                        </div>
                      )}
                      {issue.vendor_details?.email && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </p>
                          <a href={`mailto:${issue.vendor_details.email}`} className="font-medium text-primary hover:underline">
                            {issue.vendor_details.email}
                          </a>
                        </div>
                      )}
                      {issue.vendor_details?.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Phone
                          </p>
                          <a href={`tel:${issue.vendor_details.phone}`} className="font-medium text-primary hover:underline">
                            {issue.vendor_details.phone}
                          </a>
                        </div>
                      )}
                      {issue.vendor_contact && (
                        <div>
                          <p className="text-sm text-muted-foreground">Vendor Contact</p>
                          <p className="font-medium">{issue.vendor_contact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="conversation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="conversation" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photos ({issue.photos?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversation" className="mt-6">
                <AIConversationPanel 
                  issue={issue as any} 
                  onUpdateIssue={handleUpdateIssue}
                />
              </TabsContent>
              
              <TabsContent value="photos" className="mt-6">
                <IssuePhotosGallery 
                  photos={(issue.photos || []) as any}
                  onAddPhoto={async (photo) => {
                    // For now, just show a message - photo upload needs backend support
                    toast.info('Photo upload feature coming soon');
                  }}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-6">
                <IssueTimeline issue={issue as any} product={issue.product_details as any} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            <IssueResolutionPanel 
              issue={issue as any}
              vendor={issue.vendor_details as any}
              onUpdateIssue={handleUpdateIssue}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
