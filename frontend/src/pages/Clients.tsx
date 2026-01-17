import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Search, Edit, Trash2, Building2, Eye, Loader2, RefreshCw, AlertTriangle, Users, UserCheck, UserX, Briefcase, TrendingUp, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClientApi';
import type { ClientFormData } from '@/services/clientApi';
import { Skeleton } from '@/components/ui/skeleton';

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // API hooks (debouncing is handled inside useClients hook)
  const { data: clientsData, isLoading, error, refetch } = useClients({
    search: searchTerm || undefined,
    account_status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  
  // Memoize clients to prevent unnecessary re-renders
  const clients = useMemo(() => clientsData?.results || [], [clientsData?.results]);
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    account_status: 'Active',
    type: 'Investor',
    notes: '',
  });

  // Clients are already filtered by the API based on search params
  const filteredClients = clients;
  
  // Calculate stats from all clients (not filtered)
  const stats = useMemo(() => {
    const allClients = clientsData?.results || [];
    const totalClients = allClients.length;
    const activeClients = allClients.filter(c => c.account_status === 'Active').length;
    const inactiveClients = allClients.filter(c => c.account_status === 'Inactive').length;
    const investorClients = allClients.filter(c => c.type === 'Investor').length;
    const internalClients = allClients.filter(c => c.type === 'Buy2Rent Internal').length;
    const totalApartments = allClients.reduce((sum, c) => sum + (c.apartments_count || 0), 0);
    const avgApartmentsPerClient = totalClients > 0 ? (totalApartments / totalClients).toFixed(1) : '0';
    
    return {
      totalClients,
      activeClients,
      inactiveClients,
      investorClients,
      internalClients,
      totalApartments,
      avgApartmentsPerClient,
    };
  }, [clientsData?.results]);
  
  // Memoize search handler to prevent re-creation
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleOpenDialog = (clientId?: string) => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setEditingClient(clientId);
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          account_status: client.account_status,
          type: client.type,
          notes: client.notes || '',
        });
      }
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        account_status: 'Active',
        type: 'Investor',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingClient) {
        console.log('Updating client:', editingClient);
        await updateClientMutation.mutateAsync({
          id: editingClient,
          data: formData,
        });
        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
      } else {
        console.log('Creating new client:', formData);
        await createClientMutation.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Client created successfully',
        });
      }
      setDialogOpen(false);
      setEditingClient(null);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        account_status: 'Active',
        type: 'Investor',
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    // Find client and get apartments_count from API
    const client = clients.find(c => c.id === id);
    const apartmentCount = client?.apartments_count ?? 0;
    
    if (apartmentCount > 0) {
      toast({
        title: 'Cannot delete client',
        description: `${name} has ${apartmentCount} apartment(s) associated. Please reassign or delete the apartments first.`,
        variant: 'destructive',
      });
      return;
    }

    // Open delete confirmation dialog
    setClientToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClientMutation.mutateAsync({ 
        id: clientToDelete.id, 
        name: clientToDelete.name 
      });
      toast({
        title: 'Success',
        description: `Client "${clientToDelete.name}" deleted successfully`,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-success/10 text-success border-success/20' 
      : 'bg-muted text-muted-foreground border-border/50';
  };
  
  // Show loading skeleton
  if (isLoading) {
    return (
      <PageLayout title="Clients">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <PageLayout title="Clients">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4">Failed to load clients: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Clients">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Clients */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Clients</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalClients}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Clients */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.activeClients}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Inactive Clients */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive</p>
                  <p className="text-2xl font-bold mt-1 text-red-500">{stats.inactiveClients}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Investors */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-violet-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Investors</p>
                  <p className="text-2xl font-bold mt-1 text-violet-600">{stats.investorClients}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Apartments */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apartments</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.totalApartments}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Avg Apartments per Client */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg/Client</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{stats.avgApartmentsPerClient}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none z-10" />
              <Input
                key="client-search-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-11 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-11 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="h-11 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader className="pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <DialogTitle className="text-xl">{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                          <DialogDescription className="text-sm">
                            {editingClient ? 'Update client information' : 'Create a new client profile'}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                          <div className="w-1 h-5 bg-primary rounded-full" />
                          <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="h-11"
                          />
                        </div>
                      </div>
                      {/* Contact Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                          <div className="w-1 h-5 bg-primary rounded-full" />
                          <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Phone
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+36 20 123 4567"
                              className="h-11"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Account Settings Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                          <div className="w-1 h-5 bg-primary rounded-full" />
                          <h3 className="text-sm font-semibold text-foreground">Account Settings</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Client Type
                            </Label>
                            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                              <SelectTrigger id="type" className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Investor">Investor</SelectItem>
                                <SelectItem value="Buy2Rent Internal">Buy2Rent Internal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Account Status
                            </Label>
                            <Select value={formData.account_status} onValueChange={(value: any) => setFormData({ ...formData, account_status: value })}>
                              <SelectTrigger id="status" className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      {/* Additional Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                          <div className="w-1 h-5 bg-primary rounded-full" />
                          <h3 className="text-sm font-semibold text-foreground">Additional Information</h3>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Notes
                          </Label>
                          <EnhancedTextarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any additional notes or comments about this client..."
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="pt-6 border-t border-border/50 gap-3">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 h-11">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 h-11 bg-primary hover:bg-primary/90">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editingClient ? 'Save Changes' : 'Create Client'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg font-semibold">All Clients ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto h-[50dvh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold text-foreground/90">Name</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Type</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Email</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Phone</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Apartments</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Notes</TableHead>
                    <TableHead className="text-right font-semibold text-foreground/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                          <p className="font-medium">No clients found</p>
                          <p className="text-sm">Try adjusting your filters or add a new client.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => {
                      // Use apartments_count from API instead of local calculation
                      const apartmentCount = client.apartments_count ?? 0;
                      return (
                        <TableRow 
                          key={client.id} 
                          className="hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
                        >
                          <TableCell className="font-medium text-foreground py-4">{client.name}</TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="capitalize border-border/50 bg-muted/40">
                              {client.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4">{client.email}</TableCell>
                          <TableCell className="text-muted-foreground py-4">{client.phone}</TableCell>
                          <TableCell className="py-4">
                            <Badge className={getStatusColor(client.account_status)}>
                              {client.account_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{apartmentCount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground py-4">
                            {client.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleViewClient(client.id)}
                                className="hover:bg-primary/10 hover:text-primary"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleOpenDialog(client.id)}
                                className="hover:bg-muted/50 hover:text-foreground"
                                title="Edit Client"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteClick(client.id, client.name)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                                title="Delete Client"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl">Delete Client</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">"{clientToDelete?.name}"</span>?
                This will permanently remove the client from the system.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel autoFocus={false}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                autoFocus
              >
                Delete Client
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default Clients;
