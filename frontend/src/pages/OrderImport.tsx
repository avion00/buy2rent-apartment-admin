import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Download, Building2, Store, Package } from 'lucide-react';
import { apartmentApi, Apartment } from '@/services/apartmentApi';
import { vendorApi, Vendor } from '@/services/vendorApi';
import { orderApi } from '@/services/orderApi';

const OrderImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Order form fields
  const [apartmentId, setApartmentId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('draft');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // File upload fields
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [fileSize, setFileSize] = useState<string>('');
  
  // Lookup data
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load apartments & vendors on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingLookups(true);
        const [aptRes, vendorRes] = await Promise.all([
          apartmentApi.getApartments({ page_size: 100 }),
          vendorApi.getVendors(),
        ]);
        setApartments(aptRes.results || []);
        setVendors(vendorRes.results || []);
      } catch (error) {
        console.error('Failed to load data', error);
        toast({
          title: 'Failed to load data',
          description: 'Could not load apartments or vendors. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingLookups(false);
      }
    };
    loadData();
  }, [toast]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a valid Excel or CSV file',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 50MB',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setFileSize(formatFileSize(selectedFile.size));
    setImportResult(null);
  };

  const handleImport = async () => {
    // Validation
    if (!apartmentId) {
      toast({
        title: 'Validation Error',
        description: 'Please select an apartment',
        variant: 'destructive',
      });
      return;
    }

    if (!vendorId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a vendor',
        variant: 'destructive',
      });
      return;
    }

    if (!poNumber.trim()) {
      toast({
        title: 'Validation Error',
        description: 'PO Number is required',
        variant: 'destructive',
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the API to import order
      const result = await orderApi.importOrder({
        file: file,
        apartment_id: apartmentId,
        vendor_id: vendorId,
        po_number: poNumber,
        status: status,
        confirmation_code: confirmationCode,
        tracking_number: trackingNumber,
        expected_delivery: expectedDelivery,
        shipping_address: shippingAddress,
        notes: notes,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setImportResult(result);

      toast({
        title: 'Import Successful!',
        description: `Order ${result.po_number} created with ${result.total_items} items.`,
      });

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.response?.data?.error || error.message || 'Failed to import order. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Use the product import template since the format is the same
      const response = await fetch('/api/products/import_template/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'order-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Template downloaded successfully',
      });
    } catch (error) {
      console.error('Template download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout title="Import Orders">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/orders')} disabled={isUploading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apartment Selection */}
              <Card className="border hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <Label htmlFor="apartment" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Apartment *
                  </Label>
                  <Select value={apartmentId} onValueChange={setApartmentId} disabled={isLoadingLookups || isUploading}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={isLoadingLookups ? 'Loading...' : 'Select apartment'} />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Vendor Selection */}
              <Card className="border hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <Label htmlFor="vendor" className="flex items-center gap-1.5 text-sm font-medium mb-2">
                    <Store className="h-4 w-4 text-primary" />
                    Vendor *
                  </Label>
                  <Select value={vendorId} onValueChange={setVendorId} disabled={isLoadingLookups || isUploading}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={isLoadingLookups ? 'Loading...' : 'Select vendor'} />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* PO Number, Confirmation, Tracking & Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_number">PO Number *</Label>
                <Input
                  id="po_number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g., PO-2025-00001"
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmation_code">Confirmation</Label>
                <Input
                  id="confirmation_code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="e.g., CONF-8831"
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking</Label>
                <Input
                  id="tracking_number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., TRK-93234"
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={isUploading}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Delivery & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_delivery">Expected Delivery</Label>
                <Input
                  id="expected_delivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_address">Shipping Address</Label>
                <Input
                  id="shipping_address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter shipping address"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <EnhancedTextarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this order"
                rows={3}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Upload File</CardTitle>
                <CardDescription className="mt-1">
                  Select an Excel (.xlsx, .xls) or CSV file (max 50MB)
                </CardDescription>
              </div>
              {file && fileSize && (
                <Badge variant="secondary" className="text-sm">
                  {fileSize}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    asChild 
                    disabled={isUploading}
                    className="relative overflow-hidden"
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                {file && !isUploading && (
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{fileSize}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Uploading and processing...</span>
                    <span className="text-muted-foreground">
                      {uploadProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Download Template Button */}
              <div className="flex justify-start">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadTemplate}
                  disabled={isUploading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                Summary of the import operation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Order Created</div>
                    <div className="text-2xl">{importResult.order_created ? 'Yes' : 'No'}</div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Total Items</div>
                    <div className="text-2xl text-green-600">{importResult.total_items}</div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Successfully Imported</div>
                    <div className="text-2xl text-green-600">{importResult.successful_imports}</div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Total Amount</div>
                    <div className="text-2xl text-green-600">${importResult.total_amount?.toFixed(2) || '0.00'}</div>
                  </AlertDescription>
                </Alert>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Errors:</h4>
                  <div className="space-y-1">
                    {importResult.errors.map((error: string, idx: number) => (
                      <div key={idx} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => navigate('/orders')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Button */}
        {!importResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/orders')}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!apartmentId || !vendorId || !poNumber || !file || isUploading}
                  className="min-w-[200px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default OrderImport;
