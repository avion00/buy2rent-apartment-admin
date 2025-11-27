import { useState, useMemo } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Edit, Trash2, Search, Loader2, RefreshCw, Upload, Download, Cloud, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApartments, useDeleteApartment } from '@/hooks/useApartmentApi';
import { Skeleton } from '@/components/ui/skeleton';

const Apartments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ 
    open: false, 
    id: '', 
    name: '' 
  });
  const [apartmentForm, setApartmentForm] = useState({
    name: '',
    type: 'furnishing' as 'furnishing' | 'renovating',
    client: '',
    address: '',
    status: 'Planning' as any,
    designer: '',
    start_date: '',
    due_date: '',
  });
  
  const typeFilter = searchParams.get('type') || 'furnishing';
  
  const handleTypeChange = (value: string) => {
    if (value) {
      setSearchParams({ type: value });
    }
  };

  // API hooks
  const { data: apartmentsData, isLoading, error, refetch } = useApartments({
    search: searchTerm || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteApartmentMutation = useDeleteApartment();

  const apartments = useMemo(() => apartmentsData?.results || [], [apartmentsData?.results]);

  // Validation functions
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!apartmentForm.name.trim()) {
      errors.name = 'Apartment name is required';
    } else if (apartmentForm.name.trim().length < 3) {
      errors.name = 'Apartment name must be at least 3 characters';
    }

    if (!apartmentForm.client) {
      errors.client = 'Client selection is required';
    }

    if (!apartmentForm.address.trim()) {
      errors.address = 'Address is required';
    } else if (apartmentForm.address.trim().length < 10) {
      errors.address = 'Please provide a complete address (minimum 10 characters)';
    }

    if (!apartmentForm.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!apartmentForm.due_date) {
      errors.due_date = 'Due date is required';
    }

    // Date validation - due date must be after start date
    if (apartmentForm.start_date && apartmentForm.due_date) {
      const startDate = new Date(apartmentForm.start_date);
      const dueDate = new Date(apartmentForm.due_date);
      
      if (dueDate <= startDate) {
        errors.due_date = 'Due date must be after start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['xlsx', 'xls', 'csv'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedExtensions.includes(fileExtension || '')) {
      return {
        valid: false,
        error: `Invalid file type: ${file.name}. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${file.name}. Maximum size is 50MB.`,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: `Empty file: ${file.name}. Please select a valid file.`,
      };
    }

    return { valid: true };
  };

  const handleFormSubmit = async () => {
    // Clear previous errors
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    // Validate files if any
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        const validation = validateFile(file);
        if (!validation.valid) {
          toast({
            title: 'File Validation Error',
            description: validation.error,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call here
      // await createApartmentMutation.mutateAsync(apartmentForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Success!',
        description: `Apartment "${apartmentForm.name}" created successfully${uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} file(s)` : ''}.`,
      });

      // Reset form and close dialog
      handleResetForm();
      setShowAddDialog(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create apartment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
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
    setUploadedFiles([]);
    setFormErrors({});
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          title: 'File Validation Error',
          description: validation.error,
          variant: 'destructive',
        });
      }
    }
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await deleteApartmentMutation.mutateAsync({ 
        id: deleteDialog.id, 
        name: deleteDialog.name 
      });
      setDeleteDialog({ open: false, id: '', name: '' });
    } catch (error) {
      console.error('Delete failed:', error);
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

          <div className="flex gap-3 items-center">
            <Button
              variant={typeFilter === 'furnishing' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('furnishing')}
              className={typeFilter === 'furnishing' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
            >
              Furnishing
            </Button>
            <Button
              variant={typeFilter === 'renovating' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('renovating')}
            >
              Renovating
            </Button>
            
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <Button onClick={() => navigate('/apartments/new')} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Apartment
            </Button>
          </div>
        </div>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Apartments ({apartmentsData?.count || 0})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apartment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Clients</TableHead>
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
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-destructive">
                        Error loading apartments. Please try again.
                      </TableCell>
                    </TableRow>
                  ) : apartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No apartments found. Try adjusting your filters or add a new apartment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    apartments.map((apartment) => (
                      <TableRow key={apartment.id}>
                        <TableCell className="font-medium">{apartment.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {apartment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{apartment.client_details?.name || 'N/A'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{apartment.address}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(apartment.status)}>
                            {apartment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{apartment.designer}</TableCell>
                        <TableCell>{apartment.start_date}</TableCell>
                        <TableCell>{apartment.due_date}</TableCell>
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
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(apartment.id, apartment.name)}>
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
          </CardContent>
        </Card>

        {/* Add Apartment & Import Data Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Apartment & Import Data</DialogTitle>
              <DialogDescription>
                Fill in the apartment details and upload Excel (.xlsx, .xls) or CSV (.csv) files to import product data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Apartment Information Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Apartment Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apt-name">
                      Apartment Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apt-name"
                      placeholder="Enter apartment name"
                      value={apartmentForm.name}
                      onChange={(e) => {
                        setApartmentForm({ ...apartmentForm, name: e.target.value });
                        if (formErrors.name) {
                          setFormErrors({ ...formErrors, name: '' });
                        }
                      }}
                      className={formErrors.name ? 'border-destructive' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apt-type">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={apartmentForm.type}
                      onValueChange={(value: any) => setApartmentForm({ ...apartmentForm, type: value })}
                    >
                      <SelectTrigger id="apt-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnishing">Furnishing</SelectItem>
                        <SelectItem value="renovating">Renovating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apt-owner">
                      Clients <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={apartmentForm.client}
                      onValueChange={(value) => {
                        setApartmentForm({ ...apartmentForm, client: value });
                        if (formErrors.client) {
                          setFormErrors({ ...formErrors, client: '' });
                        }
                      }}
                    >
                      <SelectTrigger id="apt-client" className={formErrors.client ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client1">Client 1</SelectItem>
                        <SelectItem value="client2">Client 2</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.client && (
                      <p className="text-sm text-destructive mt-1">{formErrors.client}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apt-status">
                      Status <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={apartmentForm.status}
                      onValueChange={(value) => setApartmentForm({ ...apartmentForm, status: value })}
                    >
                      <SelectTrigger id="apt-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Design Approved">Design Approved</SelectItem>
                        <SelectItem value="Ordering">Ordering</SelectItem>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Installation">Installation</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apt-designer">Designer</Label>
                  <Input
                    id="apt-designer"
                    placeholder="Enter designer name"
                    value={apartmentForm.designer}
                    onChange={(e) => setApartmentForm({ ...apartmentForm, designer: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apt-start">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apt-start"
                      type="date"
                      value={apartmentForm.start_date}
                      onChange={(e) => {
                        setApartmentForm({ ...apartmentForm, start_date: e.target.value });
                        if (formErrors.start_date) {
                          setFormErrors({ ...formErrors, start_date: '' });
                        }
                      }}
                      className={formErrors.start_date ? 'border-destructive' : ''}
                    />
                    {formErrors.start_date && (
                      <p className="text-sm text-destructive mt-1">{formErrors.start_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apt-due">
                      Due Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apt-due"
                      type="date"
                      value={apartmentForm.due_date}
                      onChange={(e) => {
                        setApartmentForm({ ...apartmentForm, due_date: e.target.value });
                        if (formErrors.due_date) {
                          setFormErrors({ ...formErrors, due_date: '' });
                        }
                      }}
                      className={formErrors.due_date ? 'border-destructive' : ''}
                    />
                    {formErrors.due_date && (
                      <p className="text-sm text-destructive mt-1">{formErrors.due_date}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apt-address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="apt-address"
                    placeholder="Enter complete address"
                    value={apartmentForm.address}
                    onChange={(e) => {
                      setApartmentForm({ ...apartmentForm, address: e.target.value });
                      if (formErrors.address) {
                        setFormErrors({ ...formErrors, address: '' });
                      }
                    }}
                    rows={3}
                    className={formErrors.address ? 'border-destructive' : ''}
                  />
                  {formErrors.address && (
                    <p className="text-sm text-destructive mt-1">{formErrors.address}</p>
                  )}
                </div>
              </div>

              {/* Import Product Data Section */}
              <div className="space-y-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Import Product Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload Excel or CSV files containing product information for this apartment.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    if (e.dataTransfer.files) {
                      handleFileSelect(e.dataTransfer.files);
                    }
                  }}
                >
                  <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-base font-medium mb-1">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Choose Files
                      </span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files);
                        }
                      }}
                    />
                  </label>
                </div>

                <p className="text-xs text-muted-foreground">
                  Maximum file size: 50MB. Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
                </p>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    handleResetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Reset Form
                </Button>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 gap-2" 
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Apartment & Import Data
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: '', name: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl">Delete Apartment</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">"{deleteDialog.name}"</span>? This will permanently remove the apartment and all associated products from the system.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel autoFocus={false}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                autoFocus
              >
                Delete Apartment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default Apartments;
