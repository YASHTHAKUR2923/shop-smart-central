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

  if (authLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    await updateStatus.mutateAsync({ id: inquiryId, status });
    
    // Auto-generate quotation when status changes to 'completed'
    if (status === 'completed') {
      try {
        await generateQuotation.mutateAsync(inquiryId);
        toast.success('Deal confirmed! Quotation generated automatically.');
      } catch (error) {
        console.error('Error generating quotation:', error);
      }
    }
  };

  const handleGenerateQuotation = async (inquiryId: string) => {
    try {
      await generateQuotation.mutateAsync(inquiryId);
      toast.success('Quotation generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate quotation');
    }
  };

  const handleConfirmDeal = async (inquiryId: string) => {
    try {
      await updateStatus.mutateAsync({ id: inquiryId, status: 'completed' });
      await generateQuotation.mutateAsync(inquiryId);
      toast.success('Deal confirmed and quotation generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm deal');
    }
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
            {/* Desktop Table */}
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
                        <div>
                          <p className="font-medium">{inquiry.customer_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {inquiry.customer_email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {inquiry.customer_phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.product ? (
                          <span className="text-sm">{inquiry.product.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">General Inquiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                          {inquiry.message || 'No message'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </span>
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
                            onValueChange={(value: InquiryStatus) => handleStatusChange(inquiry.id, value)}
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
                          
                          {inquiry.status !== 'completed' && inquiry.status !== 'cancelled' && (
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
                          
                          {inquiry.status === 'quoted' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateQuotation(inquiry.id)}
                              disabled={generateQuotation.isPending}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Regenerate Quote
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{inquiry.customer_name}</CardTitle>
                        <CardDescription>
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge className={STATUS_COLORS[inquiry.status]}>
                        {STATUS_LABELS[inquiry.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {inquiry.customer_email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {inquiry.customer_phone}
                    </div>
                    {inquiry.product && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {inquiry.product.name}
                      </div>
                    )}
                    {inquiry.message && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">{inquiry.message}</p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t space-y-2">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value: InquiryStatus) => handleStatusChange(inquiry.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {inquiry.status !== 'completed' && inquiry.status !== 'cancelled' && (
                        <Button 
                          className="w-full bg-success hover:bg-success/90"
                          onClick={() => handleConfirmDeal(inquiry.id)}
                          disabled={generateQuotation.isPending}
                        >
                          {generateQuotation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Deal & Generate Quote
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Phone className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No inquiries yet
            </h2>
            <p className="text-muted-foreground">
              Customer inquiries will appear here when they contact you.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}