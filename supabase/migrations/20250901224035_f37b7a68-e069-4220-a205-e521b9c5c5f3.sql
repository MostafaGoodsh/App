-- Fix security vulnerability in early_access table by properly cleaning up policies
-- Drop all existing conflicting policies first
DROP POLICY IF EXISTS "Admins can view early access requests" ON public.early_access;
DROP POLICY IF EXISTS "Only admins can view early access requests" ON public.early_access;
DROP POLICY IF EXISTS "Authenticated users can insert early access requests" ON public.early_access;
DROP POLICY IF EXISTS "Admins only can view early access data" ON public.early_access;

-- Create secure, non-conflicting policies with unique names
-- Only admins can view the sensitive personal data
CREATE POLICY "secure_admin_view_early_access"
ON public.early_access
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow anyone to submit early access requests (but not view them)
CREATE POLICY "public_submit_early_access"
ON public.early_access
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can update/manage early access requests
CREATE POLICY "admin_manage_early_access"
ON public.early_access
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete early access requests
CREATE POLICY "admin_delete_early_access"
ON public.early_access
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));