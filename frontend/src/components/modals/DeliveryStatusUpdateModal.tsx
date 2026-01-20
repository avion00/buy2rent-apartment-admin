import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon, CheckCircle, Truck, Clock, XCircle, RotateCcw, Package, Loader2 } from "lucide-react";
import { deliveryApi, Delivery } from "@/services/deliveryApi";
import { useToast } from "@/hooks/use-toast";

interface DeliveryStatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string;
  currentStatus: string;
  orderReference: string;
  onStatusUpdated?: () => void;
}

const STATUS_OPTIONS = [
  { value: "Confirmed", label: "Confirmed", icon: CheckCircle, color: "text-yellow-500" },
  { value: "In Transit", label: "In Transit", icon: Truck, color: "text-blue-500" },
  { value: "Delayed", label: "Delayed", icon: Clock, color: "text-orange-500" },
  { value: "Received", label: "Received", icon: Package, color: "text-green-500" },
  { value: "Cancelled", label: "Cancelled", icon: XCircle, color: "text-red-500" },
  { value: "Returned", label: "Returned", icon: RotateCcw, color: "text-purple-500" },
];

export function DeliveryStatusUpdateModal({
  open,
  onOpenChange,
  deliveryId,
  currentStatus,
  orderReference,
  onStatusUpdated,
}: DeliveryStatusUpdateModalProps) {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [deliveryData, setDeliveryData] = useState<Delivery | null>(null);

  // Common fields
  const [notes, setNotes] = useState("");

  // Received status fields
  const [receivedBy, setReceivedBy] = useState("");
  const [actualDate, setActualDate] = useState<Date | undefined>(undefined);

  // In Transit status fields
  const [location, setLocation] = useState("");

  // Delayed status fields
  const [delayReason, setDelayReason] = useState("");

  // Returned status fields
  const [returnReason, setReturnReason] = useState("");

  // Cancelled status fields
  const [cancellationReason, setCancellationReason] = useState("");

  // Confirmed status fields
  const [confirmedBy, setConfirmedBy] = useState("");
  const [confirmationNotes, setConfirmationNotes] = useState("");

  // Fetch delivery details when modal opens or deliveryId changes
  useEffect(() => {
    if (open && deliveryId) {
      // Reset all form fields first to clear previous delivery data
      setNotes("");
      setReceivedBy("");
      setActualDate(undefined);
      setLocation("");
      setDelayReason("");
      setReturnReason("");
      setCancellationReason("");
      setConfirmedBy("");
      setConfirmationNotes("");
      setDeliveryData(null);
      
      setFetchingData(true);
      deliveryApi.getDelivery(deliveryId)
        .then((data) => {
          setDeliveryData(data);
          setSelectedStatus(data.status);
          
          // Pre-fill existing data
          if (data.received_by) {
            setReceivedBy(data.received_by);
          }
          
          if (data.actual_date) {
            try {
              const parsedDate = parse(data.actual_date, 'yyyy-MM-dd', new Date());
              setActualDate(parsedDate);
            } catch (e) {
              console.error('Error parsing date:', e);
            }
          }
          
          // Get latest status history entry for current status
          if (data.status_history && data.status_history.length > 0) {
            const latestEntry = data.status_history[0];
            
            // Pre-fill based on current status
            if (data.status === 'Received' && latestEntry.received_by) {
              setReceivedBy(latestEntry.received_by);
            }
            
            if (data.status === 'In Transit' && latestEntry.location) {
              setLocation(latestEntry.location);
            }
            
            if (data.status === 'Delayed' && latestEntry.delay_reason) {
              setDelayReason(latestEntry.delay_reason);
            }
            
            if (data.status === 'Returned' && latestEntry.notes) {
              setReturnReason(latestEntry.notes);
            }
            
            if (data.status === 'Cancelled' && latestEntry.notes) {
              setCancellationReason(latestEntry.notes);
            }
            
            if (data.status === 'Confirmed') {
              if (latestEntry.received_by) {
                setConfirmedBy(latestEntry.received_by);
              }
              if (latestEntry.notes) {
                setConfirmationNotes(latestEntry.notes);
              }
            }
          }
          
          if (data.notes) {
            setNotes(data.notes);
          }
        })
        .catch((error) => {
          console.error('Error fetching delivery details:', error);
          toast({
            title: "Error",
            description: "Failed to load delivery details",
            variant: "destructive",
          });
        })
        .finally(() => {
          setFetchingData(false);
        });
    } else if (!open) {
      // Reset all fields when modal closes
      setNotes("");
      setReceivedBy("");
      setActualDate(undefined);
      setLocation("");
      setDelayReason("");
      setReturnReason("");
      setCancellationReason("");
      setConfirmedBy("");
      setConfirmationNotes("");
      setDeliveryData(null);
    }
  }, [open, deliveryId, toast]);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields based on status
    if (selectedStatus === "Received" && !receivedBy) {
      toast({
        title: "Error",
        description: "Please enter who received the delivery",
        variant: "destructive",
      });
      return;
    }

    if (selectedStatus === "Delayed" && !delayReason) {
      toast({
        title: "Error",
        description: "Please enter the delay reason",
        variant: "destructive",
      });
      return;
    }

    if (selectedStatus === "Returned" && !returnReason) {
      toast({
        title: "Error",
        description: "Please enter the return reason",
        variant: "destructive",
      });
      return;
    }

    if (selectedStatus === "Cancelled" && !cancellationReason) {
      toast({
        title: "Error",
        description: "Please enter the cancellation reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare additional data based on status
      const additionalData: any = {
        status_notes: notes,
      };

      if (selectedStatus === "Received") {
        additionalData.received_by = receivedBy;
        if (actualDate) {
          additionalData.actual_date = format(actualDate, "yyyy-MM-dd");
        }
      }

      if (selectedStatus === "In Transit") {
        additionalData.location = location;
      }

      if (selectedStatus === "Delayed") {
        additionalData.delay_reason = delayReason;
      }

      if (selectedStatus === "Returned") {
        additionalData.status_notes = returnReason + (notes ? `\n\nAdditional Notes: ${notes}` : "");
      }

      if (selectedStatus === "Cancelled") {
        additionalData.status_notes = cancellationReason + (notes ? `\n\nAdditional Notes: ${notes}` : "");
      }

      if (selectedStatus === "Confirmed") {
        additionalData.received_by = confirmedBy;
        additionalData.status_notes = confirmationNotes || notes;
      }

      await deliveryApi.updateStatus(deliveryId, selectedStatus, additionalData);

      toast({
        title: "Success",
        description: `Delivery status updated to ${selectedStatus}`,
      });

      onOpenChange(false);
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update delivery status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusSpecificFields = () => {
    switch (selectedStatus) {
      case "Received":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receivedBy">
                Received By <span className="text-red-500">*</span>
              </Label>
              <Input
                id="receivedBy"
                placeholder="Enter recipient name"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !actualDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actualDate ? format(actualDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={actualDate}
                    onSelect={setActualDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "In Transit":
        return (
          <div className="space-y-2">
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              placeholder="Enter current location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        );

      case "Delayed":
        return (
          <div className="space-y-2">
            <Label htmlFor="delayReason">
              Delay Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="delayReason"
              placeholder="Explain the reason for delay"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              rows={3}
            />
          </div>
        );

      case "Returned":
        return (
          <div className="space-y-2">
            <Label htmlFor="returnReason">
              Return Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="returnReason"
              placeholder="Explain why the delivery was returned"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
            />
          </div>
        );

      case "Cancelled":
        return (
          <div className="space-y-2">
            <Label htmlFor="cancellationReason">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancellationReason"
              placeholder="Explain why the delivery was cancelled"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
            />
          </div>
        );

      case "Confirmed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmedBy">Confirmed By</Label>
              <Input
                id="confirmedBy"
                placeholder="Enter name of person who confirmed"
                value={confirmedBy}
                onChange={(e) => setConfirmedBy(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmationNotes">Confirmation Notes</Label>
              <Textarea
                id="confirmationNotes"
                placeholder="Add any confirmation details"
                value={confirmationNotes}
                onChange={(e) => setConfirmationNotes(e.target.value)}
                rows={2}
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
          <DialogDescription>
            {orderReference} • {currentStatus}
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
          {/* Status Selection */}
          <div className="space-y-3">
            <Label>Select Status</Label>
            <div className="grid grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                      selectedStatus === status.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", status.color)} />
                    <span className="text-sm font-medium">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status-specific fields */}
          {renderStatusSpecificFields()}

          {/* General Notes - Always visible */}
          {selectedStatus !== "Returned" && selectedStatus !== "Cancelled" && selectedStatus !== "Confirmed" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
        )}

        {!fetchingData && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
