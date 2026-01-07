import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/database';

export interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
  full_name?: string;
}

export function useUserRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      // Use the secure function that returns user info for admins
      const { data, error } = await supabase.rpc('get_users_with_roles');
      
      if (error) {
        // Fallback to basic query if function fails (e.g., not admin)
        const { data: basicData, error: basicError } = await supabase
          .from('user_roles')
          .select('*')
          .order('role', { ascending: true });
        
        if (basicError) throw basicError;
        return basicData as UserWithRole[];
      }
      
      return data as UserWithRole[];
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // First check if user already has a role entry
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
}

export function useRemoveAdminRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'customer' })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
}
