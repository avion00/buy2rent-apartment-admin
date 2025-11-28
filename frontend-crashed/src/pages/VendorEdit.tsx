import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { useVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VendorEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  
  // API hooks
  const { data: vendor, isLoading } = useVendor(id || "");
  const updateVendorMutation = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (vendor) {
      setCompanyName(vendor.company_name || vendor.name);
      setContactPerson(vendor.contact_person || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setWebsite(vendor.website || '');
      setLeadTime(vendor.lead_time || '');
      setNotes(vendor.notes || '');
    }
  }, [vendor]);

  if (isLoading) {
    return (
      <PageLayout title="Loading vendor...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vendor details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!vendor) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const handleSave = async () => {
    if (!companyName || !email) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await updateVendorMutation.mutateAsync({
        id: vendor.id,
        vendor: {
          name: companyName,
          company_name: companyName,
          contact_person: contactPerson,
          email,
          phone,
          website,
          lead_time: leadTime,
          notes,
        },
      });
      navigate(`/vendors/${vendor.id}`);
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Update vendor error:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVendorMutation.mutateAsync(vendor.id);
      navigate('/vendors');
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Delete vendor error:', error);
    }
  };

  return (
    <PageLayout title={`Edit ${vendor.name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vendors/${vendor.id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendor
          </Button>
          
          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this vendor and all associated data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Vendor Information</CardTitle>
            <CardDescription>
              Update vendor details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time</Label>
                    <Input
                      id="leadTime"
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                      placeholder="e.g., 7-14 days"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Additional information about the vendor"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default VendorEdit;
