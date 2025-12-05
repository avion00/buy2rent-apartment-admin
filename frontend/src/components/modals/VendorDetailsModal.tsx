import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataStore, Vendor } from '@/stores/useDataStore';
import { vendorApi, Vendor as ApiVendor } from '@/services/vendorApi';
import { toast } from 'sonner';
import { Loader2, Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface VendorDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
  productId?: string;
  onVendorUpdated?: (vendorId: string, vendorName: string) => void;
  openInEditMode?: boolean; // Open directly in change vendor mode
}

export const VendorDetailsModal = ({ open, onOpenChange, vendorName, productId, onVendorUpdated, openInEditMode = false }: VendorDetailsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);
  const [isChangingVendor, setIsChangingVendor] = useState(false);
  const [newVendorId, setNewVendorId] = useState<string>('');

  // Fetch vendors and find the selected one
  useEffect(() => {
    if (open) {
      fetchVendors();
      setIsChangingVendor(openInEditMode); // Set based on prop
    } else {
      // Reset states when modal closes
      setSelectedVendor(null);
      setNewVendorId('');
      setIsChangingVendor(false);
    }
  }, [open, openInEditMode]);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await vendorApi.getVendors();
      setVendors(response.results);
      
      // Find vendor by name
      const vendor = response.results.find(v => v.name.toLowerCase() === vendorName.toLowerCase());
      if (vendor) {
        setSelectedVendor(vendor);
        setNewVendorId(vendor.id);
      } else {
        // Clear previous vendor data if no vendor is found
        setSelectedVendor(null);
        setNewVendorId('');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeVendor = async () => {
    if (!newVendorId) {
      toast.error('Please select a vendor');
      return;
    }

    const vendor = vendors.find(v => v.id === newVendorId);
    if (vendor) {
      onVendorUpdated?.(vendor.id, vendor.name);
      toast.success(`Vendor changed to ${vendor.name}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Vendor Details
          </DialogTitle>
          <DialogDescription>
            View vendor information and change vendor assignment
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Current Vendor Details */}
            {selectedVendor ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Vendor</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingVendor(!isChangingVendor)}
                  >
                    {isChangingVendor ? 'Cancel' : 'Change Vendor'}
                  </Button>
                </div>

                {!isChangingVendor ? (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Vendor Name</Label>
                        <p className="font-semibold">{selectedVendor.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Company Name</Label>
                        <p className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {selectedVendor.company_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Contact Person</Label>
                        <p>{selectedVendor.contact_person || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <p>{selectedVendor.category || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${selectedVendor.email}`} className="text-primary hover:underline">
                            {selectedVendor.email}
                          </a>
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {selectedVendor.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Website</Label>
                        <p className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {selectedVendor.website ? (
                            <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {selectedVendor.website}
                            </a>
                          ) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">
                            {selectedVendor.address || 'N/A'}
                            {selectedVendor.city && `, ${selectedVendor.city}`}
                            {selectedVendor.country && `, ${selectedVendor.country}`}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-xs text-muted-foreground">Lead Time</Label>
                        <p className="font-semibold">{selectedVendor.lead_time || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Reliability</Label>
                        <p className="font-semibold">{selectedVendor.reliability || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Orders</Label>
                        <p className="font-semibold">{selectedVendor.orders_count || 0}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <Label>Select New Vendor</Label>
                    <Select value={newVendorId} onValueChange={setNewVendorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{vendor.name}</span>
                              {vendor.company_name && (
                                <span className="text-xs text-muted-foreground">({vendor.company_name})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No vendor assigned or vendor not found in the system.
                </p>
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Assign Vendor</Label>
                  <Select value={newVendorId} onValueChange={setNewVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{vendor.name}</span>
                            {vendor.company_name && (
                              <span className="text-xs text-muted-foreground">({vendor.company_name})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {(isChangingVendor || !selectedVendor) && (
            <Button onClick={handleChangeVendor} disabled={!newVendorId}>
              {selectedVendor ? 'Change Vendor' : 'Assign Vendor'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
