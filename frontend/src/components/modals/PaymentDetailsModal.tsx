import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Product } from '@/stores/useDataStore';

interface PaymentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onSave: (updates: Partial<Product>) => void;
}

export const PaymentDetailsModal = ({ open, onOpenChange, product, onSave }: PaymentDetailsModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partially Paid' | 'Paid'>(product.paymentStatus || 'Unpaid');
  const [paidAmount, setPaidAmount] = useState(product.paidAmount || 0);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    product.paymentDueDate ? new Date(product.paymentDueDate) : undefined
  );

  const totalAmount = product.paymentAmount || (product.unitPrice * product.qty);
  const outstandingBalance = totalAmount - paidAmount;

  useEffect(() => {
    setPaymentStatus(product.paymentStatus || 'Unpaid');
    setPaidAmount(product.paidAmount || 0);
    setDueDate(product.paymentDueDate ? new Date(product.paymentDueDate) : undefined);
  }, [product, open]);

  // Auto-calculate status based on paid amount
  useEffect(() => {
    if (paidAmount === 0) {
      setPaymentStatus('Unpaid');
    } else if (paidAmount >= totalAmount) {
      setPaymentStatus('Paid');
    } else {
      setPaymentStatus('Partially Paid');
    }
  }, [paidAmount, totalAmount]);

  const handleSave = () => {
    onSave({
      paymentStatus,
      paidAmount,
      paymentDueDate: dueDate?.toISOString().split('T')[0],
      paymentAmount: totalAmount,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>{product.product}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} HUF</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Amount Paid</Label>
            <Input
              id="paidAmount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Outstanding Balance</Label>
            <div className={cn(
              "text-xl font-semibold",
              outstandingBalance > 0 ? "text-danger" : "text-success"
            )}>
              {outstandingBalance.toLocaleString()} HUF
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Payment Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
