import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    show_price: boolean;
    image_url: string | null;
    category_id: string | null;
    subcategory_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Service[];
        },
    });
}

export function useServicesByCategory(categoryId?: string, subcategoryId?: string) {
    return useQuery({
        queryKey: ['services', categoryId, subcategoryId],
        queryFn: async () => {
            let query: any = (supabase as any)
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            if (subcategoryId) {
                query = query.eq('subcategory_id', subcategoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Service[];
        },
        enabled: true, // Always enabled, even if no category selected (returns all)
    });
}

export function useService(id: string) {
    return useQuery({
        queryKey: ['service', id],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('services')
                .select('*, category:service_categories(name), subcategory:service_subcategories(name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Service & { category?: { name: string }, subcategory?: { name: string } };
        },
        enabled: !!id,
    });
}

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await (supabase as any)
                .from('services')
                .insert(service)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}

export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
            const { data, error } = await (supabase as any)
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['service'] });
        },
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}
