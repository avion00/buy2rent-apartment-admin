import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/services/paymentApi';
import { format } from 'date-fns';
import { Calendar, CreditCard, FileText, CheckCircle } from 'lucide-react';

interface PaymentHistoryModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentHistoryModal = ({ payment, open, onOpenChange }: PaymentHistoryModalProps) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-success/10 text-success border-success/20",
      "Partial": "bg-warning/10 text-warning border-warning/20",
      "Unpaid": "bg-muted text-muted-foreground border-border",
      "Overdue": "bg-danger/10 text-danger border-danger/20"
    };
    return colors[status] || "bg-muted";
  };

  // Handle null payment - render empty dialog to maintain state
  if (!payment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Support both API format (snake_case) and store format (camelCase)
  const totalAmount = payment.total_amount ?? (payment as any).totalAmount ?? 0;
  const amountPaid = payment.amount_paid ?? (payment as any).amountPaid ?? 0;
  const vendorName = payment.vendor_name ?? payment.vendor_details?.name ?? (payment as any).vendor ?? 'Unknown';
  const orderRef = payment.order_reference ?? (payment as any).orderReference ?? '';
  const dueDate = payment.due_date ?? (payment as any).dueDate ?? '';
  const lastPaymentDate = payment.last_payment_date ?? (payment as any).lastPaymentDate;
  const paymentHistory = payment.payment_history ?? (payment as any).paymentHistory ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Payment History
          </DialogTitle>
          <DialogDescription>
            Complete payment record for <span className="font-semibold">{vendorName}</span> - {orderRef}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
              <p className="text-xl font-bold">{totalAmount.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount Paid</p>
              <p className="text-xl font-bold text-success">{amountPaid.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
              <p className="text-xl font-bold text-warning">
                {(totalAmount - amountPaid).toLocaleString()} HUF
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
              <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-card">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {dueDate ? format(new Date(dueDate), 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              {lastPaymentDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <p className="text-sm font-medium">{format(new Date(lastPaymentDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              )}
              {payment.notes && (
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{payment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Transaction History</h3>
            {paymentHistory && paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((entry: any, index: number) => (
                  <div key={entry.id || index} className="relative">
                    {index !== paymentHistory.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                    )}
                    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-success/10 rounded-full">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{(entry.amount || 0).toLocaleString()} HUF</p>
                              <Badge variant="outline" className="text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {entry.method}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {entry.date ? format(new Date(entry.date), 'MMMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {(entry.referenceNo || entry.reference_no) && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Ref:</span>
                            <span className="font-mono bg-muted px-2 py-0.5 rounded">
                              {entry.referenceNo || entry.reference_no}
                            </span>
                          </div>
                        )}
                        {entry.note && (
                          <p className="text-sm text-muted-foreground italic">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No payment transactions recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
