import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Package, MapPin, Clock, Truck, Calendar, User, Phone, Mail, 
  Globe, Building2, FileText, AlertCircle, CheckCircle2, 
  ExternalLink, Weight, DollarSign, Hash, Loader2, ShoppingBag
} from 'lucide-react';
import { deliveryApi, Delivery } from '@/services/deliveryApi';

interface DeliveryDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: {
    id: string;
    apartment_name: string;
    vendor_name: string;
    order_reference: string;
    expected_date: string;
    time_slot?: string | null;
    status: string;
    priority: string;
    tracking_number?: string;
  } | null;
}

export const DeliveryDetails = ({ open, onOpenChange, delivery }: DeliveryDetailsProps) => {
  const [fullDelivery, setFullDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && delivery?.id) {
      setLoading(true);
      deliveryApi.getDelivery(delivery.id)
        .then(data => setFullDelivery(data))
        .catch(err => console.error('Failed to fetch delivery details:', err))
        .finally(() => setLoading(false));
    }
  }, [open, delivery?.id]);

  if (!delivery) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      'In Transit': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      'Delivered': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
      'Delayed': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      'Cancelled': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30',
      'Returned': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Urgent': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      'High': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
      'Medium': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      'Low': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  // Use full delivery data if available, otherwise use basic delivery data
  const d = fullDelivery || delivery;
  const apartmentDetails = fullDelivery?.apartment_details;
  const vendorDetails = fullDelivery?.vendor_details;
  const clientDetails = apartmentDetails?.client_details;
  const orderItems = fullDelivery?.order_items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">Delivery Details</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">{d.order_reference}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(d.status)} variant="outline">
                {d.status}
              </Badge>
              <Badge className={getPriorityColor(d.priority)} variant="outline">
                {d.priority} Priority
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Separator className="my-2" />

            <div className="space-y-4">
              {/* Delivery Address & Vendor Info */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                          <p className="text-sm font-semibold mt-1">{apartmentDetails?.name || d.apartment_name}</p>
                          {apartmentDetails?.address && (
                            <p className="text-xs text-muted-foreground mt-0.5">{apartmentDetails.address}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact Person (Client/Owner) */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Person</p>
                          <p className="text-sm font-semibold mt-1">
                            {clientDetails?.name || apartmentDetails?.owner || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {/* Contact Phone */}
                      {clientDetails?.phone && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Phone</p>
                            <p className="text-sm font-semibold mt-1">{clientDetails.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Truck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor</p>
                          <p className="text-sm font-semibold mt-1">{vendorDetails?.name || d.vendor_name}</p>
                          {vendorDetails?.delivery_terms && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Carrier: {vendorDetails.delivery_terms}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Vendor Contact */}
                      {vendorDetails?.contact_person && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor Contact</p>
                            <p className="text-sm font-semibold mt-1">{vendorDetails.contact_person}</p>
                          </div>
                        </div>
                      )}

                      {/* Vendor Email & Website */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor Email</p>
                          {vendorDetails?.email ? (
                            <a href={`mailto:${vendorDetails.email}`} className="text-sm font-medium text-primary hover:underline mt-1 block">
                              {vendorDetails.email}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">Not available</p>
                          )}
                        </div>
                      </div>

                      {vendorDetails?.website && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-teal-500/10">
                            <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</p>
                            <a 
                              href={vendorDetails.website.startsWith('http') ? vendorDetails.website : `https://${vendorDetails.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline mt-1 flex items-center gap-1"
                            >
                              {vendorDetails.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Schedule */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Delivery Schedule
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Delivery</p>
                      <p className="text-sm font-semibold mt-1">{fullDelivery?.expected_date || d.expected_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Slot</p>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {fullDelivery?.time_slot || d.time_slot || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual Delivery</p>
                      <p className="text-sm font-semibold mt-1">
                        {fullDelivery?.actual_date || (
                          <span className="text-muted-foreground font-normal">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Details */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Package Details
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Order Number
                      </p>
                      <Badge variant="outline" className="text-xs mt-1.5 font-mono">{d.order_reference}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        Items Count
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {fullDelivery?.order_items_count || orderItems.length || '-'} items
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        Weight
                      </p>
                      <p className="text-sm font-semibold mt-1">-</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Order Total
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {fullDelivery?.order_total ? `€${Number(fullDelivery.order_total).toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tracking Number */}
                  {(fullDelivery?.tracking_number || d.tracking_number) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">Tracking Number</p>
                      <Badge className="bg-primary/10 text-primary text-xs font-mono mt-1.5">
                        {fullDelivery?.tracking_number || d.tracking_number}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      Delivered Products ({orderItems.length})
                    </h3>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Product</TableHead>
                            <TableHead className="text-xs font-semibold">SKU</TableHead>
                            <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Unit Price</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item, index) => (
                            <TableRow key={item.id || index}>
                              <TableCell className="text-sm font-medium">{item.product_name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">{item.sku || '-'}</TableCell>
                              <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                              <TableCell className="text-sm text-right">€{Number(item.unit_price).toFixed(2)}</TableCell>
                              <TableCell className="text-sm font-semibold text-right">€{Number(item.total_price).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes & Instructions - Status History Timeline */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Notes & Instructions
                  </h3>
                  
                  {/* Special Instructions from Order */}
                  {fullDelivery?.order_notes && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Special Instructions</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{fullDelivery.order_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Status History Timeline */}
                  {fullDelivery?.status_history && fullDelivery.status_history.length > 0 ? (
                    <div className="space-y-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Status History</p>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
                        
                        {/* Status entries - newest first (already sorted by -created_at) */}
                        <div className="space-y-3">
                          {fullDelivery.status_history.map((entry, index) => {
                            const getStatusIcon = (status: string) => {
                              switch (status) {
                                case 'Delivered':
                                  return { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' };
                                case 'In Transit':
                                  return { icon: Truck, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
                                case 'Scheduled':
                                  return { icon: Calendar, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
                                case 'Delayed':
                                  return { icon: Clock, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
                                case 'Cancelled':
                                  return { icon: AlertCircle, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30' };
                                case 'Returned':
                                  return { icon: Package, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' };
                                default:
                                  return { icon: FileText, color: 'bg-muted text-muted-foreground' };
                              }
                            };
                            
                            const { icon: StatusIcon, color } = getStatusIcon(entry.status);
                            const isLatest = index === 0;
                            
                            return (
                              <div key={entry.id} className="relative flex gap-3 pl-0">
                                {/* Status icon */}
                                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${color} ${isLatest ? 'ring-2 ring-primary/20' : ''}`}>
                                  <StatusIcon className="h-3 w-3" />
                                </div>
                                
                                {/* Content */}
                                <div className={`flex-1 pb-3 ${!isLatest ? 'opacity-80' : ''}`}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={`text-xs ${color}`}>
                                      {entry.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(entry.created_at).toLocaleString()}
                                    </span>
                                    {entry.changed_by && (
                                      <span className="text-xs text-muted-foreground">
                                        by {entry.changed_by}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Notes */}
                                  {entry.notes && (
                                    <p className="text-sm mt-1 text-foreground">{entry.notes}</p>
                                  )}
                                  
                                  {/* Additional info based on status */}
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {entry.received_by && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        Received by: {entry.received_by}
                                      </span>
                                    )}
                                    {entry.location && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {entry.location}
                                      </span>
                                    )}
                                    {entry.delay_reason && (
                                      <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Reason: {entry.delay_reason}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Fallback to current notes if no history */
                    fullDelivery?.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Delivery Notes</p>
                        <p className="text-sm mt-1">{fullDelivery.notes}</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Received Info */}
              {fullDelivery?.received_by && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Received By</p>
                        <p className="text-sm font-semibold">{fullDelivery.received_by}</p>
                        {fullDelivery.actual_date && (
                          <p className="text-xs text-muted-foreground">on {fullDelivery.actual_date}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
