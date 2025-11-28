import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectTags } from '@/components/ui/multi-select-tags';
import { AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '@/stores/useDataStore';

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportIssueModal = ({ open, onOpenChange }: ReportIssueModalProps) => {
  const { apartments, products, vendors, addIssue } = useDataStore();
  
  const [formData, setFormData] = useState({
    apartmentId: '',
    productId: '',
    issueTypes: [] as string[],
    customIssueType: '',
    priority: '',
    description: '',
    expectedResolution: '',
    vendorContact: '',
    impact: '',
    photos: [] as File[],
  });

  const [uploading, setUploading] = useState(false);

  const issueTypes = [
    'Broken/Damaged',
    'Wrong Item/Color',
    'Missing Parts',
    'Incorrect Quantity',
    'Poor Quality',
    'Late Delivery',
    'Installation Issue',
    'Warranty Claim',
    'Defective Product',
    'Packaging Damage',
    'Other'
  ];

  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  
  const impactLevels = [
    'Blocking Progress',
    'Delaying Delivery',
    'Minor Inconvenience',
    'No Impact'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apartmentId || !formData.productId || formData.issueTypes.length === 0 || !formData.priority || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.issueTypes.includes('Other') && !formData.customIssueType.trim()) {
      toast.error('Please specify the custom issue type');
      return;
    }

    setUploading(true);

    try {
      const product = products.find(p => p.id === formData.productId);
      const vendor = vendors.find(v => v.id === product?.vendorId);

      const issueTypesString = formData.issueTypes.includes('Other') 
        ? [...formData.issueTypes.filter(t => t !== 'Other'), formData.customIssueType].join(', ')
        : formData.issueTypes.join(', ');

      const newIssue = {
        id: `issue-${Date.now()}`,
        apartmentId: formData.apartmentId,
        productId: formData.productId,
        productName: product?.product || 'Unknown Product',
        vendor: product?.vendor || 'Unknown Vendor',
        type: issueTypesString,
        description: formData.description,
        status: 'Open' as const,
        reportedOn: new Date().toISOString(),
        priority: formData.priority,
        expectedResolution: formData.expectedResolution,
        vendorContact: formData.vendorContact,
        impact: formData.impact,
        photos: formData.photos.map((file, index) => ({
          id: `photo-${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        })),
        aiActivated: false,
        aiCommunicationLog: [],
      };

      // In a real app, upload photos to server first
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add issue to store
      addIssue(newIssue);

      toast.success('Issue Reported', {
        description: 'The issue has been successfully reported and assigned.',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to report issue');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      apartmentId: '',
      productId: '',
      issueTypes: [],
      customIssueType: '',
      priority: '',
      description: '',
      expectedResolution: '',
      vendorContact: '',
      impact: '',
      photos: [],
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-danger" />
            Report New Issue
          </DialogTitle>
          <DialogDescription>
            Report a product issue for vendor resolution. All details will be tracked and communicated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment *</Label>
              <Select value={formData.apartmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, apartmentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select apartment" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {apartments.map(apt => (
                    <SelectItem key={apt.id} value={String(apt.id)}>{apt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select 
                value={formData.productId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
                disabled={!formData.apartmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {products
                    .filter(p => String(p.apartmentId) === String(formData.apartmentId))
                    .map(product => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.product}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
              <p className="text-sm font-medium">Product Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span> {selectedProduct.sku}
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span> {selectedProduct.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span> €{selectedProduct.unitPrice.toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span> {selectedProduct.qty}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issueTypes">Issue Type(s) *</Label>
            <MultiSelectTags
              options={issueTypes}
              value={formData.issueTypes}
              onChange={(value) => setFormData(prev => ({ ...prev, issueTypes: value }))}
              placeholder="Select one or more issue types"
            />
            <p className="text-xs text-muted-foreground">Select multiple types if applicable</p>
          </div>

          {formData.issueTypes.includes('Other') && (
            <div className="space-y-2">
              <Label htmlFor="customIssueType">Specify Other Issue Type *</Label>
              <Input
                id="customIssueType"
                placeholder="Enter custom issue type..."
                value={formData.customIssueType}
                onChange={(e) => setFormData(prev => ({ ...prev, customIssueType: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact Level</Label>
              <Select value={formData.impact} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  {impactLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedResolution">Expected Resolution Date</Label>
              <Input
                id="expectedResolution"
                type="date"
                value={formData.expectedResolution}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedResolution: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorContact">Vendor Contact Person</Label>
              <Input
                id="vendorContact"
                placeholder="Contact person name"
                value={formData.vendorContact}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorContact: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Photos (Optional, max 10)</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.photos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-danger text-danger-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Reporting...' : 'Report Issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
