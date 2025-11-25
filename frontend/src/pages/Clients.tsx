import { useState, useEffect } from 'react';
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
import { Plus, Search, Edit, Trash2, Building2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { useDataStore } from '@/stores/useDataStore';
import { useToast } from '@/hooks/use-toast';
import { ClientDetailsModal } from '@/components/modals/ClientDetailsModal';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClientApi';
import type { ClientFormData } from '@/services/clientApi';
import { Skeleton } from '@/components/ui/skeleton';

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { apartments, products } = useDataStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // API hooks
  const { data: clientsData, isLoading, error, refetch } = useClients({
    search: searchTerm || undefined,
    account_status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  
  const clients = clientsData?.results || [];
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    account_status: 'Active',
    type: 'Individual',
    notes: '',
  });

  // Clients are already filtered by the API based on search params
  const filteredClients = clients;

  const getClientApartmentCount = (clientId: string) => {
    return apartments.filter(apt => apt.clientId === clientId).length;
  };

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
        type: 'Individual',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        await updateClientMutation.mutateAsync({
          id: editingClient,
          data: formData,
        });
      } else {
        await createClientMutation.mutateAsync(formData);
      }
      setDialogOpen(false);
      setEditingClient(null);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        account_status: 'Active',
        type: 'Individual',
        notes: '',
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const apartmentCount = getClientApartmentCount(id);
    if (apartmentCount > 0) {
      toast({
        title: 'Cannot delete client',
        description: `${name} has ${apartmentCount} apartment(s) associated. Please reassign or delete the apartments first.`,
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteClientMutation.mutateAsync({ id, name });
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleViewClient = (clientId: string) => {
    setViewingClientId(clientId);
    setDetailsModalOpen(true);
  };

  // Adapt API client to match the store client type for the modal
  const viewingClient = viewingClientId ? clients.find(c => c.id === viewingClientId) : null;
  const adaptedClient = viewingClient ? {
    ...viewingClient,
    accountStatus: viewingClient.account_status,
    type: viewingClient.type === 'Individual' ? 'Investor' : 'Buy2Rent Internal',
  } as any : null;

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
        {/* Header Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
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
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                      <DialogDescription>
                        {editingClient ? 'Update client information' : 'Create a new client profile'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+36 20 123 4567"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Individual">Individual</SelectItem>
                              <SelectItem value="Company">Company</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Account Status</Label>
                          <Select value={formData.account_status} onValueChange={(value: any) => setFormData({ ...formData, account_status: value })}>
                            <SelectTrigger id="status">
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
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <EnhancedTextarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
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
            <div className="overflow-x-auto">
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
                      const apartmentCount = getClientApartmentCount(client.id);
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
                                onClick={() => handleDelete(client.id, client.name)}
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

        {/* Client Details Modal */}
        <ClientDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          client={adaptedClient}
          apartments={apartments}
          products={products}
        />
      </div>
    </PageLayout>
  );
};

export default Clients;
