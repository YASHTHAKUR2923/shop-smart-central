-- Create junction table for category-brand relationships
CREATE TABLE public.category_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.custom_categories(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.custom_brands(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, brand_id)
);

-- Enable RLS
ALTER TABLE public.category_brands ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Category brands are viewable by everyone"
ON public.category_brands FOR SELECT
USING (true);

CREATE POLICY "Admins can manage category brands"
ON public.category_brands FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add email column to user_roles for display purposes (denormalized for RLS-safe access)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create function to sync user email/name to user_roles (called from trigger)
CREATE OR REPLACE FUNCTION public.sync_user_info_to_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET email = NEW.email
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users is not allowed, so we'll update email when role is created/accessed
-- Instead, let's create a function admins can call to get user emails
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role app_role,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    au.email::TEXT,
    p.full_name
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON au.id = ur.user_id
  LEFT JOIN public.profiles p ON p.user_id = ur.user_id
  ORDER BY ur.role ASC, au.email ASC;
END;
$$;