import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

interface SKUEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSKU: string;
  productName: string;
  onSave: (newSKU: string) => Promise<void>;
}

export const SKUEditModal = ({ open, onOpenChange, currentSKU, productName, onSave }: SKUEditModalProps) => {
  const [sku, setSku] = useState(currentSKU);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSku(currentSKU);
  }, [currentSKU, open]);

  const handleSave = async () => {
    if (!sku.trim()) {
      toast({
        title: "Error",
        description: "SKU cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(sku.trim());
      toast({
        title: "Success",
        description: "SKU updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('SKU update error:', error);
      toast({
        title: "Error",
        description: "Failed to update SKU",
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
            Edit SKU
          </DialogTitle>
          <DialogDescription>
            Update the SKU for <span className="font-medium text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU Code</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter SKU code"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Stock Keeping Unit - unique identifier for this product
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
            disabled={isLoading || sku === currentSKU}
          >
            {isLoading ? 'Saving...' : 'Save SKU'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
