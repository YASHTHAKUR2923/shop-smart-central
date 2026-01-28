import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, Brand } from '@/types/database';

interface ProductInput {
  name: string;
  description: string | null;
  category: ProductCategory;
  brand: Brand;
  price: number | null;
  show_price: boolean;
  image_url: string | null;
  specifications?: Record<string, string>;
  in_stock: boolean;
  model_no?: string | null;
  additional_images?: string[] | null;
  custom_category_id?: string | null;
  custom_subcategory_id?: string | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, custom_category:custom_categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductsByCustomCategory(categoryId?: string | null, subcategoryId?: string | null) {
  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId, subcategoryId],
    queryFn: async () => {
      let query: any = supabase
        .from('products')
        .select('*');

      if (categoryId) {
        query = query.eq('custom_category_id', categoryId);
      }

      if (subcategoryId) {
        query = query.eq('custom_subcategory_id', subcategoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          specifications: product.specifications || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
