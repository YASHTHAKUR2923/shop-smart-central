-- First, let's see all policies and drop the restrictive one, then create a permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

-- Create a truly PERMISSIVE policy (by default policies are permissive unless marked as restrictive)
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);