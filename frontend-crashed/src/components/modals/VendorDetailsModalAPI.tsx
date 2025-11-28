import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  FileText,
  Calendar,
  Award,
  Package,
} from 'lucide-react';
import { Vendor } from '@/services/api';
import { format } from 'date-fns';

interface VendorDetailsModalAPIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export const VendorDetailsModalAPI = ({
  open,
  onOpenChange,
  vendor,
}: VendorDetailsModalAPIProps) => {
  if (!vendor) return null;

  // Safe date formatter
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error('Date format error:', error);
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Vendor Profile
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{vendor.name}</h3>
                  {vendor.company_name && (
                    <p className="text-sm text-muted-foreground mt-1">{vendor.company_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {vendor.reliability && vendor.reliability > 0 && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <Award className="h-3 w-3 mr-1" />
                        {Number(vendor.reliability).toFixed(1)} Rating
                      </Badge>
                    )}
                    {vendor.orders_count != null && vendor.orders_count > 0 && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Package className="h-3 w-3 mr-1" />
                        {vendor.orders_count} Orders
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {vendor.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${vendor.email}`} className="text-sm font-medium hover:underline truncate block">
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${vendor.phone}`} className="text-sm font-medium hover:underline truncate block">
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline truncate block text-primary"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {vendor.contact_person && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                  <p className="text-sm font-medium">{vendor.contact_person}</p>
                </div>
              )}

              {/* Address */}
              {(vendor.address || vendor.city || vendor.country) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="text-sm">
                      {vendor.address && <span>{vendor.address}<br /></span>}
                      {vendor.city && <span>{vendor.city}{vendor.postal_code && `, ${vendor.postal_code}`}<br /></span>}
                      {vendor.country && <span>{vendor.country}</span>}
                    </p>
                  </div>
                </div>
              )}

              {vendor.notes && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{vendor.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Business Information */}
              {(vendor.business_type || vendor.year_established || vendor.employee_count) && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {vendor.business_type && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Business Type</p>
                          <p className="text-sm font-medium mt-1">{vendor.business_type}</p>
                        </div>
                      )}
                      {vendor.year_established && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Established</p>
                          <p className="text-sm font-medium mt-1">{vendor.year_established}</p>
                        </div>
                      )}
                      {vendor.employee_count && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Employees</p>
                          <p className="text-sm font-medium mt-1">{vendor.employee_count}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Terms & Conditions */}
              {(vendor.payment_terms || vendor.delivery_terms || vendor.lead_time) && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Terms & Delivery</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendor.payment_terms && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Payment Terms</p>
                          <p className="text-sm mt-1">{vendor.payment_terms}</p>
                        </div>
                      )}
                      {vendor.delivery_terms && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Delivery Terms</p>
                          <p className="text-sm mt-1">{vendor.delivery_terms}</p>
                        </div>
                      )}
                      {vendor.lead_time && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-xs text-muted-foreground">Lead Time</p>
                          <p className="text-sm mt-1">{vendor.lead_time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Metadata */}
              {(vendor.created_at || vendor.updated_at) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.created_at && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {formatDate(vendor.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  {vendor.updated_at && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                        <p className="text-sm font-medium">
                          {formatDate(vendor.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
