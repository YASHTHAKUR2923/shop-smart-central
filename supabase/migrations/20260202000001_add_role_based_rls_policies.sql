-- Add RLS policies for Sale and Product Manager roles

-- =============================================================================
-- INQUIRIES TABLE POLICIES - Customers can insert, Sale role can view all inquiries
-- =============================================================================

-- All unauthenticated users can submit inquiries (create contact form submissions)
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries FOR INSERT
TO anon
WITH CHECK (true);

-- Sale role can view all inquiries
CREATE POLICY "Sale can view all inquiries"
ON public.inquiries FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'sale'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- =============================================================================
-- PRODUCTS TABLE POLICIES - Product Manager can upload/update products
-- =============================================================================

-- Product Manager can insert products
CREATE POLICY "Product Manager can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- Product Manager can update products
CREATE POLICY "Product Manager can update products"
ON public.products FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- =============================================================================
-- CATEGORIES TABLE POLICIES - Product Manager can manage categories
-- =============================================================================

-- Product Manager can insert categories
CREATE POLICY "Product Manager can insert categories"
ON public.custom_categories FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- Product Manager can update categories
CREATE POLICY "Product Manager can update categories"
ON public.custom_categories FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- Product Manager can delete categories
CREATE POLICY "Product Manager can delete categories"
ON public.custom_categories FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'product_manager'
  OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);
