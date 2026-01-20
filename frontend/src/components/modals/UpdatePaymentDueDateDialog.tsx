import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface UpdatePaymentDueDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onUpdate: (paymentId: string, newDueDate: string) => Promise<void>;
}

export function UpdatePaymentDueDateDialog({
  open,
  onOpenChange,
  payment,
  onUpdate,
}: UpdatePaymentDueDateDialogProps) {
  const [dueDate, setDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (payment?.due_date) {
      setDueDate(payment.due_date);
    }
  }, [payment]);

  const handleUpdate = async () => {
    if (!payment?.id || !dueDate) return;

    setIsUpdating(true);
    try {
      await onUpdate(payment.id, dueDate);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update payment due date:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Payment Due Date</DialogTitle>
          <DialogDescription>
            Update the payment due date for order {payment.order_reference || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="due-date">Due Date</Label>
            <div className="relative">
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Amount</div>
              <div className="font-medium">
                {((payment.total_amount || 0) + (payment.shipping_cost || 0) - (payment.discount || 0)).toLocaleString()} HUF
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">{payment.status || 'Unpaid'}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !dueDate}
          >
            {isUpdating ? "Updating..." : "Update Due Date"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
