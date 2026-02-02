import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInquiries, useUpdateInquiryStatus } from '@/hooks/useInquiries';
import { useGenerateQuotation } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { InquiryStatus } from '@/types/database';
import { Loader2, Phone, Mail, MessageSquare, Package, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  quoted: 'Quoted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<InquiryStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  contacted: 'bg-primary/20 text-primary border-primary/30',
  quoted: 'bg-accent/20 text-accent border-accent/30',
  completed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function AdminInquiries() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: inquiries, isLoading } = useInquiries();
  const updateStatus = useUpdateInquiryStatus();
  const generateQuotation = useGenerateQuotation();

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    await updateStatus.mutateAsync({ id: inquiryId, status });
  };

  const handleConfirmDeal = async (inquiryId: string) => {
    try {
      await generateQuotation.mutateAsync(inquiryId);
      await updateStatus.mutateAsync({ id: inquiryId, status: 'completed' });
      toast.success('Deal confirmed and quotation generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm deal');
    }
  };

  // ✅ PDF DOWNLOAD FUNCTION
  const handleDownloadPDF = (inquiry: any) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Customer Inquiry Details', 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${inquiry.customer_name}`, 20, 40);
    doc.text(`Email: ${inquiry.customer_email}`, 20, 50);
    doc.text(`Phone: ${inquiry.customer_phone}`, 20, 60);
    doc.text(
      `Product: ${inquiry.product ? inquiry.product.name : 'General Inquiry'}`,
      20,
      70
    );
    doc.text(`Status: ${STATUS_LABELS[inquiry.status]}`, 20, 80);
    doc.text(`Date: ${format(new Date(inquiry.created_at), 'MMM d, yyyy')}`, 20, 90);

    doc.text('Message:', 20, 110);
    doc.text(inquiry.message || 'No message', 20, 120, { maxWidth: 170 });

    doc.save(`Inquiry_${inquiry.customer_name}.pdf`);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Customer Inquiries
          </h1>
          <p className="text-muted-foreground">
            Manage and respond to customer inquiries. Confirm deals to auto-generate quotations.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="space-y-4">

            {/* ===== DESKTOP TABLE ===== */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <p className="font-medium">{inquiry.customer_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {inquiry.customer_email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {inquiry.customer_phone}
                        </p>
                      </TableCell>

                      <TableCell>
                        {inquiry.product ? inquiry.product.name : 'General Inquiry'}
                      </TableCell>

                      <TableCell className="max-w-xs line-clamp-2">
                        {inquiry.message || 'No message'}
                      </TableCell>

                      <TableCell>
                        {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                      </TableCell>

                      <TableCell>
                        <Badge className={STATUS_COLORS[inquiry.status]}>
                          {STATUS_LABELS[inquiry.status]}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-col gap-2 items-end">

                          <Select
                            value={inquiry.status}
                            onValueChange={(value: InquiryStatus) =>
                              handleStatusChange(inquiry.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {inquiry.status !== 'completed' &&
                            inquiry.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmDeal(inquiry.id)}
                                disabled={generateQuotation.isPending}
                                className="bg-success hover:bg-success/90"
                              >
                                {generateQuotation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Confirm Deal
                                  </>
                                )}
                              </Button>
                            )}

                          {/* ✅ DOWNLOAD PDF BUTTON */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(inquiry)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Download PDF
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ===== MOBILE CARDS ===== */}
            <div className="lg:hidden space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{inquiry.customer_name}</CardTitle>
                        <CardDescription>
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge className={STATUS_COLORS[inquiry.status]}>
                        {STATUS_LABELS[inquiry.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex gap-2 text-sm">
                      <Mail className="w-4 h-4" /> {inquiry.customer_email}
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Phone className="w-4 h-4" /> {inquiry.customer_phone}
                    </div>
                    {inquiry.product && (
                      <div className="flex gap-2 text-sm">
                        <Package className="w-4 h-4" /> {inquiry.product.name}
                      </div>
                    )}
                    {inquiry.message && (
                      <div className="flex gap-2 text-sm">
                        <MessageSquare className="w-4 h-4" /> {inquiry.message}
                      </div>
                    )}

                    <Select
                      value={inquiry.status}
                      onValueChange={(value: InquiryStatus) =>
                        handleStatusChange(inquiry.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {inquiry.status !== 'completed' &&
                      inquiry.status !== 'cancelled' && (
                        <Button
                          className="w-full bg-success hover:bg-success/90"
                          onClick={() => handleConfirmDeal(inquiry.id)}
                        >
                          Confirm Deal
                        </Button>
                      )}

                    {/* ✅ DOWNLOAD PDF BUTTON */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownloadPDF(inquiry)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Inquiry PDF
                    </Button>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold">No inquiries yet</h2>
            <p className="text-muted-foreground">
              Customer inquiries will appear here when they contact you.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}