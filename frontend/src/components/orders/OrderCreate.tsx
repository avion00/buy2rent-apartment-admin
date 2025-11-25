import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apartments, vendors } from '@/data/mockData';
import { Plus, Trash2, Package, Building2, Store, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export const OrderCreate = ({ open, onOpenChange }: OrderCreateProps) => {
  const { toast } = useToast();
  const [apartmentId, setApartmentId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ product: '', quantity: 1, price: 0 }]);

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartmentId || !vendorId || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    toast({
      title: "Order Created",
      description: `Order created with ${items.length} items. Total: €${total.toFixed(2)}`,
    });
    
    onOpenChange(false);
    // Reset form
    setApartmentId('');
    setVendorId('');
    setItems([{ product: '', quantity: 1, price: 0 }]);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const selectedApartment = apartments.find(a => a.id.toString() === apartmentId);
  const selectedVendor = vendors.find(v => v.id.toString() === vendorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Purchase Order</DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details to create a new order
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
            {/* Order Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Package className="h-3.5 w-3.5" />
                <span>Order Information</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Apartment Selection */}
                <Card className="border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <Label htmlFor="apartment" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Apartment *
                    </Label>
                    <Select value={apartmentId} onValueChange={setApartmentId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select apartment" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartments.map(apt => (
                          <SelectItem key={apt.id} value={apt.id.toString()}>
                            <span className="text-sm">{apt.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedApartment && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Owner: {selectedApartment.owner}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Vendor Selection */}
                <Card className="border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <Label htmlFor="vendor" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                      <Store className="h-3.5 w-3.5 text-primary" />
                      Vendor *
                    </Label>
                    <Select value={vendorId} onValueChange={setVendorId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map(vendor => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            <span className="text-sm">{vendor.logo} {vendor.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedVendor && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Lead time: {selectedVendor.lead_time}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Order Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Package className="h-3.5 w-3.5" />
                  <span>Order Items ({items.length})</span>
                </div>
                <Button type="button" size="sm" onClick={addItem} className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card key={index} className="border hover:border-primary/30 transition-all">
                    <CardContent className="p-3">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Product Name *
                          </Label>
                          <Input
                            placeholder="e.g., Modern Sofa"
                            value={item.product}
                            onChange={(e) => updateItem(index, 'product', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Qty *
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs font-medium mb-1.5 block">
                            Price (€) *
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <div className="flex-1 text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-sm">€{(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                          {items.length > 1 && (
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Order Summary</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Items</p>
                      <p className="text-xl font-bold">{items.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Units</p>
                      <p className="text-xl font-bold">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                      <p className="text-2xl font-bold text-primary">€{totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5" size="sm">
              <ShoppingCart className="h-3.5 w-3.5" />
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
