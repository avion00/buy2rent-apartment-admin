import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { productApi } from "@/services/productApi";
import { useToast } from "@/hooks/use-toast";

const ProductImport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apartmentId = searchParams.get("apartmentId");
  const { toast: toastHook } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [fileSize, setFileSize] = useState<string>("");

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImportResult(null);
  };


  const handleImport = async () => {
    if (!file || !apartmentId) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await productApi.importProducts(file, apartmentId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportResult(result);

      toastHook({
        title: "Import Successful!",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{result.message}</p>
            <p className="text-sm">Total products: {result.total_products}</p>
            <p className="text-sm">Successfully imported: {result.successful_imports}</p>
            {result.failed_imports > 0 && (
              <p className="text-sm text-yellow-600">Failed: {result.failed_imports}</p>
            )}
          </div>
        ),
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/apartments/${apartmentId}`);
      }, 2000);
    } catch (error: any) {
      console.error("Import error:", error);
      toastHook({
        title: "Import Failed",
        description: error.response?.data?.message || error.message || "Failed to import products. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await productApi.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };


  return (
    <PageLayout title="Import Products">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} disabled={isUploading}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Total Products</div>
                    <div className="text-2xl">{importResult.total_products}</div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <div className="font-semibold">Successfully Imported</div>
                    <div className="text-2xl text-green-600">{importResult.successful_imports}</div>
                  </AlertDescription>
                </Alert>
                {importResult.failed_imports > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">Failed</div>
                      <div className="text-2xl">{importResult.failed_imports}</div>
                    </AlertDescription>
                  </Alert>
                )}
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
                <Button onClick={() => navigate(`/apartments/${apartmentId}`)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Button */}
        {file && !importResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFile(null);
                    setFileSize("");
                  }}
                  disabled={isUploading}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || isUploading}
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
                      Import Products
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
