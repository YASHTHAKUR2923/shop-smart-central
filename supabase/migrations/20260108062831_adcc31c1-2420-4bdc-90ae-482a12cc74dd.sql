-- Drop the restrictive INSERT policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

CREATE POLICY "Anyone can create inquiries"
ON public.inquiries
FOR INSERT
TO public
WITH CHECK (true);