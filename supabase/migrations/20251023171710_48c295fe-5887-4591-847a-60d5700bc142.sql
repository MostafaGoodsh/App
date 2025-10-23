-- Add Anubis access control to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_anubis_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS anubis_subscription_type TEXT CHECK (anubis_subscription_type IN ('free', 'basic', 'premium', NULL)),
ADD COLUMN IF NOT EXISTS anubis_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_anubis_access ON public.profiles(user_id, has_anubis_access);

-- Create RPC function to check Anubis access
CREATE OR REPLACE FUNCTION public.check_anubis_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT has_anubis_access 
     FROM public.profiles 
     WHERE user_id = _user_id
     AND (anubis_expires_at IS NULL OR anubis_expires_at > now())
    ),
    false
  );
$function$;

-- Create RPC function for admins to grant Anubis access
CREATE OR REPLACE FUNCTION public.grant_anubis_access(
  p_user_id uuid,
  p_subscription_type text DEFAULT 'basic',
  p_duration_days integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE public.profiles 
  SET 
    has_anubis_access = true,
    anubis_subscription_type = p_subscription_type,
    anubis_expires_at = CASE 
      WHEN p_duration_days IS NOT NULL THEN now() + (p_duration_days || ' days')::interval
      ELSE NULL
    END
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$function$;

-- Create RPC function to revoke Anubis access
CREATE OR REPLACE FUNCTION public.revoke_anubis_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE public.profiles 
  SET 
    has_anubis_access = false,
    anubis_subscription_type = NULL,
    anubis_expires_at = NULL
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$function$;

-- Add comments
COMMENT ON COLUMN public.profiles.has_anubis_access IS 'Whether user has access to Anubis vault feature';
COMMENT ON COLUMN public.profiles.anubis_subscription_type IS 'Type of Anubis subscription (free, basic, premium)';
COMMENT ON COLUMN public.profiles.anubis_expires_at IS 'When Anubis access expires (NULL = lifetime access)';