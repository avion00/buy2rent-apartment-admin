import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Truck, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface DeliveryTrackingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: {
    id: number;
    apartment: string;
    vendor: string;
    order_no: string;
    tracking_number: string;
    status: string;
    carrier: string;
    eta: string;
  } | null;
}

export const DeliveryTracking = ({ open, onOpenChange, delivery }: DeliveryTrackingProps) => {
  if (!delivery) return null;

  const trackingEvents = [
    {
      date: '2025-11-10 14:30',
      status: delivery.status === 'Delivered' ? 'Delivered' : delivery.status === 'In Transit' ? 'Out for Delivery' : 'Package Ready',
      location: delivery.status === 'Delivered' ? delivery.apartment : 'Local Hub',
      description: delivery.status === 'Delivered' 
        ? 'Package delivered successfully' 
        : delivery.status === 'In Transit' 
        ? 'Package is out for delivery' 
        : 'Package is ready for dispatch',
      active: true
    },
    {
      date: '2025-11-09 10:15',
      status: 'In Transit',
      location: 'Distribution Center',
      description: 'Package is on the way to delivery location',
      active: false
    },
    {
      date: '2025-11-08 16:45',
      status: 'Package Dispatched',
      location: `${delivery.vendor} Warehouse`,
      description: 'Package has been dispatched from warehouse',
      active: false
    },
    {
      date: '2025-11-08 09:00',
      status: 'Order Confirmed',
      location: delivery.vendor,
      description: 'Order has been confirmed and is being prepared',
      active: false
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Track Delivery</DialogTitle>
              <p className="text-xs text-muted-foreground">{delivery.order_no}</p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          {/* Tracking Info Card */}
          <Card className="border bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tracking Number</p>
                    <p className="text-sm font-bold font-mono">{delivery.tracking_number}</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {delivery.carrier}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-primary/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm font-medium truncate">{delivery.apartment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-medium truncate">{delivery.vendor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="text-sm font-medium">{delivery.eta}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="p-1 bg-primary/10 rounded">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Tracking History</h3>
                  <p className="text-xs text-muted-foreground">Latest updates</p>
                </div>
              </div>

              <div className="space-y-4">
                {trackingEvents.map((event, index) => (
                  <div key={index} className="flex gap-3 relative">
                    {index !== trackingEvents.length - 1 && (
                      <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-border" />
                    )}
                    <div className="relative flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full border-2 border-background flex items-center justify-center ${
                        event.active
                          ? 'bg-primary shadow-lg shadow-primary/20'
                          : 'bg-muted'
                      }`}>
                        {event.active ? (
                          <Truck className="h-3.5 w-3.5 text-primary-foreground" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-semibold ${event.active ? 'text-primary' : ''}`}>
                          {event.status}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {event.date}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-0.5">{event.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
