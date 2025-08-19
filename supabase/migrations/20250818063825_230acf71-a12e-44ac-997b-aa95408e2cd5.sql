-- SECURITY FIXES PHASE 2: Fix remaining function security issues
-- Fix remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.mask_contact_info(email text, phone text)
RETURNS TABLE(masked_email text, masked_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY SELECT 
    CASE 
      WHEN email IS NOT NULL AND email != '' THEN
        LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2)
      ELSE NULL 
    END as masked_email,
    CASE 
      WHEN phone IS NOT NULL AND phone != '' THEN
        '***' || RIGHT(phone, 4)
      ELSE NULL 
    END as masked_phone;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log the update
  INSERT INTO public.profiles_audit (
    profile_id,
    accessed_by,
    access_type,
    accessed_at,
    fields_accessed
  ) VALUES (
    NEW.id,
    auth.uid(),
    'update',
    now(),
    ARRAY['full_name', 'email', 'phone', 'avatar_url', 'preferred_language']
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_transaction_data(p_amount numeric, p_wallet_id uuid, p_transaction_hash text, p_reference_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN jsonb_build_object(
        'amount_range', CASE 
            WHEN p_amount < 100 THEN 'small (<100)'
            WHEN p_amount < 1000 THEN 'medium (100-1K)'
            WHEN p_amount < 10000 THEN 'large (1K-10K)'
            ELSE 'very_large (>10K)'
        END,
        'wallet_masked', substring(p_wallet_id::text from 1 for 8) || '****',
        'hash_masked', CASE 
            WHEN p_transaction_hash IS NOT NULL 
            THEN substring(p_transaction_hash from 1 for 6) || '...' || substring(p_transaction_hash from length(p_transaction_hash)-5)
            ELSE NULL 
        END,
        'reference_masked', CASE 
            WHEN p_reference_id IS NOT NULL 
            THEN substring(p_reference_id from 1 for 4) || '****'
            ELSE NULL 
        END
    );
END;
$$;

-- Fix security definer views by dropping them and creating secure functions instead
-- Drop the problematic views
DROP VIEW IF EXISTS public.profiles_admin_secure;
DROP VIEW IF EXISTS public.transactions_admin_secure;
DROP VIEW IF EXISTS public.identity_verification_admin_secure;

-- Replace with secure functions that provide controlled access
CREATE OR REPLACE FUNCTION public.get_profiles_admin_view()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  masked_email TEXT,
  masked_phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  access_count BIGINT,
  last_accessed TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    contact.masked_email,
    contact.masked_phone,
    p.avatar_url,
    p.preferred_language,
    p.created_at,
    p.updated_at,
    COALESCE(audit_stats.access_count, 0) as access_count,
    audit_stats.last_accessed
  FROM public.profiles p
  CROSS JOIN LATERAL public.mask_contact_info(p.email, p.phone) as contact
  LEFT JOIN (
    SELECT 
      profile_id,
      COUNT(*) as access_count,
      MAX(accessed_at) as last_accessed
    FROM public.profiles_audit
    GROUP BY profile_id
  ) audit_stats ON audit_stats.profile_id = p.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_identity_verification_admin_view()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  status TEXT,
  verification_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  document_info_masked TEXT,
  document_status TEXT,
  verification_notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    iv.id,
    iv.user_id,
    iv.full_name,
    iv.status,
    iv.verification_type,
    iv.created_at,
    iv.verified_at,
    -- Mask sensitive document info for admin viewing
    CASE 
      WHEN iv.document_type IS NOT NULL THEN iv.document_type || ' (***' || RIGHT(COALESCE(iv.document_number, ''), 4) || ')'
      ELSE NULL 
    END as document_info_masked,
    -- Hide actual document URLs and show only metadata
    CASE 
      WHEN iv.document_front_url IS NOT NULL THEN 'Document uploaded'
      ELSE 'No document' 
    END as document_status,
    iv.verification_notes
  FROM public.identity_verification iv;
END;
$$;