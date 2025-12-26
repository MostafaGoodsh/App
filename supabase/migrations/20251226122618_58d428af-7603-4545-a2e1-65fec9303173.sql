-- Fix 1: CRITICAL - Secure is_admin function to prevent enumeration attacks
-- The function should ONLY check the current authenticated user, not accept arbitrary user_ids

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    -- If _user_id is provided but doesn't match auth.uid(), always return false
    WHEN _user_id IS NOT NULL AND _user_id != auth.uid() THEN FALSE
    -- Otherwise check the actual user's admin status
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = COALESCE(_user_id, auth.uid())
        AND role = 'admin'
    )
  END
$$;

-- Fix 2: Secure has_role function with same pattern
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    -- If _user_id doesn't match auth.uid(), always return false (prevent enumeration)
    WHEN _user_id != auth.uid() THEN FALSE
    -- Otherwise check actual role
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

-- Fix 3: Drop invalid wallet_security_access_trigger (SELECT triggers don't exist in PostgreSQL)
-- And create a proper RPC function for wallet security access with built-in logging
DROP TRIGGER IF EXISTS wallet_security_access_trigger ON public.wallet_security;

-- Create a secure RPC function to access wallet security with logging
CREATE OR REPLACE FUNCTION public.get_wallet_security_with_logging(p_wallet_id uuid)
RETURNS TABLE (
  wallet_id uuid,
  private_key_encrypted text,
  mnemonic_encrypted text,
  encryption_version integer,
  last_accessed timestamp with time zone,
  access_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Verify wallet ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE id = p_wallet_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Access denied: wallet does not belong to user';
  END IF;
  
  -- Log access and update counters
  UPDATE public.wallet_security ws
  SET 
    last_accessed = now(),
    access_count = COALESCE(ws.access_count, 0) + 1
  WHERE ws.wallet_id = p_wallet_id;
  
  -- Return the wallet security data
  RETURN QUERY
  SELECT 
    ws.wallet_id,
    ws.private_key_encrypted,
    ws.mnemonic_encrypted,
    ws.encryption_version,
    ws.last_accessed,
    ws.access_count
  FROM public.wallet_security ws
  WHERE ws.wallet_id = p_wallet_id;
END;
$$;