-- Update get_profiles_admin_view function to include solana_address
CREATE OR REPLACE FUNCTION public.get_profiles_admin_view()
 RETURNS TABLE(id uuid, user_id uuid, full_name text, masked_email text, masked_phone text, solana_address text, avatar_url text, preferred_language text, created_at timestamp with time zone, updated_at timestamp with time zone, access_count bigint, last_accessed timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    p.solana_address,
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
$function$;