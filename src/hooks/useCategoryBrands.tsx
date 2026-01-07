import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryBrand {
  id: string;
  category_id: string;
  brand_id: string;
  created_at: string;
}

export function useCategoryBrands(categoryId?: string) {
  return useQuery({
    queryKey: ['category-brands', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('category_brands')
        .select(`
          id,
          category_id,
          brand_id,
          created_at,
          custom_brands (
            id,
            name,
            slug,
            logo_url
          )
        `);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: categoryId !== undefined,
  });
}

export function useAllCategoryBrands() {
  return useQuery({
    queryKey: ['category-brands-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_brands')
        .select(`
          id,
          category_id,
          brand_id
        `);
      
      if (error) throw error;
      return data as CategoryBrand[];
    },
  });
}

export function useAddBrandToCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, brandId }: { categoryId: string; brandId: string }) => {
      const { data, error } = await supabase
        .from('category_brands')
        .insert({ category_id: categoryId, brand_id: brandId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-brands'] });
      queryClient.invalidateQueries({ queryKey: ['category-brands-all'] });
    },
  });
}

export function useRemoveBrandFromCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, brandId }: { categoryId: string; brandId: string }) => {
      const { error } = await supabase
        .from('category_brands')
        .delete()
        .eq('category_id', categoryId)
        .eq('brand_id', brandId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-brands'] });
      queryClient.invalidateQueries({ queryKey: ['category-brands-all'] });
    },
  });
}

export function useSetCategoryBrands() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, brandIds }: { categoryId: string; brandIds: string[] }) => {
      // Delete existing
      await supabase
        .from('category_brands')
        .delete()
        .eq('category_id', categoryId);
      
      // Insert new
      if (brandIds.length > 0) {
        const { error } = await supabase
          .from('category_brands')
          .insert(brandIds.map(brandId => ({ category_id: categoryId, brand_id: brandId })));
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-brands'] });
      queryClient.invalidateQueries({ queryKey: ['category-brands-all'] });
    },
  });
}
