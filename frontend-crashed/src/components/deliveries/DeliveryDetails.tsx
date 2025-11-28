import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, User, Phone, Clock, Truck, Weight, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';

interface DeliveryDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: {
    id: number;
    apartment: string;
    vendor: string;
    order_no: string;
    eta: string;
    actual_delivery?: string;
    received_by?: string;
    status: string;
    priority: string;
    time_slot: string;
    contact_person: string;
    contact_phone: string;
    delivery_address: string;
    tracking_number: string;
    delivery_fee: number;
    items_count: number;
    total_weight: string;
    carrier: string;
    notes?: string;
    special_instructions?: string;
  } | null;
}

export const DeliveryDetails = ({ open, onOpenChange, delivery }: DeliveryDetailsProps) => {
  if (!delivery) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'In Transit': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      'Delivered': 'bg-green-500/10 text-green-600 dark:text-green-400',
      'Delayed': 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-red-500/10 text-red-600 dark:text-red-400',
      'Medium': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      'Low': 'bg-green-500/10 text-green-600 dark:text-green-400',
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold">Delivery Details</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{delivery.order_no}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(delivery.status)} variant="outline">
                {delivery.status}
              </Badge>
              <Badge className={getPriorityColor(delivery.priority)} variant="outline">
                {delivery.priority} Priority
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-3" />

        <div className="space-y-3">
          {/* Location & Contact Info */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
                      <p className="text-sm font-medium break-words">{delivery.apartment}</p>
                      <p className="text-xs text-muted-foreground break-words">{delivery.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Contact Person</p>
                      <p className="text-sm font-medium">{delivery.contact_person}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Vendor</p>
                      <p className="text-sm font-medium">{delivery.vendor}</p>
                      <p className="text-xs text-muted-foreground">Carrier: {delivery.carrier}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Contact Phone</p>
                      <p className="text-sm font-medium">{delivery.contact_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Schedule */}
          <Card>
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Delivery Schedule
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Expected Delivery</p>
                  <p className="text-sm font-medium">{delivery.eta}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time Slot</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {delivery.time_slot}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Actual Delivery</p>
                  <p className="text-sm font-medium">
                    {delivery.actual_delivery || <span className="text-muted-foreground text-xs">Pending</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" />
                Package Details
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <Badge variant="outline" className="text-xs mt-1">{delivery.order_no}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items Count</p>
                  <p className="text-sm font-medium">{delivery.items_count} items</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    Weight
                  </p>
                  <p className="text-sm font-medium">{delivery.total_weight}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Delivery Fee
                  </p>
                  <p className="text-sm font-medium">€{delivery.delivery_fee.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary text-xs font-mono">
                    {delivery.tracking_number}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Instructions */}
          {(delivery.notes || delivery.special_instructions) && (
            <Card>
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  Notes & Instructions
                </h3>
                <div className="space-y-2">
                  {delivery.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Notes</p>
                      <p className="text-sm">{delivery.notes}</p>
                    </div>
                  )}
                  {delivery.special_instructions && (
                    <div className="flex items-start gap-2 p-2 rounded bg-accent/10 border border-accent/20">
                      <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">Special Instructions</p>
                        <p className="text-xs text-muted-foreground">{delivery.special_instructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Received Info */}
          {delivery.received_by && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/10 rounded">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Received By</p>
                    <p className="text-sm font-medium">{delivery.received_by}</p>
                    {delivery.actual_delivery && (
                      <p className="text-xs text-muted-foreground">on {delivery.actual_delivery}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
