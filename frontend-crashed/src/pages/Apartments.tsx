import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Eye, Edit, Trash2, Search, Upload, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle, Loader2, Cloud, File, Download } from 'lucide-react';
import { useApartments, useDeleteApartment, useClients } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';
import { importApi, ImportResponse } from '@/services/importApi';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const Apartments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [dragActive, setDragActive] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<{[key: string]: 'pending' | 'uploading' | 'success' | 'error'}>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; apartmentId: string; apartmentName: string }>({ open: false, apartmentId: '', apartmentName: '' });
  
  // Apartment form state
  const [apartmentForm, setApartmentForm] = useState({
    name: '',
    type: 'furnishing',
    client: '',
    address: '',
    status: 'Planning',
    designer: '',
    start_date: '',
    due_date: '',
  });
  
  // Fetch apartments from API
  const typeFilter = searchParams.get('type') || 'furnishing';
  const { data: apartmentsData, isLoading, error, refetch } = useApartments({ type: typeFilter });
  const apartments = Array.isArray(apartmentsData) ? apartmentsData : [];
  const { data: clientsData } = useClients();
  const clients = Array.isArray(clientsData) ? clientsData : [];
  
  // Debug logging
  console.log('🏢 Apartments Page State:', {
    typeFilter,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    apartmentsDataType: typeof apartmentsData,
    apartmentsIsArray: Array.isArray(apartmentsData),
    apartmentsCount: apartments.length,
    apartments: apartments
  });
  const deleteApartmentMutation = useDeleteApartment();
  
  // Helper function to get owner name from client ID
  const getOwnerName = (clientId?: string) => {
    if (!clientId) return 'Unknown Client';
    const client = Array.isArray(clients) ? clients.find(c => c.id === clientId) : null;
    return client ? client.name : 'Unknown Client';
  };
  
  const handleTypeChange = (value: string | null) => {
    if (value !== null && value !== '') {
      setSearchParams({ type: value });
    }
  };

  const filteredApartments = apartments.filter(apt => {
    const ownerName = getOwnerName(apt.client);
    const matchesSearch = (apt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ownerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesType = !apt.type || apt.type === typeFilter; // Handle missing type
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, apartmentId: id, apartmentName: name });
  };

  const confirmDelete = async () => {
    try {
      await deleteApartmentMutation.mutateAsync(deleteDialog.apartmentId);
      setDeleteDialog({ open: false, apartmentId: '', apartmentName: '' });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Planning': 'bg-blue-500/10 text-blue-500',
      'Ordering': 'bg-yellow-500/10 text-yellow-500',
      'Delivery': 'bg-purple-500/10 text-purple-500',
      'Complete': 'bg-green-500/10 text-green-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  // Enhanced file handling functions
  const validateFile = (file: File): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['xlsx', 'xls', 'csv'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedExtensions.includes(fileExtension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel (.xlsx, .xls) or CSV (.csv) file.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      // Initialize file statuses
      const newStatuses: {[key: string]: 'pending'} = {};
      validFiles.forEach(file => {
        newStatuses[file.name] = 'pending';
      });
      setFileStatuses(prev => ({ ...prev, ...newStatuses }));
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    handleFileSelect(files);
    // Don't reset the input to allow multiple selections
  };

  const handleRealImport = async (file: File, apartmentId: string) => {
    const fileName = file.name;
    
    try {
      // Set uploading status
      setFileStatuses(prev => ({ ...prev, [fileName]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
      
      // Use real API with progress tracking
      const result: ImportResponse = await importApi.importProductsWithProgress(
        apartmentId,
        file,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
        }
      );
      
      // Handle success
      if (result.success) {
        setFileStatuses(prev => ({ ...prev, [fileName]: 'success' }));
        setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
        
        toast({
          title: "Import completed successfully",
          description: `${fileName} imported: ${result.data?.successful_imports || 0} products added, ${result.data?.sheets_processed || 1} categories created.`,
        });
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
    } catch (error: any) {
      console.error('Import error:', error);
      setFileStatuses(prev => ({ ...prev, [fileName]: 'error' }));
      
      toast({
        title: "Import failed",
        description: error.message || `Failed to import ${fileName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // This function is no longer needed since handleCreateApartmentAndImport 
  // now handles everything in one operation

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setFileStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[fileName];
      return newStatuses;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setFileStatuses({});
    setUploadProgress({});
  };

  const handleFormChange = (field: string, value: string) => {
    setApartmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setApartmentForm({
      name: '',
      type: 'furnishing',
      client: '',
      address: '',
      status: 'Planning',
      designer: '',
      start_date: '',
      due_date: '',
    });
    clearAllFiles();
  };

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'client', 'address', 'start_date', 'due_date'];
    const missingFields = requiredFields.filter(field => !apartmentForm[field as keyof typeof apartmentForm]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleCreateApartmentAndImport = async (): Promise<void> => {
    if (!validateForm()) return;
    
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Import the new API service
      const { importApi } = await import('@/services/importApi');
      
      // Process each file using the combined API
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        toast({
          title: "Creating apartment and importing products...",
          description: `Processing "${file.name}" (${i + 1}/${uploadedFiles.length})`,
        });

        const result = await importApi.createApartmentAndImport({
          apartment_name: apartmentForm.name,
          apartment_type: apartmentForm.type,
          owner: apartmentForm.client,
          status: apartmentForm.status,
          designer: apartmentForm.designer,
          start_date: apartmentForm.start_date,
          due_date: apartmentForm.due_date,
          address: apartmentForm.address,
        }, file);

        if (result.success) {
          toast({
            title: "Success!",
            description: `Apartment "${result.apartment_name}" created with ${result.data?.successful_imports || 0} products imported.`,
          });
          
          // Only create one apartment for the first file, then break
          // If you want to import multiple files to the same apartment, 
          // you'd need to modify this logic
          break;
        } else {
          toast({
            title: "Import failed",
            description: result.message || "Please try again.",
            variant: "destructive",
          });
        }
      }

      // Refresh the apartments list
      refetch();
      
      // Reset form and close dialog
      resetForm();
      setShowImportDialog(false);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast({
        title: "Downloading template...",
        description: "Preparing Excel template for download.",
      });

      const blob = await importApi.downloadTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template downloaded",
        description: "Excel template has been downloaded successfully.",
      });
      
    } catch (error: any) {
      console.error('Template download error:', error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return <FileText className="h-6 w-6 text-blue-600" />;
    }
    return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <PageLayout title="Apartments">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apartments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Ordering">Ordering</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
                <SelectItem value="Design Approved">Design Approved</SelectItem>
                <SelectItem value="Renovating">Renovating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center">
            <ToggleGroup type="single" value={typeFilter} onValueChange={handleTypeChange} className="border rounded-lg p-1">
              <ToggleGroupItem value="furnishing" className="px-4">
                Furnishing
              </ToggleGroupItem>
              <ToggleGroupItem value="renovating" className="px-4">
                Renovating
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <Button onClick={() => navigate('/apartments/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Apartment
            </Button>
          </div>
        </div>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Apartments ({isLoading ? '...' : filteredApartments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Error loading apartments: {error.message}</p>
                <Button onClick={() => window.location.reload()} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apartment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No apartments found. Try adjusting your filters or add a new apartment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApartments.map((apartment) => (
                      <TableRow key={apartment.id}>
                        <TableCell className="font-medium">{apartment.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {apartment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getOwnerName(apartment.client)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{apartment.address}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(apartment.status)}>
                            {apartment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{apartment.designer}</TableCell>
                        <TableCell>{apartment.start_date || 'Not set'}</TableCell>
                        <TableCell>{apartment.due_date || 'Not set'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={apartment.progress} className="w-[60px]" />
                            <span className="text-sm text-muted-foreground">{apartment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/apartments/${apartment.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/apartments/${apartment.id}/edit`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(apartment.id, apartment.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Import Dialog with Apartment Form */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Apartment & Import Data</DialogTitle>
              <DialogDescription>
                Fill in the apartment details and upload Excel (.xlsx, .xls) or CSV (.csv) files to import product data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Apartment Information Form */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900">Apartment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Apartment Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Apartment Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter apartment name"
                      value={apartmentForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <Select value={apartmentForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnishing">Furnishing</SelectItem>
                        <SelectItem value="renovating">Renovating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Owner/Client */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Owner <span className="text-red-500">*</span>
                    </label>
                    <Select value={apartmentForm.client} onValueChange={(value) => handleFormChange('client', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(clients) && clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Select value={apartmentForm.status} onValueChange={(value) => handleFormChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Ordering">Ordering</SelectItem>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                        <SelectItem value="Design Approved">Design Approved</SelectItem>
                        <SelectItem value="Renovating">Renovating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Designer */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Designer</label>
                    <Input
                      placeholder="Enter designer name"
                      value={apartmentForm.designer}
                      onChange={(e) => handleFormChange('designer', e.target.value)}
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={apartmentForm.start_date}
                      onChange={(e) => handleFormChange('start_date', e.target.value)}
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={apartmentForm.due_date}
                      onChange={(e) => handleFormChange('due_date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Address - Full width */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter complete address"
                    value={apartmentForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Import Product Data</h3>
                    <p className="text-sm text-gray-600">Upload Excel or CSV files containing product information for this apartment.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>
                
                {/* Compact Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <Cloud className={`h-8 w-8 transition-colors duration-200 ${
                      dragActive ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    or click to browse
                  </p>
                  
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative z-10 pointer-events-none"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Enhanced Progress Section - Only show when uploading */}
              {isUploading && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <div className="absolute inset-0 h-5 w-5 animate-ping bg-blue-400 rounded-full opacity-20"></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Importing apartment data...</span>
                  </div>
                  
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-700">
                      <span className="font-medium">Processing {uploadedFiles.length} file(s)</span>
                      <span className="font-mono">
                        {Object.values(fileStatuses).filter(s => s === 'success' || s === 'error').length} / {uploadedFiles.length} completed
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={(Object.values(fileStatuses).filter(s => s === 'success' || s === 'error').length / uploadedFiles.length) * 100} 
                        className="h-3 bg-white/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Current File Progress with Enhanced Details */}
                  {uploadedFiles.map((file) => {
                    const status = fileStatuses[file.name];
                    const progress = uploadProgress[file.name] || 0;
                    
                    if (status === 'uploading') {
                      // Determine current stage based on progress
                      let stage = 'Reading file...';
                      let stageColor = 'text-blue-600';
                      
                      if (progress < 30) {
                        stage = 'Reading and validating file...';
                        stageColor = 'text-blue-600';
                      } else if (progress < 70) {
                        stage = 'Processing apartment data...';
                        stageColor = 'text-purple-600';
                      } else if (progress < 95) {
                        stage = 'Saving to database...';
                        stageColor = 'text-green-600';
                      } else {
                        stage = 'Finalizing import...';
                        stageColor = 'text-emerald-600';
                      }
                      
                      return (
                        <div key={file.name} className="space-y-2 p-3 bg-white/70 rounded-lg border border-white/50">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              {getFileIcon(file.name)}
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium truncate text-gray-900">{file.name}</span>
                                <span className="text-xs font-mono text-gray-600 bg-white/80 px-2 py-1 rounded">{progress}%</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${stageColor}`}>{stage}</span>
                                <div className="flex gap-1">
                                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-2 bg-gray-200" />
                            <div 
                              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Processing Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-white/30">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Processing large files may take several minutes
                    </span>
                    <span className="font-mono">Max: 50MB</span>
                  </div>
                </div>
              )}

              {/* File List - Compact version */}
              {uploadedFiles.length > 0 && !isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected Files ({uploadedFiles.length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      className="h-6 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, index) => {
                      const status = fileStatuses[file.name] || 'pending';
                      
                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-2 p-2 bg-white rounded border text-xs"
                        >
                          {getFileIcon(file.name)}
                          <span className="flex-1 truncate font-medium">{file.name}</span>
                          {getStatusIcon(status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.name)}
                            className="h-4 w-4 p-0 text-gray-400 hover:text-red-500"
                            disabled={status === 'uploading'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Results Summary - Show after upload */}
              {uploadedFiles.length > 0 && !isUploading && Object.values(fileStatuses).some(s => s === 'success' || s === 'error') && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">
                      ✓ {Object.values(fileStatuses).filter(s => s === 'success').length} successful
                    </span>
                    <span className="text-red-600">
                      ✗ {Object.values(fileStatuses).filter(s => s === 'error').length} failed
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB. Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
              </p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isUploading}
                >
                  Reset Form
                </Button>
              </div>
              
              <Button
                onClick={handleCreateApartmentAndImport}
                disabled={isUploading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating & Importing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Apartment & Import Data
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          title="Delete Apartment"
          description={`Are you sure you want to delete "${deleteDialog.apartmentName}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </PageLayout>
  );
};

export default Apartments;
