-- Drop and recreate the function with fixed parameter name
DROP FUNCTION IF EXISTS public.initialize_first_admin(uuid);

CREATE OR REPLACE FUNCTION public.initialize_first_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if any admin already exists
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remove customer role if exists
  DELETE FROM public.user_roles WHERE user_roles.user_id = p_user_id AND role = 'customer';
  
  RETURN true;
END;
$$;