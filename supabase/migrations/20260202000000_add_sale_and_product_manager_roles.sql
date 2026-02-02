-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE 'sale' AFTER 'admin';
ALTER TYPE public.app_role ADD VALUE 'product_manager' AFTER 'sale';
