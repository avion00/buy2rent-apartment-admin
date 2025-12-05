import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, DollarSign } from 'lucide-react';

interface UnitPriceEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrice: string | number;
  productId: string;
  productName: string;
  onPriceUpdated?: (newPrice: string) => void;
}

export const UnitPriceEditModal = ({ 
  open, 
  onOpenChange, 
  currentPrice, 
  productId, 
  productName,
  onPriceUpdated 
}: UnitPriceEditModalProps) => {
  const [price, setPrice] = useState(currentPrice?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  // Update price when modal opens with new data
  useEffect(() => {
    if (open) {
      // Convert to integer if it's a decimal value
      const priceValue = currentPrice ? Math.round(parseFloat(currentPrice.toString())) : 0;
      setPrice(priceValue.toString());
    }
  }, [open, currentPrice]);

  const handleSave = async () => {
    const numPrice = parseInt(price);
    
    if (!price.trim() || isNaN(numPrice)) {
      toast.error('Please enter a valid price');
      return;
    }

    if (numPrice < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    setIsLoading(true);
    try {
      // Call the update callback with integer value
      onPriceUpdated?.(numPrice.toString());
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating unit price:', error);
      toast.error('Failed to update unit price');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive integers (no decimals for HUF)
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Edit Unit Price
          </DialogTitle>
          <DialogDescription>
            Update the unit price for "{productName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Unit Price (HUF)</Label>
            <div className="relative">
              <Input
                id="price"
                value={price}
                onChange={handlePriceChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter unit price"
                className="pr-12"
                autoFocus
                disabled={isLoading}
                type="text"
                inputMode="numeric"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                HUF
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the price per unit in Hungarian Forint (whole numbers only)
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
            disabled={isLoading || !price.trim() || isNaN(parseInt(price))}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
