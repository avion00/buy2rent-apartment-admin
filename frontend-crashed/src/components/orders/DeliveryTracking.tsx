import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, MapPin, Calendar, User, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DeliveryTrackingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: number;
    po_number: string;
    apartment: string;
    vendor: string;
    tracking?: string;
    status: string;
  } | null;
}

export const DeliveryTracking = ({ open, onOpenChange, order }: DeliveryTrackingProps) => {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber) {
      toast({
        title: "Validation Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Tracking Updated",
      description: `Delivery tracking updated for ${order?.po_number}`,
    });
    
    onOpenChange(false);
  };

  if (!order) return null;

  const trackingEvents = [
    { 
      date: '2025-11-06 16:45', 
      status: 'Out for Delivery', 
      location: 'Local Hub - Budapest',
      description: 'Package is out for delivery and will arrive today',
      active: true
    },
    { 
      date: '2025-11-06 09:15', 
      status: 'In Transit', 
      location: 'Distribution Center',
      description: 'Package is on the way to delivery location',
      active: false
    },
    { 
      date: '2025-11-05 14:30', 
      status: 'Package Dispatched', 
      location: 'Warehouse - Budapest',
      description: 'Package has been dispatched from warehouse',
      active: false
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Delivery Tracking</DialogTitle>
              <DialogDescription className="text-sm">
                Track delivery for {order.po_number}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
            {/* Current Status Card */}
            <Card className="border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600/10 rounded">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-bold">{order.status}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                    {order.tracking || 'No Tracking'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium">{order.apartment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium">{order.vendor}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            {order.tracking && (
              <Card className="border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 pb-2 mb-3 border-b">
                    <div className="p-1 bg-primary/10 rounded">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Tracking History</h3>
                      <p className="text-xs text-muted-foreground">Delivery updates</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={index} className="flex gap-3 relative">
                        {index !== trackingEvents.length - 1 && (
                          <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary to-muted" />
                        )}
                        <div className="relative flex-shrink-0">
                          <div className={`w-7 h-7 rounded-full border-2 border-background flex items-center justify-center ${
                            event.active 
                              ? 'bg-primary shadow-md' 
                              : 'bg-muted'
                          }`}>
                            {event.active ? (
                              <Truck className="h-3.5 w-3.5 text-primary-foreground" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className={`flex-1 pb-2 ${event.active ? 'pt-0.5' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className={`font-semibold text-sm ${event.active ? 'text-primary' : ''}`}>
                              {event.status}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {event.date}
                            </Badge>
                          </div>
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
            )}

            {/* Update Tracking Form */}
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b">
                  <div className="p-1 bg-primary/10 rounded">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Update Tracking</h3>
                    <p className="text-xs text-muted-foreground">Modify delivery details</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="tracking" className="flex items-center gap-1.5 text-xs font-medium">
                        <Package className="h-3 w-3 text-primary" />
                        Tracking Number *
                      </Label>
                      <Input
                        id="tracking"
                        placeholder="TRK-99234"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        defaultValue={order.tracking}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="estimated" className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="h-3 w-3 text-primary" />
                        Delivery Date
                      </Label>
                      <Input
                        id="estimated"
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="person" className="flex items-center gap-1.5 text-xs font-medium">
                      <User className="h-3 w-3 text-primary" />
                      Courier / Person
                    </Label>
                    <Input
                      id="person"
                      placeholder="Delivery person or courier service"
                      value={deliveryPerson}
                      onChange={(e) => setDeliveryPerson(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-xs font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Special instructions or notes..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  <Separator className="my-3" />

                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-1.5" size="sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Update
                    </Button>
                  </DialogFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
