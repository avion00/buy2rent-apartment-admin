import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { useDataStore, Vendor } from '@/stores/useDataStore';
import { toast } from 'sonner';

interface VendorDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
  onVendorUpdated?: (vendorId: string) => void;
}

export const VendorDetailsModal = ({ open, onOpenChange, vendorName, onVendorUpdated }: VendorDetailsModalProps) => {
  const getVendorByName = useDataStore((state) => state.getVendorByName);
  const addVendor = useDataStore((state) => state.addVendor);
  const updateVendor = useDataStore((state) => state.updateVendor);
  
  const existingVendor = getVendorByName(vendorName);
  
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: vendorName,
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
  });

  useEffect(() => {
    if (existingVendor) {
      setFormData(existingVendor);
    } else {
      setFormData({
        name: vendorName,
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        notes: '',
      });
    }
  }, [existingVendor, vendorName, open]);

  const handleSave = () => {
    if (!formData.email) {
      toast.error('Email is required for AI communication');
      return;
    }

    if (existingVendor) {
      updateVendor(existingVendor.id, formData);
      toast.success('Vendor details updated');
      onVendorUpdated?.(existingVendor.id);
    } else {
      const newVendor = { ...formData } as Omit<Vendor, 'id'>;
      addVendor(newVendor);
      toast.success('New vendor added to global list');
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Details - {vendorName}</DialogTitle>
          <DialogDescription>
            {existingVendor 
              ? 'Edit vendor details. Changes will be reflected globally.' 
              : 'Add new vendor details. This vendor will be saved to the global vendors list.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Official company name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Primary contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">Required for AI communication</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+36 ..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <EnhancedTextarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this vendor..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {existingVendor ? 'Update' : 'Add'} Vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
