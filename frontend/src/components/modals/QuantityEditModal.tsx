import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Hash } from 'lucide-react';

interface QuantityEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuantity: string | number;
  productId: string;
  productName: string;
  onQuantityUpdated?: (newQuantity: string) => void;
}

export const QuantityEditModal = ({ 
  open, 
  onOpenChange, 
  currentQuantity, 
  productId, 
  productName,
  onQuantityUpdated 
}: QuantityEditModalProps) => {
  const [quantity, setQuantity] = useState(currentQuantity?.toString() || '1');
  const [isLoading, setIsLoading] = useState(false);

  // Update quantity when modal opens with new data
  useEffect(() => {
    if (open) {
      setQuantity(currentQuantity?.toString() || '1');
    }
  }, [open, currentQuantity]);

  const handleSave = async () => {
    const numQuantity = parseInt(quantity);
    
    if (!quantity.trim() || isNaN(numQuantity)) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (numQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      // Call the update callback
      onQuantityUpdated?.(quantity.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    setQuantity((current + 1).toString());
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Edit Quantity
          </DialogTitle>
          <DialogDescription>
            Update the quantity for "{productName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={isLoading || parseInt(quantity) <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter quantity"
                className="text-center"
                autoFocus
                disabled={isLoading}
                type="text"
                inputMode="numeric"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={isLoading}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the number of units to order
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
            disabled={isLoading || !quantity.trim() || parseInt(quantity) <= 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Quantity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
