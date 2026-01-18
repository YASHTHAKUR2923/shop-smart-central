-- Create custom subcategories table
CREATE TABLE public.custom_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.custom_categories(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE public.custom_subcategories ENABLE ROW LEVEL SECURITY;

-- Subcategories: anyone can view, only admins can manage
CREATE POLICY "Subcategories are viewable by everyone"
  ON public.custom_subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert subcategories"
  ON public.custom_subcategories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subcategories"
  ON public.custom_subcategories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subcategories"
  ON public.custom_subcategories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_custom_subcategories_updated_at
  BEFORE UPDATE ON public.custom_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- First, clear existing categories and add the new structure
DELETE FROM public.custom_categories;

-- Insert categories from user's list
INSERT INTO public.custom_categories (name, slug, icon, description, display_order) VALUES
  ('Desktops', 'desktops', 'Monitor', 'Desktop computers and workstations', 1),
  ('Laptops', 'laptops', 'Laptop', 'Laptops and notebooks', 2),
  ('Tabs', 'tabs', 'Tablet', 'Tablets and iPads', 3),
  ('Monitor & TV', 'monitor-tv', 'Monitor', 'Monitors and televisions', 4),
  ('Printing & Scanning Devices', 'printing-scanning', 'Printer', 'Printers and scanners', 5),
  ('Storage Devices', 'storage-devices', 'HardDrive', 'Storage solutions', 6),
  ('Servers', 'servers', 'Server', 'Enterprise server solutions', 7),
  ('Networking Devices', 'networking-devices', 'Network', 'Active networking equipment', 8),
  ('Passive Networking Products', 'passive-networking', 'Cable', 'Cables and passive networking', 9);

-- Insert subcategories
-- Desktops subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Desktop', 'desktop', id, 1 FROM public.custom_categories WHERE slug = 'desktops';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Tiny Machine', 'tiny-machine', id, 2 FROM public.custom_categories WHERE slug = 'desktops';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Thin Clients', 'thin-clients', id, 3 FROM public.custom_categories WHERE slug = 'desktops';

-- Tabs subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'iPad', 'ipad', id, 1 FROM public.custom_categories WHERE slug = 'tabs';

-- Printing & Scanning subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Printer', 'printer', id, 1 FROM public.custom_categories WHERE slug = 'printing-scanning';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Scanner', 'scanner', id, 2 FROM public.custom_categories WHERE slug = 'printing-scanning';

-- Storage Devices subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Tape Library', 'tape-library', id, 1 FROM public.custom_categories WHERE slug = 'storage-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Storage – SAN', 'storage-san', id, 2 FROM public.custom_categories WHERE slug = 'storage-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'JBODs', 'jbods', id, 3 FROM public.custom_categories WHERE slug = 'storage-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Storage – NAS', 'storage-nas', id, 4 FROM public.custom_categories WHERE slug = 'storage-devices';

-- Servers subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Rack Server', 'rack-server', id, 1 FROM public.custom_categories WHERE slug = 'servers';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Tower Server', 'tower-server', id, 2 FROM public.custom_categories WHERE slug = 'servers';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Chassis Server', 'chassis-server', id, 3 FROM public.custom_categories WHERE slug = 'servers';

-- Networking Devices subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Network Switch', 'network-switch', id, 1 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'SAN Switch', 'san-switch', id, 2 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'KVM Switch', 'kvm-switch', id, 3 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Access Controller & Access Point', 'access-controller-ap', id, 4 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Chassis Switch', 'chassis-switch', id, 5 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Router', 'router', id, 6 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Gateway', 'gateway', id, 7 FROM public.custom_categories WHERE slug = 'networking-devices';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Firewall Hardware', 'firewall-hardware', id, 8 FROM public.custom_categories WHERE slug = 'networking-devices';

-- Passive Networking Products subcategories
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Ethernet Patchcord', 'ethernet-patchcord', id, 1 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Fiber Patchcord', 'fiber-patchcord', id, 2 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'LAN Cable', 'lan-cable', id, 3 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Fibre Cable', 'fibre-cable', id, 4 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'IO Ports', 'io-ports', id, 5 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Patch Panel', 'patch-panel', id, 6 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'LIU', 'liu', id, 7 FROM public.custom_categories WHERE slug = 'passive-networking';
INSERT INTO public.custom_subcategories (name, slug, category_id, display_order)
SELECT 'Passive Networking Accessories', 'passive-networking-accessories', id, 8 FROM public.custom_categories WHERE slug = 'passive-networking';

-- Add subcategory reference to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS custom_subcategory_id uuid REFERENCES public.custom_subcategories(id);
