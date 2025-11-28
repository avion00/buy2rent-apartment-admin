import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

interface QuantityEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuantity: number;
  productName: string;
  unitPrice: string | number;
  currency?: string;
  onSave: (newQuantity: string) => Promise<void>;
}

export const QuantityEditModal = ({ 
  open, 
  onOpenChange, 
  currentQuantity, 
  productName, 
  unitPrice,
  currency = 'HUF',
  onSave 
}: QuantityEditModalProps) => {
  const [quantity, setQuantity] = useState(String(currentQuantity));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setQuantity(String(currentQuantity));
  }, [currentQuantity, open]);

  const calculateTotal = () => {
    const qty = parseInt(quantity) || 0;
    const price = parseFloat(String(unitPrice)) || 0;
    return (qty * price).toLocaleString();
  };

  const handleSave = async () => {
    const numericQty = parseInt(quantity);
    
    if (!quantity.trim() || isNaN(numericQty)) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (numericQty < 1) {
      toast({
        title: "Error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(quantity.trim());
      toast({
        title: "Success",
        description: "Quantity updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Quantity update error:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Edit Quantity
          </DialogTitle>
          <DialogDescription>
            Update the quantity for <span className="font-medium text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
            <p className="text-xs text-muted-foreground">
              Number of units to order
            </p>
          </div>

          {/* Total Calculation Preview */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unit Price:</span>
              <span className="text-sm font-medium">
                {parseFloat(String(unitPrice)).toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <span className="text-sm font-medium">{quantity || 0}</span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold">Total:</span>
              <span className="text-base font-bold text-primary">
                {calculateTotal()} {currency}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || quantity === String(currentQuantity)}
          >
            {isLoading ? 'Saving...' : 'Save Quantity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
