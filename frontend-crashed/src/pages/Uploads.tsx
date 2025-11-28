import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const Uploads = () => {
  const uploads = [
    {
      id: 1,
      name: "Apartment 3B - Design List v2.xlsx",
      uploadedBy: "Sarah Designer",
      uploadedAt: "2024-01-15 10:30 AM",
      status: "Parsed",
      itemsFound: 48,
      version: 2
    },
    {
      id: 2,
      name: "Apartment 4A - Initial List.pdf",
      uploadedBy: "John Procurement",
      uploadedAt: "2024-01-14 3:45 PM",
      status: "Processing",
      itemsFound: 0,
      version: 1
    },
    {
      id: 3,
      name: "Apartment 3B - Design List v1.xlsx",
      uploadedBy: "Sarah Designer",
      uploadedAt: "2024-01-10 2:15 PM",
      status: "Completed",
      itemsFound: 42,
      version: 1
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Parsed": "bg-success/10 text-success",
      "Processing": "bg-warning/10 text-warning",
      "Completed": "bg-muted text-muted-foreground",
      "Error": "bg-danger/10 text-danger"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Parsed":
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Processing":
        return <Clock className="h-4 w-4" />;
      case "Error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <PageLayout title="Uploads & Design Lists">
      <div className="space-y-6">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Design List</CardTitle>
            <CardDescription>
              Upload Excel or PDF files containing furniture and accessory lists for parsing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: .xlsx, .xls, .pdf (Max 20MB)
              </p>
              <Button>Select Files</Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload History */}
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Previous design list uploads and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div 
                  key={upload.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-muted rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{upload.name}</p>
                        <Badge variant="outline" className="text-xs">
                          v{upload.version}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Uploaded by {upload.uploadedBy}</span>
                        <span>•</span>
                        <span>{upload.uploadedAt}</span>
                        {upload.itemsFound > 0 && (
                          <>
                            <span>•</span>
                            <span>{upload.itemsFound} items found</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(upload.status)}>
                      {getStatusIcon(upload.status)}
                      <span className="ml-1">{upload.status}</span>
                    </Badge>
                    <div className="flex gap-2">
                      {upload.status === "Parsed" && (
                        <Button variant="outline" size="sm">View Diff</Button>
                      )}
                      <Button variant="outline" size="sm">Download</Button>
                      <Button size="sm">View Items</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Prepare your design list</p>
                  <p className="text-muted-foreground">
                    Ensure your file contains columns: Item Name, SKU, Vendor, Price, Quantity
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Upload the file</p>
                  <p className="text-muted-foreground">
                    Drag and drop or click to browse. Files will be automatically parsed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Review parsed items</p>
                  <p className="text-muted-foreground">
                    Check the items found and compare with previous versions if applicable
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Uploads;
