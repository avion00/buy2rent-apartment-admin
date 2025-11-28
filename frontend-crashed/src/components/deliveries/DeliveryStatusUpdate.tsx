import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, Truck, PackageCheck, XCircle, Calendar, User } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

interface DeliveryStatusUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: {
    id: number;
    order_no: string;
    apartment: string;
    status: string;
  } | null;
  onStatusUpdate: (deliveryId: number, newStatus: string, receivedBy?: string, actualDelivery?: string) => void;
}

export const DeliveryStatusUpdate = ({ open, onOpenChange, delivery, onStatusUpdate }: DeliveryStatusUpdateProps) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [actualDelivery, setActualDelivery] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledReason, setScheduledReason] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [delayDuration, setDelayDuration] = useState('');
  const [newEstimatedDate, setNewEstimatedDate] = useState('');

  const statusOptions = [
    { 
      value: 'Scheduled', 
      label: 'Scheduled', 
      icon: Clock, 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/15',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-blue-500/10'
    },
    { 
      value: 'In Transit', 
      label: 'In Transit', 
      icon: Truck, 
      color: 'text-yellow-600 dark:text-yellow-400', 
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      hoverBg: 'hover:bg-yellow-500/15',
      selectedBorder: 'border-yellow-500',
      selectedBg: 'bg-yellow-500/10'
    },
    { 
      value: 'Delivered', 
      label: 'Delivered', 
      icon: PackageCheck, 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      hoverBg: 'hover:bg-green-500/15',
      selectedBorder: 'border-green-500',
      selectedBg: 'bg-green-500/10'
    },
    { 
      value: 'Delayed', 
      label: 'Delayed', 
      icon: XCircle, 
      color: 'text-red-600 dark:text-red-400', 
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      hoverBg: 'hover:bg-red-500/15',
      selectedBorder: 'border-red-500',
      selectedBg: 'bg-red-500/10'
    },
  ];

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSubmit = () => {
    if (!delivery || !selectedStatus) return;

    // Validation based on status
    if (selectedStatus === 'Delivered' && !receivedBy) {
      toast({
        title: "Validation Error",
        description: "Please enter who received the delivery",
        variant: "destructive"
      });
      return;
    }

    if (selectedStatus === 'Delayed' && !delayReason) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the delay",
        variant: "destructive"
      });
      return;
    }

    onStatusUpdate(
      delivery.id, 
      selectedStatus, 
      selectedStatus === 'Delivered' ? receivedBy : undefined,
      selectedStatus === 'Delivered' ? (actualDelivery || new Date().toISOString().split('T')[0]) : undefined
    );

    toast({
      title: "Status Updated",
      description: `Delivery status changed to ${selectedStatus}`,
    });

    // Reset all fields
    setSelectedStatus('');
    setReceivedBy('');
    setActualDelivery('');
    setScheduledTime('');
    setScheduledReason('');
    setEstimatedDelivery('');
    setCurrentLocation('');
    setDelayReason('');
    setDelayDuration('');
    setNewEstimatedDate('');
    onOpenChange(false);
  };

  if (!delivery) return null;

  const renderStatusFields = () => {
    if (!selectedStatus) return null;

    switch (selectedStatus) {
      case 'Scheduled':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="scheduledTime" className="text-sm font-medium">
                Scheduled Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledReason" className="text-sm font-medium">
                Reason for Scheduling
              </Label>
              <Textarea
                id="scheduledReason"
                placeholder="Why is this delivery being scheduled?"
                value={scheduledReason}
                onChange={(e) => setScheduledReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        );

      case 'In Transit':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="estimatedDelivery" className="text-sm font-medium">
                Estimated Delivery Time
              </Label>
              <Input
                id="estimatedDelivery"
                type="datetime-local"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLocation" className="text-sm font-medium">
                Current Location
              </Label>
              <LocationPicker
                value={currentLocation}
                onChange={(location) => setCurrentLocation(location)}
                placeholder="Search location or select from map"
              />
            </div>
          </div>
        );

      case 'Delivered':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="receivedBy" className="text-sm font-medium">
                Received By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="receivedBy"
                placeholder="Enter recipient name"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualDelivery" className="text-sm font-medium">
                Delivery Date
              </Label>
              <Input
                id="actualDelivery"
                type="date"
                value={actualDelivery}
                onChange={(e) => setActualDelivery(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        );

      case 'Delayed':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="delayReason" className="text-sm font-medium">
                Reason for Delay <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="delayReason"
                placeholder="Explain the reason for the delay"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delayDuration" className="text-sm font-medium">
                Expected Delay Duration
              </Label>
              <Input
                id="delayDuration"
                placeholder="e.g., 2 hours, 1 day"
                value={delayDuration}
                onChange={(e) => setDelayDuration(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEstimatedDate" className="text-sm font-medium">
                New Estimated Delivery
              </Label>
              <Input
                id="newEstimatedDate"
                type="datetime-local"
                value={newEstimatedDate}
                onChange={(e) => setNewEstimatedDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-2 pb-3 border-b">
          <DialogTitle className="text-lg font-semibold">Update Delivery Status</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-primary">{delivery.order_no}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm">{delivery.apartment}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Status Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Select Status</Label>
            <div className="grid grid-cols-4 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusSelect(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? `${option.selectedBorder} ${option.selectedBg}` 
                        : `${option.borderColor} ${option.hoverBg}`
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${option.bgColor}`}>
                      <Icon className={`h-4 w-4 ${option.color}`} />
                    </div>
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Fields Based on Selected Status */}
          {selectedStatus && (
            <div className="p-4 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-primary/10">
                  {statusOptions.find(opt => opt.value === selectedStatus)?.icon && 
                    (() => {
                      const Icon = statusOptions.find(opt => opt.value === selectedStatus)!.icon;
                      return <Icon className="h-3.5 w-3.5 text-primary" />;
                    })()
                  }
                </div>
                <p className="text-sm font-semibold">{selectedStatus} Details</p>
              </div>
              {renderStatusFields()}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStatus}
            className="h-10"
          >
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
