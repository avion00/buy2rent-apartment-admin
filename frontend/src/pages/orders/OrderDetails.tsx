import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Package, Building2, Store, Calendar, FileCheck, Truck, DollarSign, Download, Printer, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OrderDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string | number;
    po_number: string;
    apartment?: string;
    apartment_name?: string;
    vendor?: string;
    vendor_name?: string;
    items_count: number;
    total: number | string;
    confirmation?: string;
    tracking?: string;
    status: string;
    placed_on: string;
  } | null;
}

// Mock items data - in real app, this would come from API
const mockOrderItems = [
  { id: 1, name: "Modern Sofa", sku: "SOF-001", quantity: 2, unit_price: 899.00, total: 1798.00 },
  { id: 2, name: "Coffee Table", sku: "TBL-045", quantity: 1, unit_price: 249.99, total: 249.99 },
  { id: 3, name: "Floor Lamp", sku: "LMP-023", quantity: 2, unit_price: 79.99, total: 159.98 },
  { id: 4, name: "Wall Art Set", sku: "ART-112", quantity: 1, unit_price: 149.00, total: 149.00 },
  { id: 5, name: "Throw Pillows", sku: "PIL-089", quantity: 4, unit_price: 24.99, total: 99.96 },
];

export const OrderDetails = ({ open, onOpenChange, order }: OrderDetailsProps) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-500/10 text-gray-500',
      'Sent': 'bg-blue-500/10 text-blue-500',
      'Confirmed': 'bg-yellow-500/10 text-yellow-500',
      'Received': 'bg-green-500/10 text-green-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{order.po_number}</DialogTitle>
                <p className="text-xs text-muted-foreground">Purchase Order Details</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1`}>
              {order.status}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
            {/* Order Information Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b">
                      <div className="p-1 bg-primary/10 rounded">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">Delivery Location</h3>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <p className="text-xs text-muted-foreground">Apartment</p>
                        <p className="text-sm font-medium">{order.apartment_name || order.apartment || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Placed On
                        </p>
                        <p className="text-sm font-medium">{order.placed_on}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b">
                      <div className="p-1 bg-primary/10 rounded">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">Vendor</h3>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <p className="text-xs text-muted-foreground">Vendor Name</p>
                        <p className="text-sm font-medium">{order.vendor_name || order.vendor || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="text-sm font-medium">{order.items_count} items</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracking Information */}
            {(order.confirmation || order.tracking) && (
              <Card className="border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-4">
                    {order.confirmation && (
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs text-muted-foreground">Confirmation</p>
                        </div>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{order.confirmation}</p>
                      </div>
                    )}
                    {order.tracking && (
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs text-muted-foreground">Tracking</p>
                        </div>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{order.tracking}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 pb-2 border-b mb-3">
                  <div className="p-1 bg-primary/10 rounded">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Order Items</h3>
                    <p className="text-xs text-muted-foreground">{mockOrderItems.length} items</p>
                  </div>
                </div>
                
                <div className="rounded border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 text-xs font-semibold">Item</th>
                        <th className="text-left p-2 text-xs font-semibold">SKU</th>
                        <th className="text-center p-2 text-xs font-semibold">Qty</th>
                        <th className="text-right p-2 text-xs font-semibold">Price</th>
                        <th className="text-right p-2 text-xs font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockOrderItems.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-2">
                            <p className="text-sm font-medium">{item.name}</p>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="font-mono text-xs">{item.sku}</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-primary/10 text-xs font-semibold px-2">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-2 text-right text-xs text-muted-foreground">€{item.unit_price.toFixed(2)}</td>
                          <td className="p-2 text-right text-sm font-bold">€{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-primary/20">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Order Summary</h3>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-semibold">€{Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-muted-foreground">Tax (0%)</span>
                      <span className="text-sm font-semibold">€0.00</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-muted-foreground">Shipping</span>
                      <span className="text-sm font-semibold text-green-600">FREE</span>
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="flex justify-between items-center py-2 bg-primary/10 -mx-3 px-3 rounded">
                      <span className="text-sm font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-primary">€{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
