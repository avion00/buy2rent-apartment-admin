import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string | number;
    po_number: string;
    status: string;
  } | null;
  onStatusUpdate: (orderId: string | number, newStatus: string) => void;
}

const statusFlow = {
  'Draft': 'Sent',
  'Sent': 'Confirmed',
  'Confirmed': 'Received',
  'Received': 'Received'
};

export const StatusUpdate = ({ open, onOpenChange, order, onStatusUpdate }: StatusUpdateProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');

  if (!order) return null;

  const nextStatus = statusFlow[order.status as keyof typeof statusFlow];
  const isAlreadyReceived = order.status === 'Received';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAlreadyReceived) {
      toast({
        title: "Already Completed",
        description: "This order has already been received",
      });
      return;
    }

    onStatusUpdate(order.id, nextStatus);
    
    toast({
      title: "Status Updated",
      description: `Order ${order.po_number} status changed to ${nextStatus}`,
    });
    
    setNotes('');
    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-500/10 text-gray-500',
      'Sent': 'bg-blue-500/10 text-blue-500',
      'Confirmed': 'bg-yellow-500/10 text-yellow-500',
      'Received': 'bg-green-500/10 text-green-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Update Order Status
          </DialogTitle>
          <DialogDescription>
            Change the status of order {order.po_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Progression */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <Badge className={getStatusColor(nextStatus)}>
                {nextStatus}
              </Badge>
            </div>
          </div>

          {isAlreadyReceived ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Order Already Received</p>
              <p className="text-xs text-muted-foreground mt-1">
                This order has reached its final status
              </p>
            </div>
          ) : (
            <>
              {/* Status Change Info */}
              <div className="space-y-2 text-sm">
                <p className="font-medium">What happens next?</p>
                <ul className="space-y-1 text-muted-foreground ml-4 list-disc text-xs">
                  {nextStatus === 'Sent' && (
                    <li>Order will be marked as sent to vendor</li>
                  )}
                  {nextStatus === 'Confirmed' && (
                    <>
                      <li>Order confirmed by vendor</li>
                      <li>Payment may be processed</li>
                    </>
                  )}
                  {nextStatus === 'Received' && (
                    <>
                      <li>Items marked as received</li>
                      <li>Order will be completed</li>
                      <li>Quality check should be done</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this status change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Cancel
            </Button>
            {!isAlreadyReceived && (
              <Button type="submit" size="sm">
                Update to {nextStatus}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
