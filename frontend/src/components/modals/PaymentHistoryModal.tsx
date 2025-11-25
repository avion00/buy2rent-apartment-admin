import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/stores/useDataStore';
import { format } from 'date-fns';
import { Calendar, CreditCard, FileText, CheckCircle } from 'lucide-react';

interface PaymentHistoryModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentHistoryModal = ({ payment, open, onOpenChange }: PaymentHistoryModalProps) => {
  if (!payment) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-success/10 text-success border-success/20",
      "Partial": "bg-warning/10 text-warning border-warning/20",
      "Unpaid": "bg-muted text-muted-foreground border-border",
      "Overdue": "bg-danger/10 text-danger border-danger/20"
    };
    return colors[status] || "bg-muted";
  };

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
            Complete payment record for <span className="font-semibold">{payment.vendor}</span> - {payment.orderReference}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
              <p className="text-xl font-bold">{payment.totalAmount.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount Paid</p>
              <p className="text-xl font-bold text-success">{payment.amountPaid.toLocaleString()} HUF</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
              <p className="text-xl font-bold text-warning">
                {(payment.totalAmount - payment.amountPaid).toLocaleString()} HUF
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
                  <p className="text-sm font-medium">{format(new Date(payment.dueDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              {payment.lastPaymentDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <p className="text-sm font-medium">{format(new Date(payment.lastPaymentDate), 'MMMM dd, yyyy')}</p>
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
            {payment.paymentHistory && payment.paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {payment.paymentHistory.map((entry, index) => (
                  <div key={index} className="relative">
                    {index !== payment.paymentHistory.length - 1 && (
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
                              <p className="font-semibold text-lg">{entry.amount.toLocaleString()} HUF</p>
                              <Badge variant="outline" className="text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {entry.method}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.date), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        {entry.referenceNo && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Ref:</span>
                            <span className="font-mono bg-muted px-2 py-0.5 rounded">{entry.referenceNo}</span>
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
