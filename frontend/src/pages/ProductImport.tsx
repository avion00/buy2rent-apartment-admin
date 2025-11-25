import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { parseXlsx, autoMapColumns, validateProductRow } from "@/utils/excel";
import { useDataStore } from "@/stores/useDataStore";
import { toast } from "sonner";

const ProductImport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apartmentId = searchParams.get("apartmentId");
  
  const apartments = useDataStore((state) => state.apartments);
  const addProduct = useDataStore((state) => state.addProduct);
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please select a valid Excel or CSV file");
      return;
    }

    // Check file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 50MB");
      return;
    }

    setFile(selectedFile);
    setFileSize(formatFileSize(selectedFile.size));
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStatus("Reading file...");

    try {
      const data = await parseXlsx(selectedFile, (progress) => {
        setUploadProgress(progress);
        if (progress < 50) {
          setProcessingStatus(`Reading file... ${progress.toFixed(0)}%`);
        } else if (progress < 80) {
          setProcessingStatus(`Processing data... ${progress.toFixed(0)}%`);
        } else {
          setProcessingStatus(`Validating rows... ${progress.toFixed(0)}%`);
        }
      });
      
      setProcessingStatus("Mapping columns...");
      setParsedData(data);
      
      const mapping = autoMapColumns(data.headers);
      setColumnMapping(mapping);
      
      setProcessingStatus("Validating data...");
      const results = data.rows.map((row: any, idx) => {
        if (idx % 10 === 0) {
          const validationProgress = (idx / data.rows.length) * 100;
          setProcessingStatus(`Validating rows... ${validationProgress.toFixed(0)}%`);
        }
        return {
          row,
          validation: validateProductRow(row, mapping, apartments)
        };
      });
      setValidationResults(results);
      
      setProcessingStatus("Complete!");
      toast.success(`Successfully parsed ${data.rows.length} products`);
      setUploadProgress(100);
    } catch (error) {
      toast.error("Failed to parse file: " + (error as Error).message);
      setFile(null);
      setProcessingStatus("Error");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus("");
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleColumnMappingChange = (header: string, field: string) => {
    const newMapping = { ...columnMapping, [header]: field };
    setColumnMapping(newMapping);
    
    if (parsedData) {
      const results = parsedData.rows.map((row: any) => ({
        row,
        validation: validateProductRow(row, newMapping, apartments)
      }));
      setValidationResults(results);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !apartmentId) return;

    const validRows = validationResults.filter(r => r.validation.valid);
    
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);
    setProcessingStatus("Importing products...");

    try {
      // Process in batches to avoid freezing
      const batchSize = 10;
      const totalBatches = Math.ceil(validRows.length / batchSize);
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;
        
        setProcessingStatus(`Importing batch ${currentBatch} of ${totalBatches}...`);
        setImportProgress((currentBatch / totalBatches) * 100);
        
        // Process batch
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            batch.forEach(({ row }) => {
        const getValue = (field: string) => {
          const header = Object.keys(columnMapping).find(k => columnMapping[k] === field);
          return header ? row[header] : undefined;
        };

        const apartment = apartments.find(
          a => a.id === getValue('apartment') || 
               a.name.toLowerCase() === String(getValue('apartment')).toLowerCase()
        );

        const newProduct = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          apartmentId: apartment?.id || apartmentId,
          apartment: apartment?.name || getValue('apartment'),
          product: getValue('product') || '',
          vendor: getValue('vendor') || '',
          vendorLink: getValue('vendorLink') || '',
          sku: getValue('sku') || '',
          unitPrice: parseFloat(getValue('unitPrice')) || 0,
          qty: parseInt(getValue('qty')) || 0,
          category: getValue('category') || 'General',
          room: getValue('room') || '',
          availability: getValue('availability') || 'In Stock',
          status: getValue('status') || 'Draft',
          statusTags: [],
          eta: getValue('eta') || '',
          actualDelivery: getValue('actualDelivery') || '',
          imageUrl: getValue('imageUrl') || '',
          replacementOf: getValue('replacementOf') || '',
          notes: getValue('notes') || '',
          deliveryType: getValue('deliveryType') || '',
          deliveryAddress: getValue('deliveryAddress') || '',
          deliveryCity: getValue('deliveryCity') || '',
          deliveryPostalCode: getValue('deliveryPostalCode') || '',
          deliveryCountry: getValue('deliveryCountry') || '',
          deliveryInstructions: getValue('deliveryInstructions') || '',
          deliveryContactPerson: getValue('deliveryContactPerson') || '',
          deliveryContactPhone: getValue('deliveryContactPhone') || '',
          deliveryContactEmail: getValue('deliveryContactEmail') || '',
          trackingNumber: getValue('trackingNumber') || '',
          deliveryTimeWindow: getValue('deliveryTimeWindow') || '',
          deliveryNotes: getValue('deliveryNotes') || '',
          deliveryStatusTags: [],
        };

              addProduct(newProduct);
            });
            resolve();
          }, 100); // Small delay to allow UI updates
        });
      }

      setImportProgress(100);
      setProcessingStatus("Complete!");
      toast.success(`Successfully imported ${validRows.length} products`);
      
      setTimeout(() => {
        navigate(`/apartments/${apartmentId}`);
      }, 500);
    } catch (error) {
      toast.error("Import failed: " + (error as Error).message);
      setProcessingStatus("Error");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus("");
        setImportProgress(0);
      }, 1000);
    }
  };

  const fieldOptions = [
    { value: 'skip', label: 'Skip this column' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'product', label: 'Product' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'vendorLink', label: 'Vendor Link' },
    { value: 'sku', label: 'SKU' },
    { value: 'unitPrice', label: 'Unit Price' },
    { value: 'qty', label: 'Quantity' },
    { value: 'category', label: 'Category' },
    { value: 'room', label: 'Room' },
    { value: 'availability', label: 'Availability' },
    { value: 'status', label: 'Status' },
    { value: 'eta', label: 'Expected Delivery' },
    { value: 'actualDelivery', label: 'Actual Delivery' },
    { value: 'imageUrl', label: 'Image URL' },
    { value: 'replacementOf', label: 'Replacement Of' },
    { value: 'notes', label: 'Notes' },
    { value: 'deliveryType', label: 'Delivery Type' },
    { value: 'deliveryAddress', label: 'Delivery Address' },
    { value: 'deliveryCity', label: 'Delivery City' },
    { value: 'deliveryPostalCode', label: 'Delivery Postal Code' },
    { value: 'deliveryCountry', label: 'Delivery Country' },
    { value: 'deliveryInstructions', label: 'Delivery Instructions' },
    { value: 'deliveryContactPerson', label: 'Delivery Contact Person' },
    { value: 'deliveryContactPhone', label: 'Delivery Contact Phone' },
    { value: 'deliveryContactEmail', label: 'Delivery Contact Email' },
    { value: 'trackingNumber', label: 'Tracking Number' },
    { value: 'deliveryTimeWindow', label: 'Delivery Time Window' },
    { value: 'deliveryNotes', label: 'Delivery Notes' },
  ];

  const validCount = validationResults.filter(r => r.validation.valid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <PageLayout title="Import Products">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
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
                    disabled={isProcessing}
                  />
                  <Button 
                    variant="outline" 
                    asChild 
                    disabled={isProcessing}
                    className="relative overflow-hidden"
                  >
                    <span>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
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
                {file && !isProcessing && (
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
              {isProcessing && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{processingStatus}</span>
                    <span className="text-muted-foreground">
                      {uploadProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Column Mapping */}
        {parsedData && (
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
              <CardDescription>
                Match your Excel columns to product fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedData.headers.map((header: string) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="w-1/3 font-medium text-sm">{header}</div>
                    <div className="w-2/3">
                      <Select
                        value={columnMapping[header] || 'skip'}
                        onValueChange={(value) => handleColumnMappingChange(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Summary */}
        {validationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>
                Review the validation status before importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Alert className="flex-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <strong>{validCount}</strong> valid rows ready to import
                  </AlertDescription>
                </Alert>
                {invalidCount > 0 && (
                  <Alert className="flex-1" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{invalidCount}</strong> rows with errors
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Apartment</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, idx) => {
                      const getValue = (field: string) => {
                        const header = Object.keys(columnMapping).find(k => columnMapping[k] === field);
                        return header ? result.row[header] : '-';
                      };

                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                          <TableCell>
                            {result.validation.valid ? (
                              <Badge variant="default" className="bg-success">Valid</Badge>
                            ) : (
                              <Badge variant="destructive">Invalid</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{getValue('product')}</TableCell>
                          <TableCell>{getValue('vendor')}</TableCell>
                          <TableCell>{getValue('apartment')}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {result.validation.errors.map((error: string, i: number) => (
                                <div key={i} className="text-xs text-destructive">{error}</div>
                              ))}
                              {result.validation.warnings.map((warning: string, i: number) => (
                                <div key={i} className="text-xs text-warning">{warning}</div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Import Progress */}
              {isProcessing && importProgress > 0 && (
                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-primary">{processingStatus}</span>
                    <span className="text-muted-foreground">
                      {importProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || isProcessing}
                  className="min-w-[200px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Import {validCount} Products
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

export default ProductImport;
