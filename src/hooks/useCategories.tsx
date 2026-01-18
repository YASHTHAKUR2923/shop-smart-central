import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomSubcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['custom-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CustomCategory[];
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['custom-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CustomBrand[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<CustomCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-categories'] });
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brand: Omit<CustomBrand, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_brands')
        .insert(brand)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-brands'] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomBrand> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-brands'] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-brands'] });
    },
  });
}

// Subcategory hooks
export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ['custom-subcategories', categoryId],
    queryFn: async () => {
      let query: any = (supabase as any)
        .from('custom_subcategories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustomSubcategory[];
    },
  });
}

export function useAllSubcategories() {
  return useQuery({
    queryKey: ['custom-subcategories-all'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('custom_subcategories')
        .select('*, category:custom_categories(id, name, slug)')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as (CustomSubcategory & { category: { id: string; name: string; slug: string } })[];
    },
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subcategory: Omit<CustomSubcategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase as any)
        .from('custom_subcategories')
        .insert(subcategory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories-all'] });
    },
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomSubcategory> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('custom_subcategories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories-all'] });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('custom_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['custom-subcategories-all'] });
    },
  });
}

export function useAdminExists() {
  return useQuery({
    queryKey: ['admin-exists'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_exists');
      if (error) throw error;
      return data as boolean;
    },
  });
}