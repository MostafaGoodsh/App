-- Fix security warnings from previous migration
-- Address security definer view and function search path issues

-- Fix the profiles_admin_secure view to remove SECURITY DEFINER property
DROP VIEW IF EXISTS public.profiles_admin_secure;

-- Recreate the view as a regular view (not security definer)
CREATE VIEW public.profiles_admin_secure AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  m.masked_email,
  m.masked_phone,
  p.avatar_url,
  p.preferred_language,
  p.created_at,
  p.updated_at,
  -- Include useful metadata
  (SELECT COUNT(*) FROM public.profiles_audit WHERE profile_id = p.id) as access_count,
  (SELECT MAX(accessed_at) FROM public.profiles_audit WHERE profile_id = p.id) as last_accessed
FROM public.profiles p
CROSS JOIN LATERAL public.mask_contact_info(p.email, p.phone) m
WHERE is_admin(auth.uid()); -- Add WHERE clause to restrict access

-- Fix search path for mask_contact_info function
CREATE OR REPLACE FUNCTION public.mask_contact_info(
  email TEXT, 
  phone TEXT
) 
RETURNS TABLE(masked_email TEXT, masked_phone TEXT) 
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

-- Fix search path for log_profile_update function
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS TRIGGER 
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

-- Fix search path for get_secure_profile_export function
CREATE OR REPLACE FUNCTION public.get_secure_profile_export()
RETURNS TABLE(
  total_profiles BIGINT,
  profiles_with_email BIGINT,
  profiles_with_phone BIGINT,
  avg_profile_age_days NUMERIC
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
    COUNT(*) as total_profiles,
    COUNT(email) FILTER (WHERE email IS NOT NULL AND email != '') as profiles_with_email,
    COUNT(phone) FILTER (WHERE phone IS NOT NULL AND phone != '') as profiles_with_phone,
    ROUND(AVG(EXTRACT(days FROM now() - created_at)), 2) as avg_profile_age_days
  FROM public.profiles;
END;
$$;