-- Create service categories table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'Package',
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create service subcategories table
CREATE TABLE public.service_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;

-- Service Categories: anyone can view, only admins can manage
CREATE POLICY "Service categories are viewable by everyone"
  ON public.service_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert service categories"
  ON public.service_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service categories"
  ON public.service_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service categories"
  ON public.service_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service Subcategories: anyone can view, only admins can manage
CREATE POLICY "Service subcategories are viewable by everyone"
  ON public.service_subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert service subcategories"
  ON public.service_subcategories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service subcategories"
  ON public.service_subcategories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service subcategories"
  ON public.service_subcategories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_subcategories_updated_at
  BEFORE UPDATE ON public.service_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
