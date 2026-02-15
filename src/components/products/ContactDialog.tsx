import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateInquiry } from '@/hooks/useInquiries';
import { Product } from '@/types/database';
import { Loader2, Phone, Mail, User } from 'lucide-react';
import { z } from 'zod';

const inquirySchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Please enter a valid email'),
  customer_phone: z.string().min(10, 'Please enter a valid phone number'),
  message: z.string().optional(),
});

interface ContactDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookUrl?: string;
}

export function ContactDialog({ product, open, onOpenChange, webhookUrl }: ContactDialogProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  
  const createInquiry = useCreateInquiry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createInquiry.mutateAsync({
        ...formData,
        product_id: product?.id,
        product: product ? { name: product.name, category: product.category } : undefined,
      });

      // Send to Zapier webhook if configured
      if (webhookUrl) {
        setIsSendingWebhook(true);
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors',
            body: JSON.stringify({
              ...formData,
              product_name: product?.name,
              product_id: product?.id,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Webhook error:', error);
        } finally {
          setIsSendingWebhook(false);
        }
      }

      setFormData({ customer_name: '', customer_email: '', customer_phone: '', message: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating inquiry:', error);
    }
  };

  const isLoading = createInquiry.isPending || isSendingWebhook;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Request a Call
          </DialogTitle>
          <DialogDescription>
            {product 
              ? `Interested in ${product.name}? Fill in your details and we'll call you back.`
              : 'Fill in your details and we\'ll call you back.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name
            </Label>
            <Input
              id="name"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              placeholder="John Doe"
              className={errors.customer_name ? 'border-destructive' : ''}
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive">{errors.customer_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
              placeholder="john@example.com"
              className={errors.customer_email ? 'border-destructive' : ''}
            />
            {errors.customer_email && (
              <p className="text-sm text-destructive">{errors.customer_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className={errors.customer_phone ? 'border-destructive' : ''}
            />
            {errors.customer_phone && (
              <p className="text-sm text-destructive">{errors.customer_phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us more about your requirements..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Request Callback
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
