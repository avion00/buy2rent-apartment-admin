import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Package } from 'lucide-react';

interface SkuEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSku: string;
  productId: string;
  productName: string;
  onSkuUpdated?: (newSku: string) => void;
}

export const SkuEditModal = ({ 
  open, 
  onOpenChange, 
  currentSku, 
  productId, 
  productName,
  onSkuUpdated 
}: SkuEditModalProps) => {
  const [sku, setSku] = useState(currentSku || '');
  const [isLoading, setIsLoading] = useState(false);

  // Update SKU when modal opens with new data
  useEffect(() => {
    if (open) {
      setSku(currentSku || '');
    }
  }, [open, currentSku]);

  const handleSave = async () => {
    if (!sku.trim()) {
      toast.error('SKU cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      // Call the update callback
      onSkuUpdated?.(sku.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating SKU:', error);
      toast.error('Failed to update SKU');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit SKU
          </DialogTitle>
          <DialogDescription>
            Update the SKU for "{productName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter SKU code"
              className="font-mono"
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a unique identifier for this product
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
            disabled={isLoading || !sku.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save SKU
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
