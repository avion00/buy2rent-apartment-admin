import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Payment } from '@/services/paymentApi';
import { CreditCard, DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (amount: number, method: string, reference: string, note: string) => void;
}

export const RecordPaymentModal = ({ payment, open, onOpenChange, onSave }: RecordPaymentModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');

  // Get values from payment - support both API format (snake_case) and store format (camelCase)
  const totalAmount = payment?.total_amount ?? (payment as any)?.totalAmount ?? 0;
  const amountPaid = payment?.amount_paid ?? (payment as any)?.amountPaid ?? 0;
  const vendorName = payment?.vendor_name ?? payment?.vendor_details?.name ?? (payment as any)?.vendor ?? 'Unknown';
  const orderRef = payment?.order_reference ?? (payment as any)?.orderReference ?? '';

  useEffect(() => {
    if (open && payment) {
      const total = payment?.total_amount ?? (payment as any)?.totalAmount ?? 0;
      const paid = payment?.amount_paid ?? (payment as any)?.amountPaid ?? 0;
      const remaining = total - paid;
      setAmount(remaining > 0 ? remaining : 0);
      setPaymentMethod('Bank Transfer');
      setReferenceNo('');
      setNote('');
    }
  }, [open, payment?.id]); // Only depend on open and payment.id

  // Don't render dialog content if no payment, but still render Dialog for proper state management
  if (!payment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const remainingBalance = totalAmount - amountPaid;
  const newBalance = remainingBalance - amount;

  const handleSubmit = () => {
    if (amount <= 0) return;
    if (amount > remainingBalance) {
      alert('Payment amount cannot exceed remaining balance');
      return;
    }
    onSave(amount, paymentMethod, referenceNo, note);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a new payment for <span className="font-semibold">{vendorName}</span> - {orderRef}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Payment Overview */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
              <p className="text-lg font-bold">{totalAmount.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Already Paid</p>
              <p className="text-lg font-bold text-success">{amountPaid.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</p>
              <p className="text-lg font-bold text-warning">{remainingBalance.toLocaleString()} HUF</p>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">Payment Amount *</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="text-lg font-semibold pr-16"
                min={0}
                max={remainingBalance}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                HUF
              </span>
            </div>
            {amount > 0 && (
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-muted-foreground">New balance after payment:</span>
                <span className={`font-semibold ${newBalance === 0 ? 'text-success' : 'text-warning'}`}>
                  {newBalance.toLocaleString()} HUF
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-semibold">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNo" className="text-sm font-semibold">Reference Number</Label>
              <Input
                id="referenceNo"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Optional"
                className="font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-semibold">Notes</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes about this payment..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={amount <= 0 || amount > remainingBalance}
            className="min-w-[120px]"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
