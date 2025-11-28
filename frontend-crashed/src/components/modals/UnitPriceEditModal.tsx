import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

interface UnitPriceEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrice: string | number;
  productName: string;
  currency?: string;
  onSave: (newPrice: string) => Promise<void>;
}

export const UnitPriceEditModal = ({ 
  open, 
  onOpenChange, 
  currentPrice, 
  productName, 
  currency = 'HUF',
  onSave 
}: UnitPriceEditModalProps) => {
  const [price, setPrice] = useState(String(currentPrice));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setPrice(String(currentPrice));
  }, [currentPrice, open]);

  const handleSave = async () => {
    const numericPrice = parseFloat(price);
    
    if (!price.trim() || isNaN(numericPrice)) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (numericPrice < 0) {
      toast({
        title: "Error",
        description: "Price cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(price.trim());
      toast({
        title: "Success",
        description: "Unit price updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Unit price update error:', error);
      toast({
        title: "Error",
        description: "Failed to update unit price",
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
            <DollarSign className="h-5 w-5 text-primary" />
            Edit Unit Price
          </DialogTitle>
          <DialogDescription>
            Update the unit price for <span className="font-medium text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Unit Price ({currency})</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter unit price"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Price per unit of this product
            </p>
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
            disabled={isLoading || price === String(currentPrice)}
          >
            {isLoading ? 'Saving...' : 'Save Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
