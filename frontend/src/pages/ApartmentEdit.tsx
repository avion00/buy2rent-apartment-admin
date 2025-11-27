import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { useApartment, useUpdateApartment } from "@/hooks/useApartmentApi";
import { useClients } from "@/hooks/useClientApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const ApartmentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch apartment data from API
  const { data: apartment, isLoading, error } = useApartment(id || null);
  
  // Fetch clients list from API
  const { data: clientsData, isLoading: isLoadingClients } = useClients({});
  const clients = clientsData?.results || [];
  
  // Update apartment mutation
  const updateApartmentMutation = useUpdateApartment();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "furnishing" as "furnishing" | "renovating",
    client: "",
    address: "",
    designer: "",
    status: "Planning" as "Planning" | "Design Approved" | "Ordering" | "Delivery" | "Installation" | "Completed",
    start_date: "",
    due_date: "",
    notes: "",
    progress: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (apartment) {
      setFormData({
        name: apartment.name,
        type: apartment.type,
        client: apartment.client || apartment.client_id || "",
        address: apartment.address,
        designer: apartment.designer,
        status: apartment.status,
        start_date: apartment.start_date,
        due_date: apartment.due_date,
        notes: apartment.notes || "",
        progress: apartment.progress,
      });
    }
  }, [apartment]);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Error or not found state
  if (error || !apartment) {
    return (
      <PageLayout title="Apartment Not Found">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Apartment not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/apartments")}>Back to Apartments</Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Apartment name is required";
    if (!formData.client) newErrors.client = "Client selection is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.designer.trim()) newErrors.designer = "Designer is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.due_date) newErrors.due_date = "Due date is required";

    if (formData.start_date && formData.due_date) {
      if (new Date(formData.due_date) < new Date(formData.start_date)) {
        newErrors.due_date = "Due date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateApartmentMutation.mutateAsync({
        id: apartment.id,
        data: formData,
      });
      
      navigate("/apartments");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update apartment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout title="Edit Apartment">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/apartments">Apartments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/apartments/${apartment.id}`}>{apartment.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/apartments/${apartment.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Apartment</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Apartment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Apartment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Izabella utca 3 • A/12"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "furnishing" | "renovating" })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="furnishing" id="furnishing" />
                        <Label htmlFor="furnishing" className="font-normal cursor-pointer">
                          Furnishing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="renovating" id="renovating" />
                        <Label htmlFor="renovating" className="font-normal cursor-pointer">
                          Renovating
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client/Owner *</Label>
                  <Select
                    value={formData.client}
                    onValueChange={(value) => setFormData({ ...formData, client: value })}
                    disabled={isLoadingClients}
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client && <p className="text-sm text-destructive">{errors.client}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designer">Assigned Designer *</Label>
                  <Input
                    id="designer"
                    value={formData.designer}
                    onChange={(e) => setFormData({ ...formData, designer: e.target.value })}
                    placeholder="Enter designer name"
                  />
                  {errors.designer && <p className="text-sm text-destructive">{errors.designer}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Izabella u. 3, Budapest"
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Design Approved">Design Approved</SelectItem>
                      <SelectItem value="Ordering">Ordering</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                      <SelectItem value="Renovating">Renovating</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                  {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                  {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <EnhancedTextarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this apartment..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(`/apartments/${apartment.id}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateApartmentMutation.isPending}>
                  {updateApartmentMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageLayout>
  );
};

export default ApartmentEdit;
