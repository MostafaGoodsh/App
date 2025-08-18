-- FINAL SECURITY FIXES: Address remaining critical issues

-- Fix early_access table access - ensure only admins can view early access requests
CREATE POLICY "Only admins can view early access requests" 
ON public.early_access 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Fix custom_tokens access - restrict unverified token viewing
DROP POLICY IF EXISTS "Users can view verified tokens and their own tokens" ON public.custom_tokens;

-- Replace with more restrictive policy
CREATE POLICY "Users can view verified tokens only" 
ON public.custom_tokens 
FOR SELECT 
USING (is_verified = true);

-- Allow users to view their own unverified tokens
CREATE POLICY "Users can view their own unverified tokens" 
ON public.custom_tokens 
FOR SELECT 
USING (
  is_verified = false 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.custom_tokens ct2 
    WHERE ct2.id = custom_tokens.id 
    -- This would need additional tracking if we want to link tokens to users
    -- For now, just restrict to verified tokens for general viewing
  )
);

-- Drop the overly permissive second policy and keep only verified token viewing
DROP POLICY IF EXISTS "Users can view their own unverified tokens" ON public.custom_tokens;

-- Final policy: Only verified tokens are publicly viewable
CREATE POLICY "Only verified tokens are publicly viewable" 
ON public.custom_tokens 
FOR SELECT 
USING (is_verified = true);

-- Admin can view all tokens for verification purposes
CREATE POLICY "Admins can view all tokens" 
ON public.custom_tokens 
FOR ALL 
USING (public.is_admin(auth.uid()));