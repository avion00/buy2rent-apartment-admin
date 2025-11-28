import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Store, 
  DollarSign, 
  CreditCard, 
  Banknote,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '@/stores/useDataStore';
import { cn } from '@/lib/utils';

interface PaymentCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentCreateModal = ({ open, onOpenChange }: PaymentCreateModalProps) => {
  const { apartments, vendors, addPayment } = useDataStore();
  
  const [formData, setFormData] = useState({
    apartmentId: '',
    vendorId: '',
    orderReference: '',
    totalAmount: '',
    amountPaid: '',
    dueDate: '',
    paymentMethod: '',
    notes: '',
    // Bank details
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    swift: '',
    iban: '',
    // Card details
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentType, setPaymentType] = useState<'bank' | 'card' | 'cash'>('bank');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBalance = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    const paid = parseFloat(formData.amountPaid) || 0;
    return total - paid;
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.apartmentId || !formData.vendorId || !formData.orderReference || 
        !formData.totalAmount || !formData.dueDate) {
      toast.error('Missing Required Fields', {
        description: 'Please fill in all required fields',
      });
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error('Invalid Amount', {
        description: 'Please enter a valid total amount',
      });
      return;
    }

    const vendor = vendors.find(v => v.id === formData.vendorId);
    if (!vendor) return;

    const balance = totalAmount - amountPaid;
    let status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue' = 'Unpaid';
    
    if (amountPaid >= totalAmount) {
      status = 'Paid';
    } else if (amountPaid > 0) {
      status = 'Partial';
    }

    const paymentHistory = amountPaid > 0 ? [{
      date: new Date().toISOString().split('T')[0],
      amount: amountPaid,
      method: formData.paymentMethod || paymentType,
      referenceNo: formData.orderReference,
      note: 'Initial payment',
    }] : [];

    addPayment({
      apartmentId: formData.apartmentId,
      vendor: vendor.name,
      orderReference: formData.orderReference,
      totalAmount,
      amountPaid,
      dueDate: formData.dueDate,
      status,
      lastPaymentDate: amountPaid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      notes: formData.notes,
      paymentHistory,
    });

    toast.success('Payment Created', {
      description: `Payment record for ${vendor.name} has been created successfully`,
    });

    // Reset form
    setFormData({
      apartmentId: '',
      vendorId: '',
      orderReference: '',
      totalAmount: '',
      amountPaid: '',
      dueDate: '',
      paymentMethod: '',
      notes: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      swift: '',
      iban: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    });
    
    onOpenChange(false);
  };

  const selectedVendor = vendors.find(v => v.id === formData.vendorId);
  const selectedApartment = apartments.find(a => a.id === formData.apartmentId);
  const balance = calculateBalance();
  const totalAmount = parseFloat(formData.totalAmount) || 0;
  const amountPaid = parseFloat(formData.amountPaid) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Payment</DialogTitle>
          <DialogDescription>
            Create a comprehensive payment record with all necessary details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Order Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apartment" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Apartment <span className="text-danger">*</span>
                  </Label>
                  <Select value={formData.apartmentId} onValueChange={(value) => handleChange('apartmentId', value)}>
                    <SelectTrigger id="apartment">
                      <SelectValue placeholder="Select apartment" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map(apt => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor" className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    Vendor <span className="text-danger">*</span>
                  </Label>
                  <Select value={formData.vendorId} onValueChange={(value) => handleChange('vendorId', value)}>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderRef">
                    Order Reference <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="orderRef"
                    placeholder="e.g., ORD-2025-001"
                    value={formData.orderReference}
                    onChange={(e) => handleChange('orderReference', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Due Date <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payment Amount</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">
                    Total Amount (HUF) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={(e) => handleChange('totalAmount', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid (HUF)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    placeholder="0.00"
                    value={formData.amountPaid}
                    onChange={(e) => handleChange('amountPaid', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Balance (HUF)</Label>
                  <div className={cn(
                    "h-10 px-3 rounded-md border flex items-center font-semibold",
                    balance > 0 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"
                  )}>
                    {balance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {totalAmount > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">{totalAmount.toLocaleString()} HUF</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold text-success">{amountPaid.toLocaleString()} HUF</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Outstanding Balance:</span>
                    <span className={cn(
                      "text-lg font-bold",
                      balance > 0 ? "text-warning" : "text-success"
                    )}>
                      {balance.toLocaleString()} HUF
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    {balance === 0 && (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Fully Paid
                      </Badge>
                    )}
                    {balance > 0 && amountPaid > 0 && (
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Partial Payment
                      </Badge>
                    )}
                    {balance > 0 && amountPaid === 0 && (
                      <Badge variant="outline">
                        Unpaid
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payment Details</h3>
              </div>

              <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'bank' | 'card' | 'cash')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bank" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Bank Transfer
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card Payment
                  </TabsTrigger>
                  <TabsTrigger value="cash" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bank" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., OTP Bank"
                        value={formData.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Account Holder</Label>
                      <Input
                        id="accountHolder"
                        placeholder="Full name"
                        value={formData.accountHolder}
                        onChange={(e) => handleChange('accountHolder', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        value={formData.accountNumber}
                        onChange={(e) => handleChange('accountNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        placeholder="HU42 1177 3016 1111 1018 0000 0000"
                        value={formData.iban}
                        onChange={(e) => handleChange('iban', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="swift">SWIFT/BIC Code</Label>
                      <Input
                        id="swift"
                        placeholder="e.g., OTPVHUHB"
                        value={formData.swift}
                        onChange={(e) => handleChange('swift', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="card" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={(e) => handleChange('cardNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cardHolder">Card Holder Name</Label>
                      <Input
                        id="cardHolder"
                        placeholder="Name as on card"
                        value={formData.cardHolder}
                        onChange={(e) => handleChange('cardHolder', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiryDate}
                        onChange={(e) => handleChange('expiryDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="XXX"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={(e) => handleChange('cvv', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cash" className="mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    <Banknote className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">Cash payment selected. No additional details required.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-6 space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional payment notes or instructions..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Summary Preview */}
          {(selectedApartment || selectedVendor) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-primary">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  {selectedApartment && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Apartment:</span>
                      <span className="font-medium">{selectedApartment.name}</span>
                    </div>
                  )}
                  {selectedVendor && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vendor:</span>
                      <span className="font-medium">{selectedVendor.name}</span>
                    </div>
                  )}
                  {formData.orderReference && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Order Reference:</span>
                      <span className="font-mono font-medium">{formData.orderReference}</span>
                    </div>
                  )}
                  {formData.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{new Date(formData.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <Badge variant="outline">{paymentType.toUpperCase()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-8">
            Create Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
