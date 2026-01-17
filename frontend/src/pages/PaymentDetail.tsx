import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Package,
  Clock,
  CheckCircle,
  Edit,
  History,
  CreditCard,
  Banknote,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentApi, Payment } from '@/services/paymentApi';
import { usePayment, useCreatePaymentHistory, useDeletePaymentHistory } from '@/hooks/usePaymentApi';
import { format } from 'date-fns';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import PaymentDetailSkeleton from '@/components/skeletons/PaymentDetailSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use React Query for data fetching
  const { data: payment, isLoading: loading, error: queryError, refetch } = usePayment(id || '');
  const createPaymentHistoryMutation = useCreatePaymentHistory();
  const deletePaymentHistoryMutation = useDeletePaymentHistory();
  
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const error = queryError ? 'Payment not found' : (!id ? 'No payment ID provided' : null);

  if (loading) {
    return <PaymentDetailSkeleton />;
  }

  if (error || !payment) {
    return (
      <PageLayout title="Payment Not Found">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Payment Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/payments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-success/10 text-success border-success/20",
      "Partial": "bg-warning/10 text-warning border-warning/20",
      "Unpaid": "bg-muted text-muted-foreground border-border",
      "Overdue": "bg-danger/10 text-danger border-danger/20"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4" />;
      case "Partial":
        return <Clock className="h-4 w-4" />;
      case "Overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalAmount = payment.total_amount || 0;
  const amountPaid = payment.amount_paid || 0;
  const outstandingAmount = payment.outstanding_amount || 0;
  const shippingCost = payment.shipping_cost || 0;
  const discount = payment.discount || 0;
  const finalTotal = payment.final_total || totalAmount;
  const paymentProgress = finalTotal > 0 ? (amountPaid / finalTotal) * 100 : 0;

  return (
    <PageLayout title="Payment Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/payments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Payment Details</h1>
              <p className="text-muted-foreground">Order Ref: {payment.order_reference}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(payment.status)}>
              {getStatusIcon(payment.status)}
              <span className="ml-1">{payment.status}</span>
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/payments/${payment.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      Payment Overview
                    </CardTitle>
                    <CardDescription>
                      Created on {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy') : 'Unknown'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">{totalAmount.toLocaleString()} HUF</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-success">{amountPaid.toLocaleString()} HUF</p>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning mb-1">Outstanding</p>
                    <p className="text-2xl font-bold text-warning">{outstandingAmount.toLocaleString()} HUF</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Due Date
                    </p>
                    <p className="font-medium">
                      {payment.due_date ? format(new Date(payment.due_date), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Payment
                    </p>
                    <p className="font-medium">
                      {payment.last_payment_date 
                        ? format(new Date(payment.last_payment_date), 'MMM dd, yyyy') 
                        : 'No payments yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" /> Products
                    </p>
                    <p className="font-medium">
                      {payment.order_items_count || payment.order_item_details?.length || payment.product_count || 0} items
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>

                {/* Notes */}
                {payment.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <FileText className="h-3 w-3" /> Notes
                      </p>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                        {payment.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Items / Products */}
            {((payment.order_item_details && payment.order_item_details.length > 0) || 
              (payment.product_details && payment.product_details.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products ({payment.order_item_details?.length || payment.product_details?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Show order items if available */}
                      {payment.order_item_details && payment.order_item_details.length > 0 ? (
                        payment.order_item_details.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.product_image && (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <span className="font-medium">{item.product_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground font-mono text-sm">{item.sku || 'N/A'}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(String(item.unit_price)).toLocaleString()} HUF
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">
                              {parseFloat(String(item.total_price)).toLocaleString()} HUF
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        /* Fallback to legacy product_details */
                        payment.product_details?.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.product}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category_name || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(product.unit_price).toLocaleString()} HUF
                            </TableCell>
                            <TableCell className="text-center">{product.qty}</TableCell>
                            <TableCell className="text-right font-medium">
                              {(parseFloat(product.unit_price) * product.qty).toLocaleString()} HUF
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </CardTitle>
                {payment.status !== 'Paid' && (
                  <Button size="sm" onClick={() => setIsRecordModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Record Payment
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {payment.payment_history && payment.payment_history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payment.payment_history.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>
                            {history.date ? format(new Date(history.date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium text-success">
                            +{(history.amount || 0).toLocaleString()} HUF
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {history.method === 'Bank Transfer' && <Banknote className="h-3 w-3" />}
                              {history.method === 'Credit Card' && <CreditCard className="h-3 w-3" />}
                              {history.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {history.reference_no || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {history.note || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-danger"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this payment record?')) {
                                  try {
                                    await deletePaymentHistoryMutation.mutateAsync(history.id);
                                    toast.success("Payment record deleted");
                                    refetch();
                                  } catch (error) {
                                    toast.error("Failed to delete payment record");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mb-2 opacity-50" />
                    <p>No payment history yet</p>
                    {payment.status !== 'Paid' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setIsRecordModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Record First Payment
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Apartment & Vendor Info */}
          <div className="space-y-6">
            {/* Apartment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Apartment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.apartment_details ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{payment.apartment_details.name}</p>
                    </div>
                    {payment.apartment_details.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{payment.apartment_details.address}</p>
                      </div>
                    )}
                    {payment.apartment_details.type && (
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge variant="outline">{payment.apartment_details.type}</Badge>
                      </div>
                    )}
                    {payment.apartment_details.status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="secondary">{payment.apartment_details.status}</Badge>
                      </div>
                    )}
                    {payment.apartment_details.designer && (
                      <div>
                        <p className="text-sm text-muted-foreground">Designer</p>
                        <p className="font-medium">{payment.apartment_details.designer}</p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/apartments/${payment.apartment_details?.id}`)}
                    >
                      View Apartment
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No apartment details available</p>
                )}
              </CardContent>
            </Card>

            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Vendor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.vendor_details ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{payment.vendor_details.name}</p>
                    </div>
                    {payment.vendor_details.contact_person && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> Contact Person
                        </p>
                        <p className="font-medium">{payment.vendor_details.contact_person}</p>
                      </div>
                    )}
                    {payment.vendor_details.email && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </p>
                        <a 
                          href={`mailto:${payment.vendor_details.email}`} 
                          className="font-medium text-primary hover:underline"
                        >
                          {payment.vendor_details.email}
                        </a>
                      </div>
                    )}
                    {payment.vendor_details.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </p>
                        <a 
                          href={`tel:${payment.vendor_details.phone}`} 
                          className="font-medium text-primary hover:underline"
                        >
                          {payment.vendor_details.phone}
                        </a>
                      </div>
                    )}
                    {payment.vendor_details.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium text-sm">
                          {payment.vendor_details.address}
                          {payment.vendor_details.city && `, ${payment.vendor_details.city}`}
                          {payment.vendor_details.country && `, ${payment.vendor_details.country}`}
                        </p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/vendors/${payment.vendor_details?.id}`)}
                    >
                      View Vendor
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No vendor details available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {payment.status !== 'Paid' && (
                  <Button className="w-full" onClick={() => setIsRecordModalOpen(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate(`/payments/${payment.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        payment={payment}
        open={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        onSave={async (amount, method, reference, note) => {
          try {
            await createPaymentHistoryMutation.mutateAsync({
              payment: payment.id,
              date: new Date().toISOString().split('T')[0],
              amount: amount,
              method: method,
              reference_no: reference,
              note: note,
            });
            toast.success("Payment Recorded", {
              description: `${amount.toLocaleString()} HUF recorded successfully`,
            });
            setIsRecordModalOpen(false);
            refetch();
          } catch (error) {
            toast.error("Failed to record payment");
          }
        }}
      />
    </PageLayout>
  );
}
