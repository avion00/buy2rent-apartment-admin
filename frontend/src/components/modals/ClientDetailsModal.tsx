import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '@/services/clientApi';
import { useEffect } from 'react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Client Profile
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{client.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {client.type}
                    </Badge>
                    <Badge className={getStatusColor(client.account_status)}>
                      {client.account_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{client.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Statistics */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Overview
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-2xl font-bold text-primary">
                    {apartmentsCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Apartments</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-2xl font-bold text-accent">
                    {productsCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Products</p>
                </div>
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-2xl font-bold text-success">
                    {new Intl.NumberFormat('hu-HU').format(totalProductValue)} Ft
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Value</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Apartments */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Apartments ({apartmentsCount})
              </h4>
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

            <Separator />

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products ({productsCount})
              </h4>
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
          </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
