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

export function useCreateInquiry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inquiry: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      product_id?: string;
      message?: string;
    }) => {
      const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
