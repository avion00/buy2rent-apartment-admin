import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Phone,
  Building2,
  Package,
  User,
  FileText,
  Calendar,
  ExternalLink,
  MapPin,
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Home,
  ShoppingBag,
  Wallet,
  Activity,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '@/services/clientApi';
import { useEffect } from 'react';
import { format } from 'date-fns';

interface ClientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

export const ClientDetailsModal = ({
  open,
  onOpenChange,
  clientId,
}: ClientDetailsModalProps) => {
  const navigate = useNavigate();

  // Fetch client details from API
  const { data: clientDetails, isLoading, error, refetch } = useQuery({
    queryKey: ['clientDetails', clientId],
    queryFn: () => clientApi.getClientDetails(clientId!),
    enabled: !!clientId && open,
  });

  // Refetch when modal opens
  useEffect(() => {
    if (open && clientId) {
      refetch();
    }
  }, [open, clientId, refetch]);

  if (!clientId) return null;

  const client = clientDetails;
  
  // Extract apartments data
  // Details API returns: { count: number, data: [...] }
  const apartmentsResponse = clientDetails?.apartments;
  const clientApartments = apartmentsResponse?.data || [];
  const apartmentsCount = apartmentsResponse?.count || 0;
  
  // Extract products data
  // Details API returns: { count: number, total_value: number, data: [...] }
  const productsResponse = clientDetails?.products;
  const clientProducts = productsResponse?.data || [];
  const productsCount = productsResponse?.count || 0;
  const totalProductValue = productsResponse?.total_value || 0;
  
  console.log('Client Details Full:', clientDetails);
  console.log('Apartments Response:', apartmentsResponse);
  console.log('Products Response:', productsResponse);

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-success/10 text-success border-success/20'
      : 'bg-muted text-muted-foreground border-border/50';
  };

  const getApartmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Design Approved': 'bg-primary/10 text-primary border-primary/20',
      'Ordering': 'bg-warning/10 text-warning border-warning/20',
      'Renovating': 'bg-accent/10 text-accent border-accent/20',
      'Completed': 'bg-success/10 text-success border-success/20',
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border/50';
  };

  // Extract statistics
  const statistics = clientDetails?.statistics || {};
  const apartmentStats = statistics?.apartments || {};
  const productStats = statistics?.products || {};
  const financialStats = statistics?.financial || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              Client Profile
            </DialogTitle>
            {client && (
              <Badge variant="outline" className="text-xs">
                ID: {client.id.substring(0, 8)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Error loading client details</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : !client ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No client data found</p>
            </div>
          ) : (
          <div className="px-6 pb-6">
            {/* Client Header Card */}
            <div className="-mx-6 -mt-0 px-6 py-6 bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{client.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize font-semibold">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {client.type}
                    </Badge>
                    <Badge className={getStatusColor(client.account_status)}>
                      {client.account_status === 'Active' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {client.account_status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Joined {format(new Date(client.created_at), 'MMM yyyy')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border/50 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Email</p>
                    <p className="text-sm font-medium truncate">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border/50 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Phone</p>
                    <p className="text-sm font-medium truncate">{client.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="mt-3 p-3 rounded-lg bg-background/60 border border-border/50 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Notes</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{client.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Dashboard */}
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <BarChart3 className="h-4 w-4 text-primary" />
                Overview & Statistics
              </h4>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="group p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <TrendingUp className="h-3 w-3 text-primary/50" />
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {apartmentStats.total || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Apartments</p>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <ShoppingBag className="h-4 w-4 text-accent" />
                    </div>
                    <TrendingUp className="h-3 w-3 text-accent/50" />
                  </div>
                  <p className="text-2xl font-bold text-accent">
                    {productStats.total || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Products</p>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-success/20">
                      <DollarSign className="h-4 w-4 text-success" />
                    </div>
                    <TrendingUp className="h-3 w-3 text-success/50" />
                  </div>
                  <p className="text-2xl font-bold text-success">
                    {new Intl.NumberFormat('hu-HU').format(financialStats.total_spent || 0)} Ft
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Total Value</p>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-warning/20">
                      <Wallet className="h-4 w-4 text-warning" />
                    </div>
                    <Activity className="h-3 w-3 text-warning/50" />
                  </div>
                  <p className="text-2xl font-bold text-warning">
                    {new Intl.NumberFormat('hu-HU').format(financialStats.outstanding || 0)} Ft
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Outstanding</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              {financialStats.total_spent > 0 && (
                <div className="p-4 rounded-xl border bg-card">
                  <h5 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    Financial Summary
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-lg font-bold text-foreground">
                        {new Intl.NumberFormat('hu-HU').format(financialStats.total_spent || 0)} Ft
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Paid</p>
                      <p className="text-lg font-bold text-success">
                        {new Intl.NumberFormat('hu-HU').format(financialStats.total_paid || 0)} Ft
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                      <p className="text-lg font-bold text-warning">
                        {new Intl.NumberFormat('hu-HU').format(financialStats.outstanding || 0)} Ft
                      </p>
                    </div>
                  </div>
                  {/* Payment Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Payment Progress</span>
                      <span className="font-semibold text-primary">
                        {Math.round(((financialStats.total_paid || 0) / (financialStats.total_spent || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((financialStats.total_paid || 0) / (financialStats.total_spent || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Tabbed Content */}
            <Tabs defaultValue="apartments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="apartments" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Apartments ({apartmentsCount})
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products ({productsCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="apartments" className="mt-4">
                <div>
              {clientApartments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No apartments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientApartments.map((apartment: any) => {
                    return (
                      <div
                        key={apartment.id}
                        className="p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">{apartment.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {apartment.address}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getApartmentStatusColor(apartment.status)}
                          >
                            {apartment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {apartment.due_date || 'N/A'}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigate(`/apartments`);
                              onOpenChange(false);
                            }}
                            className="h-7 text-xs"
                          >
                            View
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-4">
                <div>
              {clientProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {clientProducts.map((product: any) => {
                    const productImage = product.product_image;
                    const categoryName = product.category_name || product.category_details?.name;
                    const room = product.room;
                    
                    return (
                      <div
                        key={product.id}
                        className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={product.product}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {product.product}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {categoryName && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryName}
                                </Badge>
                              )}
                              {room && (
                                <span className="text-xs text-muted-foreground">
                                  📍 {room}
                                </span>
                              )}
                              {product.vendor_name && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.vendor_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-foreground">
                              {new Intl.NumberFormat('hu-HU').format(
                                parseFloat(product.unit_price || 0) * product.qty
                              )}{' '}
                              Ft
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.qty} × {new Intl.NumberFormat('hu-HU').format(parseFloat(product.unit_price || 0))} Ft
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
