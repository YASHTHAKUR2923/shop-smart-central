-- Create custom categories table
CREATE TABLE public.custom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'Package',
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create custom brands table
CREATE TABLE public.custom_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_brands ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can view, only admins can manage
CREATE POLICY "Categories are viewable by everyone"
  ON public.custom_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.custom_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
  ON public.custom_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
  ON public.custom_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Brands: anyone can view, only admins can manage
CREATE POLICY "Brands are viewable by everyone"
  ON public.custom_brands FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert brands"
  ON public.custom_brands FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brands"
  ON public.custom_brands FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brands"
  ON public.custom_brands FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_custom_categories_updated_at
  BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_brands_updated_at
  BEFORE UPDATE ON public.custom_brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories
INSERT INTO public.custom_categories (name, slug, icon, description, display_order) VALUES
  ('Laptops', 'laptop', 'Laptop', 'Business & Enterprise Laptops', 1),
  ('Desktops', 'desktop', 'Monitor', 'Workstations & PCs', 2),
  ('Network Modules', 'network_module', 'Network', 'Switches, Routers & Modules', 3),
  ('Servers', 'server', 'Server', 'Enterprise Server Solutions', 4),
  ('Accessories', 'accessories', 'Cable', 'Peripherals & Accessories', 5),
  ('Other', 'other', 'Package', 'Other Products', 6);

-- Seed default brands
INSERT INTO public.custom_brands (name, slug, display_order) VALUES
  ('Dell', 'dell', 1),
  ('HP', 'hp', 2),
  ('Lenovo', 'lenovo', 3),
  ('ASUS', 'asus', 4),
  ('Acer', 'acer', 5),
  ('Cisco', 'cisco', 6),
  ('Juniper', 'juniper', 7),
  ('Netgear', 'netgear', 8),
  ('Other', 'other', 9);

-- Modify products table to use custom categories and brands (add columns, keep enums for backward compat)
ALTER TABLE public.products 
  ADD COLUMN custom_category_id uuid REFERENCES public.custom_categories(id),
  ADD COLUMN custom_brand_id uuid REFERENCES public.custom_brands(id);

-- Create function to check if any admin exists
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
$$;

-- Create function to initialize first admin (only works when no admin exists)
CREATE OR REPLACE FUNCTION public.initialize_first_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if any admin already exists
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remove customer role if exists
  DELETE FROM public.user_roles WHERE user_id = user_id AND role = 'customer';
  
  RETURN true;
END;
$$;