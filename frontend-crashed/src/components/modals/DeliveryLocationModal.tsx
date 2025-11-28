import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, Package, Clock, User, Phone, Mail } from "lucide-react";

interface DeliveryLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export const DeliveryLocationModal = ({ open, onOpenChange, product }: DeliveryLocationModalProps) => {
  if (!product) return null;

  const getDeliveryTypeColor = (type: string) => {
    if (type?.includes("DPD")) return "bg-blue-500 text-white";
    if (type?.includes("GLS")) return "bg-yellow-500 text-black";
    if (type?.includes("Sameday")) return "bg-green-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Delivery Location Details
          </DialogTitle>
          <DialogDescription>
            Complete delivery information for {product.product}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.product}
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.product}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-sm text-muted-foreground">Vendor: {product.vendor}</p>
            </div>
          </div>

          <Separator />

          {/* Delivery Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Delivery Service</h4>
            </div>
            <Badge className={getDeliveryTypeColor(product.deliveryType)} variant="secondary">
              {product.deliveryType || "Not specified"}
            </Badge>
            {product.trackingNumber && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="ml-2 font-mono font-medium">{product.trackingNumber}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Delivery Location */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Delivery Address</h4>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <p className="font-medium">{product.deliveryAddress || "Not specified"}</p>
              {product.deliveryCity && (
                <p className="text-sm text-muted-foreground">
                  {product.deliveryCity}, {product.deliveryPostalCode || ""}
                </p>
              )}
              {product.deliveryCountry && (
                <p className="text-sm text-muted-foreground">{product.deliveryCountry}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Delivery Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">How to Receive</h4>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              {product.deliveryInstructions ? (
                <p className="text-sm leading-relaxed">{product.deliveryInstructions}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No special instructions</p>
              )}
              
              {product.deliveryContactPerson && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{product.deliveryContactPerson}</span>
                </div>
              )}
              
              {product.deliveryContactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{product.deliveryContactPhone}</span>
                </div>
              )}
              
              {product.deliveryContactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{product.deliveryContactEmail}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Delivery Schedule */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Delivery Schedule</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Expected Delivery</p>
                <p className="font-medium">
                  {product.expectedDeliveryDate
                    ? new Date(product.expectedDeliveryDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Actual Delivery</p>
                <p className="font-medium">
                  {product.actualDeliveryDate
                    ? new Date(product.actualDeliveryDate).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
              {product.deliveryTimeWindow && (
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Time Window</p>
                  <p className="font-medium">{product.deliveryTimeWindow}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {product.deliveryNotes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Additional Notes</h4>
                <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/30 rounded">
                  {product.deliveryNotes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
