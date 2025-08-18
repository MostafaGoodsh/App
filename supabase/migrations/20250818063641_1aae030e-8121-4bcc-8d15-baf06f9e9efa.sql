-- CRITICAL SECURITY FIXES - PHASE 1: Data Protection (Corrected)
-- Fix 1: Secure early_access table - remove public read access
DROP POLICY IF EXISTS "Anyone can view early access requests" ON public.early_access;

-- Only authenticated users can submit early access requests
DROP POLICY IF EXISTS "Anyone can insert early access requests" ON public.early_access;
CREATE POLICY "Authenticated users can insert early access requests" 
ON public.early_access 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 2: Enhanced security for database functions - add proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.update_kyc_status(verification_id uuid, new_status text, admin_notes text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved, rejected, or pending.';
  END IF;
  
  -- Update the verification record
  UPDATE public.identity_verification 
  SET 
    status = new_status,
    verified_at = CASE WHEN new_status = 'approved' THEN now() ELSE NULL END,
    verification_notes = COALESCE(admin_notes, verification_notes),
    updated_at = now()
  WHERE id = verification_id;
  
  -- Check if update was successful
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Fix 3: Enhanced wallet security - create separate table for sensitive wallet data
CREATE TABLE IF NOT EXISTS public.wallet_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  private_key_encrypted TEXT,
  mnemonic_encrypted TEXT,
  encryption_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0
);

-- Enable RLS on wallet_security
ALTER TABLE public.wallet_security ENABLE ROW LEVEL SECURITY;

-- Ultra-restrictive policies for wallet security data
CREATE POLICY "Only wallet owner can access security data" 
ON public.wallet_security 
FOR ALL 
USING (
  wallet_id IN (
    SELECT id FROM public.wallets 
    WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  wallet_id IN (
    SELECT id FROM public.wallets 
    WHERE user_id = auth.uid()
  )
);

-- Create secure view for admin access to identity data (without full document URLs)
CREATE OR REPLACE VIEW public.identity_verification_admin_secure AS
SELECT 
  id,
  user_id,
  full_name,
  status,
  verification_type,
  created_at,
  verified_at,
  -- Mask sensitive document info for admin viewing
  CASE 
    WHEN document_type IS NOT NULL THEN document_type || ' (***' || RIGHT(COALESCE(document_number, ''), 4) || ')'
    ELSE NULL 
  END as document_info_masked,
  -- Hide actual document URLs and show only metadata
  CASE 
    WHEN document_front_url IS NOT NULL THEN 'Document uploaded'
    ELSE 'No document' 
  END as document_status,
  verification_notes
FROM public.identity_verification;