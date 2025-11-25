import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import { Client, Apartment, Product } from '@/stores/useDataStore';
import { useNavigate } from 'react-router-dom';

interface ClientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  apartments: Apartment[];
  products: Product[];
}

export const ClientDetailsModal = ({
  open,
  onOpenChange,
  client,
  apartments,
  products,
}: ClientDetailsModalProps) => {
  const navigate = useNavigate();

  if (!client) return null;

  const clientApartments = apartments.filter((apt) => apt.clientId === client.id);
  const clientProducts = products.filter((product) =>
    clientApartments.some((apt) => apt.id === product.apartmentId)
  );

  const totalProductValue = clientProducts.reduce(
    (sum, product) => sum + product.unitPrice * product.qty,
    0
  );

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
                    <Badge className={getStatusColor(client.accountStatus)}>
                      {client.accountStatus}
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
                  <p className="text-2xl font-bold text-primary">{clientApartments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Apartments</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-2xl font-bold text-accent">{clientProducts.length}</p>
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
                Apartments ({clientApartments.length})
              </h4>
              {clientApartments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No apartments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientApartments.map((apartment) => {
                    const apartmentProducts = products.filter(
                      (p) => p.apartmentId === apartment.id
                    );
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
                              <Package className="h-3 w-3" />
                              <span>{apartmentProducts.length} products</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {apartment.dueDate}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigate(`/apartments/${apartment.id}`);
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
                Products ({clientProducts.length})
              </h4>
              {clientProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {clientProducts.map((product) => {
                    const apartment = apartments.find((apt) => apt.id === product.apartmentId);
                    return (
                      <div
                        key={product.id}
                        className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">
                              {product.product}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {apartment?.name}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {product.vendor}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {new Intl.NumberFormat('hu-HU').format(
                                product.unitPrice * product.qty
                              )}{' '}
                              Ft
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.qty} × {new Intl.NumberFormat('hu-HU').format(product.unitPrice)} Ft
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
