import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuotationItem } from '@/types/database';

export interface Quotation {
  id: string;
  inquiry_id: string | null;
  customer_email: string;
  items: QuotationItem[];
  total_amount: number | null;
  notes: string | null;
  created_at: string;
}

export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Parse items from JSON
      return (data || []).map(q => ({
        ...q,
        items: (q.items as unknown as QuotationItem[]) || [],
      })) as Quotation[];
    },
  });
}

export function useGenerateQuotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inquiryId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('generate-quotation', {
        body: { inquiry_id: inquiryId },
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}