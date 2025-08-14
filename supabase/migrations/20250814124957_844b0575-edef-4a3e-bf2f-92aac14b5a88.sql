-- Remove the overly permissive policy that allows any authenticated user to view all early access requests
DROP POLICY IF EXISTS "Authenticated users can view early access requests" ON public.early_access;

-- The INSERT policy for "Anyone can insert early access requests" remains intact
-- This ensures users can still submit early access requests but cannot view others' data
-- Only administrators can view this data through the Supabase dashboard