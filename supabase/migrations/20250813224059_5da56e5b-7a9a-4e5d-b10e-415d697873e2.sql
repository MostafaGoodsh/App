-- Remove the overly permissive policy that allows anyone to view early access data
DROP POLICY IF EXISTS "Anyone can view early access requests" ON public.early_access;

-- Create a new policy that only allows authenticated users to view early access data
-- This is a temporary solution - ideally should be restricted to admin users only
CREATE POLICY "Authenticated users can view early access requests" 
ON public.early_access 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add a comment to remind about implementing proper admin roles in the future
COMMENT ON TABLE public.early_access IS 'Early access requests table. TODO: Implement admin role system to restrict SELECT access to admin users only.';