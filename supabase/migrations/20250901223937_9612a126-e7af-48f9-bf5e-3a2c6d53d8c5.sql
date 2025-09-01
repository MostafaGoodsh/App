-- Fix security vulnerability in early_access table
-- Remove duplicate and potentially conflicting RLS policies

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view early access requests" ON public.early_access;
DROP POLICY IF EXISTS "Only admins can view early access requests" ON public.early_access;
DROP POLICY IF EXISTS "Authenticated users can insert early access requests" ON public.early_access;

-- Create secure, non-conflicting policies
-- Only admins can view the sensitive personal data
CREATE POLICY "Admins only can view early access data"
ON public.early_access
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow anyone to submit early access requests (but not view them)
CREATE POLICY "Anyone can submit early access requests"
ON public.early_access
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can update/manage early access requests
CREATE POLICY "Admins can manage early access requests"
ON public.early_access
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete early access requests
CREATE POLICY "Admins can delete early access requests"
ON public.early_access
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));