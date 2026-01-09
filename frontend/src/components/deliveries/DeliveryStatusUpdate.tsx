import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, Truck, PackageCheck, XCircle, Calendar, User, AlertTriangle } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

interface StatusUpdateData {
  receivedBy?: string;
  actualDelivery?: string;
  statusNotes?: string;
  location?: string;
  delayReason?: string;
}

interface DeliveryStatusUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: {
    id: string;
    order_reference: string;
    apartment_name: string;
    status: string;
  } | null;
  onStatusUpdate: (deliveryId: string, newStatus: string, data?: StatusUpdateData) => void;
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
      value: 'Confirmed', 
      label: 'Confirmed', 
      icon: Clock, 
      color: 'text-yellow-600 dark:text-yellow-400', 
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      hoverBg: 'hover:bg-yellow-500/15',
      selectedBorder: 'border-yellow-500',
      selectedBg: 'bg-yellow-500/10'
    },
    { 
      value: 'In Transit', 
      label: 'In Transit', 
      icon: Truck, 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/15',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-blue-500/10'
    },
    { 
      value: 'Delayed', 
      label: 'Delayed', 
      icon: AlertTriangle, 
      color: 'text-orange-600 dark:text-orange-400', 
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      hoverBg: 'hover:bg-orange-500/15',
      selectedBorder: 'border-orange-500',
      selectedBg: 'bg-orange-500/10'
    },
    { 
      value: 'Received', 
      label: 'Received', 
      icon: PackageCheck, 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      hoverBg: 'hover:bg-green-500/15',
      selectedBorder: 'border-green-500',
      selectedBg: 'bg-green-500/10'
    },
    { 
      value: 'Returned', 
      label: 'Returned', 
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
    if (selectedStatus === 'Received' && !receivedBy) {
      toast({
        title: "Validation Error",
        description: "Please enter who received the delivery",
        variant: "destructive"
      });
      return;
    }

    // Build status notes based on the status
    let statusNotes = '';
    switch (selectedStatus) {
      case 'Confirmed':
        statusNotes = 'Vendor confirmed the order';
        break;
      case 'In Transit':
        statusNotes = currentLocation ? `Package is at ${currentLocation}` : 'Package is in transit';
        break;
      case 'Delayed':
        statusNotes = delayReason || 'Delivery delayed';
        break;
      case 'Received':
        statusNotes = `Received by ${receivedBy}`;
        break;
      case 'Returned':
        statusNotes = delayReason || 'Items returned to vendor';
        break;
      default:
        statusNotes = `Status changed to ${selectedStatus}`;
    }

    onStatusUpdate(delivery.id, selectedStatus, {
      receivedBy: selectedStatus === 'Received' ? receivedBy : undefined,
      actualDelivery: selectedStatus === 'Received' ? (actualDelivery || new Date().toISOString().split('T')[0]) : undefined,
      statusNotes,
      location: currentLocation || undefined,
      delayReason: (selectedStatus === 'Delayed' || selectedStatus === 'Returned') ? delayReason : undefined,
    });

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
      case 'Confirmed':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="scheduledReason" className="text-sm font-medium">
                Confirmation Notes
              </Label>
              <Textarea
                id="scheduledReason"
                placeholder="Add any notes about vendor confirmation..."
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

      case 'Received':
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
                Reason for Delay
              </Label>
              <Textarea
                id="delayReason"
                placeholder="Explain why the delivery is delayed..."
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLocation" className="text-sm font-medium">
                Current Location (Optional)
              </Label>
              <Input
                id="currentLocation"
                placeholder="Where is the package now?"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        );

      case 'Returned':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="delayReason" className="text-sm font-medium">
                Reason for Return
              </Label>
              <Textarea
                id="delayReason"
                placeholder="Explain why items are being returned to vendor..."
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                rows={3}
                className="resize-none"
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
            <span className="font-mono text-sm font-medium text-primary">{delivery.order_reference}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm">{delivery.apartment_name}</span>
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
