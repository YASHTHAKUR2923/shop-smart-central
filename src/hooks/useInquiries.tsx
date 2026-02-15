import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Inquiry, InquiryStatus } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useInquiries() {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Inquiry[];
    },
  });
}

const SEND_INQUIRY_EMAIL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-inquiry-notification`;

async function sendInquiryEmailNotification(payload: {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
  product?: { name: string; category: string };
}) {
  try {
    await fetch(SEND_INQUIRY_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Email notification failed:', err);
  }
}

export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      product_id?: string;
      message?: string;
      cart_items?: any;
      product?: { name: string; category: string };
    }) => {
      const { product, ...dbInquiry } = inquiry;
      const { error } = await supabase
        .from('inquiries')
        .insert([dbInquiry]);

      if (error) throw error;

      // Send email notification (database trigger may fail, so we call from app too)
      sendInquiryEmailNotification({
        id: `app-${Date.now()}`,
        customer_name: inquiry.customer_name,
        customer_email: inquiry.customer_email,
        customer_phone: inquiry.customer_phone,
        product_id: inquiry.product_id ?? null,
        message: inquiry.message ?? null,
        status: 'pending',
        created_at: new Date().toISOString(),
        product: inquiry.product,
      });

      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast({
        title: 'Inquiry submitted successfully',
        description: 'Our team will contact you shortly.'
      });
    },
    onError: (error) => {
      toast({ title: 'Error submitting inquiry', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast({ title: 'Inquiry status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating inquiry', description: error.message, variant: 'destructive' });
    },
  });
}
