import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface ServiceSubcategory {
    id: string;
    name: string;
    slug: string;
    category_id: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export function useServiceCategories() {
    return useQuery({
        queryKey: ['service-categories'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('service_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as ServiceCategory[];
        },
    });
}

// Note: Brands are not implemented for services as per plan

export function useCreateServiceCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (category: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await (supabase as any)
                .from('service_categories')
                .insert(category)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        },
    });
}

export function useUpdateServiceCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ServiceCategory> & { id: string }) => {
            const { data, error } = await (supabase as any)
                .from('service_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        },
    });
}

export function useDeleteServiceCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('service_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        },
    });
}

// Subcategory hooks
export function useServiceSubcategories(categoryId?: string) {
    return useQuery({
        queryKey: ['service-subcategories', categoryId],
        queryFn: async () => {
            let query: any = (supabase as any)
                .from('service_subcategories')
                .select('*')
                .order('display_order', { ascending: true });

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as ServiceSubcategory[];
        },
    });
}

export function useAllServiceSubcategories() {
    return useQuery({
        queryKey: ['service-subcategories-all'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('service_subcategories')
                .select('*, category:service_categories(id, name, slug)')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as (ServiceSubcategory & { category: { id: string; name: string; slug: string } })[];
        },
    });
}

export function useCreateServiceSubcategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subcategory: Omit<ServiceSubcategory, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await (supabase as any)
                .from('service_subcategories')
                .insert(subcategory)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['service-subcategories-all'] });
        },
    });
}

export function useUpdateServiceSubcategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ServiceSubcategory> & { id: string }) => {
            const { data, error } = await (supabase as any)
                .from('service_subcategories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['service-subcategories-all'] });
        },
    });
}

export function useDeleteServiceSubcategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('service_subcategories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['service-subcategories-all'] });
        },
    });
}
