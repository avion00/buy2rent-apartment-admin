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
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useDataStore } from '@/stores/useDataStore';
import { useToast } from '@/hooks/use-toast';

const Apartments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { apartments, deleteApartment } = useDataStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const typeFilter = searchParams.get('type') || 'furnishing';
  
  const handleTypeChange = (value: string) => {
    if (value) {
      setSearchParams({ type: value });
    }
  };

  const filteredApartments = apartments.filter(apt => {
    const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesType = apt.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will also delete all associated products.`)) {
      deleteApartment(id);
      toast({
        title: 'Apartment deleted',
        description: `${name} has been deleted successfully.`,
      });
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

          <div className="flex gap-2 items-center">
            <ToggleGroup type="single" value={typeFilter} onValueChange={handleTypeChange} className="border rounded-lg p-1">
              <ToggleGroupItem value="furnishing" className="px-4">
                Furnishing
              </ToggleGroupItem>
              <ToggleGroupItem value="renovating" className="px-4">
                Renovating
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button onClick={() => navigate('/apartments/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Apartment
            </Button>
          </div>
        </div>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Apartments ({filteredApartments.length})</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <TableCell>{apartment.owner}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{apartment.address}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(apartment.status)}>
                            {apartment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{apartment.designer}</TableCell>
                        <TableCell>{apartment.startDate}</TableCell>
                        <TableCell>{apartment.dueDate}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Apartments;
