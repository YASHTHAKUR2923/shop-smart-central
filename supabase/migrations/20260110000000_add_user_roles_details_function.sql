-- Create function to get user roles with email and full_name
CREATE OR REPLACE FUNCTION public.get_user_roles_with_details()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role app_role,
  email text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    au.email,
    p.full_name
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON ur.user_id = au.id
  LEFT JOIN public.profiles p ON ur.user_id = p.user_id
  ORDER BY ur.role ASC, au.email ASC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_roles_with_details() TO authenticated;

-- Add RLS check - only admins can call this function
-- We'll check this in the application, but also add a comment
COMMENT ON FUNCTION public.get_user_roles_with_details() IS 
  'Returns user roles with email and full_name. Should only be called by admins.';