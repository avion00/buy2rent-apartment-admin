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
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  DollarSign
} from 'lucide-react';
import { useVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useVendorApi';
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
import VendorEditSkeleton from '@/components/skeletons/VendorEditSkeleton';

const VendorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch vendor data
  const { data: vendor, isLoading, error } = useVendor(id || null);
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  // Basic Info
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  
  // Address Info
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Business Info
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  
  // Product/Service Info
  const [productCategories, setProductCategories] = useState('');
  const [certifications, setCertifications] = useState('');
  const [specializations, setSpecializations] = useState('');
  
  // Terms & Conditions
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  
  // Additional Info
  const [notes, setNotes] = useState('');

  // Populate form when vendor data loads
  useEffect(() => {
    if (vendor) {
      setCompanyName(vendor.name || '');
      setContactPerson(vendor.contact_person || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setWebsite(vendor.website || '');
      setCategory(vendor.category || '');
      setAddress(vendor.address || '');
      setCity(vendor.city || '');
      setCountry(vendor.country || '');
      setPostalCode(vendor.postal_code || '');
      setTaxId(vendor.tax_id || '');
      setBusinessType(vendor.business_type || '');
      setYearEstablished(vendor.year_established || '');
      setEmployeeCount(vendor.employee_count || '');
      setProductCategories(vendor.product_categories || '');
      setCertifications(vendor.certifications || '');
      setSpecializations(vendor.specializations || '');
      setPaymentTerms(vendor.payment_terms || '');
      setDeliveryTerms(vendor.delivery_terms || '');
      setWarrantyPeriod(vendor.warranty_period || '');
      setReturnPolicy(vendor.return_policy || '');
      setMinimumOrder(vendor.minimum_order || '');
      setNotes(vendor.notes || '');
    }
  }, [vendor]);

  // Loading state
  if (isLoading) {
    return <VendorEditSkeleton />;
  }

  // Error or not found state
  if (error || !vendor) {
    return (
      <PageLayout title="Vendor Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "The vendor you're trying to edit doesn't exist."}
            </p>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const handleSave = () => {
    // Validation
    if (!companyName || !email || !contactPerson) {
      toast.error('Please fill in all required fields (Company Name, Contact Person, Email)');
      setActiveTab('basic');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setActiveTab('basic');
      return;
    }

    // Prepare update data
    const updateData = {
      name: companyName,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone: phone || '',
      website: website || '',
      category: category || '',
      address: address || '',
      city: city || '',
      country: country || '',
      postal_code: postalCode || '',
      tax_id: taxId || '',
      business_type: businessType || '',
      year_established: yearEstablished || '',
      employee_count: employeeCount || '',
      product_categories: productCategories || '',
      certifications: certifications || '',
      specializations: specializations || '',
      payment_terms: paymentTerms || '',
      delivery_terms: deliveryTerms || '',
      warranty_period: warrantyPeriod || '',
      return_policy: returnPolicy || '',
      minimum_order: minimumOrder || '',
      notes: notes || '',
    };

    // Call API to update vendor
    updateVendor.mutate({ id: id!, data: updateData }, {
      onSuccess: () => {
        navigate(`/vendors/${id}`);
      },
    });
  };

  const handleDelete = () => {
    deleteVendor.mutate(id!, {
      onSuccess: () => {
        navigate('/vendors');
      },
    });
  };

  return (
    <PageLayout title={`Edit ${vendor.name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/vendors/${id}`)}
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
                  <AlertDialogCancel disabled={deleteVendor.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    disabled={deleteVendor.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteVendor.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              onClick={handleSave} 
              className="gap-2"
              disabled={updateVendor.isPending}
            >
              {updateVendor.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Form - Same structure as VendorNew.tsx */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>
              Update the vendor details below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>

              {/* Basic Information - Copy from VendorNew.tsx */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">
                      Contact Person <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactPerson"
                        placeholder="Primary contact name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://company.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Address Information */}
              <TabsContent value="address" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Business Information */}
              <TabsContent value="business" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input
                      id="taxId"
                      placeholder="XX-XXXXXXX"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      placeholder="2020"
                      value={yearEstablished}
                      onChange={(e) => setYearEstablished(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      placeholder="50"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Products & Services */}
              <TabsContent value="products" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productCategories">Product Categories</Label>
                    <Textarea
                      id="productCategories"
                      placeholder="E.g., Furniture, Lighting, Appliances (comma-separated)"
                      value={productCategories}
                      onChange={(e) => setProductCategories(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specializations">Specializations</Label>
                    <Textarea
                      id="specializations"
                      placeholder="What makes this vendor unique?"
                      value={specializations}
                      onChange={(e) => setSpecializations(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications & Compliance</Label>
                    <Textarea
                      id="certifications"
                      placeholder="ISO, Quality certifications, etc."
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Terms & Conditions */}
              <TabsContent value="terms" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net-30">Net 30</SelectItem>
                        <SelectItem value="net-60">Net 60</SelectItem>
                        <SelectItem value="net-90">Net 90</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                    <Input
                      id="deliveryTerms"
                      placeholder="E.g., 7-14 business days"
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                    <Input
                      id="warrantyPeriod"
                      placeholder="E.g., 12 months"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumOrder">Minimum Order Value</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minimumOrder"
                        placeholder="500"
                        value={minimumOrder}
                        onChange={(e) => setMinimumOrder(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="returnPolicy">Return Policy</Label>
                    <Textarea
                      id="returnPolicy"
                      placeholder="Describe return and refund policy"
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the vendor"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
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
